import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/auth/verify-request';
import { enforceUserRateLimit } from '@/lib/auth/rate-limit';
import { generateGeminiJson, GeminiJsonError } from '@/lib/ai/gemini-json';

export type QuickToolType =
  | 'synonym' | 'antonym' | 'one-word' | 'idiom' | 'sentence-improve' | 'paraphrase';

const TOOL_PROMPTS: Record<QuickToolType, string> = {
  synonym: 'Give 5-8 strong synonyms for this word, ordered from most common to most advanced/exam-level. Return ONLY valid JSON: {"results": ["word1", "word2", ...]}',
  antonym: 'Give 5-8 strong antonyms for this word, ordered from most common to most advanced/exam-level. Return ONLY valid JSON: {"results": ["word1", "word2", ...]}',
  'one-word': 'This is a phrase. Give the single English word that best substitutes this phrase (as commonly asked in competitive exams like SSC/UPSC). Return ONLY valid JSON: {"results": ["word1", "word2 (alternative if any)"]}',
  idiom: 'This is a word or short phrase/topic. Give 4-6 common English idioms or phrases related to it, each with a short meaning. Return ONLY valid JSON: {"results": ["idiom \u2014 meaning", "idiom2 \u2014 meaning2", ...]}',
  'sentence-improve': 'Improve this sentence for clarity, grammar, and formal tone, suitable for an interview or exam answer. Give the improved version, and briefly note what changed. Return ONLY valid JSON: {"results": ["Improved sentence here"], "note": "brief note on what changed"}',
  paraphrase: 'Paraphrase this sentence/paragraph in 2 different ways, keeping the same meaning but different wording \u2014 useful for essay writing and avoiding repetition. Return ONLY valid JSON: {"results": ["version 1", "version 2"]}'
};

export async function POST(req: NextRequest) {
  const authResult = await verifyRequestAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const rateLimitResponse = enforceUserRateLimit(authResult.uid, 'ai-route:english-lab/quick-tool');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { tool, input } = await req.json() as { tool: QuickToolType; input: string };
    if (!input || typeof input !== 'string' || !input.trim()) {
      return NextResponse.json({ error: 'Please enter something first.' }, { status: 400 });
    }
    const systemPrompt = TOOL_PROMPTS[tool];
    if (!systemPrompt) {
      return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
    }

    const result = await generateGeminiJson({
      systemInstruction: systemPrompt,
      contents: [{ role: 'user', parts: [{ text: input.trim() }] }],
      maxOutputTokens: 1024,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof GeminiJsonError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('English Lab quick error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Could not process that. Please try again.' }, { status: 500 });
  }
}
