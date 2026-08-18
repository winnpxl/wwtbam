import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import Link from "next/link";
import { cn } from "@/lib/utils";
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

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const [sessionsRes, userRes] = await Promise.all([
        supabase
          .from("game_sessions")
          .select(
            "id, user_id, mode, prize_reached, questions_answered, walked_away, completed, created_at"
          )
          .or("completed.eq.true,walked_away.eq.true")
          .order("prize_reached", { ascending: false })
          .limit(50),
        supabase.auth.getUser(),
      ]);
      rows = (sessionsRes.data as Row[]) ?? [];
      currentUserId = userRes.data.user?.id ?? null;
    } catch {
      // Supabase unreachable — render empty state
    }
  }

  return (
    <main className="abyss-glow min-h-screen px-5 py-20">
      <div className="max-w-3xl mx-auto flex flex-col gap-12">
        {/* Header */}
        <div className="flex flex-col items-center gap-4 text-center animate-fade-in-up">
          <Link href="/" className="btn-ghost">
            ← Home
          </Link>
          <h1 className="t-heading-lg">Leaderboard</h1>
          <p className="t-body">Top 50 scores of all time</p>
        </div>

        {/* Table */}
        <div className="surface overflow-hidden animate-fade-in-up">
          {rows.length === 0 ? (
            <div className="py-24 flex flex-col items-center gap-4 text-center px-9">
              <p className="t-caption">No Scores Yet</p>
              <p className="t-body">Be the first to climb the ladder.</p>
              <Link href="/play" className="btn-aurora mt-2">
                Play Now
              </Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/8">
                  <th className="t-caption text-left px-6 py-5">#</th>
                  <th className="t-caption text-left px-6 py-5">Player</th>
                  <th className="t-caption text-left px-6 py-5 hidden sm:table-cell">
                    Mode
                  </th>
                  <th className="t-caption text-right px-6 py-5">Prize</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, i) => {
                  const isMe = currentUserId === row.user_id;
                  const modeLabel =
                    PROFESSIONS[row.mode as Profession]?.label ?? row.mode;

                  return (
                    <tr
                      key={row.id}
                      className={cn(
                        "border-b border-white/5 last:border-0 transition-colors",
                        isMe ? "bg-bio-from/15" : "hover:bg-white/[0.03]"
                      )}
                    >
                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            "text-xs font-medium tabular-nums",
                            i < 3 ? "text-phosphor" : "text-slate"
                          )}
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span
                          className={cn(
                            "text-sm",
                            isMe ? "text-platinum font-medium" : "text-mist"
                          )}
                        >
                          {isMe ? "You" : `Player ${row.user_id.slice(0, 6)}`}
                        </span>
                      </td>
                      <td className="px-6 py-5 hidden sm:table-cell">
                        <span className="text-sm text-silver">{modeLabel}</span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <span className="t-stat text-base">
                          {formatPrizeFull(row.prize_reached)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {rows.length > 0 && (
          <div className="flex justify-center animate-fade-in-up">
            <Link href="/play" className="btn-aurora">
              Play Now
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
