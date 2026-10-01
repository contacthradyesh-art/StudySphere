import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { verifyRequestAuth } from '@/lib/auth/verify-request';
import { enforceUserRateLimit } from '@/lib/auth/rate-limit';
import { SUBJECTS } from '@/lib/firestore/planner-schema';

const requestSchema = z.object({
  subjects: z.array(z.enum(SUBJECTS)).min(1).max(8),
  weeklyHours: z.number().min(1).max(80),
  weakSubjects: z.array(z.enum(SUBJECTS)).max(8).default([]),
  examDates: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).max(5).default([]),
  todayKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const slotSchema = z.object({
  day: z.number().int().min(0).max(6),
  subject: z.enum(SUBJECTS),
  hours: z.number().positive().max(8),
  isRevision: z.boolean(),
});

const responseSchema = z.object({
  slots: z.array(slotSchema).max(56),
});

const SYSTEM_PROMPT = `You are StudySphere's weekly study-planning AI.
Create a realistic 7-day study roadmap for an Indian student.
Return ONLY JSON: {"slots":[{"day":0,"subject":"Mathematics","hours":2,"isRevision":false}]}.
day 0 is Monday and day 6 is Sunday.
Use only the supplied subjects. Weight weak subjects more heavily.
Respect the student's weekly hour budget.
Use exam dates to increase revision near the nearest exam.
Do not invent progress, scores, or completed work.
Keep total planned hours at or below the requested weekly hours.`;

export async function POST(req: NextRequest) {
  const authResult = await verifyRequestAuth(req);
  if (authResult instanceof NextResponse) return authResult;

  const rateLimitResponse = enforceUserRateLimit(authResult.uid, 'ai-planner-weekly');
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const parsedRequest = requestSchema.safeParse(await req.json());
    if (!parsedRequest.success) {
      return NextResponse.json({ error: 'Invalid planner request.' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'AI is not configured.' }, { status: 503 });

    const { subjects, weeklyHours, weakSubjects, examDates, todayKey } = parsedRequest.data;
    const prompt = JSON.stringify({ subjects, weeklyHours, weakSubjects, examDates, todayKey });

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2, maxOutputTokens: 1800 },
        }),
      },
    );

    if (!response.ok) {
      console.error('Weekly planner Gemini error:', response.status);
      return NextResponse.json({ error: 'Weekly AI planner is temporarily unavailable.' }, { status: 503 });
    }

    const data = await response.json();
    const raw = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!raw) return NextResponse.json({ error: 'AI returned no weekly plan.' }, { status: 502 });

    let generated: unknown;
    try {
      generated = JSON.parse(raw.replace(/^\`\`\`json\s*/i, '').replace(/\s*\`\`\`$/i, '').trim());
    } catch {
      return NextResponse.json({ error: 'AI returned invalid weekly-plan JSON.' }, { status: 502 });
    }

    const validated = responseSchema.safeParse(generated);
    if (!validated.success) {
      return NextResponse.json({ error: 'AI returned an invalid weekly plan.' }, { status: 502 });
    }

    const totalHours = validated.data.slots.reduce((sum, slot) => sum + slot.hours, 0);
    if (totalHours > weeklyHours + 0.01) {
      return NextResponse.json({ error: 'AI plan exceeded the weekly hour budget.' }, { status: 502 });
    }

    return NextResponse.json(validated.data);
  } catch (error) {
    console.error('Weekly planner error:', error);
    return NextResponse.json({ error: 'Could not generate the weekly plan.' }, { status: 500 });
  }
}
