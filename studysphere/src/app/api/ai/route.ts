import { NextRequest, NextResponse } from "next/server";
import { generateStructuredContent, generateVisionContent } from "@/lib/ai/gemini";
import type { GeminiRequest, GeminiResponse } from "@/types/api";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GeminiRequest;
    if (!body.prompt) {
      return NextResponse.json<GeminiResponse>({ success: false, data: null, error: "Prompt is required" }, { status: 400 });
    }
    let result: unknown;
    if (body.imageBase64 && body.imageMimeType) {
      result = await generateVisionContent({
        prompt: body.prompt, imageBase64: body.imageBase64, imageMimeType: body.imageMimeType,
        systemInstruction: body.systemInstruction, responseSchema: body.responseSchema,
      });
    } else {
      result = await generateStructuredContent({
        prompt: body.prompt, systemInstruction: body.systemInstruction, responseSchema: body.responseSchema,
      });
    }
    return NextResponse.json<GeminiResponse>({ success: true, data: result, error: null });
  } catch (error) {
    console.error("AI API error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json<GeminiResponse>({ success: false, data: null, error: message }, { status: 500 });
  }
}
