
import { create } from "zustand";

export interface Product {
  id: string;
  title: string;
  status: string;
}

interface ProductState {
  product: Product;
  initialize: (product: Product) => void;
  setId: (id: string) => void;
  setTitle: (title: string) => void;
  setStatus: (status: string) => void;
}

export const useProductStore = create<ProductState>((set) => ({

  product: { id: "", title: "", status: "" },
  
  initialize: (product: Product) => set(() => ({ product })),
  setId: (id: string) =>
    set((state) => ({ product: { ...state.product, id } })),
  setTitle: (title: string) =>
    set((state) => ({ product: { ...state.product, title } })),
  setStatus: (status: string) =>
    set((state) => ({ product: { ...state.product, status } })),
}));
