"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEssaysStore } from "@/stores/essays-store";
import { usePublicEssaysStore } from "@/stores/public-essays-store";
import { useAuth } from "@/contexts/auth-context";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface EssayViewerProps {
  essayId: string;
}

export default function EssayViewer({ essayId }: EssayViewerProps) {
  const { user } = useAuth();
  const {
    getEssayHandler,
    deleteEssayHandler,
    isLoading: personalLoading,
    loadEssays,
  } = useEssaysStore();
  const { getPublicEssayHandler } = usePublicEssaysStore();
  const router = useRouter();

  const [essay, setEssay] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadEssay = async () => {
      setIsLoading(true);

      // First try to get from personal essays if user is logged in
      if (user) {
        await loadEssays(user.uid);
        const personalEssay = getEssayHandler(essayId);
        if (personalEssay) {
          setEssay(personalEssay);
          setIsLoading(false);
          return;
        }
      }

      // If not found in personal essays, try public essays
      const publicEssay = await getPublicEssayHandler(essayId);
      if (publicEssay) {
        setEssay(publicEssay);
      }

      setIsLoading(false);
    };

    loadEssay();
  }, [user, essayId, loadEssays, getEssayHandler, getPublicEssayHandler]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDelete = async () => {
    if (!user || !essay || essay.userId !== user.uid) return;

    setIsDeleting(true);
    try {
      const success = await deleteEssayHandler(essayId, user.uid);
      if (success) {
        router.push("/dashboard");
      } else {
        alert("Failed to delete essay. Please try again.");
      }
    } catch (error) {
      console.error("Error deleting essay:", error);
      alert("Error deleting essay. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const isOwner = user && essay && essay.userId === user.uid;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!essay) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Essay Not Found
        </h2>
        <p className="text-gray-600 mb-6">
          The essay you're looking for doesn't exist or is not accessible.
        </p>
        <Link
          href="/"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <Link
            href={isOwner ? "/dashboard" : "/"}
            className="text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center"
          >
            ← {isOwner ? "Back to Dashboard" : "Back to Home"}
          </Link>

          {isOwner && (
            <div className="flex gap-2">
              <Link href={`/write?edit=${essayId}`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-300 rounded-lg overflow-hidden">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Essay</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{essay.title}"? This
                      action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-red-600 hover:bg-red-700 text-slate-300 rounded-lg"
                    >
                      {isDeleting ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-4 text-balance">
          {essay.title}
        </h1>

        <div className="text-gray-500 text-sm flex items-center gap-4">
          <span>Published on {formatDate(essay.createdAt)}</span>
          {essay.updatedAt !== essay.createdAt && (
            <span>• Updated on {formatDate(essay.updatedAt)}</span>
          )}
          {!isOwner && <span>• By {essay.userId.substring(0, 8)}...</span>}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-8">
          <div
            className="essay-content prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: essay.content }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="mt-8 flex justify-center gap-4">
        {isOwner ? (
          <>
            <Link
              href="/write"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Write Another Essay
            </Link>
            <Link
              href="/dashboard"
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              View All Essays
            </Link>
          </>
        ) : (
          <>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Explore More Essays
            </Link>
            {user && (
              <Link
                href="/write"
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Write Your Own
              </Link>
            )}
          </>
        )}
      </div>
    </div>
  );
}
