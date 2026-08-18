"use client";

import { cn } from "@/lib/utils";
import { PRIZE_LADDER, SAFE_HAVEN_INDICES, formatPrize } from "@/lib/types";

interface PrizeLadderProps {
  currentIndex: number;
  prizeReached: number;
}

export function PrizeLadder({ currentIndex }: PrizeLadderProps) {
  const rungs = [...PRIZE_LADDER].reverse();

  return (
    <div className="surface-recessed p-5 w-full lg:w-56">
      <p className="t-caption mb-4">Prize Ladder</p>

      <div className="flex flex-col gap-1">
        {rungs.map((prize, i) => {
          const ladderIndex = 14 - i;
          const isCurrent = ladderIndex === currentIndex;
          const isPast = ladderIndex < currentIndex;
          const isSafe = SAFE_HAVEN_INDICES.has(ladderIndex);

          return (
            <div
              key={ladderIndex}
              className={cn(
                "flex items-center justify-between gap-3 px-3 py-1.5 rounded-[6px] transition-all duration-300",
                isCurrent && "aurora-bg",
                !isCurrent && isPast && "bg-kelp/40",
                !isCurrent && !isPast && "bg-transparent"
              )}
            >
              <span
                className={cn(
                  "text-[10px] font-medium tabular-nums",
                  isCurrent ? "text-abyss/60" : "text-slate"
                )}
              >
                {ladderIndex + 1}
              </span>

              <span
                className={cn(
                  "text-xs font-medium tabular-nums tracking-tight",
                  isCurrent && "text-abyss",
                  !isCurrent && isPast && "text-correct",
                  !isCurrent && !isPast && isSafe && "text-phosphor",
                  !isCurrent && !isPast && !isSafe && "text-silver"
                )}
              >
                {formatPrize(prize)}
              </span>

              <span
                className={cn(
                  "w-1 h-1 rounded-full shrink-0",
                  isSafe
                    ? isCurrent
                      ? "bg-abyss/50"
                      : "bg-phosphor"
                    : "bg-transparent"
                )}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
