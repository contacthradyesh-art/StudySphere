'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { POMODORO_COLLECTIONS, type PomodoroSession } from '@/lib/firestore/pomodoro-schema';
import { FLASHCARD_COLLECTIONS, type Flashcard } from '@/lib/firestore/flashcard-schema';
import { getTestResults } from '@/lib/repositories/mockTestRepository';
import { useAuth } from './use-auth';
import type { AnalyticsData, HeatmapEntry, TrendPoint, SubjectAccuracyEntry } from '@/features/analytics/types';
import type { StoredTestResult } from '@/lib/firestore/mock-test-schema';

const SUBJECT_COLORS: Record<string, string> = {
  'quantitative-aptitude': '#007edc',
  reasoning: '#00e805',
  english: '#ffb800',
  'general-awareness': '#ff4757',
};

function intensityFor(accuracy: number): HeatmapEntry['intensity'] {
  if (accuracy < 40) return 'critical';
  if (accuracy < 55) return 'high';
  if (accuracy < 70) return 'medium';
  return 'low';
}

/** Empty-state shape shown before any real activity exists — never fake numbers. */
const EMPTY_ANALYTICS: AnalyticsData = {
  predictedScore: 0,
  readiness: 0,
  accuracy: 0,
  speed: 0,
  negativeMarks: 0,
  retentionRate: 0,
  revisionHealth: 0,
  weakTopicHeatmap: [],
  studyTrends: [],
  subjectAccuracy: [],
  recentTestScores: [],
};

