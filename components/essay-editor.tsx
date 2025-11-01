"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useEssaysStore } from "@/stores/essays-store"
import { useAuth } from "@/contexts/auth-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Globe, Lock, Save, X, FileText, Zap } from "lucide-react"

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill")
    await import("react-quill/dist/quill.snow.css")
    return RQ
  },
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-6 h-80 flex items-center justify-center bg-gray-50 dark:bg-slate-800">
        <div className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-amber-500 border-t-transparent"></div>
          Loading editor...
        </div>
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
      <div className="min-h-screen bg-white dark:bg-slate-950 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800">
            <div className="p-8">
              <div className="border border-gray-200 dark:border-slate-700 rounded-xl p-6 h-80 flex items-center justify-center bg-gray-50 dark:bg-slate-800">
                <div className="text-gray-500 dark:text-gray-400">Loading editor...</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] text-[hsl(var(--foreground))] p-6 transition-colors">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-4xl font-bold text-[hsl(var(--foreground))]">
              {isEditing ? "Edit Essay" : "Write Essay"}
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400 ml-11">
            {isEditing ? "Update your essay and save changes" : "Create and publish your thoughts"}
          </p>
        </div>

        {/* Main Editor Card */}
        <div className="bg-[hsl(var(--card))] dark:bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] overflow-hidden">
          {/* Title Section */}
          <div className="p-8 border-b border-[hsl(var(--border))]">
            <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-3">Essay Title</label>
            <input
              type="text"
              placeholder="Enter a compelling title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-3xl font-bold p-4 border border-[hsl(var(--border))] rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-400 dark:placeholder-gray-500 bg-[hsl(var(--card))] text-[hsl(var(--foreground))] transition-all"
            />
          </div>

          <div className="px-8 py-6 border-b border-[hsl(var(--border))] bg-gray-50 dark:bg-slate-800/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  {isPublic ? (
                    <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  ) : (
                    <Lock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  )}
                </div>
                <div>
                  <Label htmlFor="privacy-toggle" className="text-sm font-semibold text-[hsl(var(--foreground))] block">
                    {isPublic ? "Public Essay" : "Private Essay"}
                  </Label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {isPublic ? "Visible to everyone" : "Only visible to you"}
                  </p>
                </div>
              </div>
              <Switch id="privacy-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div className="p-8">
            <label className="block text-sm font-semibold text-[hsl(var(--foreground))] mb-4">Essay Content</label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Start writing your essay here..."
              className="mb-6 bg-[hsl(var(--card))]"
            />
          </div>

          <div className="px-8 py-6 border-t border-[hsl(var(--border))] bg-gray-50 dark:bg-slate-800/50 flex flex-wrap gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-600 transition-all font-medium flex items-center gap-2 shadow-sm hover:shadow-md"
            >
              <X className="h-4 w-4" />
              {isEditing ? "Cancel" : "Clear"}
            </button>

            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-6 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium flex items-center gap-2 shadow-md hover:shadow-lg"
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

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-bold text-[hsl(var(--foreground))]">Writing Tips</h3>
            </div>
            <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-3">
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                <span>Use clear headings to structure your essay</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                <span>Bold important points for emphasis</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                <span>Create lists to organize thoughts</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                <span>Add links to reference sources</span>
              </li>
            </ul>
          </div>

          <div className="bg-[hsl(var(--card))] rounded-2xl shadow-sm border border-[hsl(var(--border))] p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <Lock className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-bold text-[hsl(var(--foreground))]">Privacy Control</h3>
            </div>
            <ul className="text-gray-700 dark:text-gray-300 text-sm space-y-3">
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                <span>Keep essays private while drafting</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                <span>Make public when ready to share</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                <span>Toggle privacy anytime</span>
              </li>
              <li className="flex gap-3">
                <span className="text-blue-500 font-bold flex-shrink-0">•</span>
                <span>Only you can edit your essays</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
