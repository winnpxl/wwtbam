"use client";

import { AnswerOption } from "./AnswerOption";
import type { ClientQuestion } from "@/lib/types";
import { formatPrizeFull } from "@/lib/game/prizeLadder";
import { PRIZE_LADDER } from "@/lib/types";

interface QuestionCardProps {
  question: ClientQuestion;
  currentIndex: number;
  selectedOption: number | null;
  revealedCorrect: number | null;
  fiftyFiftyOptions: number[] | null;
  disabled: boolean;
  onSelect: (index: number) => void;
}

export function QuestionCard({
  question,
  currentIndex,
  selectedOption,
  revealedCorrect,
  fiftyFiftyOptions,
  disabled,
  onSelect,
}: QuestionCardProps) {
  function getOptionState(
    idx: number
  ): "idle" | "selected" | "correct" | "wrong" | "eliminated" {
    // 50/50 eliminated
    if (fiftyFiftyOptions && !fiftyFiftyOptions.includes(idx)) {
      return "eliminated";
    }
    if (revealedCorrect !== null) {
      if (idx === revealedCorrect) return "correct";
      if (idx === selectedOption) return "wrong";
      return "idle";
    }
    if (idx === selectedOption) return "selected";
    return "idle";
  }

  return (
    <div className="wwtbam-card animate-hotspot-pulse p-6 md:p-8 w-full max-w-2xl mx-auto">
      {/* Prize indicator */}
      <p className="text-center text-xs font-display text-gold-400 mb-4 tracking-widest uppercase">
        Question {currentIndex + 1} of 15 — For{" "}
        <span className="text-gold font-bold">
          {formatPrizeFull(PRIZE_LADDER[currentIndex])}
        </span>
      </p>

      {/* Question text */}
      <h2 className="text-center text-white font-semibold text-base md:text-xl leading-snug mb-8 min-h-[60px] flex items-center justify-center">
        {question.text}
      </h2>

      {/* Answer options */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {question.options.map((opt, idx) => (
          <AnswerOption
            key={idx}
            index={idx}
            text={opt}
            state={getOptionState(idx)}
            disabled={disabled}
            onClick={() => onSelect(idx)}
          />
        ))}
      </div>
    </div>
  );
}
