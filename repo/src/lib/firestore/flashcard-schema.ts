import type { Timestamp } from 'firebase/firestore';
import type { Subject } from '@/lib/firestore/planner-schema';

/**
 * Firestore data model for Flashcards + AI (Milestone 6).
 * Collections (under users/{uid}):
 *   flashcardDecks/{deckId}
 *   flashcards/{cardId}            - references deckId
 *   aiConversations/{conversationId}
 */

export const FLASHCARD_COLLECTIONS = {
  decks: 'flashcardDecks',
  cards: 'flashcards',
  conversations: 'aiConversations'
} as const;

export interface Deck {
  id: string;
  name: string;
  subject: Subject | null;
  cardCount: number;
  createdAt: Timestamp | null;
}

export type NewDeck = Pick<Deck, 'name' | 'subject'>;

/** SuperMemo-2 scheduling state lives on each card. */
export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  /** SM-2 ease factor (>= 1.3). */
  ease: number;
  /** Current inter-repetition interval in days. */
  interval: number;
  /** Number of consecutive correct reviews. */
  repetitions: number;
  /** ISO date (YYYY-MM-DD) this card is next due. */
  dueDate: string;
  source: 'manual' | 'ai';
  createdAt: Timestamp | null;
}

export type NewFlashcard = Pick<Flashcard, 'deckId' | 'front' | 'back' | 'source'>;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}
