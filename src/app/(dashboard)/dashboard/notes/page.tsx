'use client';

import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { NoteCard } from '@/components/notes/note-card';
import { useAuth } from '@/hooks/use-auth';
import { useNotesSync } from '@/hooks/use-notes';
import { useNotesStore, filterNotes, bySubject } from '@/store/notes-store';
import { createNote } from '@/lib/notes/notes-service';
import { SUBJECTS } from '@/lib/firestore/planner-schema';

export default function NotesPage() {
  useNotesSync();
  const router = useRouter();
  const { user } = useAuth();
  const { notes, loading, search, setSearch, subjectFilter, setSubjectFilter } = useNotesStore();
  const visible = filterNotes(bySubject(notes, subjectFilter), search);

  async function newNote() {
    if (!user) return;
    try {
      const id = await createNote(user.uid, { title: 'Untitled note', content: '', subject: null, category: null, tags: [] });
      router.push(`/dashboard/notes/${id}`);
    } catch {
      toast.error('Could not create note');
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notes</h1>
          <p className="text-sm text-muted-foreground">Markdown notes with attachments and version history.</p>
        </div>
        <Button variant="gradient" onClick={newNote}><Plus className="h-4 w-4" /> New note</Button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search title, content, tags, subject..." className="pl-9" />
        </div>
        <select
          value={subjectFilter}
          onChange={(e) => setSubjectFilter(e.target.value)}
          className="h-10 rounded-md border border-input bg-background/60 px-3 text-sm"
          aria-label="Filter by subject"
        >
          <option value="">All subjects</option>
          {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Loading notes...</p>}
      {!loading && visible.length === 0 && (
        <p className="text-sm text-muted-foreground">{search || subjectFilter ? 'No matching notes.' : 'No notes yet. Create your first!'}</p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((n, i) => <NoteCard key={n.id} note={n} delay={i * 0.03} />)}
      </div>
    </div>
  );
}
