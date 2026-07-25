import type { Flashcard, FlashcardDeck, SM2Data } from "../types";
import { createInitialSM2Data } from "./sm2Algorithm";

export function getMockDecks(): FlashcardDeck[] {
  return [
    { id: "deck-quant", name: "Quantitative Aptitude Formulas", description: "Key formulas for SSC & Banking exams", topic: "Quantitative Aptitude", subject: "quantitative-aptitude", examId: "ssc-cgl", cardCount: 8, dueCount: 5, masteredCount: 2, createdAt: new Date(Date.now() - 7 * 86400000), updatedAt: new Date() },
    { id: "deck-polity", name: "Indian Polity Basics", description: "Constitutional articles and amendments", topic: "Indian Polity", subject: "general-awareness", examId: "upsc-cse", cardCount: 6, dueCount: 3, masteredCount: 1, createdAt: new Date(Date.now() - 14 * 86400000), updatedAt: new Date() },
    { id: "deck-reasoning", name: "Reasoning Shortcuts", description: "Quick methods for coding, series, syllogism", topic: "Reasoning", subject: "reasoning", cardCount: 5, dueCount: 4, masteredCount: 0, createdAt: new Date(Date.now() - 3 * 86400000), updatedAt: new Date() },
  ];
}

export function getMockCards(deckId: string): Flashcard[] {
  const allCards: Record<string, Flashcard[]> = {
    "deck-quant": [
      { id: "fc-1", front: "What is the formula for Compound Interest?", back: "A = P(1 + R/100)^n\nCI = A - P", topic: "CI/SI", subject: "quantitative-aptitude", difficulty: "medium", tags: ["formula"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-2", front: "Profit% formula when CP and SP are given?", back: "Profit% = ((SP - CP) / CP) × 100", topic: "Profit & Loss", subject: "quantitative-aptitude", difficulty: "easy", tags: ["formula"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-3", front: "Speed, Distance, Time relationship?", back: "Speed = Distance/Time\nkm/hr to m/s: multiply by 5/18", topic: "Time, Speed & Distance", subject: "quantitative-aptitude", difficulty: "easy", tags: ["formula"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-4", front: "What is the formula for Simple Interest?", back: "SI = (P × R × T) / 100", topic: "CI/SI", subject: "quantitative-aptitude", difficulty: "easy", tags: ["formula"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-5", front: "Average formula and shortcut?", back: "Average = Sum / Count\nAP shortcut: (First+Last)/2", topic: "Average", subject: "quantitative-aptitude", difficulty: "easy", tags: ["formula"], source: "ai-generated", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-6", front: "Percentage increase/decrease formula?", back: "% Change = ((New-Old)/Old) × 100", topic: "Percentage", subject: "quantitative-aptitude", difficulty: "medium", tags: ["formula"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-7", front: "Work and Time: A does work in a days, B in b days, together?", back: "(a×b)/(a+b) days", topic: "Time & Work", subject: "quantitative-aptitude", difficulty: "medium", tags: ["formula"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-8", front: "Ratio: if a:b = c:d, property?", back: "a × d = b × c (cross multiplication)", topic: "Ratio & Proportion", subject: "quantitative-aptitude", difficulty: "easy", tags: ["formula"], source: "ai-generated", createdAt: new Date(), updatedAt: new Date() },
    ],
    "deck-polity": [
      { id: "fc-p1", front: "Which articles deal with Right to Equality?", back: "Articles 14-18", topic: "Fundamental Rights", subject: "general-awareness", difficulty: "medium", tags: ["article"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-p2", front: "What are Directive Principles of State Policy?", back: "Part IV, Articles 36-51. Non-justiciable.", topic: "DPSP", subject: "general-awareness", difficulty: "medium", tags: ["part-iv"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-p3", front: "42nd Constitutional Amendment is known as?", back: "Mini Constitution (1976)", topic: "Amendments", subject: "general-awareness", difficulty: "hard", tags: ["amendment"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-p4", front: "What is Article 370?", back: "Special status to J&K, abrogated 5 Aug 2019", topic: "Special Provisions", subject: "general-awareness", difficulty: "medium", tags: ["article"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-p5", front: "How many Fundamental Duties are there?", back: "11 (Article 51A)", topic: "Fundamental Duties", subject: "general-awareness", difficulty: "medium", tags: ["duties"], source: "ai-generated", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-p6", front: "What is the Preamble of the Indian Constitution?", back: "Sovereign Socialist Secular Democratic Republic: Justice, Liberty, Equality, Fraternity", topic: "Preamble", subject: "general-awareness", difficulty: "medium", tags: ["preamble"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
    ],
    "deck-reasoning": [
      { id: "fc-r1", front: "Coding: letter shifted by 1, how to decode?", back: "Shift back by 1. DPNQVUFS -> COMPUTER", topic: "Coding-Decoding", subject: "reasoning", difficulty: "easy", tags: ["shortcut"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-r2", front: "Syllogism: 4 types of statements?", back: "A: All S are P, E: No S is P, I: Some S are P, O: Some S are not P", topic: "Syllogism", subject: "reasoning", difficulty: "medium", tags: ["concept"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-r3", front: "Number Series: common patterns?", back: "Differences, ratios, squares/cubes, n(n+1), primes", topic: "Number Series", subject: "reasoning", difficulty: "medium", tags: ["pattern"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-r4", front: "Blood Relations: how to solve quickly?", back: "Draw family tree, use + male / - female symbols", topic: "Blood Relations", subject: "reasoning", difficulty: "easy", tags: ["shortcut"], source: "ai-generated", createdAt: new Date(), updatedAt: new Date() },
      { id: "fc-r5", front: "Direction Sense: key rules?", back: "Start from North. Clockwise: N->E->S->W", topic: "Direction Sense", subject: "reasoning", difficulty: "easy", tags: ["concept"], source: "manual", createdAt: new Date(), updatedAt: new Date() },
    ],
  };
  return allCards[deckId] || allCards["deck-quant"];
}

export function getMockSM2Data(cards: Flashcard[]): Record<string, SM2Data> {
  const data: Record<string, SM2Data> = {};
  cards.forEach((card, index) => {
    const sm2 = createInitialSM2Data(card.id);
    if (index < 2) {
      sm2.repetitions = 3; sm2.interval = 10; sm2.easeFactor = 2.8;
      const future = new Date(); future.setDate(future.getDate() + 5); sm2.nextReviewDate = future;
    } else if (index < 4) {
      sm2.repetitions = 1; sm2.interval = 1; sm2.easeFactor = 2.3;
      const past = new Date(); past.setDate(past.getDate() - 1); sm2.nextReviewDate = past;
    }
    data[card.id] = sm2;
  });
  return data;
}
