"use client"

import { create } from "zustand"
import { getPublicEssays, getAnyEssay, type Essay } from "@/lib/firestore"

interface PublicEssaysState {
  essays: Essay[]
  isLoading: boolean
  // Actions
  loadPublicEssays: () => Promise<void>
  getPublicEssayHandler: (id: string) => Promise<Essay | null>
  refreshPublicEssays: () => Promise<void>
  clearPublicEssays: () => void
}

export const usePublicEssaysStore = create<PublicEssaysState>((set, get) => ({
  essays: [],
  isLoading: true,

  loadPublicEssays: async () => {
    set({ isLoading: true })
    try {
      const fetchedEssays = await getPublicEssays()
      set({ essays: fetchedEssays, isLoading: false })
    } catch (error) {
      console.error("Failed to load public essays:", error)
      set({ isLoading: false })
    }
  },

  getPublicEssayHandler: async (id: string) => {
    try {
      const essay = await getAnyEssay(id)
      // Only return if it's public or if it's already in our store
      if (essay && (essay.isPublic || get().essays.some((e) => e.id === id))) {
        return essay
      }
      return null
    } catch (error) {
      console.error("Failed to get public essay:", error)
      return null
    }
  },

  refreshPublicEssays: async () => {
    await get().loadPublicEssays()
  },

  clearPublicEssays: () => {
    set({ essays: [], isLoading: false })
  },
}))

export type { Essay }
