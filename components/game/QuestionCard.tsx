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
    <div className="surface p-9 w-full animate-fade-in-up">
      {/* Meta row */}
      <div className="flex items-center justify-between gap-4 mb-7">
        <span className="t-caption">Question {currentIndex + 1} of 15</span>
        <span className="t-stat text-xl">
          {formatPrizeFull(PRIZE_LADDER[currentIndex])}
        </span>
      </div>

      {/* Question */}
      <h2 className="t-subheading text-platinum mb-8 min-h-[64px] flex items-center">
        {question.text}
      </h2>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
