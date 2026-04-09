import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from './supabase';

export type LocalOrder = {
  id: string;
  buyer_id: string;
  seller_id: string;
  date: string;
  status: "pending" | "processing" | "completed" | "cancelled";
  items: { title: string; qty: number; price: number; product_id: string }[];
  total: number;
};

interface OrderStore {
  orders: LocalOrder[];
  hydrated: boolean;
  addOrder: (order: Omit<LocalOrder, 'id' | 'date' | 'status'>) => Promise<void>;
  fetchOrders: (buyerId: string) => Promise<void>;
  clearOrders: () => void;
}

export const useOrderStore = create<OrderStore>()(
  persist(
    (set) => ({
      orders: [],
      hydrated: false,
      clearOrders: () => set({ orders: [] }),

      addOrder: async (orderData) => {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData),
        });

        if (!response.ok) {
          const { error } = await response.json();
          throw new Error(error || 'Failed to place order');
        }

        const order = await response.json();

        // Add to local state for immediate UI update
        const newOrder: LocalOrder = {
          id: order.id,
          buyer_id: orderData.buyer_id,
          seller_id: orderData.seller_id,
          date: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: 'pending',
          items: orderData.items,
          total: orderData.total,
        };
        set((state) => ({ orders: [newOrder, ...state.orders] }));
      },

      fetchOrders: async (buyerId: string) => {
        const { data, error } = await supabase
          .from('orders')
          .select('*, items:order_items(*, product:products(title))')
          .eq('buyer_id', buyerId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Failed to fetch orders:', error.message);
          return;
        }

        if (data) {
          const mapped: LocalOrder[] = data.map((o) => ({
            id: o.id,
            buyer_id: o.buyer_id,
            seller_id: o.seller_id,
            date: new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
            status: o.status,
            total: Number(o.total_amount),
            items: (o.items ?? []).map((i: { product: { title: string } | null; quantity: number; price_at_time: number; product_id: string }) => ({
              title: i.product?.title ?? 'Unknown Product',
              qty: i.quantity,
              price: Number(i.price_at_time),
              product_id: i.product_id,
            })),
          }));
          set({ orders: mapped });
        }
      },
    }),
    {
      name: 'ecomarket-orders',
      version: 2,
      migrate: () => ({ orders: [], hydrated: false }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
