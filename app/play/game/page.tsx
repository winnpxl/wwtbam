"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useGame } from "@/hooks/useGame";
import { QuestionCard } from "@/components/game/QuestionCard";
import { PrizeLadder } from "@/components/game/PrizeLadder";
import { Lifelines } from "@/components/game/Lifelines";
import { AudienceChart } from "@/components/game/AudienceChart";
import { GameOver } from "@/components/game/GameOver";
import { PROFESSIONS, type ClientQuestion, type Profession } from "@/lib/types";
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
      <main className="abyss-glow flex items-center justify-center min-h-screen px-5">
        <div className="flex flex-col items-center gap-3 text-center animate-fade-in-up">
          <p className="t-caption animate-pulse-soft">Preparing Your Game</p>
          <p className="t-heading">Loading 15 questions</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="abyss-glow flex items-center justify-center min-h-screen px-5">
        <div className="surface p-12 flex flex-col items-center gap-6 text-center max-w-md">
          <p className="t-caption">Something Went Wrong</p>
          <p className="t-body">{error}</p>
          <button onClick={() => window.location.reload()} className="btn-aurora">
            Try Again
          </button>
        </div>
      </main>
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

  const safeHavenPrize =
    state.currentIndex <= 4
      ? 0
      : state.currentIndex <= 10
      ? PRIZE_LADDER[4]
      : PRIZE_LADDER[10];

  return (
    <main className="abyss-glow min-h-screen px-5 py-8 md:py-12">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        {/* ── Top bar ── */}
        <div className="flex items-center justify-between gap-4">
          <button onClick={() => router.push("/play")} className="btn-ghost">
            ← Quit
          </button>

          <span className="t-caption">
            {PROFESSIONS[mode]?.label ?? mode}
          </span>

          <button
            onClick={walkAway}
            disabled={state.currentIndex === 0}
            className="btn-ghost"
          >
            Walk Away
          </button>
        </div>

        {/* ── Body: main + ladder ── */}
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <div className="flex-1 w-full flex flex-col gap-5">
            <Lifelines
              lifelinesUsed={state.lifelinesUsed}
              disabled={isAnswering}
              onFiftyFifty={handleFiftyFifty}
              onAudience={handleAudience}
              onAiHint={handleAiHint}
            />

            {state.aiHint && (
              <div className="surface-recessed p-7 animate-fade-in-up">
                <p className="t-caption mb-2.5">AI Hint</p>
                <p className="t-body text-mist">{state.aiHint}</p>
              </div>
            )}

            {state.audienceResults && (
              <AudienceChart results={state.audienceResults} />
            )}

            <QuestionCard
              question={currentQuestion}
              currentIndex={state.currentIndex}
              selectedOption={state.selectedOption}
              revealedCorrect={revealedCorrect}
              fiftyFiftyOptions={state.fiftyFiftyOptions}
              disabled={isAnswering}
              onSelect={handleSelect}
            />

            {state.currentIndex > 0 && (
              <p className="t-caption text-center">
                Safe Haven ·{" "}
                <span className="text-phosphor">
                  {formatPrizeFull(safeHavenPrize)}
                </span>
              </p>
            )}
          </div>

          <aside className="w-full lg:w-auto">
            <PrizeLadder
              currentIndex={state.currentIndex}
              prizeReached={state.prizeReached}
            />
          </aside>
        </div>
      </div>
    </main>
  );
}
