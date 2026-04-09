import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/types';
import { supabase } from './supabase';
import { MOCK_PRODUCTS } from './services/products';

interface ProductStore {
  products: Product[];
  hydrated: boolean;
  usingMock: boolean;
  addProduct: (product: Omit<Product, 'id' | 'created_at'>) => Promise<Product>;
  fetchFromDB: () => Promise<void>;
}

export const useProductStore = create<ProductStore>()(
  persist(
    (set) => ({
      products: [],
      hydrated: false,
      usingMock: false,

      addProduct: async (productData) => {
        const { data, error } = await supabase.from('products').insert([{
          seller_id: productData.seller_id,
          title: productData.title,
          description: productData.description,
          price: productData.price,
          stock_quantity: productData.stock_quantity,
          eco_tags: productData.eco_tags,
          image_url: productData.image_url,
          lat: productData.lat,
          lng: productData.lng,
        }]).select('*, seller:sellers(*)').single();

        if (error) throw new Error(error.message);

        const newProduct: Product = {
          ...data,
          seller: data.seller ?? productData.seller,
        } as Product;

        set((state) => ({ products: [newProduct, ...state.products] }));
        return newProduct;
      },

      fetchFromDB: async () => {
        try {
          const { data, error } = await supabase
            .from('products').select('*, seller:sellers(*)');
          if (error) {
            console.error('Failed to fetch products:', error.message);
            set({ products: MOCK_PRODUCTS, hydrated: true, usingMock: true });
            return;
          }
          const loadedProducts = (data as Product[]) ?? [];
          if (loadedProducts.length === 0) {
              set({ products: MOCK_PRODUCTS, hydrated: true, usingMock: true });
          } else {
              set({ products: loadedProducts, hydrated: true, usingMock: false });
          }
        } catch (e) {
          console.error('Failed to fetch products:', e);
          set({ products: MOCK_PRODUCTS, hydrated: true, usingMock: true });
        }
      },
    }),
    {
      name: 'ecomarket-products',
      version: 4,
      migrate: () => ({
        products: [],
        hydrated: false,
        usingMock: false,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.hydrated = true;
      },
    }
  )
);
