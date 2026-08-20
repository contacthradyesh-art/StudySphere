'use client';
import { TrendingUp } from 'lucide-react';
import { CategoryHubPage } from '@/components/mission-ias/category-hub-page';

export default function BudgetEconomyPage() {
  return (
    <CategoryHubPage
      title="Budget & Economy"
      description="Economic news, filtered from Current Affairs \u2014 fiscal policy, RBI decisions, trade, and macroeconomic indicators."
      icon={TrendingUp}
      category="economy"
      noteCategory="Budget & Economy"
    />
  );
}
