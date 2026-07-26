'use client';

import { useRef, useState } from 'react';
import { Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { uploadAttachment } from '@/lib/notes/storage-service';
import { addAttachment } from '@/lib/notes/notes-service';
import type { Attachment } from '@/lib/firestore/notes-schema';

interface AttachmentUploaderProps {
  uid: string;
  noteId: string;
  attachments: Attachment[];
  onUploaded: () => void;
}

/** Uploads PDF/image/audio files to Storage and links them to the note. */
export function AttachmentUploader({ uid, noteId, attachments, onUploaded }: AttachmentUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const att = await uploadAttachment(uid, noteId, file);
      await addAttachment(uid, noteId, att);
      toast.success('Attachment uploaded');
      onUploaded();
    } catch {
      toast.error('Upload failed');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="space-y-3">
      <input ref={inputRef} type="file" accept=".pdf,image/*,audio/*" hidden onChange={onPick} />
      <Button variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
        <Paperclip className="h-4 w-4" /> {busy ? 'Uploading...' : 'Attach PDF / image / audio'}
      </Button>
      <ul className="space-y-1 text-sm">
        {attachments.map((a) => (
          <li key={a.url}>
            <a href={a.url} target="_blank" rel="noreferrer" className="text-primary hover:underline">
              {a.name} <span className="text-xs text-muted-foreground">({a.type})</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
