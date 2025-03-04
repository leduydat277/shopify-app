import { create } from 'zustand';
import { shallow } from 'zustand/shallow';
import { immer } from 'zustand/middleware/immer';
import { createWithEqualityFn } from 'zustand/traditional';
import {
  persist,
  subscribeWithSelector,
  devtools,
  createJSONStorage,
} from 'zustand/middleware';

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

const intiProduct: Product = {
  id: "",
  title: "my-product", 
  status: "ACTIVE",
}

export const useProductStore = createWithEqualityFn(
  devtools(
    persist(
      subscribeWithSelector(
        immer<any>((set, get) => ({
          ...intiProduct,
          resetState: () => set({ ...intiProduct }),
          setId:(id:String) =>set((state)=> {state.id = id}),
          setTitle:(title:String) =>set((state)=> {state.title= title}),
          setStatus:(status:String) =>set((state)=> {state.status = status}),
          clear: () => set({ ...intiProduct }),
        })
      )
    ),
    {
      name: 'product-store',
      storage: createJSONStorage(() => localStorage)
    }
  )
),
shallow
)