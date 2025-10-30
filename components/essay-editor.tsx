"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useEssaysStore } from "@/stores/essays-store"
import { useAuth } from "@/contexts/auth-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Globe, Lock, Save, X } from "lucide-react"

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill")
    await import("react-quill/dist/quill.snow.css")
    return RQ
  },
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 dark:border-slate-600 rounded-lg p-4 h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-800">
        <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
      </div>
    ),
  },
)

export default function EssayEditor() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [isPublic, setIsPublic] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  const { user } = useAuth()
  const { addEssayHandler, updateEssayHandler, getEssayHandler } = useEssaysStore()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const editId = searchParams.get("edit")
    if (editId && user) {
      const existingEssay = getEssayHandler(editId)
      if (existingEssay && existingEssay.userId === user.uid) {
        setTitle(existingEssay.title)
        setContent(existingEssay.content)
        setIsPublic(existingEssay.isPublic)
        setEditingId(editId)
        setIsEditing(true)
      }
    }
  }, [searchParams, user, getEssayHandler])

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link"],
      ["clean"],
    ],
  }

  const formats = ["header", "bold", "italic", "underline", "strike", "list", "bullet", "indent", "link"]

  const handlePublish = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Please provide both a title and content for your essay.")
      return
    }

    if (!user) {
      alert("You must be logged in to publish an essay.")
      return
    }

    setIsPublishing(true)

    try {
      let result
      if (isEditing && editingId) {
        result = await updateEssayHandler(
          editingId,
          {
            title: title.trim(),
            content: content,
            isPublic: isPublic,
          },
          user.uid,
        )
        if (result) {
          alert("Essay updated successfully!")
          router.push(`/essays/${editingId}`)
        } else {
          throw new Error("Failed to update essay")
        }
      } else {
        const newEssay = await addEssayHandler(
          {
            title: title.trim(),
            content: content,
            isPublic: isPublic,
          },
          user.uid,
        )

        if (newEssay) {
          setTitle("")
          setContent("")
          setIsPublic(false)
          alert("Essay published successfully!")
          router.push(`/essays/${newEssay.id}`)
        } else {
          throw new Error("Failed to publish essay")
        }
      }
      setIsPublishing(false)
    } catch (error) {
      console.error("Error publishing essay:", error)
      alert("Error publishing essay. Please try again.")
      setIsPublishing(false)
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      router.push("/dashboard")
    } else {
      setTitle("")
      setContent("")
      setIsPublic(false)
    }
  }

  if (!isMounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700">
            <div className="p-8 border-b border-gray-200 dark:border-slate-700">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Write Your Essay</h1>
            </div>
            <div className="p-8">
              <div className="border border-gray-300 dark:border-slate-600 rounded-lg p-4 h-64 flex items-center justify-center bg-gray-50 dark:bg-slate-800">
                <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-950 dark:to-slate-900 p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {isEditing ? "Edit Your Essay" : "Create New Essay"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isEditing ? "Update your essay and save changes" : "Share your thoughts and ideas with the world"}
          </p>
        </div>

        {/* Main Editor Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
          {/* Title Section */}
          <div className="p-8 border-b border-gray-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Essay Title</label>
            <input
              type="text"
              placeholder="Enter a compelling title for your essay..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-2xl font-bold p-4 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Privacy Toggle Section */}
          <div className="px-8 py-4 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isPublic ? (
                  <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <Lock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                )}
                <div>
                  <Label htmlFor="privacy-toggle" className="text-sm font-semibold text-gray-900 dark:text-white">
                    {isPublic ? "Public Essay" : "Private Essay"}
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {isPublic ? "Visible to everyone on the platform" : "Only visible to you"}
                  </p>
                </div>
              </div>
              <Switch id="privacy-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="p-8">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Essay Content</label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Start writing your essay here... Share your insights, stories, and ideas."
              className="mb-6 bg-white dark:bg-slate-800"
            />
          </div>

          {/* Action Buttons */}
          <div className="px-8 py-6 border-t border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 flex flex-wrap gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors font-medium flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              {isEditing ? "Cancel" : "Clear"}
            </button>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
            >
              <Save className="h-4 w-4" />
              {isPublishing
                ? isEditing
                  ? "Updating..."
                  : "Publishing..."
                : isEditing
                  ? "Update Essay"
                  : "Publish Essay"}
            </button>
          </div>
        </div>

        {/* Writing Tips */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">✨</span> Writing Tips
            </h3>
            <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-2">
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Use headings to structure your essay clearly</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Bold important points for emphasis</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Create lists to organize your thoughts</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Add links to reference sources</span>
              </li>
            </ul>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-md border border-gray-200 dark:border-slate-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🔒</span> Privacy Control
            </h3>
            <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-2">
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Keep essays private while drafting</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Make public when ready to share</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Toggle privacy anytime</span>
              </li>
              <li className="flex gap-2">
                <span className="text-blue-600 dark:text-blue-400 font-bold">•</span>
                <span>Only you can edit your essays</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
