import type { TestSession, TestResult, SectionResult, TopicResult, FourStepAnalysis, TimeSplit, UserAnswer, MockTestSection } from "../types";

export function calculateTestResult(session: TestSession): TestResult {
  const { config, answers } = session;
  const allQuestions = config.sections.flatMap((s) => s.questions);
  let correct = 0, incorrect = 0, unanswered = 0, totalTimeSpent = 0;

  allQuestions.forEach((q) => {
    const answer = answers[q.id];
    if (!answer || answer.selectedOptionIndex === null) unanswered++;
    else if (answer.selectedOptionIndex === q.correctOptionIndex) correct++;
    else incorrect++;
    if (answer) totalTimeSpent += answer.timeSpent;
  });

  const attempted = correct + incorrect;
  const totalMarks = allQuestions.length * config.marksPerQuestion;
  const positiveMarks = correct * config.marksPerQuestion;
  const negativeMarks = incorrect * config.negativeMarkingFraction * config.marksPerQuestion;
  const marksObtained = positiveMarks - negativeMarks;
  const percentage = totalMarks > 0 ? (marksObtained / totalMarks) * 100 : 0;

  const sectionResults = calculateSectionResults(config.sections, answers);
  const topicResults = calculateTopicResults(config.sections, answers);

  return {
    id: `result-${Date.now()}`, testId: config.id, userId: "", examId: config.examId, mode: config.mode,
    totalQuestions: allQuestions.length, attempted, correct, incorrect, unanswered,
    marksObtained: Math.max(marksObtained, 0), totalMarks, negativeMarks, percentage: Math.max(percentage, 0),
    timeTaken: totalTimeSpent, averageTimePerQuestion: attempted > 0 ? totalTimeSpent / attempted : 0,
    sectionResults, topicResults, completedAt: new Date(),
  };
}

function calculateSectionResults(sections: MockTestSection[], answers: Record<string, UserAnswer>): SectionResult[] {
  return sections.map((section) => {
    let correct = 0, incorrect = 0, totalTime = 0, attempted = 0;
    section.questions.forEach((q) => {
      const answer = answers[q.id];
      if (answer && answer.selectedOptionIndex !== null) {
        attempted++; totalTime += answer.timeSpent;
        if (answer.selectedOptionIndex === q.correctOptionIndex) correct++; else incorrect++;
      }
    });
    const totalMarks = section.questions.length * section.marksPerQuestion;
    const positiveMarks = correct * section.marksPerQuestion;
    const negMarks = incorrect * section.negativeMarkingFraction * section.marksPerQuestion;
    return {
      sectionId: section.id, sectionName: section.name, subject: section.subject, totalQuestions: section.questions.length,
      attempted, correct, incorrect, marksObtained: Math.max(positiveMarks - negMarks, 0), totalMarks,
      accuracy: attempted > 0 ? (correct / attempted) * 100 : 0, averageTime: attempted > 0 ? totalTime / attempted : 0,
    };
  });
}

function calculateTopicResults(sections: MockTestSection[], answers: Record<string, UserAnswer>): TopicResult[] {
  const topicMap = new Map<string, { subject: string; total: number; correct: number; incorrect: number; totalTime: number }>();
  sections.forEach((section) => {
    section.questions.forEach((q) => {
      const answer = answers[q.id];
      const existing = topicMap.get(q.topic) || { subject: q.subject, total: 0, correct: 0, incorrect: 0, totalTime: 0 };
      existing.total++;
      if (answer && answer.selectedOptionIndex !== null) {
        existing.totalTime += answer.timeSpent;
        if (answer.selectedOptionIndex === q.correctOptionIndex) existing.correct++; else existing.incorrect++;
      }
      topicMap.set(q.topic, existing);
    });
  });
  return Array.from(topicMap.entries()).map(([topic, data]) => ({
    topic, subject: data.subject as any, totalQuestions: data.total, correct: data.correct, incorrect: data.incorrect,
    accuracy: (data.correct + data.incorrect) > 0 ? (data.correct / (data.correct + data.incorrect)) * 100 : 0,
    averageTime: (data.correct + data.incorrect) > 0 ? data.totalTime / (data.correct + data.incorrect) : 0,
  }));
}

export function generateFourStepAnalysis(session: TestSession): FourStepAnalysis {
  const allQuestions = session.config.sections.flatMap((s) => s.questions);
  const categorize = { conceptual: 0, silly: 0, timePressure: 0, guessing: 0 };
  const findCause: FourStepAnalysis["findCause"] = [];
  const reResolve: string[] = [];
  const logMistakes: FourStepAnalysis["logMistakes"] = [];

  allQuestions.forEach((q) => {
    const answer = session.answers[q.id];
    if (!answer || answer.selectedOptionIndex === null) return;
    if (answer.selectedOptionIndex === q.correctOptionIndex) return;

    let errorType: string;
    if (answer.timeSpent < 10) { errorType = "guessing"; categorize.guessing++; }
    else if (answer.timeSpent < 20) { errorType = "silly"; categorize.silly++; }
    else if (answer.timeSpent > 60) { errorType = "timePressure"; categorize.timePressure++; }
    else { errorType = "conceptual"; categorize.conceptual++; }

    findCause.push({ questionId: q.id, errorType, cause: getCauseDescription(errorType), suggestion: getSuggestion(errorType, q.topic) });
    if (errorType === "conceptual" || errorType === "silly") reResolve.push(q.id);
    logMistakes.push({ questionId: q.id, topic: q.topic, errorType, notes: "" });
  });

  return { categorize, findCause, reResolve, logMistakes };
}

function getCauseDescription(errorType: string): string {
  switch (errorType) {
    case "conceptual": return "Fundamental concept not clear. Need to revisit the topic.";
    case "silly": return "Rushed through the question. Calculation or reading error.";
    case "timePressure": return "Spent too long and likely panicked. Need speed practice.";
    case "guessing": return "Random guess without attempting. Skip strategy needed.";
    default: return "Unknown error pattern.";
  }
}

function getSuggestion(errorType: string, topic: string): string {
  switch (errorType) {
    case "conceptual": return `Revise ${topic} fundamentals. Create flashcards for key formulas.`;
    case "silly": return `Practice ${topic} with focus on accuracy. Double-check calculations.`;
    case "timePressure": return `Do speed drills on ${topic}. Learn shortcut methods.`;
    case "guessing": return `Study ${topic} basics first. Don't guess with negative marking.`;
    default: return `Review ${topic}.`;
  }
}

export function calculateTimeSplit(session: TestSession): TimeSplit {
  const allQuestions = session.config.sections.flatMap((s) => s.questions);
  let totalThinking = 0, totalSolving = 0;
  const perQuestion: TimeSplit["perQuestion"] = [];

  allQuestions.forEach((q) => {
    const answer = session.answers[q.id];
    if (!answer) return;
    const thinking = Math.round(answer.timeSpent * 0.6);
    const solving = answer.timeSpent - thinking;
    totalThinking += thinking; totalSolving += solving;
    perQuestion.push({ questionId: q.id, thinkingSeconds: thinking, solvingSeconds: solving, totalSeconds: answer.timeSpent });
  });

  const total = totalThinking + totalSolving || 1;
  return {
    thinkingTime: Math.round((totalThinking / total) * 100), solvingTime: Math.round((totalSolving / total) * 100),
    idealThinking: 60, idealSolving: 40, perQuestion,
  };
}
