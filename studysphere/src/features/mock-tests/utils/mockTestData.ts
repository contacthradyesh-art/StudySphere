import type { AvailableTest, MockTestConfig, Question, MockTestSection } from "../types";

const sampleQuestions: Question[] = [
  { id: "q1", text: "If the cost price of 15 articles is equal to the selling price of 12 articles, find the profit percentage.", options: ["20%", "25%", "30%", "15%"], correctOptionIndex: 1, explanation: "CP of 15 = SP of 12. Profit% = 25%", topic: "Profit & Loss", subject: "quantitative-aptitude", difficulty: "medium" },
  { id: "q2", text: "A train 150m long passes a pole in 15 seconds. Find the speed of the train in km/hr.", options: ["36 km/hr", "40 km/hr", "32 km/hr", "45 km/hr"], correctOptionIndex: 0, explanation: "Speed = 150/15 = 10 m/s = 36 km/hr", topic: "Time, Speed & Distance", subject: "quantitative-aptitude", difficulty: "easy" },
  { id: "q3", text: "In a certain code language, 'COMPUTER' is written as 'DPNQVUFS'. How is 'KEYBOARD' written?", options: ["LFZCPBSE", "LFZCPBSD", "LFZAPBSE", "LFZCPASE"], correctOptionIndex: 0, explanation: "Each letter shifted by 1.", topic: "Coding-Decoding", subject: "reasoning", difficulty: "easy" },
  { id: "q4", text: "All roses are flowers. Some flowers are red. Conclusion: I. Some roses are red. II. Some red things are flowers.", options: ["Only I follows", "Only II follows", "Both I and II follow", "Neither I nor II follows"], correctOptionIndex: 1, explanation: "Only II is a valid conclusion.", topic: "Syllogism", subject: "reasoning", difficulty: "medium" },
  { id: "q5", text: "Choose the correctly spelled word:", options: ["Accomodation", "Accommodation", "Acomodation", "Accommadation"], correctOptionIndex: 1, explanation: "Correct spelling: Accommodation.", topic: "Spelling", subject: "english", difficulty: "easy" },
  { id: "q6", text: "The Preamble of the Indian Constitution was amended by which Constitutional Amendment?", options: ["42nd Amendment", "44th Amendment", "46th Amendment", "52nd Amendment"], correctOptionIndex: 0, explanation: "42nd Amendment, 1976.", topic: "Indian Polity", subject: "general-awareness", difficulty: "medium" },
  { id: "q7", text: "A sum of Rs 5000 is invested at 10% per annum compound interest. What is the amount after 2 years?", options: ["Rs 6000", "Rs 6050", "Rs 5500", "Rs 6100"], correctOptionIndex: 1, explanation: "A = 5000(1.1)^2 = Rs 6050", topic: "Compound Interest", subject: "quantitative-aptitude", difficulty: "medium" },
  { id: "q8", text: "Which river is known as the 'Sorrow of Bihar'?", options: ["Ganga", "Kosi", "Son", "Gandak"], correctOptionIndex: 1, explanation: "Kosi river frequently floods.", topic: "Indian Geography", subject: "general-awareness", difficulty: "easy" },
  { id: "q9", text: "Find the missing number in the series: 2, 6, 12, 20, 30, ?", options: ["40", "42", "38", "44"], correctOptionIndex: 1, explanation: "Pattern n(n+1): 42", topic: "Number Series", subject: "reasoning", difficulty: "easy" },
  { id: "q10", text: "Select the word most nearly OPPOSITE in meaning to 'BENEVOLENT':", options: ["Generous", "Malevolent", "Kind", "Charitable"], correctOptionIndex: 1, explanation: "Opposite of benevolent is malevolent.", topic: "Vocabulary", subject: "english", difficulty: "medium" },
];

