import type { ComponentType } from 'react';
import type { Subject } from '@/lib/firestore/planner-schema';
import { BookOpenIcon, ZapIcon, FlameIcon, MenuIcon, CalendarIcon, BotIcon, SearchIcon, BellIcon, BarChart3Icon } from '@/components/shared/icons';

export interface SubjectMeta {
  icon: ComponentType<{ size?: number; className?: string }>;
  glow: string;
  bg: string;
}

const META: Record<Subject, SubjectMeta> = {
  Mathematics: { icon: BookOpenIcon, glow: '#a78bfa', bg: '#a78bfa1a' },
  Physics: { icon: ZapIcon, glow: '#60a5fa', bg: '#60a5fa1a' },
  Chemistry: { icon: FlameIcon, glow: '#34d399', bg: '#34d3991a' },
  Biology: { icon: MenuIcon, glow: '#86efac', bg: '#86efac1a' },
  English: { icon: SearchIcon, glow: '#fbbf24', bg: '#fbbf241a' },
  'Computer Science': { icon: BotIcon, glow: '#38bdf8', bg: '#38bdf81a' },
  History: { icon: CalendarIcon, glow: '#fb923c', bg: '#fb923c1a' },
  Geography: { icon: BarChart3Icon, glow: '#4ade80', bg: '#4ade801a' },
};

const FALLBACK: SubjectMeta = { icon: BookOpenIcon, glow: '#8b5cf6', bg: '#8b5cf61a' };

export function subjectMeta(subject: Subject | string | null | undefined): SubjectMeta {
  if (!subject) return FALLBACK;
  return META[subject as Subject] ?? FALLBACK;
}
