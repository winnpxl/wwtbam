"use client";

import Link from "next/link";
import { formatPrizeFull } from "@/lib/game/prizeLadder";

interface GameOverProps {
  phase: "wrong" | "walkaway" | "gameover";
  prizeReached: number;
  questionsAnswered: number;
  onPlayAgain: () => void;
}

const PHASE_CONFIG: Record<
  GameOverProps["phase"],
  { title: string; subtitle: string; caption: string }
> = {
  gameover: {
    caption: "Perfect Game",
    title: "You Are a Millionaire",
    subtitle: "All fifteen questions answered correctly.",
  },
  wrong: {
    caption: "Game Over",
    title: "Incorrect Answer",
    subtitle: "You fall back to your last safe haven.",
  },
  walkaway: {
    caption: "Walked Away",
    title: "You Took the Money",
    subtitle: "A calculated decision — and a wise one.",
  },
};

export function GameOver({
  phase,
  prizeReached,
  questionsAnswered,
  onPlayAgain,
}: GameOverProps) {
  const config = PHASE_CONFIG[phase];

  return (
    <main className="abyss-glow min-h-screen flex items-center justify-center px-5 py-20">
      <div className="w-full max-w-2xl flex flex-col items-center gap-12 text-center animate-fade-in-up">
        {/* Headline */}
        <div className="flex flex-col items-center gap-4">
          <p className="t-caption">{config.caption}</p>
          <h1
            className={
              phase === "gameover"
                ? "t-heading-lg aurora-text aurora-drift"
                : "t-heading-lg"
            }
          >
            {config.title}
          </h1>
          <p className="t-body max-w-sm">{config.subtitle}</p>
        </div>

        {/* Winnings */}
        <div className="surface w-full p-12 flex flex-col items-center gap-3">
          <p className="t-caption">Total Winnings</p>
          <p className="t-stat text-6xl md:text-7xl">
            {formatPrizeFull(prizeReached)}
          </p>
          <p className="t-body-sm">
            {questionsAnswered} of 15 questions answered
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button onClick={onPlayAgain} className="btn-aurora">
            Play Again
          </button>
          <Link href="/leaderboard" className="btn-kelp">
            Leaderboard
          </Link>
          <Link href="/play" className="btn-ghost px-4">
            Change Mode
          </Link>
        </div>
      </div>
    </main>
  );
}
