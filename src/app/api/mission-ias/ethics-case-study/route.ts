import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const SYSTEM_PROMPT = `You are writing a UPSC Civil Services Mains GS Paper 4 (Ethics, Integrity and Aptitude) Section-B case study, in the authentic style of actual UPSC case studies.
Generate ONE realistic ethical dilemma involving an Indian civil servant, local body official, or someone in a position of public responsibility, appropriate for the given topic if one is given (otherwise pick any realistic UPSC-relevant theme: corruption, conflict of interest, whistleblowing, resource allocation, environment vs development, communal harmony, disaster response, gender/caste bias, superior's illegal order, etc).
The scenario should be 120-180 words, present a genuine dilemma with no obviously "correct" answer, and involve competing stakeholders/values.
Then write exactly 3 sub-questions in the standard UPSC case-study format:
1. A question asking to identify the ethical issues/values in conflict.
2. A question asking what options/courses of action are available.
3. A question asking which course of action the candidate would adopt and why.
Return ONLY valid JSON, no markdown, matching exactly:
{"scenario": "...", "questions": ["...", "...", "..."]}`;

export async function POST(req: NextRequest) {
  try {
    const { topic } = await req.json().catch(() => ({ topic: undefined }));

    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: `Topic: ${topic || 'any realistic UPSC-relevant ethical dilemma'}` }] }],
        generationConfig: { maxOutputTokens: 900, temperature: 0.8, responseMimeType: 'application/json' }
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('ethics-case-study: Gemini API error', res.status, errBody.slice(0, 500));
      return NextResponse.json({ error: `AI request failed (${res.status})` }, { status: 500 });
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const raw = candidate?.content?.parts?.[0]?.text;
    if (!raw) {
      console.error('ethics-case-study: no content in response', JSON.stringify(data).slice(0, 500));
      return NextResponse.json({ error: `AI did not return content (finishReason: ${candidate?.finishReason || 'unknown'})` }, { status: 500 });
    }

    let parsed: { scenario: string; questions: string[] };
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      console.error('ethics-case-study: JSON parse failed', String(e), raw.slice(-300));
      return NextResponse.json({ error: 'AI returned invalid JSON (try again)' }, { status: 500 });
    }

    return NextResponse.json(parsed);
  } catch (error) {
    console.error('ethics-case-study: unexpected error', error);
    return NextResponse.json({ error: 'Could not generate a case study. Please try again.' }, { status: 500 });
  }
}
