import Link from "next/link"
import Navigation from "@/components/navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Essay Writer</h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Create, write, and publish your essays with our intuitive rich-text editor. Share your thoughts and ideas
            with the world.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/write"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Start Writing
            </Link>
            <Link
              href="/essays"
              className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-3 px-8 rounded-lg border-2 border-blue-600 transition-colors duration-200"
            >
              Browse Public Essays
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
