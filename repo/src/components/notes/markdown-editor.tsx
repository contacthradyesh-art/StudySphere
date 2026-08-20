'use client';

import { useState } from 'react';
import { renderMarkdown } from '@/lib/notes/markdown';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

/** Split editor with a Write / Preview toggle. */
export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');

  return (
    <div className="space-y-2">
      <div className="flex w-fit gap-1 rounded-lg bg-secondary p-1 text-sm">
        {(['write', 'preview'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            className={cn('rounded-md px-3 py-1 capitalize', mode === m ? 'bg-gradient-brand text-white' : 'text-muted-foreground')}
          >
            {m}
          </button>
        ))}
      </div>
      {mode === 'write' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="# Start writing in Markdown..."
          className="min-h-[320px] w-full rounded-xl border border-input bg-background/60 p-4 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      ) : (
        <div
          className="prose-note min-h-[320px] rounded-xl border border-input bg-background/60 p-4"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(value) }}
        />
      )}
    </div>
  );
}
