import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/auth/verify-request';

const GEMINI_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.5-flash',
  'gemini-flash-latest',
];

const SYSTEM_PROMPTS: Record<string, string> = {
  standard:
    'You are StudySphere AI, a helpful Hindi-first study assistant for Indian students preparing for school exams and competitive exams (SSC, UPSC, banking). Answer in the language the student uses. For Hindi questions, answer in clear natural Hindi. Explain calculations step-by-step and verify arithmetic before answering. For exam questions, give the concept, method, final answer, and a short exam tip.',
  'explain-like-confused':
    'You are StudySphere AI, a patient Hindi-first tutor for a confused student. Answer in the language the student uses. Use very simple language, real-world analogies, short sentences, tiny steps, and no unnecessary jargon. For calculations, show each step and verify the result. Be encouraging.',
};

const MAX_TOKENS = 1200;

interface IncomingMessage {
  role: 'user' | 'assistant';
  content: string;
}

function buildContents(messages: IncomingMessage[], imageDataUrl?: string) {
  return messages.map((m, i) => {
    const isLast = i === messages.length - 1;
    const parts: Record<string, unknown>[] = [{ text: m.content }];

    if (isLast && m.role === 'user' && imageDataUrl) {
      const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inline_data: { mime_type: match[1], data: match[2] },
        });
      }
    }

    return {
      role: m.role === 'assistant' ? 'model' : 'user',
      parts,
    };
  });
}

async function callModel(
  model: string,
  messages: IncomingMessage[],
  mode: string,
  imageDataUrl?: string,
): Promise<{ text: string | null; status: number; error?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { text: null, status: 500, error: 'GEMINI_API_KEY is not configured' };
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: {
        parts: [{ text: SYSTEM_PROMPTS[mode] || SYSTEM_PROMPTS.standard }],
      },
      contents: buildContents(messages, imageDataUrl),
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
      },
    }),
    cache: 'no-store',
  });

  const data = await res.json().catch(() => null);
  const text = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: string }) => part.text || '')
    .join('')
    .trim();

  if (res.ok && text) {
    return { text, status: res.status };
  }

  const message =
    data?.error?.message ||
    data?.candidates?.[0]?.finishReason ||
    'Gemini returned no answer';

  return { text: null, status: res.status || 502, error: message };
}

async function callGemini(
  messages: IncomingMessage[],
  mode: string,
  imageDataUrl?: string,
): Promise<string> {
  let lastError = 'AI service unavailable';

  for (const model of GEMINI_MODELS) {
    try {
      const result = await callModel(model, messages, mode, imageDataUrl);
      if (result.text) return result.text;

      lastError = `${model}: ${result.error || 'no response'}`;
      // 429/5xx are commonly temporary/free-tier model limits; try the next model.
      if (![429, 500, 502, 503, 504].includes(result.status)) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : 'Network error';
    }
  }

  throw new Error(lastError);
}

export async function POST(req: NextRequest) {
  const authResult = await verifyRequestAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const { messages, mode, image } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const sanitized = messages
      .filter(
        (message: IncomingMessage) =>
          message &&
          (message.role === 'user' || message.role === 'assistant') &&
          typeof message.content === 'string',
      )
      .slice(-12)
      .map((message: IncomingMessage) => ({
        role: message.role,
        content: message.content.slice(0, 12000),
      }));

    if (!sanitized.length) {
      return NextResponse.json({ error: 'No valid messages provided' }, { status: 400 });
    }

    const reply = await callGemini(sanitized, mode || 'standard', image);
    return NextResponse.json({ reply, provider: 'gemini' });
  } catch (error) {
    console.error('AI chat error', error);
    return NextResponse.json(
      {
        error: 'AI service temporarily unavailable. Please try again in a moment.',
        retryable: true,
      },
      { status: 503 },
    );
  }
}
