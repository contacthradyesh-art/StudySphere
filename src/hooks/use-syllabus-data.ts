"use client";
import { useEffect, useState, useCallback } from "react";
import { getSyllabusProgress, updateTopicMastery as saveTopicMastery } from "@/lib/repositories/syllabusRepository";
import { SYLLABUS_TAXONOMY, CROSS_EXAM_WEIGHTAGE } from "@/lib/syllabus/taxonomy";
import type { SubjectGroup, CrossExamMap } from "@/features/syllabus/types";
import type { MasteryLevel } from "@/types/common";

type ProgressDoc = { topicId: string; mastery: MasteryLevel; accuracy: number };

const MASTERY_ORDER: MasteryLevel[] = ["not-started", "learning", "practicing", "mastered"];

export function useSyllabusData() {
  const [progress, setProgress] = useState<Record<string, ProgressDoc>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const docs = ((await getSyllabusProgress().catch(() => [])) as unknown as ProgressDoc[]) ?? [];
      const map: Record<string, ProgressDoc> = {};
      for (const d of docs) map[d.topicId] = d;
      setProgress(map);
      setLoading(false);
    })();
  }, []);

  const subjects: SubjectGroup[] = Object.entries(SYLLABUS_TAXONOMY).map(([subject, group]) => {
    const topics = group.topics.map((t) => {
      const p = progress[t.id];
      return { ...t, mastery: p?.mastery ?? "not-started", accuracy: p?.accuracy ?? 0 };
    });
    const overallMastery = topics.length
      ? Math.round(topics.reduce((sum, t) => sum + t.accuracy, 0) / topics.length)
      : 0;
    return { subject: subject as SubjectGroup["subject"], subjectLabel: group.subjectLabel, topics, overallMastery, topicCount: topics.length };
  });

  const crossExamMaps: CrossExamMap[] = CROSS_EXAM_WEIGHTAGE.map((m) => ({
    ...m,
    subject: m.subject as CrossExamMap["subject"],
    exams: m.exams.map((e) => ({ ...e, examId: e.examId as CrossExamMap["exams"][number]["examId"], mastery: progress[m.topicId]?.mastery ?? "not-started" })),
  }));

  const cycleMastery = useCallback(async (topicId: string) => {
    const current = progress[topicId]?.mastery ?? "not-started";
    const next = MASTERY_ORDER[(MASTERY_ORDER.indexOf(current) + 1) % MASTERY_ORDER.length];
    const accuracy = progress[topicId]?.accuracy ?? 0;
    setProgress((prev) => ({ ...prev, [topicId]: { topicId, mastery: next, accuracy } }));
    await saveTopicMastery(topicId, next, accuracy).catch(() => {});
  }, [progress]);

  return { subjects, crossExamMaps, loading, cycleMastery };
}
