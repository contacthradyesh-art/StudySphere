"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { formatDate } from "@/utils/formatters";
import type { MistakeEntry } from "../types";

interface MistakeNotebookCardProps { mistakes: MistakeEntry[]; onResolve: (id: string) => void; }
const errorTypeConfig: Record<string, { label: string; variant: "danger" | "warning" | "electric" | "default" }> = {
  conceptual: { label: "Conceptual", variant: "danger" }, silly: { label: "Silly Mistake", variant: "warning" },
  "time-pressure": { label: "Time Pressure", variant: "electric" }, guessing: { label: "Guessing", variant: "default" },
};

export function MistakeNotebookCard({ mistakes, onResolve }: MistakeNotebookCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const unresolvedCount = mistakes.filter((m) => !m.resolved).length;

  return (
    <Card variant="glass">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2"><span className="text-lg">📓</span><h3 className="text-sm font-semibold text-charcoal-100">Mistake Notebook</h3></div>
        {unresolvedCount > 0 && <Badge variant="danger" size="sm">{unresolvedCount} unresolved</Badge>}
      </div>
      <div className="space-y-3">
        {mistakes.map((mistake, index) => {
          const errorType = errorTypeConfig[mistake.errorType];
          const isExpanded = expandedId === mistake.id;
          return (
            <motion.div key={mistake.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}
              className={`rounded-xl border p-3 cursor-pointer transition-all duration-200 ${mistake.resolved ? "border-charcoal-700/30 bg-charcoal-900/30 opacity-60" : "border-charcoal-700/50 bg-charcoal-900/40 hover:border-charcoal-600/50"}`}
              onClick={() => setExpandedId(isExpanded ? null : mistake.id)}>
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm flex-1 ${mistake.resolved ? "line-through text-charcoal-500" : "text-charcoal-200"}`}>{mistake.questionSummary}</p>
                <Badge variant={errorType.variant} size="sm">{errorType.label}</Badge>
              </div>
              <AnimatePresence>
                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                    <div className="mt-3 pt-3 border-t border-charcoal-700/30 space-y-2">
                      <div className="flex gap-4">
                        <div><p className="text-[10px] text-charcoal-500 uppercase tracking-wider">Your Answer</p><p className="text-sm text-red-400">{mistake.userAnswer}</p></div>
                        <div><p className="text-[10px] text-charcoal-500 uppercase tracking-wider">Correct</p><p className="text-sm text-neon">{mistake.correctAnswer}</p></div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-charcoal-500"><span>{mistake.topic}</span><span>•</span><span>{formatDate(mistake.createdAt, "relative")}</span></div>
                      {mistake.notes && <p className="text-xs text-charcoal-400 italic">Note: {mistake.notes}</p>}
                      {!mistake.resolved && (
                        <Button size="sm" variant="neon" onClick={(e) => { e.stopPropagation(); onResolve(mistake.id); }} className="mt-2">Mark Resolved (+30 XP)</Button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}
