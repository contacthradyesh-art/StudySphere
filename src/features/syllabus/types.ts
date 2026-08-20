import type { ExamId } from "@/types/exam";
import type { SubjectArea, MasteryLevel, Difficulty } from "@/types/common";

export interface SyllabusTopic {
  id: string; name: string; subject: SubjectArea; difficulty: Difficulty; examIds: ExamId[];
  mastery: MasteryLevel; accuracy: number; subtopics: string[]; weightage: Record<ExamId, number>;
  isOverlap: boolean; overlapCount: number;
}

export interface SubjectGroup {
  subject: SubjectArea; subjectLabel: string; topics: SyllabusTopic[]; overallMastery: number; topicCount: number;
}

export interface CrossExamMap {
  topicId: string; topicName: string; subject: SubjectArea;
  exams: Array<{ examId: ExamId; examName: string; weightage: number; mastery: MasteryLevel; }>;
}
