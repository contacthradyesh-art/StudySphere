export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  error: string | null;
  timestamp: number;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export type LoadingState = "idle" | "loading" | "success" | "error";

export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export type Difficulty = "easy" | "medium" | "hard" | "expert";

export type SubjectArea =
  | "quantitative-aptitude"
  | "reasoning"
  | "english"
  | "general-awareness"
  | "general-science"
  | "physics"
  | "chemistry"
  | "biology"
  | "mathematics"
  | "history"
  | "geography"
  | "polity"
  | "economics"
  | "current-affairs"
  | "computer-knowledge";

export type MasteryLevel = "not-started" | "learning" | "practicing" | "mastered";

export type TimeRange = "today" | "week" | "month" | "quarter" | "all";
