'use client';
import { Globe } from 'lucide-react';
import { CategoryHubPage } from '@/components/mission-ias/category-hub-page';

export default function InternationalRelationsPage() {
  return (
    <CategoryHubPage
      title="International Relations"
      description="Foreign policy and diplomacy news, filtered from Current Affairs \u2014 relevant for GS Paper 2."
      icon={Globe}
      category="international-relations"
      noteCategory="International Relations"
    />
  );
}
