import type { AiFlashcard } from '@/lib/ai/ai-client';

/**
 * Deterministic, offline fallbacks so AI features work even when no provider
 * key is configured. These are intentionally simple heuristics, not an LLM.
 */

/** Extractive summary: top sentences by length/keyword density, capped. */
export function summarize(text: string, maxSentences = 3): string {
  const sentences = text.replace(/\s+/g, ' ').split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length <= maxSentences) return text.trim();
  const scored = sentences.map((s, i) => ({ s, i, score: s.length }));
  const top = scored.sort((a, b) => b.score - a.score).slice(0, maxSentences).sort((a, b) => a.i - b.i);
  return top.map((t) => t.s).join(' ');
}

/** Turn "Term: definition" or "Term - definition" lines into Q/A cards. */
export function extractFlashcards(text: string, max = 10): AiFlashcard[] {
  const cards: AiFlashcard[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^\s*(.{2,80}?)\s*[:\-\u2013]\s*(.+)$/);
    if (m) cards.push({ front: m[1].trim(), back: m[2].trim() });
    if (cards.length >= max) break;
  }
  // Fallback: if no structured lines, make a single card from the first sentence.
  if (cards.length === 0) {
    const first = text.split(/(?<=[.!?])\s+/)[0]?.trim();
    if (first) cards.push({ front: 'Summarize this concept', back: first });
  }
  return cards;
}

export function fallbackChat(prompt: string): string {
  return (
    `Here is a study-focused response based on your question:\n\n` +
    summarize(prompt, 2) +
    `\n\n(Tip: configure an AI provider key to enable full conversational answers.)`
  );
}