export function useAnalyticsData() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<AnalyticsData>(EMPTY_ANALYTICS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setData(EMPTY_ANALYTICS);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      const uid = user!.uid;

      const [testResultsRaw, pomodoroSnap, flashcardsSnap] = await Promise.all([
        getTestResults().catch(() => []),
        getDocs(
          query(
            collection(db, COLLECTIONS.users, uid, POMODORO_COLLECTIONS.pomodoroSessions)
          )
        ).catch(() => null),
        getDocs(
          query(collection(db, COLLECTIONS.users, uid, FLASHCARD_COLLECTIONS.cards))
        ).catch(() => null),
      ]);

      if (cancelled) return;

      const testResults = (testResultsRaw as StoredTestResult[]) ?? [];
      const sessions: PomodoroSession[] = pomodoroSnap
        ? pomodoroSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as PomodoroSession)
        : [];
      const cards: Flashcard[] = flashcardsSnap
        ? flashcardsSnap.docs.map((d) => ({ id: d.id, ...d.data() }) as Flashcard)
        : [];

      // --- Test-derived metrics ---
      const recentResults = [...testResults]
        .sort((a, b) => {
          const ta = a.completedAt?.toMillis?.() ?? 0;
          const tb = b.completedAt?.toMillis?.() ?? 0;
          return ta - tb;
        })
        .slice(-8);

      const recentTestScores = recentResults.map((r) => Math.round(r.percentage ?? 0));

      const accuracy = testResults.length
        ? Math.round(
            testResults.reduce((sum, r) => sum + (r.percentage ?? 0), 0) / testResults.length
          )
        : 0;

      const negativeMarks = testResults.length
        ? Math.round(
            (testResults.reduce((sum, r) => sum + (r.negativeMarks ?? 0), 0) /
              testResults.length) *
              10
          ) / 10
        : 0;

      // Speed: how close average time-per-question was to the test's allotted pace (capped 100).
      const speedSamples = testResults
        .filter((r) => r.averageTimePerQuestion && r.totalQuestions)
        .map((r) => {
          const idealSecondsPerQ = (r.timeTaken / Math.max(r.attempted, 1));
          if (!idealSecondsPerQ) return null;
          return Math.min(100, Math.round((idealSecondsPerQ / r.averageTimePerQuestion) * 100));
        })
        .filter((v): v is number => v !== null);
      const speed = speedSamples.length
        ? Math.round(speedSamples.reduce((a, b) => a + b, 0) / speedSamples.length)
        : 0;

      const predictedScore = testResults.length
        ? Math.round(
            testResults.reduce((sum, r) => sum + (r.marksObtained ?? 0), 0) / testResults.length
          )
        : 0;

      // Topic weakness heatmap, aggregated across all tests.
      const topicAgg = new Map<string, { subject: string; correct: number; total: number }>();
      for (const r of testResults) {
        for (const t of r.topicResults ?? []) {
          const cur = topicAgg.get(t.topic) ?? { subject: t.subject, correct: 0, total: 0 };
          cur.correct += t.correct;
          cur.total += t.totalQuestions;
          topicAgg.set(t.topic, cur);
        }
      }
      const weakTopicHeatmap: HeatmapEntry[] = Array.from(topicAgg.entries())
        .map(([topic, v]) => {
          const acc = v.total ? Math.round((v.correct / v.total) * 100) : 0;
          return {
            topic,
            subject: v.subject as HeatmapEntry['subject'],
            accuracy: acc,
            attempts: v.total,
            intensity: intensityFor(acc),
          };
        })
        .sort((a, b) => a.accuracy - b.accuracy)
        .slice(0, 10);

      // Subject-level accuracy, aggregated across all tests.
      const subjectAgg = new Map<string, { correct: number; total: number }>();
      for (const r of testResults) {
        for (const s of r.sectionResults ?? []) {
          const cur = subjectAgg.get(s.subject) ?? { correct: 0, total: 0 };
          cur.correct += s.correct;
          cur.total += s.totalQuestions;
          subjectAgg.set(s.subject, cur);
        }
      }
      const subjectAccuracy: SubjectAccuracyEntry[] = Array.from(subjectAgg.entries()).map(
        ([subject, v]) => ({
          subject,
          accuracy: v.total ? Math.round((v.correct / v.total) * 100) : 0,
          totalQuestions: v.total,
          color: SUBJECT_COLORS[subject] ?? '#007edc',
        })
      );

      // --- Study trends from Pomodoro sessions (last 14 days) ---
      const days: TrendPoint[] = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        return { date: d.toISOString().split('T')[0], studyMinutes: 0, accuracy: 0, testsCompleted: 0 };
      });
      const dayIndex = new Map(days.map((d, i) => [d.date, i]));
      for (const s of sessions) {
        if (s.phase !== 'focus' || !s.endedAt?.toDate) continue;
        const dateKey = s.endedAt.toDate().toISOString().split('T')[0];
        const idx = dayIndex.get(dateKey);
        if (idx === undefined) continue;
        days[idx].studyMinutes += Math.round((s.completedSeconds ?? 0) / 60);
      }
      for (const r of testResults) {
        const dateKey = r.completedAt?.toDate?.().toISOString().split('T')[0];
        const idx = dateKey ? dayIndex.get(dateKey) : undefined;
        if (idx !== undefined) days[idx].testsCompleted += 1;
      }

      // --- Flashcard-derived retention & revision health ---
      const reviewedCards = cards.filter((c) => c.repetitions > 0);
      const retentionRate = cards.length
        ? Math.round((reviewedCards.length / cards.length) * 100)
        : 0;
      const today = new Date().toISOString().split('T')[0];
      const onTrackCards = cards.filter((c) => c.dueDate >= today);
      const revisionHealth = cards.length
        ? Math.round((onTrackCards.length / cards.length) * 100)
        : 0;

      const readiness = Math.round((accuracy + speed + retentionRate) / 3);

      setData({
        predictedScore,
        readiness,
        accuracy,
        speed,
        negativeMarks,
        retentionRate,
        revisionHealth,
        weakTopicHeatmap,
        studyTrends: days,
        subjectAccuracy,
        recentTestScores,
      });
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { data, loading, hasActivity: data.recentTestScores.length > 0 || data.studyTrends.some((d) => d.studyMinutes > 0) };
}
