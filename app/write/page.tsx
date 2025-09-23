import Navigation from "@/components/navigation"
import EssayEditor from "@/components/essay-editor"

export default function WritePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto py-8">
        <EssayEditor />
      </div>
    </div>
  )
}
