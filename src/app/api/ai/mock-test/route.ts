import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent";

const GENERATE_SYSTEM_PROMPT = `You are an expert question setter for Indian competitive exams (SSC, UPSC, UPP, Banking, RRB, etc).
Generate high-quality, unique multiple-choice questions. Never repeat a question.
Explanations must be short (1-2 plain sentences), plain text only — no LaTeX, no backslash commands, no markdown, no special formatting symbols.
Also provide a short hint (1 sentence, plain text) for each question — it should nudge the student toward the method/concept without revealing the final answer.
Return ONLY valid JSON, no markdown, no commentary, matching exactly this shape:
{"questions":[{"text":"...","options":["A","B","C","D"],"correctOptionIndex":0,"explanation":"...","topic":"...","hint":"..."}]}`;

const PARSE_SYSTEM_PROMPT = `You extract multiple-choice questions from messy pasted text (any language, any format).
For each question found, identify the question text, its options, which option is correct, and a short explanation if present.
Explanations must be short (1-2 plain sentences), plain text only — no LaTeX, no backslash commands, no markdown.
Also generate a short hint (1 sentence, plain text) for each question that nudges toward the method without giving away the answer.
Return ONLY valid JSON, no markdown, no commentary, matching exactly this shape:
{"questions":[{"text":"...","options":["A","B","C","D"],"correctOptionIndex":0,"explanation":"...","topic":"...","hint":"..."}]}
If no explanation is given, use an empty string. If fewer or more than 4 options exist, include exactly what was given.`;

async function callGemini(systemPrompt: string, userPrompt: string) {
  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
      generationConfig: {
        maxOutputTokens: 8192,
        temperature: 0.5,
        responseMimeType: 'application/json',
      },
    }),
  });
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('Gemini raw response:', JSON.stringify(data));
    throw new Error('AI did not return content');
  }
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    console.error('JSON parse failed. Raw text was:', text.slice(0, 500));
    throw new Error('AI response was not valid JSON');
  }
  if (!Array.isArray(parsed.questions) || parsed.questions.length === 0) {
    throw new Error('AI returned no questions');
  }
  return parsed.questions;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Mode 1: parse raw pasted text into structured questions.
    if (body.rawText) {
      const userPrompt = `Extract every multiple-choice question from this pasted text:\n\n${body.rawText}`;
      const questions = await callGemini(PARSE_SYSTEM_PROMPT, userPrompt);
      return NextResponse.json({ questions });
    }

    // Mode 2: generate brand-new questions.
    const { examName, topic, difficulty, count } = body;
    if (!examName || !count) {
      return NextResponse.json({ error: 'examName and count are required' }, { status: 400 });
    }
    const userPrompt = `Generate ${count} ${difficulty || 'medium'} difficulty multiple-choice questions for the "${examName}" exam${
      topic ? `, focused on the topic: "${topic}"` : ', covering a healthy mix of quant, reasoning, English and general awareness'
    }. Each question must have exactly 4 options and one correct answer.`;
    const questions = await callGemini(GENERATE_SYSTEM_PROMPT, userPrompt);
    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Mock test generation error:', error);
    return NextResponse.json({ error: 'Could not process test' }, { status: 500 });
  }
}