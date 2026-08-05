import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

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
  try {
    const { tool, input } = await req.json() as { tool: QuickToolType; input: string };
    if (!input || typeof input !== 'string' || !input.trim()) {
      return NextResponse.json({ error: 'Please enter something first.' }, { status: 400 });
    }
    const systemPrompt = TOOL_PROMPTS[tool];
    if (!systemPrompt) {
      return NextResponse.json({ error: 'Unknown tool' }, { status: 400 });
    }

    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ role: 'user', parts: [{ text: input.trim() }] }],
        generationConfig: { maxOutputTokens: 400, temperature: 0.5, responseMimeType: 'application/json' }
      })
    });

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('AI did not return content');
    const parsed = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Quick tool error', error);
    return NextResponse.json({ error: 'Could not process that. Please try again.' }, { status: 500 });
  }
}
