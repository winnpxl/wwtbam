"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/play";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Check your email to confirm your account!",
        });
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err: unknown) {
      setMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="wwtbam-card p-8 w-full max-w-md animate-fade-in-up">
        {/* Title */}
        <h1 className="font-display font-black text-2xl text-center gold-shimmer mb-1">
          MILLIONAIRE?
        </h1>
        <p className="text-center text-gray-500 text-xs mb-6 font-display">
          {mode === "login" ? "Welcome back!" : "Create your account"}
        </p>

        {/* Mode toggle */}
        <div className="flex rounded-full border border-yellow-900 overflow-hidden mb-6">
          {(["login", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2 text-sm font-display transition-colors ${
                mode === m
                  ? "bg-yellow-500 text-blue-950 font-bold"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs font-display text-gray-400 mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-blue-950/50 border border-blue-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-display text-gray-400 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-blue-950/50 border border-blue-800 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-yellow-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          {message && (
            <p
              className={`text-sm text-center py-2 rounded-lg px-4 ${
                message.type === "error"
                  ? "bg-red-900/30 text-red-400 border border-red-800"
                  : "bg-green-900/30 text-green-400 border border-green-800"
              }`}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="py-3 rounded-full bg-yellow-500 text-blue-950 font-display font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-4 font-display">
          <button onClick={() => router.push("/play")} className="hover:text-gray-400 transition-colors">
            Continue as guest →
          </button>
        </p>
      </div>
    </main>
  );
}
