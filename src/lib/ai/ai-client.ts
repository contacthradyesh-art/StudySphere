import type { ChatMessage } from '@/lib/firestore/flashcard-schema';

export type AiTask = 'chat' | 'summarize' | 'flashcards' | 'quiz';

export interface AiRequest {
  task: AiTask;
  messages?: ChatMessage[];
  text?: string;
}

export interface AiFlashcard { front: string; back: string; }

export interface AiResponse {
  reply?: string;
  flashcards?: AiFlashcard[];
  fallback: boolean; // true when generated without a real provider
}

/** Call the server-side AI route. The API key stays on the server. */
export async function askAi(req: AiRequest): Promise<AiResponse> {
  const res = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  if (!res.ok) throw new Error('AI request failed');
  return res.json();
}
