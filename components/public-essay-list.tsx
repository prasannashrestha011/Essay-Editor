"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePublicEssaysStore } from "@/stores/public-essays-store";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, User } from "lucide-react";

export default function PublicEssayList() {
  const { essays, isLoading, loadPublicEssays } = usePublicEssaysStore();

  useEffect(() => {
    loadPublicEssays();
  }, [loadPublicEssays]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getAuthorInitials = (userId: string) => {
    // Create initials from userId for display
    return userId.substring(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (essays.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No public essays yet
          </h3>
          <p className="text-gray-600 mb-6">
            Be the first to share your thoughts with the community!
          </p>
          <Link href="/write">
            <Button>Write and Share an Essay</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          Community Essays ({essays.length})
        </h2>
        <Link href="/write">
          <Button>Share Your Story</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {essays.map((essay) => (
          <Card
            key={essay.id}
            className="hover:shadow-md transition-shadow h-72 border border-gray-400 rounded-xl flex flex-col"
          >
            <CardHeader className="flex-shrink-0 pb-3">
              <CardTitle className="text-lg mb-2 line-clamp-2 min-h-[3.5rem]">
                {essay.title}
              </CardTitle>
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{getAuthorInitials(essay.userId)}</span>
                  </div>
                  <span>•</span>
                  <span>{formatDate(essay.createdAt)}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Public
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col flex-grow pt-0">
              <div className="flex-grow mb-4">
                <div
                  className="text-gray-700 text-sm line-clamp-4"
                  dangerouslySetInnerHTML={{
                    __html:
                      essay.content.replace(/<[^>]*>/g, "").substring(0, 150) +
                      "...",
                  }}
                />
              </div>
              <div className="mt-auto">
                <Link href={`/essays/${essay.id}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent border-gray-500"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Read Essay
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
