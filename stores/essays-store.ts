"use client"

import { create } from "zustand"
import { getEssays, addEssay, updateEssay, deleteEssay, type Essay } from "@/lib/firestore"

interface EssaysState {
  essays: Essay[]
  isLoading: boolean
  // Actions
  loadEssays: (userId: string) => Promise<void>
  addEssayHandler: (
    essay: Omit<Essay, "id" | "createdAt" | "updatedAt" | "userId">,
    userId: string,
  ) => Promise<Essay | null>
  deleteEssayHandler: (id: string, userId: string) => Promise<boolean>
  getEssayHandler: (id: string) => Essay | undefined
  updateEssayHandler: (
    id: string,
    updates: Partial<Omit<Essay, "id" | "createdAt" | "userId">>,
    userId: string,
  ) => Promise<boolean>
  refreshEssays: (userId: string) => Promise<void>
  clearEssays: () => void
}

export const useEssaysStore = create<EssaysState>((set, get) => ({
  essays: [],
  isLoading: true,

  loadEssays: async (userId: string) => {
    set({ isLoading: true })
    try {
      const fetchedEssays = await getEssays(userId)
      set({ essays: fetchedEssays, isLoading: false })
    } catch (error) {
      console.error("Failed to load essays:", error)
      set({ isLoading: false })
    }
  },

  addEssayHandler: async (essay, userId) => {
    try {
      const newEssay = await addEssay(essay, userId)
      if (newEssay) {
        set((state) => ({
          essays: [newEssay, ...state.essays],
        }))
        return newEssay
      }
      return null
    } catch (error) {
      console.error("Failed to add essay:", error)
      return null
    }
  },

  deleteEssayHandler: async (id, userId) => {
    try {
      const success = await deleteEssay(id, userId)
      if (success) {
        set((state) => ({
          essays: state.essays.filter((essay) => essay.id !== id),
        }))
      }
      return success
    } catch (error) {
      console.error("Failed to delete essay:", error)
      return false
    }
  },

  getEssayHandler: (id) => {
    const { essays } = get()
    return essays.find((essay) => essay.id === id)
  },

  updateEssayHandler: async (id, updates, userId) => {
    try {
      const success = await updateEssay(id, updates, userId)
      if (success) {
        set((state) => ({
          essays: state.essays.map((essay) =>
            essay.id === id ? { ...essay, ...updates, updatedAt: new Date().toISOString() } : essay,
          ),
        }))
      }
      return success
    } catch (error) {
      console.error("Failed to update essay:", error)
      return false
    }
  },

  refreshEssays: async (userId) => {
    await get().loadEssays(userId)
  },

  clearEssays: () => {
    set({ essays: [], isLoading: false })
  },
}))

export type { Essay }
