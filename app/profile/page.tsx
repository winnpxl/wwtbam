import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatPrizeFull } from "@/lib/game/prizeLadder";
import { PROFESSIONS, type Profession } from "@/lib/types";

export default async function ProfilePage() {
  if (!isSupabaseConfigured()) redirect("/auth?redirectTo=/profile");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth?redirectTo=/profile");

  const { data: sessions } = await supabase
    .from("game_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const rows = sessions ?? [];
  const bestPrize = rows.reduce((max, s) => Math.max(max, s.prize_reached), 0);
  const gamesPlayed = rows.length;
  const wins = rows.filter((s) => s.completed).length;

  return (
    <main className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm font-display mb-4 block">
          ← Home
        </Link>
        <h1 className="font-display font-black text-3xl gold-shimmer mb-1">
          My Profile
        </h1>
        <p className="text-gray-500 text-xs">{user.email}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Games Played", value: gamesPlayed },
          { label: "Best Prize", value: formatPrizeFull(bestPrize) },
          { label: "Million Wins", value: wins },
        ].map((stat) => (
          <div key={stat.label} className="wwtbam-card p-4 text-center">
            <p className="font-display font-black text-2xl text-yellow-400">
              {stat.value}
            </p>
            <p className="text-gray-500 text-xs mt-1 font-display">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Match history */}
      <div className="wwtbam-card overflow-hidden">
        <div className="px-4 py-3 border-b border-yellow-900/30">
          <h2 className="font-display text-yellow-600 text-xs uppercase tracking-widest">
            Recent Games
          </h2>
        </div>
        <table className="w-full text-sm">
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td className="text-center py-12 text-gray-600 font-display">
                  No games yet — start playing!
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const modeLabel =
                  PROFESSIONS[row.mode as Profession]?.label ?? row.mode;
                const emoji = row.completed
                  ? "🏆"
                  : row.walked_away
                  ? "🚶"
                  : "💔";
                const date = new Date(row.created_at).toLocaleDateString();

                return (
                  <tr
                    key={row.id}
                    className="border-b border-blue-900/20 hover:bg-blue-900/20 transition-colors"
                  >
                    <td className="px-4 py-3 text-lg">{emoji}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">{modeLabel}</td>
                    <td className="px-4 py-3 text-right font-display font-bold text-yellow-400 text-sm">
                      {formatPrizeFull(row.prize_reached)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-600 text-xs hidden sm:table-cell">
                      {date}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Sign out */}
      <form action="/api/auth/signout" method="POST" className="mt-6 text-center">
        <button
          type="submit"
          className="text-xs text-gray-600 hover:text-gray-400 font-display transition-colors"
        >
          Sign out
        </button>
      </form>
    </main>
  );
}
