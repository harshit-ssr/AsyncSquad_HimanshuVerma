import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';
import type { Role } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string;
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; role?: Role }>;
  signup: (name: string, email: string, password: string, role: 'buyer' | 'seller') => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      initialized: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) { set({ isLoading: false }); return { error: error.message }; }
          if (data.user) {
            const { data: profile } = await supabase
              .from('profiles').select('*').eq('id', data.user.id).single();
            const role: Role = profile?.role ?? 'buyer';
            const user: AuthUser = {
              id: data.user.id,
              email: data.user.email!,
              role,
              name: profile?.name ?? email.split('@')[0],
            };
            set({ user, isLoading: false });
            return { role };
          }
          set({ isLoading: false });
          return { error: 'Login failed. Please try again.' };
        } catch {
          set({ isLoading: false });
          return { error: 'Something went wrong. Please try again.' };
        }
      },

      signup: async (name, email, password, role) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { role, name } },
          });
          if (error) { set({ isLoading: false }); return { error: error.message }; }
          if (data.user) {
            // The trigger on auth.users will auto-create the profile + seller row.
            // Upsert as a safety net in case the trigger hasn't fired yet.
            await supabase.from('profiles').upsert({ id: data.user.id, email, role, name });
            if (role === 'seller') {
              await supabase.from('sellers').upsert({ id: data.user.id, store_name: name + "'s Store" });
            }
            const user: AuthUser = { id: data.user.id, email, role, name };
            set({ user, isLoading: false });
            return {};
          }
          set({ isLoading: false });
          return { error: 'Signup failed. Please try again.' };
        } catch {
          set({ isLoading: false });
          return { error: 'Something went wrong. Please try again.' };
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        set({ user: null });
        const { useOrderStore } = await import('./orderStore');
        useOrderStore.getState().clearOrders();
      },

      initializeAuth: async () => {
        if (get().initialized) return;

        try {
          // Restore session from Supabase on app load
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles').select('*').eq('id', session.user.id).single();
            set({
              user: {
                id: session.user.id,
                email: session.user.email!,
                role: profile?.role ?? 'buyer',
                name: profile?.name ?? session.user.email!.split('@')[0],
              },
              initialized: true,
            });
          } else {
            set({ user: null, initialized: true });
          }
        } catch {
          set({ initialized: true });
        }

        // Listen for future auth state changes (login/logout from other tabs, token refresh)
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_OUT' || !session?.user) {
            set({ user: null });
            return;
          }

          if (['SIGNED_IN', 'TOKEN_REFRESHED', 'INITIAL_SESSION'].includes(event)) {
            const { data: profile } = await supabase
              .from('profiles').select('*').eq('id', session.user.id).single();
            set({
              user: {
                id: session.user.id,
                email: session.user.email!,
                role: profile?.role ?? 'buyer',
                name: profile?.name ?? session.user.email!.split('@')[0],
              },
            });
          }
        });
      },
    }),
    {
      name: 'ecomarket-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
