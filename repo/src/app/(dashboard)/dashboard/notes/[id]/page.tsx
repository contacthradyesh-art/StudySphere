'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft, Download, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GlassCard } from '@/components/shared/glass-card';
import { MarkdownEditor } from '@/components/notes/markdown-editor';
import { AttachmentUploader } from '@/components/notes/attachment-uploader';
import { useAuth } from '@/hooks/use-auth';
import { deleteNote, getNote, updateNote } from '@/lib/notes/notes-service';
import { SUBJECTS, type Subject } from '@/lib/firestore/planner-schema';
import type { Note } from '@/lib/firestore/notes-schema';

export default function NoteDetailPage() {
  const router = useRouter();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState<Subject | ''>('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const n = await getNote(user.uid, id);
    if (!n) { toast.error('Note not found'); router.push('/dashboard/notes'); return; }
    setNote(n);
    setTitle(n.title); setContent(n.content);
    setSubject(n.subject ?? ''); setTags(n.tags.join(', '));
  }, [user, id, router]);

  useEffect(() => { load(); }, [load]);

  async function save() {
    if (!user) return;
    setSaving(true);
    try {
      await updateNote(user.uid, id, {
        title: title.trim() || 'Untitled note',
        content,
        subject: (subject || null) as Subject | null,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean)
      });
      toast.success('Saved (previous version archived)');
      await load();
    } catch {
      toast.error('Could not save');
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!user) return;
    await deleteNote(user.uid, id);
    toast.success('Note deleted');
    router.push('/dashboard/notes');
  }

  if (!note) return <p className="text-sm text-muted-foreground">Loading note...</p>;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => router.push('/dashboard/notes')}><ArrowLeft className="h-4 w-4" /> Back</Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.print()}><Download className="h-4 w-4" /> Export PDF</Button>
          <Button variant="destructive" onClick={remove}><Trash2 className="h-4 w-4" /> Delete</Button>
          <Button variant="gradient" onClick={save} disabled={saving}><Save className="h-4 w-4" /> {saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </div>

      <Input value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold" placeholder="Note title" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value as Subject)}
          className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm"
        >
          <option value="">No subject</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="tags, comma, separated" />
      </div>

      <MarkdownEditor value={content} onChange={setContent} />

      <GlassCard>
        <h2 className="mb-3 font-semibold">Attachments</h2>
        {user && <AttachmentUploader uid={user.uid} noteId={id} attachments={note.attachments} onUploaded={load} />}
      </GlassCard>
    </div>
  );
}
