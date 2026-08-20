'use client';

import { useMemo } from 'react';
import { SubjectCard } from '@/components/subjects/subject-card';
import { useNotesSync } from '@/hooks/use-notes';
import { useNotesStore } from '@/store/notes-store';
import { SUBJECTS } from '@/lib/firestore/planner-schema';

export default function SubjectsPage() {
  useNotesSync();
  const notes = useNotesStore((s) => s.notes);

  const bySubject = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of notes) if (n.subject) map.set(n.subject, (map.get(n.subject) ?? 0) + 1);
    return map;
  }, [notes]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subjects</h1>
        <p className="text-sm text-muted-foreground">Organize study materials by subject.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SUBJECTS.map((s, i) => {
          const count = bySubject.get(s) ?? 0;
          // Lightweight progress heuristic until graded materials land (M7).
          const progress = Math.min(100, count * 10);
          return <SubjectCard key={s} subject={s} noteCount={count} progress={progress} delay={i * 0.03} />;
        })}
      </div>
    </div>
  );
}
