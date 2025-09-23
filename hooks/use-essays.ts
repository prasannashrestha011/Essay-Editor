"use client"

import { useState, useEffect } from "react"
import { getEssays, addEssay, updateEssay, deleteEssay, type Essay } from "../lib/firestore"

export type { Essay } from "../lib/firestore"

export function useEssays() {
  const [essays, setEssays] = useState<Essay[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEssays()
  }, [])

  const loadEssays = async () => {
    setIsLoading(true)
    const fetchedEssays = await getEssays()
    setEssays(fetchedEssays)
    setIsLoading(false)
  }

  const addEssayHandler = async (essay: Omit<Essay, "id" | "createdAt" | "updatedAt">) => {
    const newEssay = await addEssay(essay)
    if (newEssay) {
      setEssays((prevEssays) => [newEssay, ...prevEssays])
      return newEssay
    }
    return null
  }

  const deleteEssayHandler = async (id: string) => {
    const success = await deleteEssay(id)
    if (success) {
      setEssays((prevEssays) => prevEssays.filter((essay) => essay.id !== id))
    }
    return success
  }

  const getEssayHandler = (id: string) => {
    return essays.find((essay) => essay.id === id)
  }

  const updateEssayHandler = async (id: string, updates: Partial<Omit<Essay, "id" | "createdAt">>) => {
    const success = await updateEssay(id, updates)
    if (success) {
      setEssays((prevEssays) =>
        prevEssays.map((essay) =>
          essay.id === id ? { ...essay, ...updates, updatedAt: new Date().toISOString() } : essay,
        ),
      )
    }
    return success
  }

  return {
    essays,
    isLoading,
    addEssay: addEssayHandler,
    deleteEssay: deleteEssayHandler,
    getEssay: getEssayHandler,
    updateEssay: updateEssayHandler,
    refreshEssays: loadEssays,
  }
}
