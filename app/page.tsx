<<<<<<< alessandro
import Link from "next/link";
import { Settings, BookOpen } from "lucide-react";
import CourseCard from "./components/courseCard";
import SignInPage from "./signin/page";
=======
"use client";
>>>>>>> master

import { useState } from "react";
// I had to add navigation to get to the home page after sign in.
import { useRouter } from "next/navigation";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [SignedOut, setSignedOut] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Authenticating:", { email, password });
    router.push("/home");
  };

  // fix the colors please, this is so bad. also add a background image or something to make it look nicer.
  // you need to ask if the user is a student or a teacher before they sign in.
  // also you need to cache the user data in local storage so my page can access it to see if the user is a student or a teacher 
  // and if you cached data the user doesn't have to sign in every time they visit the site.
  return (
<<<<<<< alessandro
    <div className="min-h-screen font-sans bg-[#F5F1E6]">
      {/* Header */}
      <header className="bg-[#D9D2C3] border-b border-black/10 px-8 py-4 flex items-center justify-between">
        {/* Logo & Home Link */}
        <Link
          href="/signin"
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-zinc-800 rounded flex items-center justify-center text-[#F5F1E6]">
            <BookOpen size={18} />
          </div>
          <span className="font-bold text-zinc-800 text-lg">CourseCanvas</span>
        </Link>
=======
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {SignedOut ? "Sign In" : "Sign Up"}
        </h1>
>>>>>>> master

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded-lg"
            required
          />

<<<<<<< alessandro
        {/* Courses & Settings */}
        <div className="flex items-center gap-6 text-zinc-800 font-medium">
          <Link href="/course" className="text-lg font-bold hover:opacity-80">
            Course
          </Link>
          <Link href="/settings" aria-label="Settings">
            <Settings
              size={22}
              className="hover:rotate-45 transition-transform cursor-pointer"
            />
          </Link>
        </div>
      </header>
=======
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border rounded-lg"
            required
          />
>>>>>>> master

          {SignedOut ? null : (
            <input
              type="password"
              placeholder="Confirm Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="p-3 border rounded-lg"
              required
            />
          )}

          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600"
          >
            Sign In
          </button>
          <button
            onClick={() => setSignedOut(!SignedOut)}
            className="mt-4 text-sm text-blue-500 hover:underline w-full text-center"
          >
            {SignedOut ? "Sign Up" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
