"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Tabs } from "@/components/shared/Tabs";
import { Skeleton } from "@/components/shared/SkeletonLoader";
import { useSyllabusData } from "@/hooks/use-syllabus-data";

const masteryConfig: Record<string, { label: string; variant: "danger" | "warning" | "electric" | "neon" | "default" }> = {
  "not-started": { label: "Not Started", variant: "default" }, learning: { label: "Learning", variant: "danger" },
  practicing: { label: "Practicing", variant: "electric" }, mastered: { label: "Mastered", variant: "neon" },
};
const viewTabs = [{ id: "subjects", label: "By Subject" }, { id: "overlap", label: "Cross-Exam Map" }];

export function SyllabusContent() {
  const [activeView, setActiveView] = useState("subjects");
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const { subjects, crossExamMaps, loading, cycleMastery } = useSyllabusData();

  if (loading) {
    return <div className="space-y-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} variant="card" height={80} />)}</div>;
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h2 className="text-2xl font-bold text-charcoal-50 mb-1">Unified Syllabus</h2><p className="text-charcoal-400 text-sm">Cross-exam mapping with shared mastery tracking</p></div>
      <Tabs tabs={viewTabs} activeTab={activeView} onChange={setActiveView} />

      {activeView === "subjects" ? (
        <div className="space-y-4">
          {subjects.map((group, gIdx) => (
            <motion.div key={group.subject} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: gIdx * 0.08 }}>
              <Card variant="glass" className="cursor-pointer" onClick={() => setExpandedSubject(expandedSubject === group.subject ? null : group.subject)}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3"><h3 className="text-base font-semibold text-charcoal-50">{group.subjectLabel}</h3><Badge variant="outline" size="sm">{group.topicCount} topics</Badge></div>
                  <span className="text-sm font-bold text-electric-300">{group.overallMastery}%</span>
                </div>
                <ProgressBar value={group.overallMastery} variant="gradient" size="sm" />
                {expandedSubject === group.subject && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="mt-4 pt-4 border-t border-charcoal-700/30 space-y-3">
                    {group.topics.map((topic) => {
                      const mastery = masteryConfig[topic.mastery];
                      return (
                        <div key={topic.id} className="rounded-xl bg-charcoal-800/30 p-3 border border-charcoal-700/20">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2"><p className="text-sm font-medium text-charcoal-100">{topic.name}</p>{topic.isOverlap && <Badge variant="electric" size="sm">{topic.overlapCount} exams</Badge>}</div>
                              <div className="flex flex-wrap gap-1 mt-1">{topic.subtopics.map((st) => <span key={st} className="text-[10px] px-1.5 py-0.5 rounded bg-charcoal-800/50 text-charcoal-500">{st}</span>)}</div>
                            </div>
                          <span className="cursor-pointer select-none" onClick={(e) => { e.stopPropagation(); cycleMastery(topic.id); }}><Badge variant={mastery.variant} size="sm">{mastery.label}</Badge></span>
                          </div>
                          <ProgressBar value={topic.accuracy} variant={topic.accuracy >= 70 ? "neon" : topic.accuracy >= 40 ? "electric" : "danger"} size="sm" showLabel label="Accuracy" />
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <Card variant="glow" padding="sm"><p className="text-xs text-electric-300">🔗 Topics shared across exams. Master once, score in multiple exams!</p></Card>
          {crossExamMaps.map((mapping, idx) => (
            <motion.div key={mapping.topicId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}>
              <Card variant="glass">
                <h4 className="text-sm font-semibold text-charcoal-50 mb-1">{mapping.topicName}</h4>
                <p className="text-xs text-charcoal-500 mb-3 capitalize">{mapping.subject.replace("-", " ")}</p>
                <div className="space-y-2">
                  {mapping.exams.map((exam) => {
                    const mastery = masteryConfig[exam.mastery];
                    return (
                      <div key={exam.examId} className="flex items-center justify-between rounded-lg bg-charcoal-800/30 px-3 py-2">
                        <div className="flex items-center gap-3"><span className="text-sm text-charcoal-200">{exam.examName}</span><Badge variant={mastery.variant} size="sm">{mastery.label}</Badge></div>
                        <span className="text-xs text-charcoal-400">Weight: {exam.weightage}%</span>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
