"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useEssaysStore } from "@/stores/essays-store"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Eye, Globe, Lock } from "lucide-react"

export default function PersonalEssayList() {
  const { user } = useAuth()
  const { essays, isLoading, loadEssays, deleteEssayHandler } = useEssaysStore()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (user?.uid) {
      loadEssays(user.uid)
    }
  }, [user?.uid, loadEssays])

  const handleDelete = async (id: string) => {
    if (!user?.uid) return

    setDeletingId(id)
    try {
      await deleteEssayHandler(id, user.uid)
    } catch (error) {
      console.error("Failed to delete essay:", error)
    } finally {
      setDeletingId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (essays.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No essays yet</h3>
          <p className="text-gray-600 mb-6">Start writing your first essay to see it here.</p>
          <Link href="/write">
            <Button>Write Your First Essay</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">Your Essays ({essays.length})</h2>
        <Link href="/write">
          <Button>Write New Essay</Button>
        </Link>
      </div>

      <div className="grid gap-6">
        {essays.map((essay) => (
          <Card key={essay.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 line-clamp-2">{essay.title}</CardTitle>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>Created {formatDate(essay.createdAt)}</span>
                    <div className="flex items-center gap-1">
                      {essay.isPublic ? (
                        <>
                          <Globe className="h-4 w-4" />
                          <Badge variant="secondary">Public</Badge>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          <Badge variant="outline">Private</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div
                className="text-gray-700 mb-4 line-clamp-3"
                dangerouslySetInnerHTML={{
                  __html: essay.content.replace(/<[^>]*>/g, "").substring(0, 200) + "...",
                }}
              />
              <div className="flex gap-2">
                <Link href={`/essays/${essay.id}`}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </Link>
                <Link href={`/write?edit=${essay.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Essay</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{essay.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(essay.id)}
                        disabled={deletingId === essay.id}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        {deletingId === essay.id ? "Deleting..." : "Delete"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
