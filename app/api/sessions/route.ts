import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import type { Lifeline, Profession } from "@/lib/types";

export async function POST(request: NextRequest) {
  // Scores simply aren't saved when there's no database — not an error
  // worth interrupting play for.
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const {
    mode,
    questions_answered,
    prize_reached,
    lifelines_used,
    completed,
    walked_away,
  }: {
    mode: Profession;
    questions_answered: number;
    prize_reached: number;
    lifelines_used: Lifeline[];
    completed: boolean;
    walked_away: boolean;
  } = body;

  const { data, error } = await supabase
    .from("game_sessions")
    .insert({
      user_id: user.id,
      mode,
      questions_answered,
      prize_reached,
      lifelines_used,
      completed,
      walked_away,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
