"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { cn } from "@/lib/utils";

type Mode = "login" | "signup";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") ?? "/play";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "error" | "success";
    text: string;
  } | null>(null);

  const configured = isSupabaseConfigured();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Created here rather than during render: without credentials this
      // throws, which would take the whole page down instead of showing
      // the notice below.
      const supabase = createClient();

      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage({
          type: "success",
          text: "Check your email to confirm your account.",
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
    <main className="abyss-glow min-h-screen flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-md flex flex-col gap-9 animate-fade-in-up">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="t-caption">Who Wants to Be a</p>
          <h1 className="t-heading aurora-text aurora-drift">MILLIONAIRE</h1>
          <p className="t-body-sm">
            {mode === "login"
              ? "Sign in to save your scores."
              : "Create an account to track your progress."}
          </p>
        </div>

        {/* Card */}
        <div className="surface p-9 flex flex-col gap-7">
          {!configured && (
            <div className="rounded-[6px] bg-deep px-4 py-3.5 flex flex-col gap-1.5">
              <p className="t-caption text-phosphor">Accounts Unavailable</p>
              <p className="text-xs leading-relaxed text-silver">
                Sign-in isn&apos;t configured on this deployment. You can still
                play as a guest — scores just won&apos;t be saved.
              </p>
            </div>
          )}

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-[6px] bg-deep">
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex-1 py-2.5 rounded-[6px] t-caption transition-all duration-200",
                  mode === m
                    ? "aurora-bg text-abyss"
                    : "text-silver hover:text-mist"
                )}
              >
                {m === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="t-caption">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-deep rounded-[6px] px-4 py-3 text-sm text-mist placeholder:text-slate outline-none transition-shadow focus:ring-1 focus:ring-bio-from"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="t-caption">Password</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-deep rounded-[6px] px-4 py-3 text-sm text-mist placeholder:text-slate outline-none transition-shadow focus:ring-1 focus:ring-bio-from"
              />
            </div>

            {message && (
              <p
                className={cn(
                  "text-xs leading-relaxed px-4 py-3 rounded-[6px] bg-deep",
                  message.type === "error" ? "text-wrong" : "text-correct"
                )}
              >
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !configured}
              className="btn-aurora w-full"
            >
              {loading
                ? "Please wait…"
                : mode === "login"
                ? "Sign In"
                : "Create Account"}
            </button>
          </form>
        </div>

        {/* Guest */}
        <button
          onClick={() => router.push("/play")}
          className="btn-ghost self-center"
        >
          Continue as guest →
        </button>
      </div>
    </main>
  );
}

/**
 * useSearchParams() opts the tree into client-side rendering, so it must sit
 * under a Suspense boundary for Next to prerender this route at build time.
 */
export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <main className="abyss-glow min-h-screen flex items-center justify-center px-5">
          <p className="t-caption animate-pulse-soft">Loading</p>
        </main>
      }
    >
      <AuthForm />
    </Suspense>
  );
}
