'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LockDialogProps {
  open: boolean;
  mode: 'lock' | 'unlock';
  onClose: () => void;
  onSubmit: (passphrase: string) => void;
}

/** Prompts for a passphrase to lock (encrypt) or unlock (decrypt) an entry. */
export function LockDialog({ open, mode, onClose, onSubmit }: LockDialogProps) {
  const [pass, setPass] = useState('');
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => { e.preventDefault(); if (pass) { onSubmit(pass); setPass(''); } }}
        className="glass w-full max-w-sm space-y-4 rounded-2xl p-6"
      >
        <h2 className="text-lg font-bold">{mode === 'lock' ? 'Lock entry' : 'Unlock entry'}</h2>
        <p className="text-xs text-muted-foreground">
          {mode === 'lock'
            ? 'Choose a passphrase. It is never stored - if you forget it, the entry cannot be recovered.'
            : 'Enter the passphrase used to lock this entry.'}
        </p>
        <div className="space-y-2">
          <Label htmlFor="pass">Passphrase</Label>
          <Input id="pass" type="password" value={pass} onChange={(e) => setPass(e.target.value)} autoFocus />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="gradient">{mode === 'lock' ? 'Lock' : 'Unlock'}</Button>
        </div>
      </form>
    </div>
  );
}
