"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { processReview } from "../utils/sm2Algorithm";
import type { Flashcard, SM2Data, SM2Quality } from "../types";

interface FlashcardReviewProps {
  cards: Flashcard[]; sm2Data: Record<string, SM2Data>;
  onComplete: (updatedSM2: Record<string, SM2Data>) => void; onExit: () => void;
}

const qualityButtons: Array<{ quality: SM2Quality; label: string; variant: "danger" | "secondary" | "primary" | "neon" }> = [
  { quality: 0, label: "Blackout", variant: "danger" }, { quality: 1, label: "Wrong", variant: "danger" },
  { quality: 3, label: "Hard", variant: "secondary" }, { quality: 4, label: "Good", variant: "primary" }, { quality: 5, label: "Easy", variant: "neon" },
];

export function FlashcardReview({ cards, sm2Data, onComplete, onExit }: FlashcardReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [updatedSM2, setUpdatedSM2] = useState<Record<string, SM2Data>>({ ...sm2Data });
  const [direction, setDirection] = useState(0);
  const currentCard = cards[currentIndex];
  const progress = (currentIndex / cards.length) * 100;

  const handleRate = useCallback((quality: SM2Quality) => {
    const cardData = updatedSM2[currentCard.id];
    if (cardData) {
      const newData = processReview(cardData, quality);
      setUpdatedSM2((prev) => ({ ...prev, [currentCard.id]: newData }));
    }
    setDirection(1); setIsFlipped(false);
    if (currentIndex < cards.length - 1) setTimeout(() => setCurrentIndex((i) => i + 1), 200);
    else onComplete(updatedSM2);
  }, [currentCard, currentIndex, cards.length, updatedSM2, onComplete]);

  if (!currentCard) return null;

  return (
    <div className="max-w-lg mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={onExit}>← Exit</Button>
        <span className="text-sm text-charcoal-400">{currentIndex + 1} / {cards.length}</span>
      </div>
      <ProgressBar value={progress} variant="gradient" size="sm" />

      <div style={{ perspective: "1000px" }}>
        <AnimatePresence mode="wait">
          <motion.div key={`${currentCard.id}-${isFlipped}`} initial={{ opacity: 0, rotateY: isFlipped ? -90 : 0, x: direction * 50 }} animate={{ opacity: 1, rotateY: 0, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
            <Card variant="glass" padding="lg" className="min-h-[280px] flex flex-col cursor-pointer" onClick={() => !isFlipped && setIsFlipped(true)}>
              <div className="flex items-center justify-between mb-4">
                <Badge variant={isFlipped ? "neon" : "electric"} size="sm">{isFlipped ? "Answer" : "Question"}</Badge>
                <Badge variant="outline" size="sm">{currentCard.topic}</Badge>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-base text-charcoal-50 text-center leading-relaxed whitespace-pre-line">{isFlipped ? currentCard.back : currentCard.front}</p>
              </div>
              {!isFlipped && <p className="text-xs text-charcoal-600 text-center mt-4">Tap to reveal answer</p>}
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isFlipped && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="space-y-3">
            <p className="text-xs text-charcoal-500 text-center">How well did you know this?</p>
            <div className="flex gap-2">
              {qualityButtons.map((btn) => <Button key={btn.quality} variant={btn.variant} size="sm" className="flex-1" onClick={() => handleRate(btn.quality)}>{btn.label}</Button>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
