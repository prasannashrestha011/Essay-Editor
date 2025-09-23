import Navigation from "@/components/navigation"
import EssayList from "@/components/essay-list"

export default function EssaysPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <EssayList />
      </div>
    </div>
  )
}
