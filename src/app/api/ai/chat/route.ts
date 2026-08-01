import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const SYSTEM_PROMPTS: Record<string, string> = {
  standard: "You are a helpful study assistant for Indian students preparing for school exams and competitive exams (SSC, UPSC, banking). Explain clearly with step-by-step reasoning.",
  'explain-like-confused': "You are a patient tutor explaining to a student who is confused. Use very simple language, real-world analogies, short sentences, and tiny steps. No jargon. Be encouraging."
};

const MAX_TOKENS = 1500;

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

function buildContents(messages: IncomingMessage[], imageDataUrl?: string) {
  const contents = messages.map((m, i) => {
    const isLast = i === messages.length - 1;
    const parts: Record<string, unknown>[] = [{ text: m.content }];
    if (isLast && m.role === 'user' && imageDataUrl) {
      const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (match) {
        parts.push({ inline_data: { mime_type: match[1], data: match[2] } });
      }
    }
    return { role: m.role === 'assistant' ? 'model' : 'user', parts };
  });
  return contents;
}

async function callGemini(messages: IncomingMessage[], mode: string, imageDataUrl?: string): Promise<string> {
  const systemPrompt = SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.standard;
  const contents = buildContents(messages, imageDataUrl);

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.5 }
    })
  });

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "Sorry, I couldn't generate a response. Please try again.";
}

export async function POST(req: NextRequest) {
  try {
    const { messages, mode, image } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }
    const reply = await callGemini(messages, mode || 'standard', image);
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI chat error', error);
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 500 });
  }
}