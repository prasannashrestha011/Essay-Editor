import Navigation from "@/components/navigation"
import EssayEditor from "@/components/essay-editor"
import { ProtectedRoute } from "@/components/protected-route"

export default function WritePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <Navigation />
        <div className="container mx-auto py-8">
          <EssayEditor />
        </div>
      </div>
    </ProtectedRoute>
  )
}
