import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  orderBy,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore"
import { db, isFirebaseConfigured } from "./firebase"

export interface Essay {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
  userId: string
}

export interface Draft {
  title: string
  content: string
  savedAt: string
  userId: string
}

const ESSAYS_COLLECTION = "essays"
const DRAFTS_COLLECTION = "drafts"

const getLocalStorageEssays = (userId: string): Essay[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(`essays_${userId}`)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const setLocalStorageEssays = (essays: Essay[], userId: string) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(`essays_${userId}`, JSON.stringify(essays))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

const getLocalStorageDraft = (userId: string): Draft | null => {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem(`essayDraft_${userId}`)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const setLocalStorageDraft = (draft: Draft | null, userId: string) => {
  if (typeof window === "undefined") return
  try {
    if (draft) {
      localStorage.setItem(`essayDraft_${userId}`, JSON.stringify(draft))
    } else {
      localStorage.removeItem(`essayDraft_${userId}`)
    }
  } catch (error) {
    console.error("Error saving draft to localStorage:", error)
  }
}

export async function getEssays(userId: string): Promise<Essay[]> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase not configured, using localStorage fallback")
    return getLocalStorageEssays(userId)
  }

  try {
    const q = query(collection(db, ESSAYS_COLLECTION), where("userId", "==", userId), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        userId: data.userId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      }
    })
  } catch (error) {
    console.error("Error fetching essays from Firebase, falling back to localStorage:", error)
    return getLocalStorageEssays(userId)
  }
}

export async function getEssay(id: string, userId: string): Promise<Essay | null> {
  if (!isFirebaseConfigured || !db) {
    const essays = getLocalStorageEssays(userId)
    return essays.find((essay) => essay.id === id) || null
  }

  try {
    const docRef = doc(db, ESSAYS_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      if (data.userId !== userId) {
        return null
      }
      return {
        id: docSnap.id,
        title: data.title,
        content: data.content,
        userId: data.userId,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      }
    }
    return null
  } catch (error) {
    console.error("Error fetching essay from Firebase:", error)
    const essays = getLocalStorageEssays(userId)
    return essays.find((essay) => essay.id === id) || null
  }
}

export async function addEssay(
  essay: Omit<Essay, "id" | "createdAt" | "updatedAt">,
  userId: string,
): Promise<Essay | null> {
  const now = new Date().toISOString()
  const newEssay: Essay = {
    id: Date.now().toString(),
    title: essay.title,
    content: essay.content,
    userId,
    createdAt: now,
    updatedAt: now,
  }

  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase not configured, using localStorage fallback")
    const essays = getLocalStorageEssays(userId)
    const updatedEssays = [newEssay, ...essays]
    setLocalStorageEssays(updatedEssays, userId)
    return newEssay
  }

  try {
    const docRef = await addDoc(collection(db, ESSAYS_COLLECTION), {
      title: essay.title,
      content: essay.content,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return {
      id: docRef.id,
      title: essay.title,
      content: essay.content,
      userId,
      createdAt: now,
      updatedAt: now,
    }
  } catch (error) {
    console.error("Error adding essay to Firebase, falling back to localStorage:", error)
    const essays = getLocalStorageEssays(userId)
    const updatedEssays = [newEssay, ...essays]
    setLocalStorageEssays(updatedEssays, userId)
    return newEssay
  }
}

export async function updateEssay(
  id: string,
  updates: Partial<Omit<Essay, "id" | "createdAt" | "userId">>,
  userId: string,
): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    const essays = getLocalStorageEssays(userId)
    const updatedEssays = essays.map((essay) =>
      essay.id === id && essay.userId === userId
        ? { ...essay, ...updates, updatedAt: new Date().toISOString() }
        : essay,
    )
    setLocalStorageEssays(updatedEssays, userId)
    return true
  }

  try {
    const docRef = doc(db, ESSAYS_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists() || docSnap.data()?.userId !== userId) {
      return false
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp(),
    })
    return true
  } catch (error) {
    console.error("Error updating essay in Firebase:", error)
    return false
  }
}

export async function deleteEssay(id: string, userId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    const essays = getLocalStorageEssays(userId)
    const updatedEssays = essays.filter((essay) => essay.id !== id || essay.userId !== userId)
    setLocalStorageEssays(updatedEssays, userId)
    return true
  }

  try {
    const docRef = doc(db, ESSAYS_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists() || docSnap.data()?.userId !== userId) {
      return false
    }

    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error("Error deleting essay from Firebase:", error)
    return false
  }
}

export async function getDraft(userId: string): Promise<Draft | null> {
  if (!isFirebaseConfigured || !db) {
    return getLocalStorageDraft(userId)
  }

  try {
    const docRef = doc(db, DRAFTS_COLLECTION, userId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        title: data.title || "",
        content: data.content || "",
        userId: data.userId,
        savedAt: data.savedAt?.toDate?.()?.toISOString() || data.savedAt,
      }
    }
    return null
  } catch (error) {
    console.error("Error fetching draft from Firebase, falling back to localStorage:", error)
    return getLocalStorageDraft(userId)
  }
}

export async function saveDraft(title: string, content: string, userId: string): Promise<boolean> {
  const draft: Draft = {
    title,
    content,
    userId,
    savedAt: new Date().toISOString(),
  }

  if (!isFirebaseConfigured || !db) {
    setLocalStorageDraft(draft, userId)
    return true
  }

  try {
    const docRef = doc(db, DRAFTS_COLLECTION, userId)
    await updateDoc(docRef, {
      title,
      content,
      userId,
      savedAt: serverTimestamp(),
    }).catch(async () => {
      // If document doesn't exist, create it
      await addDoc(collection(db, DRAFTS_COLLECTION), {
        title,
        content,
        userId,
        savedAt: serverTimestamp(),
      })
    })
    return true
  } catch (error) {
    console.error("Error saving draft to Firebase, falling back to localStorage:", error)
    setLocalStorageDraft(draft, userId)
    return true
  }
}

export async function clearDraft(userId: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    setLocalStorageDraft(null, userId)
    return true
  }

  try {
    const docRef = doc(db, DRAFTS_COLLECTION, userId)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error("Error clearing draft from Firebase, falling back to localStorage:", error)
    setLocalStorageDraft(null, userId)
    return true
  }
}
