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
} from "firebase/firestore"
import { db, isFirebaseConfigured } from "./firebase"

export interface Essay {
  id: string
  title: string
  content: string
  createdAt: string
  updatedAt: string
}

export interface Draft {
  title: string
  content: string
  savedAt: string
}

const ESSAYS_COLLECTION = "essays"
const DRAFTS_COLLECTION = "drafts"
const DRAFT_DOC_ID = "current-draft"

// Fallback localStorage functions
const getLocalStorageEssays = (): Essay[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem("essays")
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const setLocalStorageEssays = (essays: Essay[]) => {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem("essays", JSON.stringify(essays))
  } catch (error) {
    console.error("Error saving to localStorage:", error)
  }
}

const getLocalStorageDraft = (): Draft | null => {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem("essayDraft")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const setLocalStorageDraft = (draft: Draft | null) => {
  if (typeof window === "undefined") return
  try {
    if (draft) {
      localStorage.setItem("essayDraft", JSON.stringify(draft))
    } else {
      localStorage.removeItem("essayDraft")
    }
  } catch (error) {
    console.error("Error saving draft to localStorage:", error)
  }
}

// Essay operations
export async function getEssays(): Promise<Essay[]> {
  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase not configured, using localStorage fallback")
    return getLocalStorageEssays()
  }

  try {
    const q = query(collection(db, ESSAYS_COLLECTION), orderBy("createdAt", "desc"))
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc) => {
      const data = doc.data()
      return {
        id: doc.id,
        title: data.title,
        content: data.content,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      }
    })
  } catch (error) {
    console.error("Error fetching essays from Firebase, falling back to localStorage:", error)
    return getLocalStorageEssays()
  }
}

export async function getEssay(id: string): Promise<Essay | null> {
  if (!isFirebaseConfigured || !db) {
    const essays = getLocalStorageEssays()
    return essays.find((essay) => essay.id === id) || null
  }

  try {
    const docRef = doc(db, ESSAYS_COLLECTION, id)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        id: docSnap.id,
        title: data.title,
        content: data.content,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || data.updatedAt,
      }
    }
    return null
  } catch (error) {
    console.error("Error fetching essay from Firebase:", error)
    const essays = getLocalStorageEssays()
    return essays.find((essay) => essay.id === id) || null
  }
}

export async function addEssay(essay: Omit<Essay, "id" | "createdAt" | "updatedAt">): Promise<Essay | null> {
  const now = new Date().toISOString()
  const newEssay: Essay = {
    id: Date.now().toString(),
    title: essay.title,
    content: essay.content,
    createdAt: now,
    updatedAt: now,
  }

  if (!isFirebaseConfigured || !db) {
    console.warn("Firebase not configured, using localStorage fallback")
    const essays = getLocalStorageEssays()
    const updatedEssays = [newEssay, ...essays]
    setLocalStorageEssays(updatedEssays)
    return newEssay
  }

  try {
    const docRef = await addDoc(collection(db, ESSAYS_COLLECTION), {
      title: essay.title,
      content: essay.content,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    return {
      id: docRef.id,
      title: essay.title,
      content: essay.content,
      createdAt: now,
      updatedAt: now,
    }
  } catch (error) {
    console.error("Error adding essay to Firebase, falling back to localStorage:", error)
    const essays = getLocalStorageEssays()
    const updatedEssays = [newEssay, ...essays]
    setLocalStorageEssays(updatedEssays)
    return newEssay
  }
}

export async function updateEssay(id: string, updates: Partial<Omit<Essay, "id" | "createdAt">>): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    const essays = getLocalStorageEssays()
    const updatedEssays = essays.map((essay) =>
      essay.id === id ? { ...essay, ...updates, updatedAt: new Date().toISOString() } : essay,
    )
    setLocalStorageEssays(updatedEssays)
    return true
  }

  try {
    const docRef = doc(db, ESSAYS_COLLECTION, id)
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

export async function deleteEssay(id: string): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    const essays = getLocalStorageEssays()
    const updatedEssays = essays.filter((essay) => essay.id !== id)
    setLocalStorageEssays(updatedEssays)
    return true
  }

  try {
    const docRef = doc(db, ESSAYS_COLLECTION, id)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error("Error deleting essay from Firebase:", error)
    return false
  }
}

// Draft operations
export async function getDraft(): Promise<Draft | null> {
  if (!isFirebaseConfigured || !db) {
    return getLocalStorageDraft()
  }

  try {
    const docRef = doc(db, DRAFTS_COLLECTION, DRAFT_DOC_ID)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      const data = docSnap.data()
      return {
        title: data.title || "",
        content: data.content || "",
        savedAt: data.savedAt?.toDate?.()?.toISOString() || data.savedAt,
      }
    }
    return null
  } catch (error) {
    console.error("Error fetching draft from Firebase, falling back to localStorage:", error)
    return getLocalStorageDraft()
  }
}

export async function saveDraft(title: string, content: string): Promise<boolean> {
  const draft: Draft = {
    title,
    content,
    savedAt: new Date().toISOString(),
  }

  if (!isFirebaseConfigured || !db) {
    setLocalStorageDraft(draft)
    return true
  }

  try {
    const docRef = doc(db, DRAFTS_COLLECTION, DRAFT_DOC_ID)
    await updateDoc(docRef, {
      title,
      content,
      savedAt: serverTimestamp(),
    }).catch(async () => {
      // If document doesn't exist, create it
      await addDoc(collection(db, DRAFTS_COLLECTION), {
        title,
        content,
        savedAt: serverTimestamp(),
      })
    })
    return true
  } catch (error) {
    console.error("Error saving draft to Firebase, falling back to localStorage:", error)
    setLocalStorageDraft(draft)
    return true
  }
}

export async function clearDraft(): Promise<boolean> {
  if (!isFirebaseConfigured || !db) {
    setLocalStorageDraft(null)
    return true
  }

  try {
    const docRef = doc(db, DRAFTS_COLLECTION, DRAFT_DOC_ID)
    await deleteDoc(docRef)
    return true
  } catch (error) {
    console.error("Error clearing draft from Firebase, falling back to localStorage:", error)
    setLocalStorageDraft(null)
    return true
  }
}
