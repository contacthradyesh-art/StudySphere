"use client";
import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs } from "@/components/shared/Tabs";
import { Button } from "@/components/shared/Button";
import { Dialog } from "@/components/shared/Dialog";
import { TestCard } from "./TestCard";
import { TestInterface } from "./TestInterface";
import { TestResultView } from "./TestResultView";
import { CreateTestDialog } from "./CreateTestDialog";
import { useMockTestStore } from "@/stores/useMockTestStore";
import { useAuth } from "@/hooks/use-auth";
import { requireAuth } from "@/lib/require-auth";
import { getAvailableTests, getMockTestConfig } from "../utils/mockTestData";
import { calculateTestResult, generateFourStepAnalysis, calculateTimeSplit } from "../utils/testCalculations";
import { subscribeCustomTests, saveTestResult } from "@/lib/mock-tests/mock-test-service";
import { awardXp } from "@/lib/gamification/xp-service";
import { showToast } from "@/components/shared/Toast";
import type { AvailableTest, TestResult, FourStepAnalysis, TimeSplit, MockTestConfig } from "../types";
import type { CustomMockTest } from "@/lib/firestore/mock-test-schema";

type ViewState = "list" | "test" | "result";
const modeTabs = [
  { id: "all", label: "All" }, { id: "full", label: "Full Mock" }, { id: "sectional", label: "Sectional" },
  { id: "speed-drill", label: "Speed Drill" }, { id: "weak-topic", label: "Weak Topic" },
];

function customToAvailable(t: CustomMockTest): AvailableTest {
  return {
    id: t.id, title: t.title, examId: t.examId as any, examName: t.examName, mode: t.mode,
    totalQuestions: t.questions.length, durationMinutes: Math.max(5, t.questions.length),
    difficulty: t.difficulty, attempted: false, topics: t.topics,
  };
}

function customToConfig(t: CustomMockTest): MockTestConfig {
  return {
    id: t.id, title: t.title, examId: t.examId as any, mode: t.mode,
    totalQuestions: t.questions.length, durationMinutes: Math.max(5, t.questions.length),
    marksPerQuestion: 1, negativeMarkingFraction: 0.25,
    sections: [{
      id: "sec-1", name: "All Questions", subject: t.questions[0]?.subject || "general-awareness",
      questions: t.questions, marksPerQuestion: 1, negativeMarkingFraction: 0.25,
    }],
    topics: t.topics, difficulty: t.difficulty,
  };
}

export function MockTestContent() {
  const { user } = useAuth();
  const [view, setView] = useState<ViewState>("list");
  const [activeMode, setActiveMode] = useState("all");
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [analysis, setAnalysis] = useState<FourStepAnalysis | null>(null);
  const [timeSplit, setTimeSplit] = useState<TimeSplit | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [customTests, setCustomTests] = useState<CustomMockTest[]>([]);

  // Duration-prompt state: which test id is pending a duration choice.
  const [pendingTestId, setPendingTestId] = useState<string | null>(null);
  const [pendingDuration, setPendingDuration] = useState(15);

  const { session, startTest, resetTest, isTestActive } = useMockTestStore();

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeCustomTests(user.uid, setCustomTests);
    return unsub;
  }, [user]);

  const customMap = useMemo(() => new Map(customTests.map((t) => [t.id, t])), [customTests]);

  const availableTests = useMemo(() => {
    const tests = [...customTests.map(customToAvailable), ...getAvailableTests()];
    if (activeMode === "all") return tests;
    return tests.filter((t) => t.mode === activeMode);
  }, [activeMode, customTests]);

  const buildConfig = useCallback((testId: string): MockTestConfig => {
    const custom = customMap.get(testId);
    return custom ? customToConfig(custom) : getMockTestConfig(testId);
  }, [customMap]);

  // Step 1: user clicks Start/Retake — open the duration prompt instead of starting immediately.
  const requestStart = useCallback((testId: string) => {
    const config = buildConfig(testId);
    setPendingDuration(config.durationMinutes);
    setPendingTestId(testId);
  }, [buildConfig]);

  // Step 2: user confirms duration — actually start the test with that duration.
  const confirmStart = useCallback(() => {
    if (!pendingTestId) return;
    const config = buildConfig(pendingTestId);
    startTest({ ...config, durationMinutes: Math.max(1, pendingDuration) });
    setPendingTestId(null);
    setView("test");
  }, [pendingTestId, pendingDuration, buildConfig, startTest]);

  const handleViewResults = useCallback(() => {
    if (!session) return;
    const result = calculateTestResult(session);
    const fourStep = generateFourStepAnalysis(session);
    const split = calculateTimeSplit(session);
    setTestResult(result); setAnalysis(fourStep); setTimeSplit(split); setView("result");

    if (requireAuth(user)) {
      const title = customMap.get(session.config.id)?.title || session.config.title;
      void saveTestResult(user.uid, title, result);
      void awardXp(user.uid, "completeMockTest");
      showToast(`Mock test completed! +25 XP`, "success");
    }
  }, [session, user, customMap]);

  if (session && (session.status === "completed" || session.status === "timed-out") && view === "test") handleViewResults();

  if (view === "test" && isTestActive) return <TestInterface />;

  if (view === "result" && testResult && analysis && timeSplit) {
    return (
      <TestResultView result={testResult} analysis={analysis} timeSplit={timeSplit}
        onRetake={() => { resetTest(); if (testResult) requestStart(testResult.testId); }}
        onBackToList={() => { resetTest(); setView("list"); }} />
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-charcoal-50 mb-1">Mock Tests</h2>
          <p className="text-charcoal-400 text-sm">Practice with timed tests and detailed analysis</p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>+ Create Test</Button>
      </div>
      <Tabs tabs={modeTabs} activeTab={activeMode} onChange={setActiveMode} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availableTests.map((test, index) => (
          <motion.div key={test.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
            <TestCard test={test} onStart={requestStart} />
          </motion.div>
        ))}
      </div>
      {availableTests.length === 0 && <div className="text-center py-12"><p className="text-charcoal-500">No tests available for this mode yet.</p></div>}

      <CreateTestDialog isOpen={createOpen} onClose={() => setCreateOpen(false)} />

      <Dialog
        isOpen={pendingTestId !== null}
        onClose={() => setPendingTestId(null)}
        onConfirm={confirmStart}
        title="Set your time limit"
        description="Choose how many minutes you want for this test."
        confirmLabel="Start test"
      >
        <div className="flex items-center gap-3 py-2">
          <input
            type="number" min={1} max={180} value={pendingDuration}
            onChange={(e) => setPendingDuration(Number(e.target.value))}
            className="w-24 rounded-xl border border-charcoal-700/50 bg-charcoal-900/60 px-3 py-2 text-center text-charcoal-50 focus:outline-none focus:ring-2 focus:ring-electric/50"
          />
          <span className="text-sm text-charcoal-400">minutes</span>
        </div>
      </Dialog>
    </motion.div>
  );
}