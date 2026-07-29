"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card } from "@/components/shared/Card";
import { Dialog } from "@/components/shared/Dialog";
import { useMockTestStore } from "@/stores/useMockTestStore";
import { formatDuration } from "@/utils/formatters";
import { cn } from "@/utils/cn";

export function TestInterface() {
  const { session, answerQuestion, toggleReview, navigateToQuestion, navigateToSection, updateTimeRemaining, completeTest } = useMockTestStore();
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState(Date.now());
  const [revealedHints, setRevealedHints] = useState<Record<string, boolean>>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!session || session.status !== "in-progress") return;
    timerRef.current = setInterval(() => { updateTimeRemaining(session.timeRemaining - 1); }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [session?.status, session?.timeRemaining, updateTimeRemaining]);

  useEffect(() => { if (session?.status === "timed-out") completeTest(); }, [session?.status, completeTest]);

  const handleSelectOption = useCallback((questionId: string, optionIndex: number) => {
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);
    answerQuestion(questionId, optionIndex, timeSpent);
  }, [answerQuestion, questionStartTime]);

  const toggleHint = useCallback((questionId: string) => {
    setRevealedHints((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }, []);

  const handleNext = useCallback(() => {
    if (!session) return;
    const currentSection = session.config.sections[session.currentSectionIndex];
    if (session.currentQuestionIndex < currentSection.questions.length - 1) navigateToQuestion(session.currentQuestionIndex + 1);
    else if (session.currentSectionIndex < session.config.sections.length - 1) navigateToSection(session.currentSectionIndex + 1);
    setQuestionStartTime(Date.now());
  }, [session, navigateToQuestion, navigateToSection]);

  const handlePrev = useCallback(() => {
    if (!session) return;
    if (session.currentQuestionIndex > 0) navigateToQuestion(session.currentQuestionIndex - 1);
    else if (session.currentSectionIndex > 0) {
      const prevSection = session.config.sections[session.currentSectionIndex - 1];
      navigateToSection(session.currentSectionIndex - 1);
      navigateToQuestion(prevSection.questions.length - 1);
    }
    setQuestionStartTime(Date.now());
  }, [session, navigateToQuestion, navigateToSection]);

  if (!session) return null;

  const currentSection = session.config.sections[session.currentSectionIndex];
  const currentQuestion = currentSection.questions[session.currentQuestionIndex];
  const currentAnswer = session.answers[currentQuestion.id];
  const allQuestions = session.config.sections.flatMap((s) => s.questions);
  const answeredCount = Object.values(session.answers).filter((a) => a.selectedOptionIndex !== null).length;
  const reviewCount = Object.values(session.answers).filter((a) => a.isMarkedForReview).length;
  const isTimeLow = session.timeRemaining < 60;

  let globalIndex = 0;
  for (let i = 0; i < session.currentSectionIndex; i++) globalIndex += session.config.sections[i].questions.length;
  globalIndex += session.currentQuestionIndex;

  return (
    <div className="min-h-screen bg-charcoal-950">
      <div className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/[0.06] px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div><h3 className="text-sm font-semibold text-charcoal-100">{session.config.title}</h3><p className="text-xs text-charcoal-500">{currentSection.name}</p></div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-xs text-charcoal-400">
              <span>✓ {answeredCount}/{allQuestions.length}</span>
              {reviewCount > 0 && <Badge variant="warning" size="sm">🔖 {reviewCount}</Badge>}
            </div>
            <div className={cn("px-3 py-1.5 rounded-lg font-mono text-sm font-bold", isTimeLow ? "bg-red-500/20 text-red-300 animate-pulse" : "bg-charcoal-800/50 text-charcoal-200")}>
              {formatDuration(session.timeRemaining)}
            </div>
            <Button variant="danger" size="sm" onClick={() => setShowSubmitDialog(true)}>Submit</Button>
          </div>
        </div>
      </div>

      <div className="pt-20 pb-24 px-4 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
                <Card variant="glass" padding="lg">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="electric" size="md">Q{globalIndex + 1} of {allQuestions.length}</Badge>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" size="sm">{currentQuestion.topic}</Badge>
                      <Badge variant={currentQuestion.difficulty === "hard" ? "danger" : currentQuestion.difficulty === "medium" ? "warning" : "neon"} size="sm">{currentQuestion.difficulty}</Badge>
                    </div>
                  </div>
                  <p className="text-base text-charcoal-50 leading-relaxed mb-4">{currentQuestion.text}</p>

                  {currentQuestion.hint && (
                    <div className="mb-4">
                      {!revealedHints[currentQuestion.id] ? (
                        <button
                          type="button"
                          onClick={() => toggleHint(currentQuestion.id)}
                          className="text-xs font-medium px-3 py-1.5 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 hover:bg-yellow-500/20 transition-colors"
                        >
                          💡 Show Hint
                        </button>
                      ) : (
                        <div className="text-xs px-3 py-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-200">
                          💡 {currentQuestion.hint}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = currentAnswer?.selectedOptionIndex === index;
                      return (
                        <motion.button key={index} whileTap={{ scale: 0.98 }} onClick={() => handleSelectOption(currentQuestion.id, index)}
                          className={cn("w-full text-left px-4 py-3 rounded-xl border transition-all duration-200",
                            isSelected ? "border-electric bg-electric/15 text-electric-200" : "border-charcoal-700/50 bg-charcoal-900/30 text-charcoal-200 hover:border-charcoal-600 hover:bg-charcoal-800/40")}>
                          <span className="inline-flex items-center gap-3">
                            <span className={cn("w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border", isSelected ? "border-electric bg-electric text-white" : "border-charcoal-600 text-charcoal-400")}>
                              {String.fromCharCode(65 + index)}
                            </span>
                            <span className="text-sm">{option}</span>
                          </span>
                        </motion.button>
                      );
                    })}
                  </div>
                </Card>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between mt-4">
              <Button variant="ghost" size="sm" onClick={handlePrev}>← Previous</Button>
              <div className="flex items-center gap-2">
                <Button variant={currentAnswer?.isMarkedForReview ? "warning" as any : "ghost"} size="sm" onClick={() => toggleReview(currentQuestion.id)}>
                  🔖 {currentAnswer?.isMarkedForReview ? "Marked" : "Mark for Review"}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => { const timeSpent = Math.round((Date.now() - questionStartTime) / 1000); answerQuestion(currentQuestion.id, null, timeSpent); handleNext(); }}>
                  Clear & Next
                </Button>
              </div>
              <Button variant="primary" size="sm" onClick={handleNext}>Next →</Button>
            </div>
          </div>

          <div className="hidden lg:block">
            <Card variant="glass" padding="sm">
              <h4 className="text-xs font-semibold text-charcoal-300 mb-3 px-1">Question Palette</h4>
              {session.config.sections.map((section, sIdx) => (
                <div key={section.id} className="mb-4">
                  <p className="text-[10px] text-charcoal-500 mb-2 px-1">{section.name}</p>
                  <div className="grid grid-cols-5 gap-1.5">
                    {section.questions.map((q, qIdx) => {
                      const answer = session.answers[q.id];
                      const isCurrent = sIdx === session.currentSectionIndex && qIdx === session.currentQuestionIndex;
                      let bgColor = "bg-charcoal-800/50 text-charcoal-500";
                      if (answer?.isMarkedForReview) bgColor = "bg-yellow-500/20 text-yellow-300 border-yellow-500/30";
                      else if (answer?.selectedOptionIndex !== null && answer?.selectedOptionIndex !== undefined) bgColor = "bg-neon/20 text-neon-300 border-neon/30";
                      if (isCurrent) bgColor = "bg-electric/30 text-electric-200 border-electric/50";
                      let globalQ = 0;
                      for (let i = 0; i < sIdx; i++) globalQ += session.config.sections[i].questions.length;
                      globalQ += qIdx;
                      return (
                        <button key={q.id} onClick={() => { navigateToSection(sIdx); navigateToQuestion(qIdx); setQuestionStartTime(Date.now()); }}
                          className={cn("w-8 h-8 rounded-lg text-xs font-medium border border-charcoal-700/30 transition-colors", bgColor)}>
                          {globalQ + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="mt-4 pt-3 border-t border-charcoal-700/30 space-y-1.5 px-1">
                <div className="flex items-center gap-2 text-[10px] text-charcoal-500"><div className="w-3 h-3 rounded bg-neon/20 border border-neon/30" />Answered</div>
                <div className="flex items-center gap-2 text-[10px] text-charcoal-500"><div className="w-3 h-3 rounded bg-yellow-500/20 border border-yellow-500/30" />Marked for Review</div>
                <div className="flex items-center gap-2 text-[10px] text-charcoal-500"><div className="w-3 h-3 rounded bg-charcoal-800/50 border border-charcoal-700/30" />Not Visited</div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <Dialog isOpen={showSubmitDialog} onClose={() => setShowSubmitDialog(false)} onConfirm={completeTest} title="Submit Test?"
        description={`You have answered ${answeredCount} out of ${allQuestions.length} questions. ${allQuestions.length - answeredCount} questions are unanswered. Are you sure you want to submit?`}
        confirmLabel="Submit Test" variant="danger" />
    </div>
  );
}