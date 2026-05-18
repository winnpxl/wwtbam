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
  if (state === "eliminated") {
    return (
      <div className="answer-option flex items-center gap-4 px-5 py-4 rounded-full opacity-20 cursor-not-allowed select-none">
        <span className="shrink-0 w-8 h-8 rounded-full border border-current flex items-center justify-center text-sm font-bold font-display">
          {LETTERS[index]}
        </span>
        <span className="text-sm line-through">{text}</span>
      </div>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled || state !== "idle"}
      className={cn(
        "answer-option w-full flex items-center gap-4 px-5 py-4 rounded-full text-left transition-all",
        "text-white font-medium cursor-pointer select-none",
        state === "selected" && "selected",
        state === "correct" && "correct",
        state === "wrong" && "wrong"
      )}
    >
      {/* Letter badge */}
      <span
        className={cn(
          "shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold font-display",
          state === "idle" && "border-blue-400 text-gold-500",
          state === "selected" && "border-blue-300 text-white",
          state === "correct" && "border-green-400 text-green-300",
          state === "wrong" && "border-red-400 text-red-300"
        )}
      >
        {LETTERS[index]}
      </span>
      <span className="text-sm md:text-base">{text}</span>
    </button>
  );
}
