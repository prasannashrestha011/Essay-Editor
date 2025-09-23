"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useEssaysStore } from "@/stores/essays-store"
import { useDraftStore } from "@/stores/draft-store"
import { useAuth } from "@/contexts/auth-context"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Globe, Lock } from "lucide-react"

const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill")
    // Import styles
    await import("react-quill/dist/quill.snow.css")
    return RQ
  },
  {
    ssr: false,
    loading: () => (
      <div className="border border-gray-300 rounded-lg p-4 h-64 flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">Loading editor...</div>
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
  const { draft, saveDraft, clearDraft, hasDraft } = useDraftStore()

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

  useEffect(() => {
    if (draft && !isEditing) {
      setTitle(draft.title)
      setContent(draft.content)
    }
  }, [draft, isEditing])

  useEffect(() => {
    const interval = setInterval(() => {
      if ((title.trim() || content.trim()) && user && !isEditing) {
        saveDraft(title, content, user.uid)
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [title, content, saveDraft, user, isEditing])

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
          await clearDraft(user.uid)
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

  const handleSaveDraft = async () => {
    if (!title.trim() && !content.trim()) {
      alert("Nothing to save.")
      return
    }

    if (!user) {
      alert("You must be logged in to save a draft.")
      return
    }

    if (isEditing) {
      alert("Changes to existing essays are saved automatically when you update.")
      return
    }

    const success = await saveDraft(title, content, user.uid)
    if (success) {
      alert("Draft saved!")
    } else {
      alert("Error saving draft. Please try again.")
    }
  }

  const handleClearDraft = async () => {
    if (confirm("Are you sure you want to clear the current draft?")) {
      setTitle("")
      setContent("")
      setIsPublic(false)
      if (user && !isEditing) {
        await clearDraft(user.uid)
      }
    }
  }

  if (!isMounted) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Write Your Essay</h1>
          </div>
          <div className="p-6">
            <div className="border border-gray-300 rounded-lg p-4 h-64 flex items-center justify-center bg-gray-50">
              <div className="text-gray-500">Loading editor...</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{isEditing ? "Edit Essay" : "Write Your Essay"}</h1>
            {hasDraft() && !isEditing && (
              <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">Draft saved</div>
            )}
          </div>

          {/* Title Input */}
          <input
            type="text"
            placeholder="Enter your essay title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-semibold p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
          />

          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {isPublic ? <Globe className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-gray-600" />}
              <Label htmlFor="privacy-toggle" className="text-sm font-medium">
                {isPublic ? "Public Essay" : "Private Essay"}
              </Label>
            </div>
            <Switch id="privacy-toggle" checked={isPublic} onCheckedChange={setIsPublic} />
            <span className="text-xs text-gray-600">{isPublic ? "Visible to everyone" : "Only visible to you"}</span>
          </div>
        </div>

        {/* Rich Text Editor */}
        <div className="p-6">
          <ReactQuill
            theme="snow"
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            placeholder="Start writing your essay..."
            className="mb-6"
          />
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-t bg-gray-50 flex flex-wrap gap-3 justify-between">
          <div className="flex gap-3">
            {!isEditing && (
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Save Draft
              </button>
            )}
            <button
              onClick={handleClearDraft}
              className="px-4 py-2 text-red-600 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              {isEditing ? "Reset Changes" : "Clear Draft"}
            </button>
          </div>

          <button
            onClick={handlePublish}
            disabled={isPublishing}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
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
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Writing Tips:</h3>
        <ul className="text-blue-800 text-sm space-y-1">
          <li>• Use headings to structure your essay</li>
          <li>• Bold important points for emphasis</li>
          <li>• Create lists to organize your thoughts</li>
          <li>• Toggle privacy to control who can see your essay</li>
          {!isEditing && <li>• Drafts are auto-saved every 30 seconds</li>}
        </ul>
      </div>
    </div>
  )
}
