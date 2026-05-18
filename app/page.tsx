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
    <main className="flex flex-col items-center justify-center min-h-screen px-4 text-center gap-8">
      {/* Radial glow background */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 80% 60% at 50% 50%, rgba(26,45,122,0.4) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Logo / Title */}
      <div className="animate-fade-in-up">
        <p className="text-gold-500 text-xs font-display tracking-[0.4em] uppercase mb-4">
          Who Wants to Be a
        </p>
        <h1 className="font-display font-black text-5xl md:text-7xl gold-shimmer leading-tight">
          MILLIONAIRE?
        </h1>
        <div className="mt-3 flex justify-center gap-2 flex-wrap">
          {["$100", "$1K", "$32K", "$125K", "$1M"].map((v) => (
            <span
              key={v}
              className="text-[10px] font-display text-yellow-700 border border-yellow-900 px-2 py-0.5 rounded-full"
            >
              {v}
            </span>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="flex flex-col items-center gap-4 animate-fade-in-up">
        <Link
          href="/play"
          className="px-12 py-4 rounded-full bg-yellow-400 text-blue-950 font-display font-black text-xl hover:bg-yellow-300 transition-all hover:scale-105 shadow-lg shadow-yellow-500/20"
        >
          Play Now
        </Link>

        {user ? (
          <div className="flex gap-3 text-sm">
            <Link
              href="/profile"
              className="text-yellow-400 hover:text-yellow-300 font-display transition-colors"
            >
              My Profile
            </Link>
            <span className="text-gray-600">·</span>
            <Link
              href="/leaderboard"
              className="text-gray-400 hover:text-gray-200 font-display transition-colors"
            >
              Leaderboard
            </Link>
          </div>
        ) : (
          <p className="text-sm text-gray-400">
            <Link href="/auth" className="text-yellow-400 hover:underline">
              Sign in
            </Link>{" "}
            to save your scores
          </p>
        )}
      </div>

      {/* Features strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full mt-4 animate-fade-in-up">
        {[
          { icon: "🎓", title: "8 Professions", desc: "Medicine, Law, Engineering and more" },
          { icon: "🧠", title: "3 Lifelines", desc: "50:50, Audience & AI Hint" },
          { icon: "🏆", title: "$1,000,000", desc: "Can you go all the way?" },
        ].map((f) => (
          <div key={f.title} className="wwtbam-card p-4 text-center">
            <span className="text-2xl">{f.icon}</span>
            <p className="font-display text-yellow-400 text-sm font-bold mt-1">{f.title}</p>
            <p className="text-gray-400 text-xs mt-1">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
