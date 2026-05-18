import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
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

  const { correct_idx } = data;

  // Simulate audience poll:
  // Correct answer gets 45–75% of votes, rest distributed randomly
  const correctPct = 45 + Math.random() * 30; // 45–75%
  const remaining = 100 - correctPct;

  // Split remaining 3 buckets with random noise
  const splits = [Math.random(), Math.random(), Math.random()];
  const sumSplits = splits.reduce((a, b) => a + b, 0);
  const normalised = splits.map((s) => (s / sumSplits) * remaining);

  const results = [0, 0, 0, 0];
  let wrongIdx = 0;
  for (let i = 0; i < 4; i++) {
    if (i === correct_idx) {
      results[i] = Math.round(correctPct);
    } else {
      results[i] = Math.round(normalised[wrongIdx++]);
    }
  }

  // Make sure they sum to 100
  const total = results.reduce((a, b) => a + b, 0);
  results[correct_idx] += 100 - total;

  return NextResponse.json({ results });
}
