import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
const SYSTEM_PROMPT = "You are a helpful study assistant.";
const MAX_TOKENS = 1024;

async function callGemini(messages: { role: 'user' | 'assistant'; content: string }[]): Promise<string> {
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }]
  }));

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents,
      generationConfig: { maxOutputTokens: MAX_TOKENS, temperature: 0.4 }
    })
  });

  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? "No response";
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const reply = await callGemini(messages);
    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json({ error: "Assistant unavailable" }, { status: 500 });
  }
}