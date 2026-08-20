import {
  BookOpen, Atom, FlaskConical, Leaf, MessageSquare,
  Monitor, Landmark, Globe, type LucideIcon
} from 'lucide-react';
import type { Subject } from '@/lib/firestore/planner-schema';

export interface SubjectMeta {
  icon: LucideIcon;
  glow: string;
  bg: string;
}

const META: Record<Subject, SubjectMeta> = {
  Mathematics:      { icon: BookOpen,      glow: '#a78bfa', bg: '#a78bfa1a' },
  Physics:          { icon: Atom,          glow: '#60a5fa', bg: '#60a5fa1a' },
  Chemistry:        { icon: FlaskConical,  glow: '#34d399', bg: '#34d3991a' },
  Biology:          { icon: Leaf,          glow: '#86efac', bg: '#86efac1a' },
  English:          { icon: MessageSquare, glow: '#fbbf24', bg: '#fbbf241a' },
  'Computer Science': { icon: Monitor,    glow: '#38bdf8', bg: '#38bdf81a' },
  History:          { icon: Landmark,      glow: '#fb923c', bg: '#fb923c1a' },
  Geography:        { icon: Globe,         glow: '#4ade80', bg: '#4ade801a' },
};

const FALLBACK: SubjectMeta = { icon: BookOpen, glow: '#8b5cf6', bg: '#8b5cf61a' };

export function subjectMeta(subject: Subject | string | null | undefined): SubjectMeta {
  if (!subject) return FALLBACK;
  return META[subject as Subject] ?? FALLBACK;
}
