import type { SubjectArea, Difficulty } from "@/types/common";
import type { ExamId } from "@/types/exam";

export interface Flashcard {
  id: string; front: string; back: string; topic: string; subject: SubjectArea; examId?: ExamId;
  difficulty: Difficulty; tags: string[]; source: "manual" | "ai-generated"; createdAt: Date; updatedAt: Date;
}

export interface SM2Data {
  cardId: string; easeFactor: number; interval: number; repetitions: number;
  nextReviewDate: Date; lastReviewDate: Date; quality: number;
}

export type SM2Quality = 0 | 1 | 2 | 3 | 4 | 5;

export interface FlashcardDeck {
  id: string; name: string; description: string; topic: string; subject: SubjectArea; examId?: ExamId;
  cardCount: number; dueCount: number; masteredCount: number; createdAt: Date; updatedAt: Date;
}

export interface ReviewSession {
  deckId: string; cards: Flashcard[]; sm2Data: Record<string, SM2Data>; currentIndex: number;
  isFlipped: boolean; completed: number; total: number; startTime: number;
}

export interface GeneratedFlashcards {
  cards: Array<{ front: string; back: string; topic: string; difficulty: string; }>;
}
