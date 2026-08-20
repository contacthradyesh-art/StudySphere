"use client";
import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { Tabs } from "@/components/shared/Tabs";
import { Input } from "@/components/shared/Input";
import { Button } from "@/components/shared/Button";
import { showToast } from "@/components/shared/Toast";
import { useAuth } from "@/hooks/use-auth";
import { createCustomTest } from "@/lib/mock-tests/mock-test-service";
import type { Question } from "../types";

interface CreateTestDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const sourceTabs = [
  { id: "ai", label: "Generate with AI" },
  { id: "manual", label: "Paste manually" },
];

export function CreateTestDialog({ isOpen, onClose }: CreateTestDialogProps) {
  const { user } = useAuth();
  const [tab, setTab] = useState("ai");

  // AI tab state
  const [examName, setExamName] = useState("");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [generating, setGenerating] = useState(false);

  // Manual tab state
  const [manualTitle, setManualTitle] = useState("");
  const [manualExam, setManualExam] = useState("");
  const [manualRaw, setManualRaw] = useState("");
  const [savingManual, setSavingManual] = useState(false);

  function toQuestions(raw: any[], fallbackTopic: string): Question[] {
    return raw.map((q: any, i: number) => ({
      id: `q-${Date.now()}-${i}`,
      text: q.text,
      options: q.options,
      correctOptionIndex: q.correctOptionIndex,
      explanation: q.explanation || "",
      topic: q.topic || fallbackTopic || "General",
      subject: "general-awareness",
      difficulty: "medium",
      hint: q.hint || undefined,
    }));
  }

  async function handleGenerate() {
    if (!user) { showToast("Please log in again", "error"); return; }
    if (!examName.trim()) { showToast("Enter an exam name", "error"); return; }
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/mock-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examName: examName.trim(), topic: topic.trim(), difficulty: "medium", count }),
      });
      const data = await res.json();
      if (!res.ok || !data.questions) throw new Error(data.error || "Generation failed");

      await createCustomTest(user.uid, {
        title: `${examName.trim()}${topic.trim() ? ` — ${topic.trim()}` : ""} (AI)`,
        examId: examName.trim().toLowerCase().replace(/\s+/g, "-"),
        examName: examName.trim(),
        mode: "full",
        difficulty: "medium",
        source: "ai",
        topics: topic.trim() ? [topic.trim()] : [],
        questions: toQuestions(data.questions, topic),
      });

      showToast("AI test created!", "success");
      setExamName(""); setTopic(""); setCount(10);
      onClose();
    } catch {
      showToast("Could not generate test. Try again.", "error");
    } finally {
      setGenerating(false);
    }
  }

  async function handleManualSave() {
    if (!user) { showToast("Please log in again", "error"); return; }
    if (!manualTitle.trim() || !manualExam.trim()) { showToast("Fill in title and exam name", "error"); return; }
    if (!manualRaw.trim()) { showToast("Paste your questions first", "error"); return; }
    setSavingManual(true);
    try {
      const res = await fetch("/api/ai/mock-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: manualRaw }),
      });
      const data = await res.json();
      if (!res.ok || !data.questions) throw new Error(data.error || "Could not read the pasted text");

      await createCustomTest(user.uid, {
        title: manualTitle.trim(),
        examId: manualExam.trim().toLowerCase().replace(/\s+/g, "-"),
        examName: manualExam.trim(),
        mode: "full",
        difficulty: "medium",
        source: "manual",
        topics: [],
        questions: toQuestions(data.questions, manualExam),
      });
      showToast(`Test added with ${data.questions.length} question(s)`, "success");
      setManualTitle(""); setManualExam(""); setManualRaw("");
      onClose();
    } catch {
      showToast("Could not read the pasted text — try adding more structure (Q, options, correct answer)", "error");
    } finally {
      setSavingManual(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create a mock test" size="lg">
      <div className="space-y-4">
        <Tabs tabs={sourceTabs} activeTab={tab} onChange={setTab} fullWidth />

        {tab === "ai" ? (
          <div className="space-y-3">
            <Input label="Exam name" placeholder="e.g. SSC CHSL, UPP Constable" value={examName} onChange={(e) => setExamName(e.target.value)} />
            <Input label="Topic (optional)" placeholder="e.g. Profit & Loss, Syllogism" value={topic} onChange={(e) => setTopic(e.target.value)} />
            <Input label="Number of questions" type="number" min={5} max={30} value={count} onChange={(e) => setCount(Number(e.target.value))} />
            <Button variant="primary" fullWidth isLoading={generating} onClick={handleGenerate}>
              {generating ? "Generating..." : "Generate test"}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Input label="Test title" placeholder="e.g. My Physics Practice Set" value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} />
            <Input label="Exam name" placeholder="e.g. SSC CGL" value={manualExam} onChange={(e) => setManualExam(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-charcoal-200">Questions</label>
              <p className="text-xs text-charcoal-500">Paste questions in any format — with options and correct answers marked however you like. AI will read and structure them.</p>
              <textarea
                value={manualRaw}
                onChange={(e) => setManualRaw(e.target.value)}
                placeholder={`Paste your questions here, e.g.:\n\nWhat is 2+2?\nA. 3  B. 4  C. 5  D. 6\nAnswer: B`}
                className="min-h-[220px] w-full rounded-xl border border-charcoal-700/50 bg-charcoal-900/60 p-3 text-sm text-charcoal-50 placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-electric/50"
              />
            </div>
            <Button variant="primary" fullWidth isLoading={savingManual} onClick={handleManualSave}>
              {savingManual ? "Reading & saving..." : "Save test"}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}