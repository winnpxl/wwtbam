"use client";

import Link from "next/link";
import { formatPrizeFull } from "@/lib/game/prizeLadder";
import type { GamePhase } from "@/lib/types";

interface GameOverProps {
  phase: "wrong" | "walkaway" | "gameover";
  prizeReached: number;
  questionsAnswered: number;
  onPlayAgain: () => void;
}

const PHASE_CONFIG: Record<
  GamePhase,
  { title: string; subtitle: string; emoji: string }
> = {
  gameover: {
    title: "YOU ARE A MILLIONAIRE!",
    subtitle: "You've answered all 15 questions correctly!",
    emoji: "🏆",
  },
  wrong: {
    title: "Incorrect!",
    subtitle: "Better luck next time.",
    emoji: "💔",
  },
  walkaway: {
    title: "You Walked Away!",
    subtitle: "A wise decision.",
    emoji: "🚶",
  },
  idle: { title: "", subtitle: "", emoji: "" },
  question: { title: "", subtitle: "", emoji: "" },
  revealing: { title: "", subtitle: "", emoji: "" },
  correct: { title: "", subtitle: "", emoji: "" },
};

export function GameOver({
  phase,
  prizeReached,
  questionsAnswered,
  onPlayAgain,
}: GameOverProps) {
  const config = PHASE_CONFIG[phase];

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 animate-fade-in-up text-center px-4">
      <span className="text-7xl">{config.emoji}</span>

      <div>
        <h1 className="font-display text-3xl md:text-5xl font-black text-gold gold-shimmer mb-2">
          {config.title}
        </h1>
        <p className="text-gray-300 text-lg">{config.subtitle}</p>
      </div>

      <div className="wwtbam-card px-10 py-6">
        <p className="text-gray-400 text-sm uppercase tracking-widest font-display mb-1">
          You won
        </p>
        <p className="font-display text-4xl md:text-6xl font-black text-gold">
          {formatPrizeFull(prizeReached)}
        </p>
        <p className="text-gray-400 text-xs mt-2">
          {questionsAnswered} question{questionsAnswered !== 1 ? "s" : ""}{" "}
          answered
        </p>
      </div>

      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={onPlayAgain}
          className="px-8 py-3 rounded-full bg-gold-500 text-navy-950 font-bold font-display hover:bg-gold-400 transition-colors"
        >
          Play Again
        </button>
        <Link
          href="/leaderboard"
          className="px-8 py-3 rounded-full border border-gold-600 text-gold font-display hover:bg-gold-500/10 transition-colors"
        >
          Leaderboard
        </Link>
        <Link
          href="/play"
          className="px-8 py-3 rounded-full border border-gray-600 text-gray-300 font-display hover:border-gray-400 transition-colors"
        >
          Change Mode
        </Link>
      </div>
    </div>
  );
}
