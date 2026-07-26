export interface GeminiRequest {
  prompt: string;
  systemInstruction?: string;
  responseSchema?: Record<string, unknown>;
  imageBase64?: string;
  imageMimeType?: string;
}

export interface GeminiResponse<T = unknown> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export interface FlashcardGenerationRequest {
  sourceText: string;
  topic: string;
  count: number;
  difficulty: "easy" | "medium" | "hard";
}

export interface DoubtSolverRequest {
  question: string;
  imageBase64?: string;
  imageMimeType?: string;
  mode: "standard" | "explain-like-confused";
  subject?: string;
}

export interface AiPlannerRequest {
  targetExams: string[];
  examDates: Record<string, string>;
  dailyHours: number;
  weakTopics: string[];
  completedTopics: string[];
}
