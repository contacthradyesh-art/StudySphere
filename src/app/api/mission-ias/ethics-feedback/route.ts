import { NextRequest, NextResponse } from 'next/server';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

const SYSTEM_PROMPT = `You are an experienced UPSC Civil Services Mains GS Paper 4 (Ethics) answer evaluator, supportive but honest, coaching an Indian aspirant.
Given a case-study scenario, its sub-questions, and the student's written answer, evaluate it the way a UPSC examiner would: does it identify the ethical issues/values in conflict, list realistic options/courses of action, weigh their pros and cons, and justify a final choice with sound ethical reasoning (not just a gut opinion)?
Return ONLY valid JSON, no markdown, matching exactly:
{
  "score": <number 0-100, mapped from typical UPSC marking (structure, ethical reasoning depth, and practicality)>,
  "ethicalIssuesIdentified": [<2-4 short phrases naming the ethical issues/values the student correctly identified, or the key ones if the student missed them>],
  "optionsEvaluated": [<2-3 short phrases summarizing the courses of action the student considered>],
  "strengths": [<2-3 short specific things done well>],
  "improvements": [<2-3 short specific, actionable things to improve \u2014 e.g. "weigh both options before choosing", "mention a specific principle/thinker", "consider the weakest stakeholder">],
  "modelApproach": "<a concise 3-5 sentence model answer approach a strong candidate might take, for the student to compare against \u2014 not a full essay, just the key reasoning path>"
}`;

export async function POST(req: NextRequest) {
  try {
    const { scenario, questions, answer } = await req.json();
    if (!answer || typeof answer !== 'string' || answer.trim().length < 20) {
      return NextResponse.json({ error: 'Please write a fuller answer (at least a few sentences per question).' }, { status: 400 });
    }

    const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{
          role: 'user',
          parts: [{
            text: `Scenario:\n${scenario}\n\nQuestions:\n${(questions || []).map((q: string, i: number) => `${i + 1}. ${q}`).join('\n')}\n\nStudent's answer:\n${answer}`
          }]
        }],
        generationConfig: { maxOutputTokens: 1200, temperature: 0.4, responseMimeType: 'application/json' }
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error('ethics-feedback: Gemini API error', res.status, errBody.slice(0, 500));
      return NextResponse.json({ error: `AI request failed (${res.status})` }, { status: 500 });
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const raw = candidate?.content?.parts?.[0]?.text;
    if (!raw) {
      console.error('ethics-feedback: no content in response', JSON.stringify(data).slice(0, 500));
      return NextResponse.json({ error: `AI did not return content (finishReason: ${candidate?.finishReason || 'unknown'})` }, { status: 500 });
    }

    let feedback;
    try {
      feedback = JSON.parse(raw);
    } catch (e) {
      console.error('ethics-feedback: JSON parse failed', String(e), raw.slice(-300));
      return NextResponse.json({ error: 'AI returned invalid JSON (try again)' }, { status: 500 });
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('ethics-feedback: unexpected error', error);
    return NextResponse.json({ error: 'Could not generate feedback. Please try again.' }, { status: 500 });
  }
}
