"use client";

import { cn } from "@/lib/utils";

const LETTERS = ["A", "B", "C", "D"];

interface AnswerOptionProps {
  index: number;
  text: string;
  state: "idle" | "selected" | "correct" | "wrong" | "eliminated";
  disabled: boolean;
  onClick: () => void;
}

export function AnswerOption({
  index,
  text,
  state,
  disabled,
  onClick,
}: AnswerOptionProps) {
  const isEliminated = state === "eliminated";

  return (
    <button
      onClick={onClick}
      disabled={disabled || state !== "idle" || isEliminated}
      className={cn(
        "answer-option w-full flex items-center gap-4 px-5 py-4 text-left",
        state === "selected" && "is-selected",
        state === "correct" && "is-correct",
        state === "wrong" && "is-wrong",
        isEliminated && "is-eliminated"
      )}
    >
      <span
        className={cn(
          "shrink-0 w-7 h-7 rounded-[6px] flex items-center justify-center text-xs font-medium tracking-widest",
          state === "idle" && "bg-abyss/50 text-silver",
          state === "selected" && "bg-selected/30 text-platinum",
          state === "correct" && "bg-correct/30 text-platinum",
          state === "wrong" && "bg-wrong/30 text-platinum",
          isEliminated && "bg-abyss/50 text-slate"
        )}
      >
        {LETTERS[index]}
      </span>

      <span
        className={cn(
          "text-sm leading-snug",
          isEliminated ? "text-slate line-through" : "text-mist"
        )}
      >
        {text}
      </span>
    </button>
  );
}
