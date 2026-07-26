import { create } from "zustand";
import type { TestSession, UserAnswer, MockTestConfig } from "@/features/mock-tests/types";

interface MockTestState {
  session: TestSession | null;
  isTestActive: boolean;
  startTest: (config: MockTestConfig) => void;
  answerQuestion: (questionId: string, optionIndex: number | null, timeSpent: number) => void;
  toggleReview: (questionId: string) => void;
  navigateToQuestion: (index: number) => void;
  navigateToSection: (index: number) => void;
  updateTimeRemaining: (seconds: number) => void;
  completeTest: () => void;
  resetTest: () => void;
}

export const useMockTestStore = create<MockTestState>()((set) => ({
  session: null,
  isTestActive: false,

  startTest: (config: MockTestConfig) => {
    const session: TestSession = {
      config, answers: {}, currentQuestionIndex: 0, currentSectionIndex: 0,
      startTime: Date.now(), timeRemaining: config.durationMinutes * 60, status: "in-progress",
    };
    set({ session, isTestActive: true });
  },

  answerQuestion: (questionId, optionIndex, timeSpent) => {
    set((state) => {
      if (!state.session) return state;
      const answer: UserAnswer = {
        questionId, selectedOptionIndex: optionIndex, timeSpent,
        isMarkedForReview: state.session.answers[questionId]?.isMarkedForReview || false,
      };
      return { session: { ...state.session, answers: { ...state.session.answers, [questionId]: answer } } };
    });
  },

  toggleReview: (questionId) => {
    set((state) => {
      if (!state.session) return state;
      const existing = state.session.answers[questionId];
      const updated: UserAnswer = existing
        ? { ...existing, isMarkedForReview: !existing.isMarkedForReview }
        : { questionId, selectedOptionIndex: null, timeSpent: 0, isMarkedForReview: true };
      return { session: { ...state.session, answers: { ...state.session.answers, [questionId]: updated } } };
    });
  },

  navigateToQuestion: (index) => {
    set((state) => (!state.session ? state : { session: { ...state.session, currentQuestionIndex: index } }));
  },

  navigateToSection: (index) => {
    set((state) => (!state.session ? state : { session: { ...state.session, currentSectionIndex: index, currentQuestionIndex: 0 } }));
  },

  updateTimeRemaining: (seconds) => {
    set((state) => {
      if (!state.session) return state;
      if (seconds <= 0) {
        return { session: { ...state.session, timeRemaining: 0, status: "timed-out", endTime: Date.now() }, isTestActive: false };
      }
      return { session: { ...state.session, timeRemaining: seconds } };
    });
  },

  completeTest: () => {
    set((state) => (!state.session ? state : { session: { ...state.session, status: "completed", endTime: Date.now() }, isTestActive: false }));
  },

  resetTest: () => set({ session: null, isTestActive: false }),
}));
