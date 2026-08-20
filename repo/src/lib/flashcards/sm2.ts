import type { Flashcard } from '@/lib/firestore/flashcard-schema';

/**
 * SuperMemo-2 spaced-repetition algorithm.
 *
 * Grade scale (q): 0-5, but we expose simple buttons mapped as:
 *   again = 2, hard = 3, good = 4, easy = 5
 * Cards graded < 3 are reset (repetitions -> 0, interval -> 1 day).
 * See https://en.wikipedia.org/wiki/SuperMemo#Algorithm_SM-2
 */
export type Grade = 2 | 3 | 4 | 5;

function isoInDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export interface Sm2State {
  ease: number;
  interval: number;
  repetitions: number;
  dueDate: string;
}

/** Compute the next scheduling state for a card given a review grade. */
export function scheduleCard(card: Pick<Flashcard, 'ease' | 'interval' | 'repetitions'>, grade: Grade): Sm2State {
  let { ease, repetitions } = card;
  let interval: number;

  if (grade < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(card.interval * ease);
  }

  // Update ease factor, clamped to a 1.3 minimum.
  ease = Math.max(1.3, ease + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02)));

  return { ease, interval, repetitions, dueDate: isoInDays(interval) };
}

/** Default scheduling state for a freshly created card (due today). */
export function initialState(): Sm2State {
  return { ease: 2.5, interval: 0, repetitions: 0, dueDate: new Date().toISOString().slice(0, 10) };
}
