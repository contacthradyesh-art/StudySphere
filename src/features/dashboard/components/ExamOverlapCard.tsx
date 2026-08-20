"use client";
import { motion } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import type { ExamOverlap } from "../types";

interface ExamOverlapCardProps { overlaps: ExamOverlap[]; }
const masteryColors: Record<string, { bg: string; text: string; label: string }> = {
  "not-started": { bg: "bg-charcoal-700/50", text: "text-charcoal-400", label: "Not Started" },
  learning: { bg: "bg-red-500/20", text: "text-red-300", label: "Learning" },
  practicing: { bg: "bg-electric/20", text: "text-electric-300", label: "Practicing" },
  mastered: { bg: "bg-neon/20", text: "text-neon-300", label: "Mastered" },
};

export function ExamOverlapCard({ overlaps }: ExamOverlapCardProps) {
  return (
    <Card variant="glass">
      <div className="flex items-center gap-2 mb-4"><span className="text-lg">🔗</span><h3 className="text-sm font-semibold text-charcoal-100">Exam Overlap</h3></div>
      <p className="text-xs text-charcoal-500 mb-4">Topics shared across your target exams. Master once, score everywhere.</p>
      <div className="space-y-3">
        {overlaps.map((overlap, index) => {
          const mastery = masteryColors[overlap.mastery];
          return (
            <motion.div key={overlap.topicId} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} className="rounded-xl border border-charcoal-700/30 p-3 hover:border-charcoal-600/50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div><p className="text-sm font-medium text-charcoal-100">{overlap.topicName}</p><p className="text-xs text-charcoal-500">{overlap.subject}</p></div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${mastery.bg} ${mastery.text}`}>{mastery.label}</span>
              </div>
              <div className="flex flex-wrap gap-1.5">{overlap.sharedExams.map((exam) => <Badge key={exam.examId} variant="electric" size="sm">{exam.examName}</Badge>)}</div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
