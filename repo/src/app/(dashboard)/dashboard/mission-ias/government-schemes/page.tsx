'use client';
import { Landmark } from 'lucide-react';
import { CategoryHubPage } from '@/components/mission-ias/category-hub-page';

export default function GovernmentSchemesPage() {
  return (
    <CategoryHubPage
      title="Government Schemes"
      description="Policy and governance news, filtered from Current Affairs \u2014 schemes, cabinet decisions, and administrative reforms."
      icon={Landmark}
      category="governance"
      noteCategory="Government Schemes"
    />
  );
}
