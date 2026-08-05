import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const SYSTEM_PROMPT = `You are an English grammar tutor for Indian competitive-exam students (SSC/UPSC/banking). Generate exactly 5 multiple-choice grammar questions on the given topic. Mix difficulty. Return ONLY valid JSON, no markdown, matching exactly:
{
  "questions": [
    { "question": "...", "options": ["A", "B", "C", "D"], "correctIndex": 0, "explanation": "brief reason why this is correct" }
  ]
}`;

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json();
    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: `Topic: ${topic || 'general grammar (mixed topics)'}` }] }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.6, responseMimeType: 'application/json' }
      })
    });
    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('AI did not return content');
    const parsed = JSON.parse(raw);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('Grammar quiz error', error);
    return NextResponse.json({ error: 'Could not generate a quiz. Please try again.' }, { status: 500 });
  }
}
