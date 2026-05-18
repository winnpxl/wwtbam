export type Profession =
  | "random"
  | "medicine"
  | "law"
  | "engineering"
  | "finance"
  | "science"
  | "history"
  | "literature";

export const PROFESSIONS: Record<Profession, { label: string; emoji: string; description: string }> = {
  random: {
    label: "General Knowledge",
    emoji: "🌍",
    description: "A mix of questions from all categories — the classic experience.",
  },
  medicine: {
    label: "Medicine & Healthcare",
    emoji: "🩺",
    description: "Anatomy, pharmacology, clinical practice and medical science.",
  },
  law: {
    label: "Law",
    emoji: "⚖️",
    description: "Legal concepts, rights, procedures and landmark cases.",
  },
  engineering: {
    label: "Engineering & Software",
    emoji: "💻",
    description: "Computer science, coding, systems and engineering principles.",
  },
  finance: {
    label: "Finance & Business",
    emoji: "📈",
    description: "Economics, markets, accounting and business strategy.",
  },
  science: {
    label: "Science",
    emoji: "🔬",
    description: "Physics, chemistry, biology and the natural world.",
  },
  history: {
    label: "History",
    emoji: "📜",
    description: "World history, civilizations, wars and pivotal moments.",
  },
  literature: {
    label: "Literature",
    emoji: "📚",
    description: "Classic and modern literature, authors, and storytelling.",
  },
};

export type Lifeline = "fifty-fifty" | "audience" | "ai-hint";

export interface Question {
  id: string;
  text: string;
  options: string[]; // always 4 items
  correct_idx: number; // 0–3, only revealed at game end or wrong answer
  category: Profession;
  difficulty: number; // 1–15
}

// Client-side question (correct_idx hidden until reveal)
export interface ClientQuestion {
  id: string;
  text: string;
  options: string[];
  category: Profession;
  difficulty: number;
}

export type AnswerState = "idle" | "selected" | "correct" | "wrong";

export type GamePhase =
  | "idle"
  | "question"
  | "revealing"
  | "correct"
  | "wrong"
  | "walkaway"
  | "gameover";

export interface GameState {
  phase: GamePhase;
  questions: ClientQuestion[];
  currentIndex: number; // 0–14
  selectedOption: number | null;
  lifelinesUsed: Set<Lifeline>;
  // 50/50 eliminates 2 wrong options — stores the surviving option indices
  fiftyFiftyOptions: number[] | null;
  // Audience poll results [pct A, pct B, pct C, pct D]
  audienceResults: number[] | null;
  aiHint: string | null;
  prizeReached: number; // last confirmed safe prize
  sessionId: string | null;
}

export const PRIZE_LADDER: number[] = [
  100, 200, 300, 500, 1_000, 2_000, 4_000, 8_000, 16_000, 32_000, 64_000,
  125_000, 250_000, 500_000, 1_000_000,
];

// Indices (0-based) that are safe havens
export const SAFE_HAVEN_INDICES = new Set([4, 10]); // $1,000 and $64,000

export function getSafeHavenPrize(currentIndex: number): number {
  if (currentIndex <= 4) return 0;
  if (currentIndex <= 10) return PRIZE_LADDER[4]; // $1,000
  return PRIZE_LADDER[10]; // $64,000
}

export function formatPrize(amount: number): string {
  if (amount === 0) return "$0";
  if (amount >= 1_000_000) return "$1,000,000";
  if (amount >= 1_000) return `$${(amount / 1_000).toLocaleString()}K`;
  return `$${amount.toLocaleString()}`;
}

export interface GameSession {
  id: string;
  user_id: string;
  mode: Profession;
  questions_answered: number;
  prize_reached: number;
  lifelines_used: Lifeline[];
  completed: boolean;
  walked_away: boolean;
  created_at: string;
}
