"use client";

import Link from "next/link";
import { Settings, BookOpen, Search, PlusCircle, Loader2 } from "lucide-react";
import CourseCard from "../components/courseCard";
import { useAuth } from "../context/AuthContext";
import AuthGuard from "../components/AuthGuard";

function HomeContent() {
  const { user, loading } = useAuth();
  const isTeacher = user?.role === "instructor";

  return (
    <div className="min-h-screen bg-[#F5F1E6]">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-zinc-300 bg-white/80 backdrop-blur-md px-8 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            href="/home"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800 text-[#F5F1E6]">
              <BookOpen size={22} />
            </div>
            <span className="hidden text-xl font-bold text-zinc-800 sm:block">
              CourseCanvas
            </span>
          </Link>

          {/* Search Bar */}
          <div className="relative mx-4 flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search courses..."
              className="w-full rounded-xl border border-zinc-300 bg-white px-10 py-2 text-zinc-800 outline-none transition focus:border-zinc-800"
            />
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/settings"
              className="flex h-10 items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 text-zinc-800 font-bold transition hover:bg-zinc-50 gap-2"
            >
              Settings
              <Settings
                size={20}
                className="transition-transform hover:rotate-45"
              />
            </Link>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl p-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
            <Loader2 className="mb-4 h-10 w-10 animate-spin text-zinc-800" />
            <p className="font-medium">Loading your dashboard...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex items-center justify-center">
              {isTeacher && (
                <Link
                  href="/courseCreation"
                  className="flex items-center gap-2 rounded-xl bg-zinc-800 px-6 py-3 font-semibold text-[#F5F1E6] transition hover:opacity-90"
                >
                  <PlusCircle size={18} />
                  Create Course
                </Link>
              )}
            </div>
            {/* Course Grid */}
            <div className="rounded-3xl border border-zinc-300 bg-white/50 p-8 shadow-sm">
              <CourseCard
                courses={
                  isTeacher
                    ? [
                        {
                          id: "CS101",
                          name: "Intro to Computer Science",
                          description: "Learn fundamentals...",
                          teacher: "Dr. Smith",
                          startDate: "2027-09-01",
                        },
                        {
                          id: "WD202",
                          name: "Intro to Web Development",
                          description: "Modern web dev...",
                          teacher: "Ms. Johnson",
                          startDate: "2027-10-15",
                        },
                        {
                          id: "DS303",
                          name: "Data Structures",
                          description: "Algorithmic approaches...",
                          teacher: "Prof. Williams",
                          startDate: "2027-11-01",
                        },
                      ]
                    : [
                        {
                          id: "WD202",
                          name: "Intro to Web Development",
                          description: "Modern web dev...",
                          teacher: "Ms. Johnson",
                          startDate: "2027-10-15",
                        },
                      ]
                }
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
