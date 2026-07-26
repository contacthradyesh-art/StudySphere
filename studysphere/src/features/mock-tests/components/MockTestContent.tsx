"use client";
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Tabs } from "@/components/shared/Tabs";
import { TestCard } from "./TestCard";
import { TestInterface } from "./TestInterface";
import { TestResultView } from "./TestResultView";
import { useMockTestStore } from "@/stores/useMockTestStore";
import { useUserStore } from "@/stores/useUserStore";
import { getAvailableTests, getMockTestConfig } from "../utils/mockTestData";
import { calculateTestResult, generateFourStepAnalysis, calculateTimeSplit } from "../utils/testCalculations";
import { showToast } from "@/components/shared/Toast";
import { XP_REWARDS } from "@/utils/constants";
import type { TestResult, FourStepAnalysis, TimeSplit } from "../types";

type ViewState = "list" | "test" | "result";
const modeTabs = [
  { id: "all", label: "All" }, { id: "full", label: "Full Mock" }, { id: "sectional", label: "Sectional" },
  { id: "speed-drill", label: "Speed Drill" }, { id: "weak-topic", label: "Weak Topic" },
];

export function MockTestContent() {
  const [view, setView] = useState<ViewState>("list");
  const [activeMode, setActiveMode] = useState("all");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [analysis, setAnalysis] = useState<FourStepAnalysis | null>(null);
  const [timeSplit, setTimeSplit] = useState<TimeSplit | null>(null);

  const { session, startTest, resetTest, isTestActive } = useMockTestStore();
  const addXp = useUserStore((s) => s.addXp);

  const availableTests = useMemo(() => {
    const tests = getAvailableTests();
    if (activeMode === "all") return tests;
    return tests.filter((t) => t.mode === activeMode);
  }, [activeMode]);

  const handleStartTest = useCallback((testId: string) => {
    const config = getMockTestConfig(testId);
    startTest(config);
    setView("test");
  }, [startTest]);

  const handleViewResults = useCallback(() => {
    if (!session) return;
    const result = calculateTestResult(session);
    const fourStep = generateFourStepAnalysis(session);
    const split = calculateTimeSplit(session);
    setTestResult(result); setAnalysis(fourStep); setTimeSplit(split); setView("result");
    addXp(XP_REWARDS.MOCK_COMPLETION);
    showToast(`Mock test completed! +${XP_REWARDS.MOCK_COMPLETION} XP`, "success");
  }, [session, addXp]);

  if (session && (session.status === "completed" || session.status === "timed-out") && view === "test") handleViewResults();

  if (view === "test" && isTestActive) return <TestInterface />;

  if (view === "result" && testResult && analysis && timeSplit) {
    return (
      <TestResultView result={testResult} analysis={analysis} timeSplit={timeSplit}
        onRetake={() => { resetTest(); if (testResult) handleStartTest(testResult.testId); }}
        onBackToList={() => { resetTest(); setView("list"); }} />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div><h2 className="text-2xl font-bold text-charcoal-50 mb-1">Mock Tests</h2><p className="text-charcoal-400 text-sm">Practice with timed tests and detailed analysis</p></div>
      <Tabs tabs={modeTabs} activeTab={activeMode} onChange={setActiveMode} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableTests.map((test, index) => (
          <motion.div key={test.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <TestCard test={test} onStart={handleStartTest} />
          </motion.div>
        ))}
      </div>
      {availableTests.length === 0 && <div className="text-center py-12"><p className="text-charcoal-500">No tests available for this mode yet.</p></div>}
    </motion.div>
  );
}
