import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/auth/verify-request';
import { enforceUserRateLimit } from '@/lib/auth/rate-limit';
import { generateGeminiJson, GeminiJsonError } from '@/lib/ai/gemini-json';

const SYSTEM_PROMPT = `You are a supportive English communication coach for Indian students preparing for competitive exams (UPSC/SSC/banking) and job interviews. Given a writing prompt and the student's response, give constructive, encouraging feedback. Return ONLY valid JSON, no markdown, matching exactly:
{
  "score": <number 0-100, overall quality>,
  "strengths": [<2-3 short specific things done well>],
  "improvements": [<2-3 short specific, actionable things to improve>],
  "correctedText": "<the student's text lightly corrected for grammar/spelling, keeping their own voice and ideas intact>",
  "vocabularySuggestions": [<2-4 stronger word/phrase alternatives the student could use, format each as \"weak word -> better word\">]
}`;

export async function POST(req: NextRequest) {
  const authResult = await verifyRequestAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const rateLimitResponse = enforceUserRateLimit(authResult.uid, 'ai-route:english-lab-writing-feedback');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { prompt, text } = await req.json();
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json({ error: 'Please write at least a couple of sentences.' }, { status: 400 });
    }

    const feedback = await generateGeminiJson({
      systemInstruction: SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: `Prompt: ${prompt}\n\nStudent's response:\n${text}` }] }],
      maxOutputTokens: 2048,
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    if (error instanceof GeminiJsonError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('English Lab writing error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Could not generate feedback. Please try again.' }, { status: 500 });
  }
}
