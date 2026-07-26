import { NextApiRequest, NextApiResponse } from 'next';

const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const SYSTEM_PROMPT = `You are a study planner AI. When user tells you what they want to study, generate a list of tasks.
ALWAYS respond in this exact JSON format only, no extra text:
{
  "tasks": [
    {
      "title": "Task name",
      "description": "Brief description",
      "priority": "High" or "Medium" or "Low",
      "estimatedTime": "30 mins",
      "dueDate": "YYYY-MM-DD"
    }
  ]
}`;

async function callGemini(userMessage: string): Promise<string> {
  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: userMessage }] }],
      generationConfig: { maxOutputTokens: 1024, temperature: 0.4 }
    })
  });
  const data = await res.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{"tasks":[]}';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { message } = req.body;
    const raw = await callGemini(message);
    const cleaned = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);
  } catch (error) {
    return res.status(500).json({ error: 'AI unavailable' });
  }
}