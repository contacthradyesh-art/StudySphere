import type { SubjectArea, Difficulty } from "./common";

export type ExamId =
  | "ssc-cgl" | "ssc-chsl" | "ibps-po" | "ibps-clerk"
  | "sbi-po" | "sbi-clerk" | "rrb-ntpc" | "upsc-cse"
  | "state-pcs" | "upp-constable" | "neet" | "jee-main" | "jee-advanced";

export type ExamCategoryType =
  | "SSC" | "Banking" | "Railway" | "Civil Services" | "Police" | "Medical" | "Engineering";

export interface ExamDefinition {
  id: ExamId;
  name: string;
  category: ExamCategoryType;
  subjects: SubjectArea[];
  totalMarks: number;
  duration: number;
  negativeMarking: number;
  sections: ExamSection[];
}

export interface ExamSection {
  id: string;
  name: string;
  subject: SubjectArea;
  totalQuestions: number;
  marksPerQuestion: number;
  negativeMarking: number;
}

export interface Topic {
  id: string;
  name: string;
  subject: SubjectArea;
  examIds: ExamId[];
  difficulty: Difficulty;
  weightage: number;
  subtopics: string[];
}

export interface TopicOverlap {
  topicId: string;
  topicName: string;
  sharedExams: ExamId[];
  subject: SubjectArea;
}
