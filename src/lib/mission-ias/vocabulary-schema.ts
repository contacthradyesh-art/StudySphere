export const VOCABULARY_COLLECTION = 'vocabulary';

export type WordDifficulty = 'easy' | 'medium' | 'hard';
export type VocabLevel = 'ssc' | 'upsc';

export interface VocabWord {
  id: string;
  word: string;
  partOfSpeech: string;
  meaning: string;
  hindiMeaning: string;
  synonyms: string[];
  antonyms: string[];
  exampleSentence: string;
  editorialUsage: string;
  difficulty: WordDifficulty;
  level?: VocabLevel;
  createdAt: number;
}