import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, type User } from "firebase/auth"
import { auth, googleProvider, isFirebaseConfigured, isAuthAvailable } from "./firebase"

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export const signInWithGoogle = async (): Promise<AuthUser | null> => {
  if (!isFirebaseConfigured || !isAuthAvailable || !auth || !googleProvider) {
    console.error("[v0] Firebase Auth is not available for Google sign-in")
    throw new Error("Firebase Auth is not configured or available")
  }

  try {
    const result = await signInWithPopup(auth, googleProvider)
    const user = result.user
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
    }
  } catch (error) {
    console.error("[v0] Google sign-in error:", error)
    throw error
  }
}

export const signOut = async (): Promise<void> => {
  if (!isFirebaseConfigured || !isAuthAvailable || !auth) {
    console.error("[v0] Firebase Auth is not available for sign-out")
    throw new Error("Firebase Auth is not configured or available")
  }

  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error("[v0] Sign out error:", error)
    throw error
  }
}

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  if (!isFirebaseConfigured || !isAuthAvailable || !auth) {
    console.warn("[v0] Firebase Auth is not available, user will remain signed out")
    callback(null)
    return () => {}
  }

  try {
    return onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        callback({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
      } else {
        callback(null)
      }
    })
  } catch (error) {
    console.error("[v0] Error setting up auth state listener:", error)
    callback(null)
    return () => {}
  }
}
