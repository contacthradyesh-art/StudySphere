export const CURRENT_AFFAIRS_COLLECTION = 'currentAffairs';

export type UpscCategory =
  | 'polity' | 'economy' | 'international-relations' | 'environment'
  | 'science-tech' | 'security' | 'governance' | 'agriculture'
  | 'social-issues' | 'other';

export interface CurrentAffairsItem {
  id: string;
  title: string;
  source: string;
  link: string;
  publishedAt: number;
  summary: string;
  /** One-line note on why this matters for UPSC prelims/mains — the exam angle, not just the news. */
  examRelevance: string;
  /** Specific static-syllabus concept this connects to, AI-inferred, e.g. "Federalism", "Repo Rate", "Indo-Pacific Strategy". */
  topic: string;
  category: UpscCategory;
  gsPaper: string;
  createdAt: number;
}