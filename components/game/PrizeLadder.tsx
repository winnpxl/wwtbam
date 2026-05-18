"use client";

import { cn } from "@/lib/utils";
import { PRIZE_LADDER, SAFE_HAVEN_INDICES, formatPrize } from "@/lib/types";

interface PrizeLadderProps {
  currentIndex: number; // 0-14 (current question)
  prizeReached: number;
}

export function PrizeLadder({ currentIndex }: PrizeLadderProps) {
  // Render in reverse (top = $1M)
  const rungs = [...PRIZE_LADDER].reverse();

  return (
    <div className="flex flex-col gap-[3px] w-44">
      {rungs.map((prize, i) => {
        const ladderIndex = 14 - i; // convert back to 0-indexed
        const isCurrent = ladderIndex === currentIndex;
        const isPast = ladderIndex < currentIndex;
        const isSafe = SAFE_HAVEN_INDICES.has(ladderIndex);
        const isTop = ladderIndex === 14;

        return (
          <div
            key={ladderIndex}
            className={cn(
              "flex items-center justify-between px-3 py-1 rounded text-xs font-display transition-all duration-300",
              isCurrent &&
                "bg-gold-500 text-navy-950 font-bold scale-105 shadow-lg shadow-yellow-500/30",
              isPast && !isCurrent && "text-green-400 opacity-60",
              !isCurrent && !isPast && "text-gray-300 opacity-70",
              isSafe && !isCurrent && "text-amber-300 font-semibold",
              isTop && !isCurrent && "text-gold font-bold"
            )}
          >
            <span className="text-[10px] text-current opacity-60">
              {14 - i + 1}
            </span>
            <span>{formatPrize(prize)}</span>
            {isSafe && (
              <span className="text-[8px] opacity-80">🛡️</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
