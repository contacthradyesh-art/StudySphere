import { NextRequest, NextResponse } from 'next/server';
import { verifyRequestAuth } from '@/lib/auth/verify-request';

const GEMINI_MODELS = ['gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest'];
const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

const SYSTEM_PROMPT = `You are StudySphere's Life Planner AI. Convert the student's natural-language request into a realistic, conflict-free daily study plan.

The student may write in Hindi, Hinglish, or English. Understand relative dates such as today, tomorrow, Monday, etc. Resolve them to YYYY-MM-DD using the current date supplied by the server.

Return ONLY valid JSON. Do not use markdown or code fences. Return exactly this shape:
{
  "tasks": [
    {
      "title": "Task name",
      "description": "Brief actionable description",
      "priority": "High" | "Medium" | "Low",
      "estimatedTime": "90 mins",
      "dueDate": "YYYY-MM-DD",
      "startTime": "06:30",
      "endTime": "08:00",
      "subject": "English"
    }
  ],
  "summary": {
    "plannedMinutes": 0,
    "breakMinutes": 0,
    "fixedEventMinutes": 0,
    "conflicts": []
  }
}

Rules:
- Never create overlapping study tasks.
- Respect fixed events and unavailable times described by the student.
- Respect requested wake/sleep and available study windows.
- Include reasonable breaks according to the student's preference.
- Prioritize explicitly weak/high-priority subjects.
- Keep the workload realistic; do not fill every available minute.
- Prefer focused blocks of 45-120 minutes.
- Split long subjects into multiple concrete tasks when useful.
- Preserve the student's requested subjects/topics.
- Do not invent existing progress, streaks, goals, or history.
- If the request does not provide a date, use the server current date.
- If an exact time is unavailable, leave startTime/endTime as null rather than inventing a conflicting time.
- Output tasks in chronological order.`;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cleanJson(text: string) {
  return text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
}

function normalizeTasks(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map((item) => ({
      title: typeof item.title === 'string' ? item.title.trim() : '',
      description: typeof item.description === 'string' ? item.description.trim() : '',
      priority: item.priority === 'High' || item.priority === 'Low' ? item.priority : 'Medium',
      estimatedTime: typeof item.estimatedTime === 'string' ? item.estimatedTime : '30 mins',
      dueDate: typeof item.dueDate === 'string' ? item.dueDate.slice(0, 10) : '',
      startTime: typeof item.startTime === 'string' ? item.startTime : null,
      endTime: typeof item.endTime === 'string' ? item.endTime : null,
      subject: typeof item.subject === 'string' ? item.subject : '',
    }))
    .filter((task) => task.title && /^\d{4}-\d{2}-\d{2}$/.test(task.dueDate));
}

export async function POST(req: NextRequest) {
  const authResult = await verifyRequestAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    const body = await req.json();
    const message = typeof body?.message === 'string' ? body.message.trim() : '';
    if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    if (message.length > 8000) return NextResponse.json({ error: 'Planner request is too long' }, { status: 400 });

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI is not configured' }, { status: 503 });

    const currentDate = new Date().toISOString().slice(0, 10);
    const userPrompt = `Current server date: ${currentDate}\nStudent request:\n${message}`;
    let lastStatus = 503;

    for (const model of GEMINI_MODELS) {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 25000);
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            signal: controller.signal,
            body: JSON.stringify({
              system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
              contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
              generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 2400 },
            }),
          });
          clearTimeout(timeout);
          lastStatus = response.status;

          if (!response.ok) {
            if (RETRYABLE_STATUS.has(response.status) && attempt === 0) {
              await sleep(600);
              continue;
            }
            break;
          }

          const data = await response.json();
          const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          if (!raw) throw new Error('Gemini returned an empty response');
          const parsed = JSON.parse(cleanJson(raw));
          const tasks = normalizeTasks(parsed?.tasks);
          if (!tasks.length) throw new Error('Gemini returned no valid planner tasks');

          return NextResponse.json({
            tasks,
            summary: parsed?.summary ?? {
              plannedMinutes: 0,
              breakMinutes: 0,
              fixedEventMinutes: 0,
              conflicts: [],
            },
            model,
          });
        } catch (error) {
          if (attempt === 0) {
            await sleep(500);
            continue;
          }
          console.error(`Planner AI Gemini error (${model}):`, error);
        }
      }
    }

    console.error('Planner AI exhausted Gemini fallbacks. Last status:', lastStatus);
    return NextResponse.json({
      error: 'Planner AI is temporarily busy. Please try again in a moment.',
      retryable: true,
    }, { status: 503 });
  } catch (error) {
    console.error('Planner AI error:', error);
    return NextResponse.json({ error: 'Could not generate the plan' }, { status: 500 });
  }
}
