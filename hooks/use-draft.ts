"use client"

import { useState, useEffect } from "react"
import {
  getDraft,
  saveDraft as saveDraftToFirestore,
  clearDraft as clearDraftFromFirestore,
  type Draft,
} from "../lib/firestore"

export function useDraft() {
  const [draft, setDraft] = useState<Draft | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDraft()
  }, [])

  const loadDraft = async () => {
    setIsLoading(true)
    const fetchedDraft = await getDraft()
    setDraft(fetchedDraft)
    setIsLoading(false)
  }

  const saveDraft = async (title: string, content: string) => {
    const success = await saveDraftToFirestore(title, content)
    if (success) {
      const newDraft: Draft = {
        title,
        content,
        savedAt: new Date().toISOString(),
      }
      setDraft(newDraft)
    }
    return success
  }

  const clearDraft = async () => {
    const success = await clearDraftFromFirestore()
    if (success) {
      setDraft(null)
    }
    return success
  }

  const hasDraft = () => {
    return draft !== null && (draft.title.trim() !== "" || draft.content.trim() !== "")
  }

  return {
    draft,
    isLoading,
    saveDraft,
    clearDraft,
    hasDraft,
    refreshDraft: loadDraft,
  }
}
