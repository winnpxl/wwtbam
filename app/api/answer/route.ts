import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";

/**
 * Returns the correct answer index for a question.
 * Called after the player selects an option — triggers the reveal.
 */
export async function POST(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Not configured" }, { status: 503 });
  }

  const { questionId } = await request.json();

  if (!questionId) {
    return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("questions")
    .select("correct_idx")
    .eq("id", questionId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  return NextResponse.json({ correct_idx: data.correct_idx });
}
