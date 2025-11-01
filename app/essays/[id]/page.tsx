import Navigation from "@/components/navigation"
import EssayViewer from "@/components/essay-viewer"
import { ProtectedRoute } from "@/components/protected-route"

interface PageProps {
  params: {
    id: string
  }
}

export default function EssayPage({ params }: PageProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <EssayViewer essayId={params.id} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
