"use client";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { DonutChart } from "@/components/shared/Charts";
import { Button } from "@/components/shared/Button";
import { formatDuration } from "@/utils/formatters";
import { cn } from "@/utils/cn";
import { motion } from "framer-motion";
import type { TestResult, FourStepAnalysis, TimeSplit } from "../types";

interface TestResultViewProps {
  result: TestResult; analysis: FourStepAnalysis; timeSplit: TimeSplit;
  onRetake: () => void; onBackToList: () => void;
}

export function TestResultView({ result, analysis, timeSplit, onRetake, onBackToList }: TestResultViewProps) {
  const scoreColor = result.percentage >= 70 ? "neon" : result.percentage >= 40 ? "electric" : "danger";
  const errorDonutData = [
    { label: "Conceptual", value: analysis.categorize.conceptual, color: "#ff4757" },
    { label: "Silly", value: analysis.categorize.silly, color: "#ffb800" },
    { label: "Time Pressure", value: analysis.categorize.timePressure, color: "#007edc" },
    { label: "Guessing", value: analysis.categorize.guessing, color: "#5c5e6a" },
  ].filter((d) => d.value > 0);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-start justify-between">
        <div><h2 className="text-2xl font-bold text-charcoal-50 mb-1">Test Results</h2><p className="text-sm text-charcoal-400">{result.mode === "full" ? "Full Mock" : result.mode} completed</p></div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={onBackToList}>← All Tests</Button>
          <Button variant="secondary" size="sm" onClick={onRetake}>Retake</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card variant="glow" className="md:col-span-1 flex flex-col items-center justify-center">
          <ProgressRing value={result.percentage} size={100} strokeWidth={8} variant={scoreColor as any} />
          <p className="text-sm font-semibold text-charcoal-200 mt-2">{result.marksObtained}/{result.totalMarks} marks</p>
        </Card>
        <Card variant="glass" className="md:col-span-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center"><p className="text-2xl font-bold text-neon">{result.correct}</p><p className="text-xs text-charcoal-500">Correct</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-red-400">{result.incorrect}</p><p className="text-xs text-charcoal-500">Incorrect</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-charcoal-400">{result.unanswered}</p><p className="text-xs text-charcoal-500">Unanswered</p></div>
            <div className="text-center"><p className="text-2xl font-bold text-red-300">-{result.negativeMarks.toFixed(1)}</p><p className="text-xs text-charcoal-500">Negative Marks</p></div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-charcoal-700/30">
            <div><p className="text-xs text-charcoal-500">Time Taken</p><p className="text-sm font-semibold text-charcoal-200">{formatDuration(result.timeTaken)}</p></div>
            <div><p className="text-xs text-charcoal-500">Avg per Question</p><p className="text-sm font-semibold text-charcoal-200">{Math.round(result.averageTimePerQuestion)}s</p></div>
          </div>
        </Card>
      </div>

      <h3 className="text-lg font-bold text-charcoal-50">4-Step Analysis</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card variant="glass">
          <h4 className="text-sm font-semibold text-charcoal-200 mb-3">Step 1: Categorize Errors</h4>
          {errorDonutData.length > 0 ? (
            <div className="flex items-center gap-6">
              <DonutChart segments={errorDonutData} size={100} strokeWidth={10} centerValue={`${result.incorrect}`} centerLabel="errors" />
              <div className="space-y-2">
                {errorDonutData.map((d) => (
                  <div key={d.label} className="flex items-center gap-2"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.color }} /><span className="text-xs text-charcoal-300">{d.label}: {d.value}</span></div>
                ))}
              </div>
            </div>
          ) : <p className="text-sm text-neon">Perfect score! No errors to categorize.</p>}
        </Card>
        <Card variant="glass">
          <h4 className="text-sm font-semibold text-charcoal-200 mb-3">Step 2: Find Root Cause</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
            {analysis.findCause.slice(0, 5).map((item, i) => (
              <div key={i} className="rounded-lg bg-charcoal-800/40 p-2.5 border border-charcoal-700/20">
                <p className="text-xs text-charcoal-300">{item.cause}</p>
                <p className="text-[10px] text-electric-300 mt-1">💡 {item.suggestion}</p>
              </div>
            ))}
            {analysis.findCause.length === 0 && <p className="text-sm text-neon">No errors to analyze!</p>}
          </div>
        </Card>
      </div>

      <Card variant="glass">
        <h4 className="text-sm font-semibold text-charcoal-200 mb-4">Section Performance</h4>
        <div className="space-y-3">
          {result.sectionResults.map((section) => (
            <div key={section.sectionId}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-charcoal-200">{section.sectionName}</span>
                <span className="text-xs text-charcoal-400">{section.correct}/{section.totalQuestions} correct ({Math.round(section.accuracy)}%)</span>
              </div>
              <ProgressBar value={section.accuracy} variant={section.accuracy >= 70 ? "neon" : section.accuracy >= 40 ? "electric" : "danger"} size="sm" />
            </div>
          ))}
        </div>
      </Card>

      <Card variant="glass">
        <h4 className="text-sm font-semibold text-charcoal-200 mb-4">60/40 Time Split</h4>
        <div className="flex items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1"><span className="text-xs text-charcoal-400">Thinking</span><span className="text-xs text-charcoal-300">{timeSplit.thinkingTime}%</span></div>
            <ProgressBar value={timeSplit.thinkingTime} variant="electric" size="md" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1"><span className="text-xs text-charcoal-400">Solving</span><span className="text-xs text-charcoal-300">{timeSplit.solvingTime}%</span></div>
            <ProgressBar value={timeSplit.solvingTime} variant="neon" size="md" />
          </div>
        </div>
        <p className="text-[10px] text-charcoal-500 mt-2">Ideal split: 60% thinking, 40% solving. Adjust your approach if heavily skewed.</p>
      </Card>

      <Card variant="glass">
        <h4 className="text-sm font-semibold text-charcoal-200 mb-4">Topic Breakdown</h4>
        <div className="space-y-3">
          {result.topicResults.map((topic) => (
            <div key={topic.topic} className="flex items-center justify-between rounded-lg bg-charcoal-800/30 px-3 py-2">
              <div><p className="text-sm text-charcoal-200">{topic.topic}</p><p className="text-[10px] text-charcoal-500">{topic.correct}/{topic.totalQuestions} correct · Avg {Math.round(topic.averageTime)}s</p></div>
              <span className={cn("text-sm font-bold", topic.accuracy >= 70 ? "text-neon" : topic.accuracy >= 40 ? "text-electric-300" : "text-red-400")}>{Math.round(topic.accuracy)}%</span>
            </div>
          ))}
        </div>
      </Card>
    </motion.div>
  );
}
