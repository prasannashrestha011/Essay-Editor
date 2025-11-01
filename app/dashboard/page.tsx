import Navigation from "@/components/navigation"
import PersonalEssayList from "@/components/personal-essay-list"
import { ProtectedRoute } from "@/components/protected-route"

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[hsl(var(--background))]">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[hsl(var(--foreground))] mb-2">My Dashboard</h1>
            <p className="text-[hsl(var(--foreground))]/70">Manage your personal essays and drafts</p>
          </div>
          <PersonalEssayList />
        </div>
      </div>
    </ProtectedRoute>
  )
}
