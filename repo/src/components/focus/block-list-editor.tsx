'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface BlockListEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
}

/** Editable list of custom blocked sites/keywords. */
export function BlockListEditor({ items, onChange }: BlockListEditorProps) {
  const [value, setValue] = useState('');

  function add() {
    const v = value.trim();
    if (!v || items.includes(v)) return;
    onChange([...items, v]);
    setValue('');
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), add())}
          placeholder="e.g. reddit.com"
        />
        <Button type="button" variant="outline" onClick={add}>Add</Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {items.length === 0 && <p className="text-xs text-muted-foreground">No custom sites blocked yet.</p>}
        {items.map((item) => (
          <span key={item} className="flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs">
            {item}
            <button aria-label={`Remove ${item}`} onClick={() => onChange(items.filter((i) => i !== item))}>
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}
