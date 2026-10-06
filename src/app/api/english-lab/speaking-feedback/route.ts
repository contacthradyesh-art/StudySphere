import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/auth/verify-request';
import { enforceUserRateLimit } from '@/lib/auth/rate-limit';
import { generateGeminiJson, GeminiJsonError } from '@/lib/ai/gemini-json';

const SYSTEM_PROMPT = `You are a supportive English communication coach for Indian students preparing for competitive exams (UPSC/SSC/banking) and job interviews. You will receive an audio recording of a student speaking in response to a prompt. First transcribe what they said, then give constructive, encouraging feedback on their spoken English. Return ONLY valid JSON, no markdown, matching exactly:
{
  "transcript": "<what the student said, transcribed as accurately as possible>",
  "score": <number 0-100, overall spoken communication quality>,
  "fluencyNotes": "<1-2 sentences on pacing, hesitation, flow>",
  "grammarNotes": "<1-2 sentences on grammar accuracy, with a gentle example if there was an error>",
  "vocabularyNotes": "<1-2 sentences on word choice and range>",
  "suggestions": [<2-3 short, specific, actionable tips for next time>]
}`;

export async function POST(req: NextRequest) {
  const authResult = await verifyRequestAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const rateLimitResponse = enforceUserRateLimit(authResult.uid, 'ai-route:english-lab/speaking-feedback');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { prompt, audio, mimeType } = await req.json();
    if (!audio || typeof audio !== 'string') {
      return NextResponse.json({ error: 'No audio received. Please record your answer first.' }, { status: 400 });
    }
    if (audio.length > 3 * 1024 * 1024) {
      return NextResponse.json({ error: 'Recording chhoti karein — 3 MB se badi recording submit nahi ho sakti.' }, { status: 413 });
    }

    const feedback = await generateGeminiJson({
      systemInstruction: SYSTEM_PROMPT,
      contents: [{ role: 'user', parts: [{ text: `Prompt the student was responding to: ${prompt}` }, { inline_data: { mime_type: mimeType || 'audio/webm', data: audio } }] }],
      maxOutputTokens: 2048,
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    if (error instanceof GeminiJsonError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('English Lab speaking error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Could not analyze your recording. Please try again.' }, { status: 500 });
  }
}
