import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/auth/verify-request';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const SYSTEM_PROMPT = `You are StudySphere's study planner AI. Convert the student's request into practical study tasks.
Return ONLY valid JSON, with no markdown or extra text, in this exact shape:
{
  "tasks": [
    {
      "title": "Task name",
      "description": "Brief description",
      "priority": "High" | "Medium" | "Low",
      "estimatedTime": "30 mins",
      "dueDate": "YYYY-MM-DD"
    }
  ]
}
Keep tasks specific and realistic. If the student gives a relative date such as tomorrow, resolve it to the correct YYYY-MM-DD date.`;

export async function POST(req: NextRequest) {
  const authResult = await verifyRequestAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI is not configured' }, { status: 503 });

    const response = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: message }] }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.3 },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Planner AI Gemini error:', errorText);
      return NextResponse.json({ error: 'AI provider unavailable' }, { status: 502 });
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    const tasks = Array.isArray(parsed?.tasks) ? parsed.tasks : [];

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Planner AI error:', error);
    return NextResponse.json({ error: 'Could not generate the plan' }, { status: 500 });
  }
}
