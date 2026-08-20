'use client';
import { Leaf } from 'lucide-react';
import { CategoryHubPage } from '@/components/mission-ias/category-hub-page';

export default function EnvironmentHubPage() {
  return (
    <CategoryHubPage
      title="Environment Hub"
      description="Environment and climate news, filtered from Current Affairs \u2014 relevant for GS Paper 3."
      icon={Leaf}
      category="environment"
      noteCategory="Environment"
    />
  );
}
