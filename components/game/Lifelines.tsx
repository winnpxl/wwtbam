"use client";

import { cn } from "@/lib/utils";
import type { Lifeline } from "@/lib/types";

interface LifelinesProps {
  lifelinesUsed: Set<Lifeline>;
  disabled: boolean;
  onFiftyFifty: () => void;
  onAudience: () => void;
  onAiHint: () => void;
}

const LIFELINE_CONFIG: {
  id: Lifeline;
  label: string;
  emoji: string;
  description: string;
}[] = [
  { id: "fifty-fifty", label: "50:50", emoji: "✂️", description: "Remove two wrong answers" },
  { id: "audience", label: "Audience", emoji: "👥", description: "Poll the audience" },
  { id: "ai-hint", label: "AI Hint", emoji: "🤖", description: "Get a cryptic clue" },
];

export function Lifelines({
  lifelinesUsed,
  disabled,
  onFiftyFifty,
  onAudience,
  onAiHint,
}: LifelinesProps) {
  const handlers: Record<Lifeline, () => void> = {
    "fifty-fifty": onFiftyFifty,
    audience: onAudience,
    "ai-hint": onAiHint,
  };

  return (
    <div className="flex gap-3 justify-center flex-wrap">
      {LIFELINE_CONFIG.map(({ id, label, emoji, description }) => {
        const used = lifelinesUsed.has(id);
        return (
          <button
            key={id}
            onClick={handlers[id]}
            disabled={used || disabled}
            title={description}
            className={cn(
              "flex flex-col items-center gap-1 px-4 py-2 rounded-lg border transition-all text-xs font-display",
              used
                ? "border-gray-600 text-gray-500 opacity-40 cursor-not-allowed"
                : disabled
                ? "border-gray-600 text-gray-400 cursor-not-allowed opacity-60"
                : "border-gold-600 text-gold hover:bg-gold-500/10 hover:border-gold-400 cursor-pointer"
            )}
          >
            <span className="text-lg">{emoji}</span>
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