function generateMoreQuestions(count: number): Question[] {
  const questions: Question[] = [];
  for (let i = 0; i < count; i++) {
    const base = sampleQuestions[i % sampleQuestions.length];
    questions.push({ ...base, id: `q-gen-${i + 1}` });
  }
  return questions;
}

export function getAvailableTests(): AvailableTest[] {
  return [
    { id: "mt-ssc-full-1", title: "SSC CGL Tier-I Full Mock #1", examId: "ssc-cgl", examName: "SSC CGL", mode: "full", totalQuestions: 25, durationMinutes: 15, difficulty: "medium", attempted: true, bestScore: 72 },
    { id: "mt-ssc-quant-1", title: "SSC CGL Quantitative Aptitude", examId: "ssc-cgl", examName: "SSC CGL", mode: "sectional", totalQuestions: 10, durationMinutes: 8, difficulty: "medium", attempted: false, topics: ["Profit & Loss", "CI/SI", "Time & Work"] },
    { id: "mt-ibps-full-1", title: "IBPS PO Prelims Mock #1", examId: "ibps-po", examName: "IBPS PO", mode: "full", totalQuestions: 20, durationMinutes: 12, difficulty: "medium", attempted: false },
    { id: "mt-ssc-speed-1", title: "Speed Drill: Quant Basics", examId: "ssc-cgl", examName: "SSC CGL", mode: "speed-drill", totalQuestions: 10, durationMinutes: 5, difficulty: "easy", attempted: true, bestScore: 80 },
    { id: "mt-ssc-weak-1", title: "Weak Topic: Syllogism Practice", examId: "ssc-cgl", examName: "SSC CGL", mode: "weak-topic", totalQuestions: 10, durationMinutes: 8, difficulty: "medium", attempted: false, topics: ["Syllogism"] },
    { id: "mt-rrb-full-1", title: "RRB NTPC CBT-1 Mock #1", examId: "rrb-ntpc", examName: "RRB NTPC", mode: "full", totalQuestions: 20, durationMinutes: 12, difficulty: "easy", attempted: false },
  ];
}

export function getMockTestConfig(testId: string): MockTestConfig {
  const test = getAvailableTests().find((t) => t.id === testId);
  const totalQ = test?.totalQuestions || 10;
  const questions = generateMoreQuestions(totalQ);

  const quantQuestions = questions.filter((q) => q.subject === "quantitative-aptitude");
  const reasoningQuestions = questions.filter((q) => q.subject === "reasoning");
  const englishQuestions = questions.filter((q) => q.subject === "english");
  const gaQuestions = questions.filter((q) => q.subject === "general-awareness");

  const sections: MockTestSection[] = [
    { id: "sec-quant", name: "Quantitative Aptitude", subject: "quantitative-aptitude", questions: quantQuestions.length > 0 ? quantQuestions : questions.slice(0, 3), marksPerQuestion: 2, negativeMarkingFraction: 0.5 },
    { id: "sec-reasoning", name: "Reasoning", subject: "reasoning", questions: reasoningQuestions.length > 0 ? reasoningQuestions : questions.slice(3, 6), marksPerQuestion: 2, negativeMarkingFraction: 0.5 },
    { id: "sec-english", name: "English", subject: "english", questions: englishQuestions.length > 0 ? englishQuestions : questions.slice(6, 8), marksPerQuestion: 2, negativeMarkingFraction: 0.5 },
    { id: "sec-ga", name: "General Awareness", subject: "general-awareness", questions: gaQuestions.length > 0 ? gaQuestions : questions.slice(8, 10), marksPerQuestion: 2, negativeMarkingFraction: 0.5 },
  ];

  return {
    id: testId || "mt-default", title: test?.title || "Practice Test", examId: test?.examId || "ssc-cgl",
    mode: test?.mode || "full", totalQuestions: totalQ, durationMinutes: test?.durationMinutes || 10,
    marksPerQuestion: 2, negativeMarkingFraction: 0.5, sections,
  };
}
