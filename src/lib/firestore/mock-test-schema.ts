import type { Timestamp } from 'firebase/firestore';
import type { Question, MockTestMode, TestResult } from '@/features/mock-tests/types';

export const MOCK_TEST_COLLECTIONS = {
  customTests: 'customMockTests',
  results: 'mockTestResults',
} as const;

export interface CustomMockTest {
  id: string;
  title: string;
  examId: string;
  examName: string;
  mode: MockTestMode;
  difficulty: 'easy' | 'medium' | 'hard';
  source: 'ai' | 'manual';
  topics: string[];
  questions: Question[];
  createdAt: Timestamp;
}

export type StoredTestResult = Omit<TestResult, 'completedAt'> & {
  completedAt: Timestamp;
  testTitle: string;
};