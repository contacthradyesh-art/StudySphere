export const WRITING_SESSIONS_COLLECTION = 'englishWritingSessions';
export const SPEAKING_SESSIONS_COLLECTION = 'englishSpeakingSessions';

export interface WritingFeedback {
  score: number; // 0-100
  strengths: string[];
  improvements: string[];
  correctedText: string;
  vocabularySuggestions: string[];
}

export interface WritingSession {
  id: string;
  prompt: string;
  text: string;
  feedback: WritingFeedback;
  createdAt: number;
}

export interface SpeakingFeedback {
  score: number; // 0-100
  transcript: string;
  fluencyNotes: string;
  grammarNotes: string;
  vocabularyNotes: string;
  suggestions: string[];
}

export interface SpeakingSession {
  id: string;
  prompt: string;
  feedback: SpeakingFeedback;
  createdAt: number;
}

/** A rotating set of prompts so the practice doesn't feel repetitive. */
export const WRITING_PROMPTS = [
  'Describe a challenge you recently overcame and what you learned from it.',
  'Should social media be regulated by the government? Give your opinion.',
  'Describe your daily routine and how you manage your time.',
  'What is one change you would make to improve your city? Explain why.',
  'Write about a book, movie, or event that influenced your thinking.',
  'Describe the qualities of a good leader, with an example.',
  'Should exams be the only way to evaluate a student\u2019s ability?',
  'Write about a goal you are currently working toward.'
];

export const SPEAKING_PROMPTS = [
  'Introduce yourself in under a minute \u2014 your background, interests, and goals.',
  'Describe your hometown to someone who has never been there.',
  'Talk about a skill you want to learn and why it matters to you.',
  'Explain a current event you find interesting, in your own words.',
  'Describe your favorite way to spend a weekend.',
  'Talk about a person who has inspired you and how.',
  'Explain the steps of a task you know well, as if teaching someone.',
  'Describe a place you would like to visit and why.'
];
