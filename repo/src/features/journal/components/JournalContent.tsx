"use client";
import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { Button } from "@/components/shared/Button";
import { Tabs } from "@/components/shared/Tabs";
import { DonutChart } from "@/components/shared/Charts";
import { showToast } from "@/components/shared/Toast";
import { useUserStore } from "@/store/useUserStore";
import { XP_REWARDS } from "@/utils/constants";
import { formatDate } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import { getMockJournalEntries, getJournalStats } from "../utils/mockJournalData";

const filterTabs = [{ id: "all", label: "All" }, { id: "unresolved", label: "Unresolved" }, { id: "resolved", label: "Resolved" }];
const errorTypeConfig: Record<string, { label: string; variant: "danger" | "warning" | "electric" | "default"; color: string }> = {
  conceptual: { label: "Conceptual", variant: "danger", color: "#ff4757" }, silly: { label: "Silly", variant: "warning", color: "#ffb800" },
  "time-pressure": { label: "Time Pressure", variant: "electric", color: "#007edc" }, guessing: { label: "Guessing", variant: "default", color: "#5c5e6a" },
};

export function JournalContent() {
  const [filter, setFilter] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entries, setEntries] = useState(() => getMockJournalEntries());
  const addXp = useUserStore((s) => s.addXp);
  const stats = useMemo(() => getJournalStats(entries), [entries]);

  const filteredEntries = useMemo(() => {
    if (filter === "unresolved") return entries.filter((e) => !e.resolved);
    if (filter === "resolved") return entries.filter((e) => e.resolved);
    return entries;
  }, [entries, filter]);

  const handleResolve = useCallback((id: string) => {
    setEntries((prev) => prev.map((e) => (e.id === id ? { ...e, resolved: true, resolvedAt: new Date() } : e)));
    addXp(XP_REWARDS.MISTAKE_CORRECTION);
    showToast(`Mistake resolved! +${XP_REWARDS.MISTAKE_CORRECTION} XP`, "success");
  }, [addXp]);

  const donutSegments = Object.entries(stats.byErrorType).filter(([, count]) => count > 0).map(([type, count]) => ({ label: errorTypeConfig[type].label, value: count, color: errorTypeConfig[type].color }));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h2 className="text-2xl font-bold text-charcoal-50 mb-1">Mistake Journal</h2><p className="text-charcoal-400 text-sm">Track, understand, and resolve your mistakes</p></div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card variant="glass" padding="sm">
          <div className="flex items-center justify-between">
            <div><p className="text-2xl font-bold text-red-400">{stats.unresolved}</p><p className="text-xs text-charcoal-500">Unresolved</p></div>
            <div><p className="text-2xl font-bold text-neon">{stats.resolved}</p><p className="text-xs text-charcoal-500">Resolved</p></div>
            <div><p className="text-2xl font-bold text-charcoal-300">{stats.total}</p><p className="text-xs text-charcoal-500">Total</p></div>
          </div>
        </Card>
        <Card variant="glass" padding="sm">
          <div className="flex items-center gap-4">
            {donutSegments.length > 0 && <DonutChart segments={donutSegments} size={70} strokeWidth={8} centerValue={`${stats.total}`} centerLabel="errors" />}
            <div className="space-y-1">{donutSegments.map((s) => (<div key={s.label} className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} /><span className="text-[10px] text-charcoal-400">{s.label}: {s.value}</span></div>))}</div>
          </div>
        </Card>
        <Card variant="glass" padding="sm">
          <h4 className="text-xs font-semibold text-charcoal-300 mb-2">Top Weak Topics</h4>
          <div className="space-y-1.5">{stats.topWeakTopics.map((t) => (<div key={t.topic} className="flex items-center justify-between"><span className="text-xs text-charcoal-300 truncate">{t.topic}</span><Badge variant="danger" size="sm">{t.count}</Badge></div>))}</div>
        </Card>
      </div>

      <Tabs tabs={filterTabs} activeTab={filter} onChange={setFilter} />

      <div className="space-y-3">
        {filteredEntries.map((entry, idx) => {
          const errorType = errorTypeConfig[entry.errorType];
          const isExpanded = expandedId === entry.id;
          return (
            <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
              <Card variant={entry.resolved ? "default" : "glass"} padding="sm" className={cn("cursor-pointer transition-all", entry.resolved && "opacity-60")} onClick={() => setExpandedId(isExpanded ? null : entry.id)}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm mb-1", entry.resolved ? "line-through text-charcoal-500" : "text-charcoal-100")}>{entry.questionText}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={errorType.variant} size="sm">{errorType.label}</Badge>
                      <span className="text-[10px] text-charcoal-500">{entry.topic}</span>
                      <span className="text-[10px] text-charcoal-600">{formatDate(entry.createdAt, "relative")}</span>
                    </div>
                  </div>
                  {entry.resolved && <span className="text-neon text-xs font-medium flex-shrink-0">✓ Resolved</span>}
                </div>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                      <div className="mt-3 pt-3 border-t border-charcoal-700/30 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div><p className="text-[10px] text-charcoal-500 uppercase tracking-wider mb-1">Your Answer</p><p className="text-sm text-red-400">{entry.userAnswer}</p></div>
                          <div><p className="text-[10px] text-charcoal-500 uppercase tracking-wider mb-1">Correct Answer</p><p className="text-sm text-neon">{entry.correctAnswer}</p></div>
                        </div>
                        {entry.notes && <div><p className="text-[10px] text-charcoal-500 uppercase tracking-wider mb-1">Notes</p><p className="text-xs text-charcoal-400 italic">{entry.notes}</p></div>}
                        <div className="flex items-center gap-2 text-xs text-charcoal-500"><span className="capitalize">{entry.subject.replace(/-/g, " ")}</span><span>|</span><span className="uppercase">{entry.examId.replace(/-/g, " ")}</span></div>
                        {!entry.resolved && <Button variant="neon" size="sm" onClick={(e) => { e.stopPropagation(); handleResolve(entry.id); }}>Mark Resolved (+{XP_REWARDS.MISTAKE_CORRECTION} XP)</Button>}
                        {entry.resolved && entry.resolvedAt && <p className="text-[10px] text-charcoal-600">Resolved {formatDate(entry.resolvedAt, "relative")}</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
        {filteredEntries.length === 0 && (
          <div className="text-center py-12"><span className="text-4xl block mb-3">🎉</span><p className="text-charcoal-400">{filter === "unresolved" ? "All mistakes resolved! Great work!" : "No entries yet."}</p></div>
        )}
      </div>
    </motion.div>
  );
}
