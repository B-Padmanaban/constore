import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../utils/api';
import toast from 'react-hot-toast';

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      loading: false,

      fetchCart: async () => {
        set({ loading: true });
        try {
          const { data } = await api.get('/cart');
          set({ items: data.items || [] });
        } catch {
          set({ items: [] });
        } finally {
          set({ loading: false });
        }
      },

      addToCart: async (productId, qty = 1) => {
        try {
          const { data } = await api.post('/cart', { productId, qty });
          set({ items: data.items });
          toast.success('Added to cart');
        } catch (err) {
          toast.error(err.response?.data?.message || 'Failed to add to cart');
        }
      },

      updateQty: async (productId, qty) => {
        try {
          const { data } = await api.put(`/cart/${productId}`, { qty });
          set({ items: data.items });
        } catch (err) {
          toast.error(err.response?.data?.message || 'Update failed');
        }
      },

      removeItem: async (productId) => {
        try {
          await api.delete(`/cart/${productId}`);
          set({ items: get().items.filter(i => i.product._id !== productId) });
          toast.success('Item removed');
        } catch {
          toast.error('Remove failed');
        }
      },

      clearCart: () => set({ items: [] }),

      get totalItems() {
        return get().items.reduce((sum, i) => sum + i.qty, 0);
      },

      get totalPrice() {
        return get().items.reduce((sum, i) => sum + i.product.price * i.qty, 0);
      },
    }),
    { name: 'constore-cart', partialize: (state) => ({ items: state.items }) }
  )
);
