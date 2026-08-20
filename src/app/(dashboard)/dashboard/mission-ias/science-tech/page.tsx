'use client';
import { Cpu } from 'lucide-react';
import { CategoryHubPage } from '@/components/mission-ias/category-hub-page';

export default function ScienceTechPage() {
  return (
    <CategoryHubPage
      title="Science & Technology"
      description="Science & tech news, filtered from Current Affairs \u2014 missions, breakthroughs, and policy relevant for GS Paper 3."
      icon={Cpu}
      category="science-tech"
      noteCategory="Science & Technology"
    />
  );
}
