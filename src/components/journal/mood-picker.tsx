'use client';

import { MOODS, type Mood } from '@/lib/firestore/journal-schema';
import { cn } from '@/lib/utils';

interface MoodPickerProps {
  value: Mood | null;
  onChange: (mood: Mood) => void;
}

/** Emoji-based mood selector. */
export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <div className="flex gap-2">
      {MOODS.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          aria-label={m.label}
          title={m.label}
          className={cn(
            'grid h-11 w-11 place-items-center rounded-xl border text-xl transition-all',
            value === m.id ? 'border-primary bg-primary/15 scale-110' : 'border-input hover:bg-accent'
          )}
        >
          {m.emoji}
        </button>
      ))}
    </div>
  );
}
