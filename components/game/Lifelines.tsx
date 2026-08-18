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
  glyph: string;
  description: string;
}[] = [
  { id: "fifty-fifty", label: "50:50", glyph: "½", description: "Remove two wrong answers" },
  { id: "audience", label: "Audience", glyph: "◍", description: "Poll the audience" },
  { id: "ai-hint", label: "AI Hint", glyph: "✳", description: "Get a cryptic clue" },
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
    <div className="flex gap-3">
      {LIFELINE_CONFIG.map(({ id, label, glyph, description }) => {
        const used = lifelinesUsed.has(id);
        const isDisabled = used || disabled;

        return (
          <button
            key={id}
            onClick={handlers[id]}
            disabled={isDisabled}
            title={description}
            className={cn(
              "flex-1 flex items-center justify-center gap-2.5 px-4 py-3 rounded-[6px] transition-all duration-200",
              used && "bg-deep text-slate cursor-not-allowed",
              !used && disabled && "bg-kelp/50 text-slate cursor-not-allowed",
              !isDisabled && "bg-kelp text-mist hover:bg-kelp-hover"
            )}
          >
            <span
              className={cn(
                "text-base leading-none",
                used ? "text-slate line-through" : "text-bio-to"
              )}
            >
              {glyph}
            </span>
            <span className="t-caption text-current">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
