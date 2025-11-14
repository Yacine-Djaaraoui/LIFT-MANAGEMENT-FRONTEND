// store.ts
import { create } from "zustand";

interface StoreState {
  count: number;
  user: { name: string; email: string } | null;
  increment: () => void;
  decrement: () => void;
  setUser: (user: { name: string; email: string }) => void;
}

const useStore = create<StoreState>((set) => ({
  count: 0,
  user: null,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  setUser: (user) => set({ user }),
}));
export default useStore;
