import { User } from "firebase/auth";
import { create } from "zustand";

type UserStoreType = {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
};
export const useUserStore = create<UserStoreType>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user: user }),
  setLoading: (loading: boolean) => set({ loading: loading }),
}));
