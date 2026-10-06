export const SPEAKING_SESSIONS_COLLECTION = 'englishSpeakingSessions';

export interface SpeakingFeedback {
  score: number;
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

export const SPEAKING_PROMPTS = [
  'Introduce yourself in under a minute — your background, interests, and goals.',
  'Describe your hometown to someone who has never been there.',
  'Talk about a skill you want to learn and why it matters to you.',
  'Explain a current event you find interesting, in your own words.',
  'Describe your favorite way to spend a weekend.',
  'Talk about a person who has inspired you and how.',
  'Explain the steps of a task you know well, as if teaching someone.',
  'Describe a place you would like to visit and why.',
];