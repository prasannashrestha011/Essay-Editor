"use client"

import { useRouter } from "next/navigation"
import Link from "next/link"
import { useEssays } from "@/hooks/use-essays"

interface EssayViewerProps {
  essayId: string
}

export default function EssayViewer({ essayId }: EssayViewerProps) {
  const { getEssay, deleteEssay, isLoading } = useEssays()
  const router = useRouter()

  const essay = getEssay(essayId)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this essay?")) {
      deleteEssay(essayId)
      router.push("/essays")
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading essay...</div>
      </div>
    )
  }

  if (!essay) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Essay Not Found</h2>
        <p className="text-gray-600 mb-6">The essay you're looking for doesn't exist.</p>
        <Link
          href="/essays"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Back to Essays
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/essays"
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center"
          >
            ← Back to Essays
          </Link>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete
          </button>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-balance">{essay.title}</h1>

        <div className="text-gray-500 text-sm">
          Published on {formatDate(essay.createdAt)}
          {essay.updatedAt !== essay.createdAt && <span> • Updated on {formatDate(essay.updatedAt)}</span>}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8">
          <div
            className="essay-content prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: essay.content }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-center gap-4">
        <Link
          href="/write"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Write Another Essay
        </Link>
        <Link
          href="/essays"
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
        >
          View All Essays
        </Link>
      </div>
    </div>
  )
}
