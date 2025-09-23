import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// Check if Firebase config is available and valid
const isFirebaseConfigured = Object.values(firebaseConfig).every(
  (value) => value !== undefined && value !== "" && value !== null,
)

let app: FirebaseApp | null = null
let db: Firestore | null = null
let auth: Auth | null = null
let googleProvider: GoogleAuthProvider | null = null

// Initialize Firebase only if properly configured
if (isFirebaseConfigured) {
  try {
    if (getApps().length === 0) {
      app = initializeApp(firebaseConfig)
      console.log("[v0] Firebase app initialized successfully")
    } else {
      app = getApp()
      console.log("[v0] Using existing Firebase app instance")
    }

    // Only proceed if app initialization was successful
    if (app) {
      try {
        auth = getAuth(app)
        googleProvider = new GoogleAuthProvider()
        console.log("[v0] Firebase Auth initialized successfully")
      } catch (authError) {
        console.error("[v0] Firebase Auth initialization failed:", authError)
        console.warn("[v0] Authentication features will not be available")
        auth = null
        googleProvider = null
      }

      try {
        db = getFirestore(app)
        console.log("[v0] Firestore initialized successfully")
      } catch (firestoreError) {
        console.error("[v0] Firestore initialization failed:", firestoreError)
        console.warn("[v0] Please ensure Firestore is enabled in your Firebase Console")
        console.warn("[v0] Data will be stored locally until Firestore is available")
        db = null
      }
    }
  } catch (error) {
    console.error("[v0] Critical Firebase initialization error:", error)
    console.warn("[v0] All Firebase features will be unavailable")
    app = null
    db = null
    auth = null
    googleProvider = null
  }
} else {
  console.warn("[v0] Firebase configuration incomplete - some environment variables are missing:")
  const missingVars = Object.entries(firebaseConfig)
    .filter(([_, value]) => !value)
    .map(([key]) => key)
  console.warn("[v0] Missing variables:", missingVars)
  console.warn("[v0] Please set these environment variables in your Vercel project settings")
}

// Export availability flags
export const isFirestoreAvailable = !!db
export const isAuthAvailable = !!auth

// Export Firebase instances
export { db, auth, googleProvider, isFirebaseConfigured }
