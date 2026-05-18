"use client";

import { useReducer, useCallback } from "react";
import type {
  GameState,
  GamePhase,
  ClientQuestion,
  Lifeline,
} from "@/lib/types";
import { getSafeHavenPrize, PRIZE_LADDER } from "@/lib/types";

const initialState: GameState = {
  phase: "idle",
  questions: [],
  currentIndex: 0,
  selectedOption: null,
  lifelinesUsed: new Set(),
  fiftyFiftyOptions: null,
  audienceResults: null,
  aiHint: null,
  prizeReached: 0,
  sessionId: null,
};

type GameAction =
  | { type: "START"; questions: ClientQuestion[]; sessionId: string }
  | { type: "SELECT_OPTION"; option: number }
  | { type: "REVEAL_ANSWER"; correctIdx: number }
  | { type: "NEXT_QUESTION" }
  | { type: "WALK_AWAY" }
  | { type: "USE_FIFTY_FIFTY"; survivingOptions: number[] }
  | { type: "USE_AUDIENCE"; results: number[] }
  | { type: "USE_AI_HINT"; hint: string }
  | { type: "RESET" };

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START":
      return {
        ...initialState,
        phase: "question",
        questions: action.questions,
        sessionId: action.sessionId,
        lifelinesUsed: new Set(),
      };

    case "SELECT_OPTION":
      if (state.phase !== "question") return state;
      return { ...state, phase: "revealing", selectedOption: action.option };

    case "REVEAL_ANSWER": {
      const isCorrect = action.correctIdx === state.selectedOption;
      const newPhase: GamePhase = isCorrect
        ? state.currentIndex === 14
          ? "gameover" // won the million!
          : "correct"
        : "wrong";
      const prizeReached = isCorrect
        ? PRIZE_LADDER[state.currentIndex]
        : getSafeHavenPrize(state.currentIndex);
      return {
        ...state,
        phase: newPhase,
        prizeReached: isCorrect ? prizeReached : prizeReached,
      };
    }

    case "NEXT_QUESTION":
      if (state.phase !== "correct") return state;
      return {
        ...state,
        phase: "question",
        currentIndex: state.currentIndex + 1,
        selectedOption: null,
        fiftyFiftyOptions: null,
        audienceResults: null,
        aiHint: null,
        prizeReached: PRIZE_LADDER[state.currentIndex], // lock in current
      };

    case "WALK_AWAY":
      return {
        ...state,
        phase: "walkaway",
        prizeReached: state.currentIndex > 0 ? PRIZE_LADDER[state.currentIndex - 1] : 0,
      };

    case "USE_FIFTY_FIFTY": {
      const used = new Set(state.lifelinesUsed);
      used.add("fifty-fifty");
      return { ...state, lifelinesUsed: used, fiftyFiftyOptions: action.survivingOptions };
    }

    case "USE_AUDIENCE": {
      const used = new Set(state.lifelinesUsed);
      used.add("audience");
      return { ...state, lifelinesUsed: used, audienceResults: action.results };
    }

    case "USE_AI_HINT": {
      const used = new Set(state.lifelinesUsed);
      used.add("ai-hint");
      return { ...state, lifelinesUsed: used, aiHint: action.hint };
    }

    case "RESET":
      return initialState;

    default:
      return state;
  }
}

export function useGame() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback(
    (questions: ClientQuestion[], sessionId: string) =>
      dispatch({ type: "START", questions, sessionId }),
    []
  );

  const selectOption = useCallback(
    (option: number) => dispatch({ type: "SELECT_OPTION", option }),
    []
  );

  const revealAnswer = useCallback(
    (correctIdx: number) => dispatch({ type: "REVEAL_ANSWER", correctIdx }),
    []
  );

  const nextQuestion = useCallback(
    () => dispatch({ type: "NEXT_QUESTION" }),
    []
  );

  const walkAway = useCallback(
    () => dispatch({ type: "WALK_AWAY" }),
    []
  );

  const useFiftyFifty = useCallback(
    (survivingOptions: number[]) =>
      dispatch({ type: "USE_FIFTY_FIFTY", survivingOptions }),
    []
  );

  const useAudience = useCallback(
    (results: number[]) => dispatch({ type: "USE_AUDIENCE", results }),
    []
  );

  const useAiHint = useCallback(
    (hint: string) => dispatch({ type: "USE_AI_HINT", hint }),
    []
  );

  const reset = useCallback(() => dispatch({ type: "RESET" }), []);

  return {
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
  };
}
