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
  category: UpscCategory;
  gsPaper: string;
  createdAt: number;
}
