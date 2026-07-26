"use client";
import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Button } from "@/components/shared/Button";
import type { FlashcardDeck } from "../types";

interface DeckCardProps { deck: FlashcardDeck; onReview: (deckId: string) => void; onViewAll: (deckId: string) => void; }

export function DeckCard({ deck, onReview, onViewAll }: DeckCardProps) {
  const masteryPercent = deck.cardCount > 0 ? (deck.masteredCount / deck.cardCount) * 100 : 0;
  return (
    <Card variant="glass" hoverable>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1"><h4 className="text-sm font-semibold text-charcoal-50 mb-1">{deck.name}</h4><p className="text-xs text-charcoal-500">{deck.description}</p></div>
        {deck.dueCount > 0 && <Badge variant="warning" size="sm">{deck.dueCount} due</Badge>}
      </div>
      <ProgressBar value={masteryPercent} variant="gradient" size="sm" label="Mastery" showLabel className="mb-4" />
      <div className="flex items-center justify-between text-xs text-charcoal-500 mb-4"><span>{deck.cardCount} cards</span><span>{deck.masteredCount} mastered</span></div>
      <div className="flex gap-2">
        {deck.dueCount > 0 && <Button variant="primary" size="sm" className="flex-1" onClick={() => onReview(deck.id)}>Review ({deck.dueCount})</Button>}
        <Button variant="secondary" size="sm" className="flex-1" onClick={() => onViewAll(deck.id)}>View All</Button>
      </div>
    </Card>
  );
}
