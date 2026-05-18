import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import Link from "next/link";
import { formatPrizeFull } from "@/lib/game/prizeLadder";
import { PROFESSIONS, type Profession } from "@/lib/types";

export const revalidate = 60;

type Row = {
  id: string;
  user_id: string;
  mode: string;
  prize_reached: number;
  questions_answered: number;
  walked_away: boolean;
  completed: boolean;
  created_at: string;
};

export default async function LeaderboardPage() {
  let rows: Row[] = [];
  let currentUserId: string | null = null;

  if (isSupabaseConfigured()) try {
    const supabase = await createClient();
    const [sessionsRes, userRes] = await Promise.all([
      supabase
        .from("game_sessions")
        .select("id, user_id, mode, prize_reached, questions_answered, walked_away, completed, created_at")
        .or("completed.eq.true,walked_away.eq.true")
        .order("prize_reached", { ascending: false })
        .limit(50),
      supabase.auth.getUser(),
    ]);
    rows = (sessionsRes.data as Row[]) ?? [];
    currentUserId = userRes.data.user?.id ?? null;
  } catch {
    // Supabase not configured — show empty state
  }

  return (
    <main className="min-h-screen px-4 py-12 max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm font-display mb-4 block">
          ← Home
        </Link>
        <h1 className="font-display font-black text-3xl gold-shimmer mb-1">
          Leaderboard
        </h1>
        <p className="text-gray-500 text-xs font-display">Top 50 all-time scores</p>
      </div>

      <div className="wwtbam-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-yellow-900/30">
              <th className="px-4 py-3 text-left text-xs font-display text-yellow-600 uppercase">#</th>
              <th className="px-4 py-3 text-left text-xs font-display text-yellow-600 uppercase">Player</th>
              <th className="px-4 py-3 text-left text-xs font-display text-yellow-600 uppercase">Mode</th>
              <th className="px-4 py-3 text-right text-xs font-display text-yellow-600 uppercase">Prize</th>
              <th className="px-4 py-3 text-right text-xs font-display text-yellow-600 uppercase hidden sm:table-cell">Qs</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-gray-600 font-display">
                  No scores yet — be the first!
                </td>
              </tr>
            ) : (
              rows.map((row, i) => {
                const isMe = currentUserId === row.user_id;
                const modeLabel = PROFESSIONS[row.mode as Profession]?.label ?? row.mode;
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;

                return (
                  <tr
                    key={row.id}
                    className={`border-b border-blue-900/20 transition-colors ${
                      isMe ? "bg-yellow-500/5 border-yellow-900/30" : "hover:bg-blue-900/20"
                    }`}
                  >
                    <td className="px-4 py-3 font-display text-gray-500 text-xs">{medal ?? i + 1}</td>
                    <td className="px-4 py-3 text-gray-300 text-xs">
                      {isMe ? (
                        <span className="text-yellow-400 font-bold">You</span>
                      ) : (
                        `Player ${row.user_id.slice(0, 6)}`
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{modeLabel}</td>
                    <td className="px-4 py-3 text-right font-display font-bold text-yellow-400">
                      {formatPrizeFull(row.prize_reached)}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs hidden sm:table-cell">
                      {row.questions_answered}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="text-center mt-6">
        <Link
          href="/play"
          className="inline-block px-8 py-3 rounded-full bg-yellow-500 text-blue-950 font-display font-bold hover:bg-yellow-400 transition-colors"
        >
          Play Now
        </Link>
      </div>
    </main>
  );
}
