import { signInWithPopup, signOut as firebaseSignOut, onAuthStateChanged, type User } from "firebase/auth"
import { auth, googleProvider, isFirebaseConfigured } from "./firebase"

export interface AuthUser {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
}

export const signInWithGoogle = async (): Promise<AuthUser | null> => {
  if (!isFirebaseConfigured || !auth || !googleProvider) {
    throw new Error("Firebase is not configured")
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
    console.error("Google sign-in error:", error)
    throw error
  }
}

export const signOut = async (): Promise<void> => {
  if (!isFirebaseConfigured || !auth) {
    throw new Error("Firebase is not configured")
  }

  try {
    await firebaseSignOut(auth)
  } catch (error) {
    console.error("Sign out error:", error)
    throw error
  }
}

export const onAuthStateChange = (callback: (user: AuthUser | null) => void) => {
  if (!isFirebaseConfigured || !auth) {
    callback(null)
    return () => {}
  }

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
}
