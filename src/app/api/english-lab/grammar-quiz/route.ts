import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/auth/verify-request';
import { enforceUserRateLimit } from '@/lib/auth/rate-limit';
import { generateGeminiJson, GeminiJsonError } from '@/lib/ai/gemini-json';

const SYSTEM_PROMPT = `You are an English grammar tutor for Indian competitive-exam students (SSC/UPSC/banking). Generate exactly 5 multiple-choice grammar questions on the given topic. Mix difficulty. Return ONLY valid JSON, no markdown, matching exactly:
{
  "questions": [
    { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "brief reason why this is correct" }
  ]
}`;

export async function POST(req: NextRequest) {
  const authResult = await verifyRequestAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const rateLimitResponse = enforceUserRateLimit(authResult.uid, 'ai-route:english-lab-grammar-quiz');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { topic } = await req.json();
    const result = await generateGeminiJson({
      systemInstruction: SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: `Topic: ${topic || 'general grammar (mixed topics)'}` }] }],
      maxOutputTokens: 2048,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GeminiJsonError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('English Lab grammar error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Could not generate a quiz. Please try again.' }, { status: 500 });
  }
}
