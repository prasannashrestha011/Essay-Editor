"use client";

import { create } from "zustand";
import {
  getAnyEssay,
  type Essay,
  subscribePublicEssays,
} from "@/lib/firestore";

interface PublicEssaysState {
  essays: Essay[];
  isLoading: boolean;

  // Actions
  setLatestEssayList: (state: Partial<PublicEssaysState>) => void;
  subscribePublicEssayList: () => void;
  unsubscribePublicEssayList: () => void;
  getPublicEssayHandler: (id: string) => Promise<Essay | null>;
  clearPublicEssays: () => void;
  unsubscribe?: () => void;
}

export const usePublicEssaysStore = create<PublicEssaysState>((set, get) => ({
  essays: [],
  isLoading: true,
  setLatestEssayList: (state: Partial<PublicEssaysState>) => set(state),

  subscribePublicEssayList: () => {
    set({ isLoading: true });

    // Subscribe to Firestore updates
    const unsub = subscribePublicEssays((essays: Essay[]) => {
      set({ essays, isLoading: false });
    });

    // Save the unsubscribe function so we can call it later
    set({ unsubscribe: unsub });
  },

  unsubscribePublicEssayList: () => {
    const unsub = get().unsubscribe;
    if (unsub) {
      unsub(); // stop listening
      set({ unsubscribe: undefined });
    }
  },

  getPublicEssayHandler: async (id: string) => {
    try {
      const essay = await getAnyEssay(id);
      // Only return if it's public or if it's already in our store
      if (essay && (essay.isPublic || get().essays.some((e) => e.id === id))) {
        return essay;
      }
      return null;
    } catch (error) {
      console.error("Failed to get public essay:", error);
      return null;
    }
  },

  clearPublicEssays: () => {
    set({ essays: [], isLoading: false });
  },
}));

export type { Essay };
