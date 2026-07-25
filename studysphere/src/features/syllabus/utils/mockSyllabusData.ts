import type { SubjectGroup, CrossExamMap } from "../types";

export function getMockSyllabusData(): SubjectGroup[] {
  return [
    {
      subject: "quantitative-aptitude", subjectLabel: "Quantitative Aptitude", overallMastery: 52, topicCount: 8,
      topics: [
        { id: "t-percentage", name: "Percentage", subject: "quantitative-aptitude", difficulty: "easy", examIds: ["ssc-cgl", "ibps-po", "rrb-ntpc"], mastery: "practicing", accuracy: 65, subtopics: ["Basic %", "% Change", "Successive %"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
        { id: "t-profit-loss", name: "Profit & Loss", subject: "quantitative-aptitude", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po", "rrb-ntpc"], mastery: "learning", accuracy: 38, subtopics: ["Basic P&L", "Discount", "Marked Price"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
        { id: "t-ci-si", name: "CI / SI", subject: "quantitative-aptitude", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po", "sbi-po"], mastery: "practicing", accuracy: 60, subtopics: ["Simple Interest", "Compound Interest"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
        { id: "t-ratio", name: "Ratio & Proportion", subject: "quantitative-aptitude", difficulty: "easy", examIds: ["ssc-cgl", "ibps-po", "rrb-ntpc"], mastery: "mastered", accuracy: 85, subtopics: ["Ratios", "Proportion", "Mixtures"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
        { id: "t-tsd", name: "Time, Speed & Distance", subject: "quantitative-aptitude", difficulty: "medium", examIds: ["ssc-cgl", "rrb-ntpc"], mastery: "learning", accuracy: 42, subtopics: ["Trains", "Boats", "Relative Speed"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
        { id: "t-tw", name: "Time & Work", subject: "quantitative-aptitude", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po"], mastery: "practicing", accuracy: 58, subtopics: ["Basic", "Pipes & Cisterns"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
        { id: "t-geometry", name: "Geometry", subject: "quantitative-aptitude", difficulty: "hard", examIds: ["ssc-cgl"], mastery: "learning", accuracy: 30, subtopics: ["Triangles", "Circles", "Quadrilaterals"], weightage: {} as any, isOverlap: false, overlapCount: 1 },
        { id: "t-algebra", name: "Algebra", subject: "quantitative-aptitude", difficulty: "hard", examIds: ["ssc-cgl"], mastery: "not-started", accuracy: 0, subtopics: ["Equations", "Surds", "Indices"], weightage: {} as any, isOverlap: false, overlapCount: 1 },
      ],
    },
    {
      subject: "reasoning", subjectLabel: "Reasoning", overallMastery: 60, topicCount: 6,
      topics: [
        { id: "t-syllogism", name: "Syllogism", subject: "reasoning", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po", "sbi-po"], mastery: "learning", accuracy: 42, subtopics: ["2 Statements", "3 Statements"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
        { id: "t-coding", name: "Coding-Decoding", subject: "reasoning", difficulty: "easy", examIds: ["ssc-cgl", "ibps-po", "rrb-ntpc"], mastery: "mastered", accuracy: 90, subtopics: ["Letter Coding", "Number Coding"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
        { id: "t-series", name: "Number Series", subject: "reasoning", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po", "sbi-po", "rrb-ntpc"], mastery: "practicing", accuracy: 72, subtopics: ["Difference", "Ratio"], weightage: {} as any, isOverlap: true, overlapCount: 4 },
        { id: "t-blood", name: "Blood Relations", subject: "reasoning", difficulty: "easy", examIds: ["ssc-cgl", "ibps-po"], mastery: "mastered", accuracy: 88, subtopics: ["Direct", "Coded"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
        { id: "t-direction", name: "Direction Sense", subject: "reasoning", difficulty: "easy", examIds: ["ssc-cgl", "rrb-ntpc"], mastery: "practicing", accuracy: 75, subtopics: ["Basic", "Shadow Based"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
        { id: "t-puzzle", name: "Seating Arrangement", subject: "reasoning", difficulty: "hard", examIds: ["ibps-po", "sbi-po"], mastery: "learning", accuracy: 35, subtopics: ["Linear", "Circular"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
      ],
    },
    {
      subject: "general-awareness", subjectLabel: "General Awareness", overallMastery: 40, topicCount: 5,
      topics: [
        { id: "t-polity", name: "Indian Polity", subject: "general-awareness", difficulty: "medium", examIds: ["ssc-cgl", "upsc-cse", "state-pcs", "rrb-ntpc"], mastery: "practicing", accuracy: 55, subtopics: ["Constitution", "Parliament"], weightage: {} as any, isOverlap: true, overlapCount: 4 },
        { id: "t-history", name: "Indian History", subject: "general-awareness", difficulty: "medium", examIds: ["ssc-cgl", "upsc-cse", "state-pcs", "rrb-ntpc"], mastery: "learning", accuracy: 40, subtopics: ["Ancient", "Medieval", "Modern"], weightage: {} as any, isOverlap: true, overlapCount: 4 },
        { id: "t-geography", name: "Indian Geography", subject: "general-awareness", difficulty: "medium", examIds: ["ssc-cgl", "upsc-cse", "rrb-ntpc"], mastery: "learning", accuracy: 38, subtopics: ["Physical", "Climate"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
        { id: "t-economy", name: "Indian Economy", subject: "general-awareness", difficulty: "hard", examIds: ["ssc-cgl", "upsc-cse", "ibps-po"], mastery: "not-started", accuracy: 0, subtopics: ["Budget", "Banking", "GDP"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
        { id: "t-science", name: "General Science", subject: "general-awareness", difficulty: "easy", examIds: ["ssc-cgl", "rrb-ntpc"], mastery: "practicing", accuracy: 62, subtopics: ["Physics", "Chemistry", "Biology"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
      ],
    },
    {
      subject: "english", subjectLabel: "English", overallMastery: 65, topicCount: 4,
      topics: [
        { id: "t-rc", name: "Reading Comprehension", subject: "english", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po", "sbi-po"], mastery: "practicing", accuracy: 68, subtopics: ["Main Idea", "Inference"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
        { id: "t-grammar", name: "Grammar", subject: "english", difficulty: "easy", examIds: ["ssc-cgl", "ibps-po"], mastery: "mastered", accuracy: 82, subtopics: ["Tenses", "Articles"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
        { id: "t-vocab", name: "Vocabulary", subject: "english", difficulty: "medium", examIds: ["ssc-cgl", "ibps-po", "sbi-po"], mastery: "practicing", accuracy: 60, subtopics: ["Synonyms", "Antonyms"], weightage: {} as any, isOverlap: true, overlapCount: 3 },
        { id: "t-cloze", name: "Cloze Test", subject: "english", difficulty: "medium", examIds: ["ibps-po", "sbi-po"], mastery: "learning", accuracy: 45, subtopics: ["Fill in blanks"], weightage: {} as any, isOverlap: true, overlapCount: 2 },
      ],
    },
  ];
}

export function getCrossExamMappings(): CrossExamMap[] {
  return [
    { topicId: "t-polity", topicName: "Indian Polity", subject: "general-awareness", exams: [
      { examId: "upsc-cse", examName: "UPSC CSE", weightage: 15, mastery: "practicing" },
      { examId: "ssc-cgl", examName: "SSC CGL", weightage: 8, mastery: "practicing" },
      { examId: "state-pcs", examName: "State PCS", weightage: 12, mastery: "not-started" },
      { examId: "rrb-ntpc", examName: "RRB NTPC", weightage: 6, mastery: "not-started" },
    ]},
    { topicId: "t-series", topicName: "Number Series", subject: "reasoning", exams: [
      { examId: "ibps-po", examName: "IBPS PO", weightage: 10, mastery: "practicing" },
      { examId: "sbi-po", examName: "SBI PO", weightage: 8, mastery: "practicing" },
      { examId: "ssc-cgl", examName: "SSC CGL", weightage: 4, mastery: "practicing" },
      { examId: "rrb-ntpc", examName: "RRB NTPC", weightage: 5, mastery: "practicing" },
    ]},
    { topicId: "t-percentage", topicName: "Percentage", subject: "quantitative-aptitude", exams: [
      { examId: "ssc-cgl", examName: "SSC CGL", weightage: 8, mastery: "practicing" },
      { examId: "ibps-po", examName: "IBPS PO", weightage: 6, mastery: "practicing" },
      { examId: "rrb-ntpc", examName: "RRB NTPC", weightage: 7, mastery: "practicing" },
    ]},
  ];
}
