"use client";

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
    <main className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {SignedOut ? "Sign In" : "Sign Up"}
        </h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border rounded-lg"
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border rounded-lg"
            required
          />

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
