import type { SM2Data, SM2Quality } from "../types";

export function createInitialSM2Data(cardId: string): SM2Data {
  return { cardId, easeFactor: 2.5, interval: 0, repetitions: 0, nextReviewDate: new Date(), lastReviewDate: new Date(), quality: 0 };
}

export function processReview(data: SM2Data, quality: SM2Quality): SM2Data {
  const newData = { ...data };
  newData.quality = quality;
  newData.lastReviewDate = new Date();

  if (quality < 3) { newData.repetitions = 0; newData.interval = 1; }
  else {
    if (newData.repetitions === 0) newData.interval = 1;
    else if (newData.repetitions === 1) newData.interval = 6;
    else newData.interval = Math.round(newData.interval * newData.easeFactor);
    newData.repetitions++;
  }

  newData.easeFactor = Math.max(1.3, newData.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + newData.interval);
  newData.nextReviewDate = nextDate;
  return newData;
}

export function isDue(data: SM2Data): boolean { return new Date() >= new Date(data.nextReviewDate); }

export function getDueCards(allSM2Data: SM2Data[]): SM2Data[] {
  return allSM2Data.filter(isDue).sort((a, b) => new Date(a.nextReviewDate).getTime() - new Date(b.nextReviewDate).getTime());
}

export function getQualityLabel(quality: SM2Quality): string {
  switch (quality) {
    case 0: return "Blackout"; case 1: return "Wrong"; case 2: return "Hard";
    case 3: return "Difficult"; case 4: return "Good"; case 5: return "Easy";
  }
}

export function getQualityColor(quality: SM2Quality): string {
  switch (quality) {
    case 0: case 1: return "text-red-400"; case 2: return "text-orange-400";
    case 3: return "text-yellow-400"; case 4: return "text-electric-300"; case 5: return "text-neon";
  }
}
