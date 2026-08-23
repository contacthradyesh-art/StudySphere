import type { SyllabusTopic, CrossExamMap } from "@/features/syllabus/types";

/**
 * Static syllabus taxonomy: topic names, subtopics, difficulty, and which
 * exams cover each topic. This is curriculum structure, not per-user data,
 * so it's fine as a static config (same pattern as INDIA_STATES).
 * Per-user mastery/accuracy is merged in at runtime from Firestore —
 * see use-syllabus-data.ts. Defaults below are always "not-started"/0.
 */
export const SYLLABUS_TAXONOMY: Record<string, { subjectLabel: string; topics: Omit<SyllabusTopic, "mastery" | "accuracy">[] }> = {
  "quantitative-aptitude": {
    subjectLabel: "Quantitative Aptitude",
    topics: [
      { id: "t-percentage", name: "Percentage", subject: "quantitative-aptitude", difficulty: "easy", examIds: ["ssc-cgl", "ibps-po", "rrb-ntpc"], subtopics: ["Basic %", "% Change", "Successive %"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
      { id: "t-profit-loss", name: "Profit & Loss", subject: "quantitative-aptitude", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po", "rrb-ntpc"], subtopics: ["Basic P&L", "Discount", "Marked Price"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
      { id: "t-ci-si", name: "CI / SI", subject: "quantitative-aptitude", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po", "sbi-po"], subtopics: ["Simple Interest", "Compound Interest"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
      { id: "t-ratio", name: "Ratio & Proportion", subject: "quantitative-aptitude", difficulty: "easy", examIds: ["ssc-cgl", "ibps-po", "rrb-ntpc"], subtopics: ["Ratios", "Proportion", "Mixtures"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
      { id: "t-tsd", name: "Time, Speed & Distance", subject: "quantitative-aptitude", difficulty: "medium", examIds: ["ssc-cgl", "rrb-ntpc"], subtopics: ["Trains", "Boats", "Relative Speed"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
      { id: "t-tw", name: "Time & Work", subject: "quantitative-aptitude", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po"], subtopics: ["Basic", "Pipes & Cisterns"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
      { id: "t-geometry", name: "Geometry", subject: "quantitative-aptitude", difficulty: "hard", examIds: ["ssc-cgl"], subtopics: ["Triangles", "Circles", "Quadrilaterals"], weightage: {} as any, isOverlap: false, overlapCount: 1 },
      { id: "t-algebra", name: "Algebra", subject: "quantitative-aptitude", difficulty: "hard", examIds: ["ssc-cgl"], subtopics: ["Equations", "Surds", "Indices"], weightage: {} as any, isOverlap: false, overlapCount: 1 },
    ],
  },
  reasoning: {
    subjectLabel: "Reasoning",
    topics: [
      { id: "t-syllogism", name: "Syllogism", subject: "reasoning", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po", "sbi-po"], subtopics: ["2 Statements", "3 Statements"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
      { id: "t-coding", name: "Coding-Decoding", subject: "reasoning", difficulty: "easy", examIds: ["ssc-cgl", "ibps-po", "rrb-ntpc"], subtopics: ["Letter Coding", "Number Coding"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
      { id: "t-series", name: "Number Series", subject: "reasoning", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po", "sbi-po", "rrb-ntpc"], subtopics: ["Difference", "Ratio"], weightage: {} as any, isOverlap: true, overlapCount: 4 },
      { id: "t-blood", name: "Blood Relations", subject: "reasoning", difficulty: "easy", examIds: ["ssc-cgl", "ibps-po"], subtopics: ["Direct", "Coded"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
      { id: "t-direction", name: "Direction Sense", subject: "reasoning", difficulty: "easy", examIds: ["ssc-cgl", "rrb-ntpc"], subtopics: ["Basic", "Shadow Based"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
      { id: "t-puzzle", name: "Seating Arrangement", subject: "reasoning", difficulty: "hard", examIds: ["ibps-po", "sbi-po"], subtopics: ["Linear", "Circular"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
    ],
  },
  "general-awareness": {
    subjectLabel: "General Awareness",
    topics: [
      { id: "t-polity", name: "Indian Polity", subject: "general-awareness", difficulty: "medium", examIds: ["ssc-cgl", "upsc-cse", "state-pcs", "rrb-ntpc"], subtopics: ["Constitution", "Parliament"], weightage: {} as any, isOverlap: true, overlapCount: 4 },
      { id: "t-history", name: "Indian History", subject: "general-awareness", difficulty: "medium", examIds: ["ssc-cgl", "upsc-cse", "state-pcs", "rrb-ntpc"], subtopics: ["Ancient", "Medieval", "Modern"], weightage: {} as any, isOverlap: true, overlapCount: 4 },
      { id: "t-geography", name: "Indian Geography", subject: "general-awareness", difficulty: "medium", examIds: ["ssc-cgl", "upsc-cse", "rrb-ntpc"], subtopics: ["Physical", "Climate"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
      { id: "t-economy", name: "Indian Economy", subject: "general-awareness", difficulty: "hard", examIds: ["ssc-cgl", "upsc-cse", "ibps-po"], subtopics: ["Budget", "Banking", "GDP"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
    ],
  },
  english: {
    subjectLabel: "English",
    topics: [
      { id: "t-rc", name: "Reading Comprehension", subject: "english", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po", "sbi-po"], subtopics: ["Main Idea", "Inference"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
      { id: "t-grammar", name: "Grammar", subject: "english", difficulty: "easy", examIds: ["ssc-cgl", "ibps-po"], subtopics: ["Tenses", "Articles"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
      { id: "t-vocab", name: "Vocabulary", subject: "english", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po", "sbi-po"], subtopics: ["Synonyms", "Antonyms"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
      { id: "t-cloze", name: "Cloze Test", subject: "english", difficulty: "medium", examIds: ["ibps-po", "sbi-po"], subtopics: ["Fill in blanks"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
    ],
  },
};

/** Real exam weightage (curriculum reference, not per-user) — used for the Cross-Exam Map view. */
export const CROSS_EXAM_WEIGHTAGE: (Omit<CrossExamMap, "exams"> & { exams: Array<{ examId: string; examName: string; weightage: number }> })[] = [
  { topicId: "t-polity", topicName: "Indian Polity", subject: "general-awareness", exams: [
    { examId: "upsc-cse", examName: "UPSC CSE", weightage: 15 }, { examId: "ssc-cgl", examName: "SSC CGL", weightage: 8 },
    { examId: "state-pcs", examName: "State PCS", weightage: 12 }, { examId: "rrb-ntpc", examName: "RRB NTPC", weightage: 6 },
  ]},
  { topicId: "t-series", topicName: "Number Series", subject: "reasoning", exams: [
    { examId: "ibps-po", examName: "IBPS PO", weightage: 10 }, { examId: "sbi-po", examName: "SBI PO", weightage: 8 },
    { examId: "ssc-cgl", examName: "SSC CGL", weightage: 4 }, { examId: "rrb-ntpc", examName: "RRB NTPC", weightage: 5 },
  ]},
  { topicId: "t-percentage", topicName: "Percentage", subject: "quantitative-aptitude", exams: [
    { examId: "ssc-cgl", examName: "SSC CGL", weightage: 8 }, { examId: "ibps-po", examName: "IBPS PO", weightage: 6 },
    { examId: "rrb-ntpc", examName: "RRB NTPC", weightage: 7 },
  ]},
];
