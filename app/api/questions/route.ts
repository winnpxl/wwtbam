import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import type { Profession, ClientQuestion } from "@/lib/types";

export async function GET(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: "The question database isn't set up for this deployment yet." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const mode = (searchParams.get("mode") ?? "random") as Profession;

  const supabase = await createClient();

  // Fetch 15 questions across difficulty tiers (1-5 easy, 6-10 medium, 11-15 hard)
  // Randomise within each tier and pick one per difficulty
  const { data, error } = await supabase
    .from("questions")
    .select("id, text, options, difficulty, category")
    .eq("category", mode)
    .order("difficulty", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data || data.length < 15) {
    // Fallback to random if profession doesn't have enough questions
    const { data: fallback, error: fallbackErr } = await supabase
      .from("questions")
      .select("id, text, options, difficulty, category")
      .eq("category", "random")
      .order("difficulty", { ascending: true });

    if (fallbackErr || !fallback || fallback.length < 15) {
      return NextResponse.json(
        { error: "Not enough questions available" },
        { status: 500 }
      );
    }

    return NextResponse.json({ questions: pickQuestions(fallback) });
  }

  return NextResponse.json({ questions: pickQuestions(data) });
}

/**
 * Pick exactly 15 questions — one per difficulty level — shuffled per tier.
 * correct_idx is NEVER returned to the client.
 */
function pickQuestions(
  rows: Array<{
    id: string;
    text: string;
    options: string[];
    difficulty: number;
    category: string;
  }>
): ClientQuestion[] {
  // Group by difficulty
  const byDifficulty: Record<number, typeof rows> = {};
  for (const row of rows) {
    if (!byDifficulty[row.difficulty]) byDifficulty[row.difficulty] = [];
    byDifficulty[row.difficulty].push(row);
  }

  const result: ClientQuestion[] = [];
  for (let d = 1; d <= 15; d++) {
    const pool = byDifficulty[d] ?? [];
    if (pool.length === 0) continue;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    result.push({
      id: picked.id,
      text: picked.text,
      options: picked.options,
      difficulty: picked.difficulty,
      category: picked.category as Profession,
    });
  }

  return result;
}
