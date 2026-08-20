"use client";
import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { DeckCard } from "./DeckCard";
import { FlashcardReview } from "./FlashcardReview";
import { CreateCardModal } from "./CreateCardModal";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { Card } from "@/components/shared/Card";
import { showToast } from "@/components/shared/Toast";
import { useUserStore } from "@/store/useUserStore";
import { XP_REWARDS } from "@/utils/constants";
import { getMockDecks, getMockCards, getMockSM2Data } from "../utils/mockFlashcardData";
import { isDue } from "../utils/sm2Algorithm";
import type { SM2Data } from "../types";

type ViewState = "decks" | "review" | "browse";

export function FlashcardContent() {
  const [view, setView] = useState<ViewState>("decks");
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const addXp = useUserStore((s) => s.addXp);
  const decks = useMemo(() => getMockDecks(), []);

  const handleReview = useCallback((deckId: string) => { setActiveDeckId(deckId); setView("review"); }, []);
  const handleViewAll = useCallback((deckId: string) => { setActiveDeckId(deckId); setView("browse"); }, []);

  const handleReviewComplete = useCallback((updatedSM2: Record<string, SM2Data>) => {
    addXp(XP_REWARDS.REVISION_SESSION);
    showToast(`Review complete! +${XP_REWARDS.REVISION_SESSION} XP`, "success");
    setView("decks"); setActiveDeckId(null);
  }, [addXp]);

  const handleCreateManual = useCallback((front: string, back: string) => { showToast("Card created successfully!", "success"); }, []);
  const handleGenerateAI = useCallback((sourceText: string, count: number) => {
    showToast(`Generating ${count} cards from source text...`, "info");
    setTimeout(() => showToast(`${count} flashcards generated!`, "success"), 2000);
  }, []);

  if (view === "review" && activeDeckId) {
    const cards = getMockCards(activeDeckId);
    const sm2Data = getMockSM2Data(cards);
    const dueCards = cards.filter((c) => isDue(sm2Data[c.id]));
    const reviewCards = dueCards.length > 0 ? dueCards : cards.slice(0, 3);
    return (
      <div className="animate-fade-in">
        <FlashcardReview cards={reviewCards} sm2Data={sm2Data} onComplete={handleReviewComplete} onExit={() => { setView("decks"); setActiveDeckId(null); }} />
      </div>
    );
  }

  if (view === "browse" && activeDeckId) {
    const cards = getMockCards(activeDeckId);
    const deck = decks.find((d) => d.id === activeDeckId);
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h2 className="text-2xl font-bold text-charcoal-50 mb-1">{deck?.name}</h2><p className="text-charcoal-400 text-sm">{cards.length} cards</p></div>
          <Button variant="ghost" size="sm" onClick={() => { setView("decks"); setActiveDeckId(null); }}>← Back</Button>
        </div>
        <div className="space-y-3">
          {cards.map((card, index) => (
            <motion.div key={card.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card variant="glass" padding="sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1"><p className="text-sm font-medium text-charcoal-100 mb-1">{card.front}</p><p className="text-xs text-charcoal-400 whitespace-pre-line">{card.back}</p></div>
                  <Badge variant={card.source === "ai-generated" ? "neon" : "default"} size="sm">{card.source === "ai-generated" ? "AI" : "Manual"}</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  const totalDue = decks.reduce((sum, d) => sum + d.dueCount, 0);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-start justify-between">
        <div><h2 className="text-2xl font-bold text-charcoal-50 mb-1">Flashcards</h2><p className="text-charcoal-400 text-sm">Review and memorize with spaced repetition</p></div>
        <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>+ Create</Button>
      </div>
      {totalDue > 0 && (
        <Card variant="glow" padding="sm">
          <div className="flex items-center gap-2"><span className="text-lg">🔔</span><span className="text-sm text-charcoal-200"><strong className="text-electric-300">{totalDue} cards</strong> due for review today</span></div>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {decks.map((deck, index) => (
          <motion.div key={deck.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
            <DeckCard deck={deck} onReview={handleReview} onViewAll={handleViewAll} />
          </motion.div>
        ))}
      </div>
      <CreateCardModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} onCreateManual={handleCreateManual} onGenerateAI={handleGenerateAI} />
    </motion.div>
  );
}
