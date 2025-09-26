"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEssaysStore } from "@/stores/essays-store";
import { useDraftStore } from "@/stores/draft-store";
import { useAuth } from "@/contexts/auth-context";
import { UserMenu } from "./user-menu";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
//icons
import { BookDashed } from "lucide-react";
import { PenLine } from "lucide-react";
import { Gauge } from "lucide-react";

export default function Navigation() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { essays, loadEssays, clearEssays } = useEssaysStore();
  const { hasDraft, loadDraft, clearDraftState } = useDraftStore();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadEssays(user.uid);
      loadDraft(user.uid);
    } else {
      clearEssays();
      clearDraftState();
    }
  }, [user, loadEssays, loadDraft, clearEssays, clearDraftState]);

  const isActive = (path: string) => {
    if (path === "/") return pathname === path;
    return pathname.startsWith(path);
  };

  const closeDrawer = () => setIsDrawerOpen(false);

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Link
        href="/essays"
        onClick={mobile ? closeDrawer : undefined}
        className={`font-medium transition-colors ${
          mobile ? "block py-2 px-4 text-lg" : ""
        } ${
          isActive("/essays") && !isActive("/dashboard")
            ? "text-blue-600"
            : "text-gray-600 hover:text-blue-600"
        }`}
      >
        <BookDashed className="inline mb-1 mr-1" size={16} />
        Public Essays
      </Link>
      {user && (
        <>
          <Link
            href="/write"
            onClick={mobile ? closeDrawer : undefined}
            className={`font-medium transition-colors flex items-center gap-1 ${
              mobile ? "py-2 px-4 text-lg" : ""
            } ${
              isActive("/write")
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <PenLine className="inline" size={16} />
            Write
            {hasDraft() && (
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            )}
          </Link>
          <Link
            href="/dashboard"
            onClick={mobile ? closeDrawer : undefined}
            className={`font-medium transition-colors flex items-center gap-1 ${
              mobile ? "py-2 px-4 text-lg" : ""
            } ${
              isActive("/dashboard")
                ? "text-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
          >
            <Gauge className="inline mb-1 mr-1 mt-1" size={18} />
            Dashboard
            {essays.length > 0 && (
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
                {essays.length}
              </span>
            )}
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <nav className="bg-white shadow-sm border-b relative z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Essay Writer
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <NavLinks />
              {!loading &&
                (user ? (
                  <UserMenu user={user} />
                ) : (
                  <Button asChild>
                    <Link href="/login">Sign In</Link>
                  </Button>
                ))}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              {!loading && !user && (
                <Button asChild size="sm">
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
              <button
                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                aria-label="Toggle menu"
              >
                {isDrawerOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      {isDrawerOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeDrawer}
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out z-50 md:hidden ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Drawer Header */}

          <div className="flex items-center justify-between p-4 border-b">
            {user && (
              <div className=" p-1">
                <UserMenu user={user} mobile onItemClick={closeDrawer} />
              </div>
            )}
            <button
              onClick={closeDrawer}
              className="p-2 rounded-md text-gray-200 hover:text-gray-900 hover:bg-gray-100 transition-colors"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="flex-1 py-4">
            <NavLinks mobile />
          </div>

          {/* User Section */}
        </div>
      </div>
    </>
  );
}
