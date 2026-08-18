import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";

export default async function Home() {
  let user = null;
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      // ignore
    }
  }

  return (
    <main className="abyss-glow flex flex-col items-center justify-center min-h-screen px-5 py-20 text-center">
      <div className="w-full max-w-[1440px] flex flex-col items-center gap-16">
        {/* ── Hero ── */}
        <div className="animate-fade-in-up flex flex-col items-center gap-6">
          <p className="t-caption">Who Wants to Be a</p>

          <h1 className="t-display aurora-text aurora-drift">
            MILLIONAIRE
          </h1>

          <p className="t-subheading max-w-md">
            Fifteen questions. Three lifelines. One million dollars.
          </p>

          <div className="flex flex-wrap justify-center gap-2 mt-2">
            {["$100", "$1,000", "$32,000", "$125,000", "$1,000,000"].map((v) => (
              <span
                key={v}
                className="t-caption px-3 py-1.5 rounded-[6px] bg-kelp text-mist"
              >
                {v}
              </span>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="animate-fade-in-up flex flex-col items-center gap-5">
          <Link href="/play" className="btn-aurora">
            Play Now
          </Link>

          {user ? (
            <div className="flex items-center gap-5">
              <Link href="/profile" className="btn-ghost">
                My Profile
              </Link>
              <Link href="/leaderboard" className="btn-ghost">
                Leaderboard
              </Link>
            </div>
          ) : (
            <p className="t-body-sm">
              <Link href="/auth" className="text-mist underline underline-offset-4 hover:text-platinum transition-colors">
                Sign in
              </Link>{" "}
              to save your scores
            </p>
          )}
        </div>

        {/* ── Features ── */}
        <div className="animate-fade-in-up grid grid-cols-1 sm:grid-cols-3 gap-5 w-full max-w-4xl">
          {[
            {
              stat: "08",
              title: "Professions",
              desc: "Medicine, Law, Engineering, Finance, Science, History and more.",
            },
            {
              stat: "03",
              title: "Lifelines",
              desc: "50:50, Ask the Audience, and an AI Hint when you need it most.",
            },
            {
              stat: "15",
              title: "Questions",
              desc: "Two safe havens on the climb from $100 to one million dollars.",
            },
          ].map((f) => (
            <div key={f.title} className="surface p-9 text-left flex flex-col gap-3">
              <span className="t-stat text-5xl">{f.stat}</span>
              <div className="flex flex-col gap-2">
                <p className="t-label">{f.title}</p>
                <p className="t-body-sm">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
