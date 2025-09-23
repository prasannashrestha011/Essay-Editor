"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEssaysStore } from "@/stores/essays-store"
import { useDraftStore } from "@/stores/draft-store"
import { useAuth } from "@/contexts/auth-context"
import { UserMenu } from "./user-menu"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function Navigation() {
  const pathname = usePathname()
  const { user, loading } = useAuth()
  const { essays, loadEssays, clearEssays } = useEssaysStore()
  const { hasDraft, loadDraft, clearDraftState } = useDraftStore()

  useEffect(() => {
    if (user) {
      loadEssays(user.uid)
      loadDraft(user.uid)
    } else {
      clearEssays()
      clearDraftState()
    }
  }, [user, loadEssays, loadDraft, clearEssays, clearDraftState])

  const isActive = (path: string) => {
    if (path === "/") return pathname === path
    return pathname.startsWith(path)
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-xl font-bold text-gray-900">
            Essay Writer
          </Link>

          <div className="flex items-center space-x-6">
            {user && (
              <>
                <Link
                  href="/write"
                  className={`font-medium transition-colors flex items-center gap-1 ${
                    isActive("/write") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Write
                  {hasDraft() && <span className="w-2 h-2 bg-green-500 rounded-full"></span>}
                </Link>
                <Link
                  href="/essays"
                  className={`font-medium transition-colors flex items-center gap-1 ${
                    isActive("/essays") ? "text-blue-600" : "text-gray-600 hover:text-blue-600"
                  }`}
                >
                  Essays
                  {essays.length > 0 && (
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">{essays.length}</span>
                  )}
                </Link>
              </>
            )}

            {!loading &&
              (user ? (
                <UserMenu user={user} />
              ) : (
                <Button asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
              ))}
          </div>
        </div>
      </div>
    </nav>
  )
}
