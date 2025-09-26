"use client";
import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { useUserStore } from "@/stores/userStore";
import { auth } from "@/lib/firebase";

export function AuthListener() {
  const { setUser, setLoading } = useUserStore();
  useEffect(() => {
    if (!auth) {
      console.log("Auth state uninitialized");
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User logged in:", user);
        setUser(user);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [setUser]);

  return null;
}
