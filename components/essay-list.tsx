"use client"

import Link from "next/link"
import { useEssaysStore } from "@/stores/essays-store"
import { useAuth } from "@/contexts/auth-context"
import { useEffect } from "react"

export default function EssayList() {
  const { user } = useAuth()
  const { essays, isLoading, deleteEssayHandler, loadEssays, clearEssays } = useEssaysStore()

  useEffect(() => {
    if (user) {
      loadEssays(user.uid)
    } else {
      clearEssays()
    }
  }, [user, loadEssays, clearEssays])

  const handleDeleteEssay = async (essayId: string) => {
    if (!user) return

    if (confirm("Are you sure you want to delete this essay?")) {
      await deleteEssayHandler(essayId, user.uid)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getPreview = (content: string) => {
    // Strip HTML tags and get first 150 characters
    const textContent = content.replace(/<[^>]*>/g, "")
    return textContent.length > 150 ? textContent.substring(0, 150) + "..." : textContent
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading essays...</div>
      </div>
    )
  }

  if (essays.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 mb-4">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No essays yet</h3>
        <p className="text-gray-500 mb-6">Start writing your first essay to see it here.</p>
        <Link
          href="/write"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Write Your First Essay
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Published Essays</h1>
          <p className="text-gray-600 mt-1">
            {essays.length} essay{essays.length !== 1 ? "s" : ""} published
          </p>
        </div>
        <Link
          href="/write"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Write New Essay
        </Link>
      </div>

      <div className="space-y-6">
        {essays.map((essay) => (
          <div key={essay.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                <h2 className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                  <Link href={`/essays/${essay.id}`}>{essay.title}</Link>
                </h2>
                <button
                  onClick={() => handleDeleteEssay(essay.id)}
                  className="text-red-500 hover:text-red-700 transition-colors p-1"
                  title="Delete essay"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>

              <p className="text-gray-600 mb-4 leading-relaxed">{getPreview(essay.content)}</p>

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Published on {formatDate(essay.createdAt)}</span>
                <Link
                  href={`/essays/${essay.id}`}
                  className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  Read more →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
