"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import { QuestionCard } from "@/components/game/QuestionCard";
import { PrizeLadder } from "@/components/game/PrizeLadder";
import { Lifelines } from "@/components/game/Lifelines";
import { AudienceChart } from "@/components/game/AudienceChart";
import { GameOver } from "@/components/game/GameOver";
import type { ClientQuestion, Profession } from "@/lib/types";
import { formatPrizeFull, PRIZE_LADDER } from "@/lib/game/prizeLadder";

export default function GamePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const mode = (searchParams.get("mode") ?? "random") as Profession;

  const {
    state,
    startGame,
    selectOption,
    revealAnswer,
    nextQuestion,
    walkAway,
    useFiftyFifty,
    useAudience,
    useAiHint,
    reset,
  } = useGame();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedCorrect, setRevealedCorrect] = useState<number | null>(null);
  const [questionAnswers, setQuestionAnswers] = useState<
    Record<string, number>
  >({});

  // Load questions and create session
  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        setError(null);

        const [questionsRes, sessionRes] = await Promise.all([
          fetch(`/api/questions?mode=${mode}`),
          fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              mode,
              questions_answered: 0,
              prize_reached: 0,
              lifelines_used: [],
              completed: false,
              walked_away: false,
            }),
          }),
        ]);

        const { questions } = await questionsRes.json();
        // Session might fail if not logged in — that's OK
        const sessionData = sessionRes.ok ? await sessionRes.json() : { id: "guest" };

        if (!questions || questions.length < 15) {
          setError("Not enough questions available. Please try again.");
          return;
        }

        // Store correct answers for reveal (fetched server-side via lifelines)
        startGame(questions as ClientQuestion[], sessionData.id);
      } catch {
        setError("Failed to load game. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [mode, startGame]);

  const currentQuestion =
    state.questions[state.currentIndex] ?? null;

  // Handle answer selection + reveal flow
  const handleSelect = useCallback(
    async (optionIdx: number) => {
      if (!currentQuestion || state.phase !== "question") return;
      selectOption(optionIdx);

      // Fetch correct answer from server
      try {
        const res = await fetch("/api/lifelines/fifty-fifty", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: currentQuestion.id, reveal: true }),
        });
        // We repurpose a dedicated reveal endpoint — actually let's just use the questions API
        // For now: fetch correct_idx from the audience endpoint (which knows it)
        // Better: dedicated /api/answer route
        const correctRes = await fetch("/api/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ questionId: currentQuestion.id }),
        });

        let correctIdx: number;
        if (correctRes.ok) {
          const data = await correctRes.json();
          correctIdx = data.correct_idx;
        } else {
          // Fallback: optimistic (shouldn't happen)
          correctIdx = 0;
        }

        // 1.5s suspense delay before revealing
        setTimeout(() => {
          setRevealedCorrect(correctIdx);
          setQuestionAnswers((prev) => ({
            ...prev,
            [currentQuestion.id]: correctIdx,
          }));
          revealAnswer(correctIdx);
        }, 1500);
      } catch {
        setTimeout(() => {
          setRevealedCorrect(0);
          revealAnswer(0);
        }, 1500);
      }
    },
    [currentQuestion, state.phase, selectOption, revealAnswer]
  );

  // Auto-advance after correct reveal
  useEffect(() => {
    if (state.phase === "correct") {
      const t = setTimeout(() => {
        setRevealedCorrect(null);
        nextQuestion();
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [state.phase, nextQuestion]);

  // Save session on game end
  useEffect(() => {
    if (
      state.phase === "wrong" ||
      state.phase === "gameover" ||
      state.phase === "walkaway"
    ) {
      fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode,
          questions_answered: state.currentIndex + (state.phase === "wrong" ? 0 : 1),
          prize_reached: state.prizeReached,
          lifelines_used: Array.from(state.lifelinesUsed),
          completed: state.phase === "gameover",
          walked_away: state.phase === "walkaway",
        }),
      }).catch(() => {});
    }
  }, [state.phase, mode, state.currentIndex, state.prizeReached, state.lifelinesUsed]);

  // Lifeline handlers
  const handleFiftyFifty = async () => {
    if (!currentQuestion) return;
    const res = await fetch("/api/lifelines/fifty-fifty", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: currentQuestion.id }),
    });
    const { survivingOptions } = await res.json();
    useFiftyFifty(survivingOptions);
  };

  const handleAudience = async () => {
    if (!currentQuestion) return;
    const res = await fetch("/api/lifelines/audience", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: currentQuestion.id }),
    });
    const { results } = await res.json();
    useAudience(results);
  };

  const handleAiHint = async () => {
    if (!currentQuestion) return;
    const res = await fetch("/api/lifelines/ai-hint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: currentQuestion.id }),
    });
    const { hint } = await res.json();
    useAiHint(hint);
  };

  const handlePlayAgain = () => {
    reset();
    setRevealedCorrect(null);
    router.refresh();
    window.location.reload();
  };

  // ── Render states ──────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="font-display text-2xl text-yellow-400 animate-pulse">
            Loading your game...
          </p>
          <p className="text-gray-500 text-sm mt-2">Preparing 15 questions</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-full border border-yellow-600 text-yellow-400 font-display"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Game Over screens
  if (
    state.phase === "wrong" ||
    state.phase === "gameover" ||
    state.phase === "walkaway"
  ) {
    return (
      <GameOver
        phase={state.phase}
        prizeReached={state.prizeReached}
        questionsAnswered={state.currentIndex}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  if (!currentQuestion) return null;

  const isAnswering = state.phase === "revealing" || state.phase === "correct";

  return (
    <div className="min-h-screen flex flex-col lg:flex-row gap-6 p-4 md:p-8 max-w-6xl mx-auto w-full">
      {/* Main game area */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.push("/play")}
            className="text-gray-500 hover:text-gray-300 text-sm font-display"
          >
            ← Quit
          </button>
          <span className="font-display text-xs text-gray-500 uppercase tracking-widest">
            {mode === "random" ? "General Knowledge" : mode.charAt(0).toUpperCase() + mode.slice(1)}
          </span>
          <button
            onClick={walkAway}
            disabled={state.currentIndex === 0}
            className="text-xs font-display text-orange-400 hover:text-orange-300 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Walk Away 🚶
          </button>
        </div>

        {/* Lifelines */}
        <Lifelines
          lifelinesUsed={state.lifelinesUsed}
          disabled={isAnswering}
          onFiftyFifty={handleFiftyFifty}
          onAudience={handleAudience}
          onAiHint={handleAiHint}
        />

        {/* AI Hint */}
        {state.aiHint && (
          <div className="wwtbam-card p-4 text-center animate-fade-in-up">
            <p className="text-xs font-display text-yellow-400 uppercase tracking-widest mb-1">
              🤖 AI Hint
            </p>
            <p className="text-gray-200 italic text-sm">{state.aiHint}</p>
          </div>
        )}

        {/* Audience chart */}
        {state.audienceResults && (
          <AudienceChart results={state.audienceResults} />
        )}

        {/* Question card */}
        <QuestionCard
          question={currentQuestion}
          currentIndex={state.currentIndex}
          selectedOption={state.selectedOption}
          revealedCorrect={revealedCorrect}
          fiftyFiftyOptions={state.fiftyFiftyOptions}
          disabled={isAnswering}
          onSelect={handleSelect}
        />

        {/* Safe haven notice */}
        {state.currentIndex > 0 && (
          <p className="text-center text-xs text-gray-600 font-display">
            Safe haven:{" "}
            <span className="text-green-500">
              {formatPrizeFull(
                state.currentIndex <= 4
                  ? 0
                  : state.currentIndex <= 10
                  ? PRIZE_LADDER[4]
                  : PRIZE_LADDER[10]
              )}
            </span>
          </p>
        )}
      </div>

      {/* Prize ladder (sidebar on desktop, bottom on mobile) */}
      <aside className="lg:block">
        <PrizeLadder
          currentIndex={state.currentIndex}
          prizeReached={state.prizeReached}
        />
      </aside>
    </div>
  );
}
