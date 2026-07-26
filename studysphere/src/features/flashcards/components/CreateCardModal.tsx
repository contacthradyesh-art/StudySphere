"use client";
import { useState } from "react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";
import { Tabs } from "@/components/shared/Tabs";
import { showToast } from "@/components/shared/Toast";

interface CreateCardModalProps {
  isOpen: boolean; onClose: () => void;
  onCreateManual: (front: string, back: string) => void;
  onGenerateAI: (sourceText: string, count: number) => void;
}
const modeTabs = [{ id: "manual", label: "Manual" }, { id: "ai", label: "AI Generate" }];

export function CreateCardModal({ isOpen, onClose, onCreateManual, onGenerateAI }: CreateCardModalProps) {
  const [mode, setMode] = useState("manual");
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [sourceText, setSourceText] = useState("");
  const [cardCount, setCardCount] = useState(5);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateManual = () => {
    if (!front.trim() || !back.trim()) { showToast("Both front and back are required", "warning"); return; }
    onCreateManual(front.trim(), back.trim());
    setFront(""); setBack("");
    showToast("Flashcard created!", "success");
  };

  const handleGenerateAI = async () => {
    if (!sourceText.trim()) { showToast("Please provide source text", "warning"); return; }
    setIsLoading(true);
    onGenerateAI(sourceText.trim(), cardCount);
    setIsLoading(false);
    showToast(`Generating ${cardCount} flashcards from source...`, "info");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Flashcards" size="lg">
      <Tabs tabs={modeTabs} activeTab={mode} onChange={setMode} className="mb-4" />
      {mode === "manual" ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-charcoal-200 mb-1.5 block">Question (Front)</label>
            <textarea value={front} onChange={(e) => setFront(e.target.value)} placeholder="What is the formula for..."
              className="w-full rounded-xl border border-charcoal-700/50 bg-charcoal-900/60 backdrop-blur-sm px-4 py-2.5 text-charcoal-50 placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric min-h-[80px] resize-none" />
          </div>
          <div>
            <label className="text-sm font-medium text-charcoal-200 mb-1.5 block">Answer (Back)</label>
            <textarea value={back} onChange={(e) => setBack(e.target.value)} placeholder="The formula is..."
              className="w-full rounded-xl border border-charcoal-700/50 bg-charcoal-900/60 backdrop-blur-sm px-4 py-2.5 text-charcoal-50 placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric min-h-[80px] resize-none" />
          </div>
          <Button variant="primary" fullWidth onClick={handleCreateManual}>Create Card</Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-charcoal-200 mb-1.5 block">Source Text</label>
            <p className="text-xs text-charcoal-500 mb-2">Paste your notes, textbook content, or any study material. AI will generate flashcards strictly from this source.</p>
            <textarea value={sourceText} onChange={(e) => setSourceText(e.target.value)} placeholder="Paste your study material here..."
              className="w-full rounded-xl border border-charcoal-700/50 bg-charcoal-900/60 backdrop-blur-sm px-4 py-2.5 text-charcoal-50 placeholder:text-charcoal-500 focus:outline-none focus:ring-2 focus:ring-electric/50 focus:border-electric min-h-[120px] resize-none" />
          </div>
          <div className="flex items-center gap-4">
            <label className="text-sm text-charcoal-300">Cards to generate:</label>
            <select value={cardCount} onChange={(e) => setCardCount(Number(e.target.value))}
              className="rounded-lg border border-charcoal-700/50 bg-charcoal-900/60 px-3 py-1.5 text-sm text-charcoal-200 focus:outline-none focus:ring-2 focus:ring-electric/50">
              {[3, 5, 8, 10].map((n) => <option key={n} value={n}>{n} cards</option>)}
            </select>
          </div>
          <Button variant="neon" fullWidth onClick={handleGenerateAI} isLoading={isLoading}>Generate with AI</Button>
        </div>
      )}
    </Modal>
  );
}
