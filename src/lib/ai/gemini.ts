import { GoogleGenerativeAI, type GenerativeModel } from "@google/generative-ai";

let genAI: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY environment variable is not set");
    genAI = new GoogleGenerativeAI(apiKey);
  }
  return genAI;
}

export function getModel(modelName: string = "gemini-1.5-flash"): GenerativeModel {
  return getClient().getGenerativeModel({ model: modelName });
}

export async function generateStructuredContent<T>(options: {
  prompt: string;
  systemInstruction?: string;
  responseSchema?: Record<string, unknown>;
  modelName?: string;
}): Promise<T> {
  const model = getModel(options.modelName);
  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: options.prompt }] }],
    systemInstruction: options.systemInstruction
      ? { role: "system", parts: [{ text: options.systemInstruction }] }
      : undefined,
    generationConfig: {
      responseMimeType: "application/json",
      ...(options.responseSchema && { responseSchema: options.responseSchema }),
    },
  });
  const text = result.response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Failed to parse Gemini response as JSON: ${text.slice(0, 200)}`);
  }
}

export async function generateVisionContent<T>(options: {
  prompt: string;
  imageBase64: string;
  imageMimeType: string;
  systemInstruction?: string;
  responseSchema?: Record<string, unknown>;
}): Promise<T> {
  const model = getModel("gemini-1.5-flash");
  const result = await model.generateContent({
    contents: [{
      role: "user",
      parts: [
        { inlineData: { mimeType: options.imageMimeType, data: options.imageBase64 } },
        { text: options.prompt },
      ],
    }],
    systemInstruction: options.systemInstruction
      ? { role: "system", parts: [{ text: options.systemInstruction }] }
      : undefined,
    generationConfig: {
      responseMimeType: "application/json",
      ...(options.responseSchema && { responseSchema: options.responseSchema }),
    },
  });
  const text = result.response.text();
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Failed to parse Gemini vision response as JSON: ${text.slice(0, 200)}`);
  }
}

export const SYSTEM_INSTRUCTIONS = {
  FLASHCARD_GENERATOR:
    "Only use information present in the provided source. Never invent or add outside facts. Generate flashcards that test understanding, not just recall.",
  DOUBT_SOLVER:
    "You are an expert tutor for Indian competitive exams. Explain concepts clearly with examples. Use step-by-step solutions for math problems. Reference relevant exam patterns when applicable.",
  DOUBT_SOLVER_CONFUSED:
    "You are a patient, friendly tutor. The student is confused. Use extremely simple language. Break everything into tiny steps. Use real-world analogies. Avoid jargon. Make the student feel confident.",
  AI_PLANNER:
    "You are an expert study planner for Indian competitive exams. Create realistic, balanced study plans. Account for revision, breaks, and buffer days. Prioritize weak topics while maintaining coverage of all subjects.",
  MOCK_ANALYZER:
    "Analyze the student's mock test performance. Identify patterns in mistakes. Categorize errors as conceptual, silly, time-management, or guessing. Provide actionable improvement suggestions.",
} as const;
