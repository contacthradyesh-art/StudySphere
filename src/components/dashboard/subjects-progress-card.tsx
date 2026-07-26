'use client';

import { GlassCard } from '@/components/shared/glass-card';

const subjects = [
  { name: 'Physics', progress: 78, color: 'bg-blue-500' },
  { name: 'Mathematics', progress: 65, color: 'bg-purple-500' },
  { name: 'Chemistry', progress: 54, color: 'bg-green-500' },
  { name: 'Biology', progress: 40, color: 'bg-red-500' },
  { name: 'English', progress: 30, color: 'bg-yellow-500' },
];

export function SubjectsProgressCard() {
  const overall = Math.round(subjects.reduce((a, s) => a + s.progress, 0) / subjects.length);

  return (
    <GlassCard>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold">Subjects Progress</h2>
        <span className="text-lg font-bold text-primary">{overall}%</span>
      </div>
      <div className="mb-3">
        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
          <div className="h-2 rounded-full bg-primary" style={{ width: `${overall}%` }} />
        </div>
        <p className="text-xs text-muted-foreground mt-1">Overall Progress</p>
      </div>
      <div className="space-y-3">
        {subjects.map((s) => (
          <div key={s.name}>
            <div className="flex justify-between text-sm mb-1">
              <span>{s.name}</span>
              <span className="text-muted-foreground">{s.progress}%</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
              <div className={`h-1.5 rounded-full ${s.color}`} style={{ width: `${s.progress}%` }} />
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}