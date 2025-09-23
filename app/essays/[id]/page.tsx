import Navigation from "@/components/navigation"
import EssayViewer from "@/components/essay-viewer"

interface PageProps {
  params: {
    id: string
  }
}

export default function EssayPage({ params }: PageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <EssayViewer essayId={params.id} />
      </div>
    </div>
  )
}
