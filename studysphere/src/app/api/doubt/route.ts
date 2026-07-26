import { NextRequest, NextResponse } from "next/server";
import { generateTextAnswer, SYSTEM_INSTRUCTIONS } from "@/lib/ai/gemini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, mode, useSearch } = body as { question: string; mode: "standard" | "explain-like-confused"; useSearch?: boolean };

    if (!question || !question.trim()) {
      return NextResponse.json({ success: false, error: "Question is required" }, { status: 400 });
    }

    const baseInstruction = mode === "explain-like-confused" ? SYSTEM_INSTRUCTIONS.DOUBT_SOLVER_CONFUSED : SYSTEM_INSTRUCTIONS.DOUBT_SOLVER;
    const systemInstruction = useSearch
      ? `${baseInstruction} You have access to Google Search — use it to check current facts, recent exam notifications, or up-to-date figures when relevant, and mention if information is time-sensitive.`
      : baseInstruction;

    const { text, usedSearch } = await generateTextAnswer({ prompt: question, systemInstruction, useSearch });

    return NextResponse.json({ success: true, answer: text, usedSearch });
  } catch (error) {
    console.error("Doubt solver API error:", error);
    const message = error instanceof Error ? error.message : "Something went wrong";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
