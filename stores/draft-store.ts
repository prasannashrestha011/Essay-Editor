"use client"

import { create } from "zustand"
import {
  getDraft,
  saveDraft as saveDraftToFirestore,
  clearDraft as clearDraftFromFirestore,
  type Draft,
} from "@/lib/firestore"

interface DraftState {
  draft: Draft | null
  isLoading: boolean
  // Actions
  loadDraft: (userId: string) => Promise<void>
  saveDraft: (title: string, content: string, userId: string) => Promise<boolean>
  clearDraft: (userId: string) => Promise<boolean>
  hasDraft: () => boolean
  refreshDraft: (userId: string) => Promise<void>
  clearDraftState: () => void
}

export const useDraftStore = create<DraftState>((set, get) => ({
  draft: null,
  isLoading: true,

  loadDraft: async (userId: string) => {
    set({ isLoading: true })
    try {
      const fetchedDraft = await getDraft(userId)
      set({ draft: fetchedDraft, isLoading: false })
    } catch (error) {
      console.error("Failed to load draft:", error)
      set({ isLoading: false })
    }
  },

  saveDraft: async (title, content, userId) => {
    try {
      const success = await saveDraftToFirestore(title, content, userId)
      if (success) {
        const newDraft: Draft = {
          title,
          content,
          userId,
          savedAt: new Date().toISOString(),
        }
        set({ draft: newDraft })
      }
      return success
    } catch (error) {
      console.error("Failed to save draft:", error)
      return false
    }
  },

  clearDraft: async (userId) => {
    try {
      const success = await clearDraftFromFirestore(userId)
      if (success) {
        set({ draft: null })
      }
      return success
    } catch (error) {
      console.error("Failed to clear draft:", error)
      return false
    }
  },

  hasDraft: () => {
    const { draft } = get()
    return draft !== null && (draft.title.trim() !== "" || draft.content.trim() !== "")
  },

  refreshDraft: async (userId) => {
    await get().loadDraft(userId)
  },

  clearDraftState: () => {
    set({ draft: null, isLoading: false })
  },
}))
