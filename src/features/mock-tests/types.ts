import type { ExamId } from "@/types/exam";
import type { Difficulty, SubjectArea } from "@/types/common";

export type MockTestMode = "full" | "sectional" | "adaptive" | "previous-year" | "weak-topic" | "speed-drill";
export type QuestionType = "mcq" | "fill-in" | "true-false";

export interface Question {
  id: string; text: string; options: string[]; correctOptionIndex: number; explanation: string;
  topic: string; subject: SubjectArea; difficulty: Difficulty;
  previousYearExam?: string; previousYear?: number; imageUrl?: string;hint?: string;
}

export interface UserAnswer { questionId: string; selectedOptionIndex: number | null; timeSpent: number; isMarkedForReview: boolean; }

export interface MockTestConfig {
  id: string; title: string; examId: ExamId; mode: MockTestMode; totalQuestions: number;
  durationMinutes: number; marksPerQuestion: number; negativeMarkingFraction: number;
  sections: MockTestSection[]; topics?: string[]; difficulty?: Difficulty;
}

export interface MockTestSection {
  id: string; name: string; subject: SubjectArea; questions: Question[];
  marksPerQuestion: number; negativeMarkingFraction: number;
}

export interface TestSession {
  config: MockTestConfig; answers: Record<string, UserAnswer>; currentQuestionIndex: number;
  currentSectionIndex: number; startTime: number; endTime?: number; timeRemaining: number;
  status: "not-started" | "in-progress" | "paused" | "completed" | "timed-out";
}

export interface TestResult {
  id: string; testId: string; userId: string; examId: ExamId; mode: MockTestMode;
  totalQuestions: number; attempted: number; correct: number; incorrect: number; unanswered: number;
  marksObtained: number; totalMarks: number; negativeMarks: number; percentage: number;
  timeTaken: number; averageTimePerQuestion: number;
  sectionResults: SectionResult[]; topicResults: TopicResult[]; completedAt: Date;
}

export interface SectionResult {
  sectionId: string; sectionName: string; subject: SubjectArea; totalQuestions: number;
  attempted: number; correct: number; incorrect: number; marksObtained: number; totalMarks: number;
  accuracy: number; averageTime: number;
}

export interface TopicResult {
  topic: string; subject: SubjectArea; totalQuestions: number; correct: number; incorrect: number;
  accuracy: number; averageTime: number;
}

export interface FourStepAnalysis {
  categorize: { conceptual: number; silly: number; timePressure: number; guessing: number; };
  findCause: Array<{ questionId: string; errorType: string; cause: string; suggestion: string; }>;
  reResolve: string[];
  logMistakes: Array<{ questionId: string; topic: string; errorType: string; notes: string; }>;
}

export interface TimeSplit {
  thinkingTime: number; solvingTime: number; idealThinking: number; idealSolving: number;
  perQuestion: Array<{ questionId: string; thinkingSeconds: number; solvingSeconds: number; totalSeconds: number; }>;
}

export interface AvailableTest {
  id: string; title: string; examId: ExamId; examName: string; mode: MockTestMode;
  totalQuestions: number; durationMinutes: number; difficulty: Difficulty; attempted: boolean;
  bestScore?: number; topics?: string[];
}
