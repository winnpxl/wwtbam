import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/isConfigured";
import { getAiHint } from "@/lib/ai";

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
    .select("text, options")
    .eq("id", questionId)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  try {
    const hint = await getAiHint(data.text, data.options);
    return NextResponse.json({ hint });
  } catch {
    return NextResponse.json(
      { hint: "The answer is closer than you think... trust your instincts." },
      { status: 200 }
    );
  }
}
