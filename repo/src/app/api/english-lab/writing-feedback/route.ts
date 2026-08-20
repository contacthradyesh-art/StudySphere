import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const SYSTEM_PROMPT = `You are a supportive English communication coach for Indian students preparing for competitive exams (UPSC/SSC/banking) and job interviews. Given a writing prompt and the student's response, give constructive, encouraging feedback. Return ONLY valid JSON, no markdown, matching exactly:
{
  "score": <number 0-100, overall quality>,
  "strengths": [<2-3 short specific things done well>],
  "improvements": [<2-3 short specific, actionable things to improve>],
  "correctedText": "<the student's text lightly corrected for grammar/spelling, keeping their own voice and ideas intact>",
  "vocabularySuggestions": [<2-4 stronger word/phrase alternatives the student could use, format each as \"weak word -> better word\">]
}`;

export async function POST(req: NextRequest) {
  try {
    const { prompt, text } = await req.json();
    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json({ error: 'Please write at least a couple of sentences.' }, { status: 400 });
    }

    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: `Prompt: ${prompt}\n\nStudent's response:\n${text}` }] }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.4, responseMimeType: 'application/json' }
      })
    });

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('AI did not return content');
    const feedback = JSON.parse(raw);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Writing feedback error', error);
    return NextResponse.json({ error: 'Could not generate feedback. Please try again.' }, { status: 500 });
  }
}
