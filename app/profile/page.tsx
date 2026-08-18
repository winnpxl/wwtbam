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

  const stats = [
    { label: "Games Played", value: String(gamesPlayed).padStart(2, "0") },
    { label: "Best Prize", value: formatPrizeFull(bestPrize) },
    { label: "Million Wins", value: String(wins).padStart(2, "0") },
  ];

  return (
    <main className="abyss-glow min-h-screen px-5 py-20">
      <div className="max-w-3xl mx-auto flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center animate-fade-in-up">
          <Link href="/" className="btn-ghost">
            ← Home
          </Link>
          <h1 className="t-heading-lg">My Profile</h1>
          <p className="t-body">{user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 animate-fade-in-up">
          {stats.map((stat) => (
            <div key={stat.label} className="surface p-9 flex flex-col gap-3">
              <p className="t-stat text-4xl">{stat.value}</p>
              <p className="t-caption">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* History */}
        <div className="surface overflow-hidden animate-fade-in-up">
          <div className="px-6 py-5 border-b border-white/8">
            <p className="t-caption">Recent Games</p>
          </div>

          {rows.length === 0 ? (
            <div className="py-20 flex flex-col items-center gap-4 text-center px-9">
              <p className="t-body">No games played yet.</p>
              <Link href="/play" className="btn-aurora">
                Play Your First Game
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <tbody>
                {rows.map((row) => {
                  const modeLabel =
                    PROFESSIONS[row.mode as Profession]?.label ?? row.mode;
                  const outcome = row.completed
                    ? "Won"
                    : row.walked_away
                    ? "Walked"
                    : "Lost";
                  const date = new Date(row.created_at).toLocaleDateString(
                    "en-US",
                    { month: "short", day: "numeric" }
                  );

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="px-6 py-5">
                        <span className="t-caption">{outcome}</span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm text-mist">{modeLabel}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="t-stat text-base">
                          {formatPrizeFull(row.prize_reached)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right hidden sm:table-cell">
                        <span className="text-xs text-slate">{date}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Sign out */}
        <form action="/api/auth/signout" method="POST" className="flex justify-center">
          <button type="submit" className="btn-ghost">
            Sign Out
          </button>
        </form>
      </div>
    </main>
  );
}
