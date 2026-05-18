import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { questionId } = await request.json();

  if (!questionId) {
    return NextResponse.json({ error: "Missing questionId" }, { status: 400 });
  }

  const supabase = await createClient();

  // Fetch the correct answer for this question (server-side only)
  const { data, error } = await supabase
    .from("questions")
    .select("correct_idx, options")
    .eq("id", questionId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  const { correct_idx } = data;

  // Build pool of wrong answer indices
  const wrongIndices = [0, 1, 2, 3].filter((i) => i !== correct_idx);

  // Shuffle and pick 2 to eliminate — keep correct + 1 random wrong
  const shuffled = wrongIndices.sort(() => Math.random() - 0.5);
  const surviving = [correct_idx, shuffled[0]].sort((a, b) => a - b);

  return NextResponse.json({ survivingOptions: surviving });
}
