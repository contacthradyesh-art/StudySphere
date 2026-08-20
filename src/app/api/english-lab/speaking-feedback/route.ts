import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

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
  try {
    const { prompt, audio, mimeType } = await req.json();
    if (!audio || typeof audio !== 'string') {
      return NextResponse.json({ error: 'No audio received. Please record your answer first.' }, { status: 400 });
    }

    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{
          role: 'user',
          parts: [
            { text: `Prompt the student was responding to: ${prompt}` },
            { inline_data: { mime_type: mimeType || 'audio/webm', data: audio } }
          ]
        }],
        generationConfig: { maxOutputTokens: 800, temperature: 0.4, responseMimeType: 'application/json' }
      })
    });

    const data = await res.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) throw new Error('AI did not return content');
    const feedback = JSON.parse(raw);

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Speaking feedback error', error);
    return NextResponse.json({ error: 'Could not analyze your recording. Please try again.' }, { status: 500 });
  }
}
