import Navigation from "@/components/navigation"
import PublicEssayList from "@/components/public-essay-list"

export default function PublicEssaysPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Public Essays</h1>
          <p className="text-gray-600">Discover essays shared by our community</p>
        </div>
        <PublicEssayList />
      </div>
    </div>
  )
}
