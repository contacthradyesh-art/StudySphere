'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import {
  X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Bookmark as BookmarkIcon,
  StickyNote, Sparkles
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GlassCard } from '@/components/shared/glass-card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import {
  subscribeLibraryNotes, addLibraryNote, deleteLibraryNote,
  subscribeLibraryBookmarks, addLibraryBookmark, deleteLibraryBookmark,
  updateReadingProgress
} from '@/lib/mission-ias/library-service';
import type { LibraryFile, LibraryNote, LibraryBookmark } from '@/lib/mission-ias/library-schema';
import { AskAiButton } from '@/components/ai/ask-ai-button';

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const MAX_AI_CONTEXT_CHARS = 3000;

export default function PdfReader({ file, onClose }: { file: LibraryFile; onClose: () => void }) {
  const { user } = useAuth();
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(file.lastPage && file.lastPage > 0 ? file.lastPage : 1);
  const [scale, setScale] = useState(1.2);
  const [panel, setPanel] = useState<'notes' | 'bookmarks' | 'ai' | null>(null);
  const [notes, setNotes] = useState<LibraryNote[]>([]);
  const [bookmarks, setBookmarks] = useState<LibraryBookmark[]>([]);
  const [noteDraft, setNoteDraft] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [currentPageText, setCurrentPageText] = useState('');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubNotes = subscribeLibraryNotes(user.uid, file.id, setNotes);
    const unsubBookmarks = subscribeLibraryBookmarks(user.uid, file.id, setBookmarks);
    return () => { unsubNotes(); unsubBookmarks(); };
  }, [user, file.id]);

  // Debounced reading-progress save — only after the page has settled for a
  // moment, never on every render.
  useEffect(() => {
    if (!user || numPages === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      updateReadingProgress(user.uid, file.id, pageNumber, numPages).catch(() => {});
    }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [pageNumber, numPages, user, file.id]);

  function goToPage(p: number) {
    setPageNumber(Math.min(Math.max(1, p), numPages || 1));
  }

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') goToPage(pageNumber + 1);
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') goToPage(pageNumber - 1);
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, numPages]);

  function handleSelection() {
    const text = window.getSelection()?.toString().trim() ?? '';
    if (text) setSelectedText(text.slice(0, MAX_AI_CONTEXT_CHARS));
  }

  async function handleAddNote() {
    if (!user || !noteDraft.trim()) return;
    await addLibraryNote(user.uid, file.id, pageNumber, noteDraft.trim());
    setNoteDraft('');
    toast.success('Note added');
  }

  async function handleAddBookmark() {
    if (!user) return;
    await addLibraryBookmark(user.uid, file.id, pageNumber, `Page ${pageNumber}`);
    toast.success('Bookmark added');
  }

  const aiContext = selectedText || currentPageText;
  const isPdf = file.type.includes('pdf');

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
          <p className="truncate text-sm font-medium">{file.name}</p>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPanel(panel === 'bookmarks' ? null : 'bookmarks')} className={cn('rounded-lg p-2', panel === 'bookmarks' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')}>
            <BookmarkIcon className="h-4 w-4" />
          </button>
          <button onClick={() => setPanel(panel === 'notes' ? null : 'notes')} className={cn('rounded-lg p-2', panel === 'notes' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')}>
            <StickyNote className="h-4 w-4" />
          </button>
          <button onClick={() => setPanel(panel === 'ai' ? null : 'ai')} className={cn('rounded-lg p-2', panel === 'ai' ? 'bg-primary/20 text-primary' : 'text-muted-foreground hover:text-foreground')}>
            <Sparkles className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {/* Left: page jump list, collapses on mobile */}
        {isPdf && numPages > 0 && (
          <div className="hidden w-20 shrink-0 overflow-y-auto border-r border-white/10 p-2 sm:block">
            {Array.from({ length: numPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => goToPage(p)}
                className={cn(
                  'mb-1.5 flex w-full items-center justify-center rounded-lg border py-2 text-xs',
                  p === pageNumber ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground hover:border-white/30'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Center: document */}
        <div className="flex flex-1 flex-col items-center overflow-y-auto p-4" onMouseUp={handleSelection}>
          {isPdf ? (
            <Document
              file={file.downloadUrl}
              onLoadSuccess={({ numPages: n }) => setNumPages(n)}
              onLoadError={() => toast.error('Could not load this PDF')}
              loading={<p className="p-8 text-sm text-muted-foreground">Loading document...</p>}
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                onGetTextSuccess={(textContent) => {
                  const text = textContent.items
                    .map((it) => ('str' in it ? it.str : ''))
                    .join(' ')
                    .slice(0, MAX_AI_CONTEXT_CHARS);
                  setCurrentPageText(text);
                }}
              />
            </Document>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={file.downloadUrl} alt={file.name} className="max-h-full max-w-full rounded-lg" />
          )}
        </div>

        {/* Right: contextual panel */}
        {panel && (
          <div className="w-full max-w-xs shrink-0 overflow-y-auto border-l border-white/10 p-3 sm:w-80">
            {panel === 'bookmarks' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Bookmarks</h3>
                  <Button variant="outline" size="sm" onClick={handleAddBookmark}>+ This page</Button>
                </div>
                {bookmarks.length === 0 && <p className="text-xs text-muted-foreground">No bookmarks yet.</p>}
                {bookmarks.map((b) => (
                  <GlassCard key={b.id} className="flex items-center justify-between p-2">
                    <button onClick={() => goToPage(b.page)} className="text-left text-sm hover:text-primary">
                      Page {b.page}
                    </button>
                    <button onClick={() => user && deleteLibraryBookmark(user.uid, file.id, b.id)} className="text-xs text-muted-foreground hover:text-red-400">
                      <X className="h-3 w-3" />
                    </button>
                  </GlassCard>
                ))}
              </div>
            )}

            {panel === 'notes' && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Notes</h3>
                <textarea
                  value={noteDraft}
                  onChange={(e) => setNoteDraft(e.target.value)}
                  placeholder={`Note for page ${pageNumber}...`}
                  className="w-full rounded-lg border border-white/10 bg-white/5 p-2 text-sm outline-none"
                  rows={3}
                />
                <Button variant="gradient" size="sm" onClick={handleAddNote} disabled={!noteDraft.trim()}>Save note</Button>
                <div className="space-y-1.5 pt-2">
                  {notes.length === 0 && <p className="text-xs text-muted-foreground">No notes yet.</p>}
                  {notes.map((n) => (
                    <GlassCard key={n.id} className="space-y-1 p-2">
                      <button onClick={() => goToPage(n.page)} className="text-xs font-medium text-primary hover:underline">
                        Page {n.page}
                      </button>
                      <p className="text-sm">{n.text}</p>
                      <button onClick={() => user && deleteLibraryNote(user.uid, file.id, n.id)} className="text-xs text-muted-foreground hover:text-red-400">
                        Delete
                      </button>
                    </GlassCard>
                  ))}
                </div>
              </div>
            )}

            {panel === 'ai' && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">AI Study Assistant</h3>
                <p className="text-xs text-muted-foreground">
                  {selectedText ? 'Using your selected text.' : `Using page ${pageNumber}'s text.`}
                </p>
                <div className="flex flex-col gap-2">
                  <AskAiButton
                    label="Explain Simply"
                    prompt={`Explain this passage from a UPSC study book simply:\n\n${aiContext}`}
                  />
                  <AskAiButton
                    label="Explain in Hindi"
                    prompt={`\u0907\u0938 passage \u0915\u094b \u0938\u0930\u0932 \u0939िंदी \u092e\u0947\u0902 \u0938\u092e\u091d\u093e\u0913, UPSC preparation \u0915\u0947 \u0932िए:\n\n${aiContext}`}
                  />
                  <AskAiButton
                    label="Important for UPSC"
                    prompt={`What's important for UPSC prelims/mains in this passage? Be specific.\n\n${aiContext}`}
                  />
                  <AskAiButton
                    label="Make Short Notes"
                    prompt={`Convert this passage into short, exam-ready bullet notes:\n\n${aiContext}`}
                  />
                  <AskAiButton
                    label="Generate Flashcards"
                    prompt={`Create 5 Q&A flashcards from this passage:\n\n${aiContext}`}
                  />
                  <AskAiButton
                    label="Generate Quiz"
                    prompt={`Create 5 UPSC-style MCQs (with answers) from this passage:\n\n${aiContext}`}
                  />
                </div>
                {selectedText && (
                  <button onClick={() => setSelectedText('')} className="text-xs text-muted-foreground underline">
                    Clear selection, use current page instead
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom bar: page nav + zoom */}
      {isPdf && (
        <div className="flex items-center justify-center gap-3 border-t border-white/10 px-4 py-2">
          <Button variant="ghost" size="sm" onClick={() => goToPage(pageNumber - 1)} disabled={pageNumber <= 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page{' '}
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => goToPage(Number(e.target.value))}
              className="w-12 rounded border border-white/10 bg-white/5 px-1 text-center"
            />{' '}
            / {numPages || '\u2026'}
          </span>
          <Button variant="ghost" size="sm" onClick={() => goToPage(pageNumber + 1)} disabled={pageNumber >= numPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="mx-2 h-4 w-px bg-white/10" />
          <Button variant="ghost" size="sm" onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}><ZoomOut className="h-4 w-4" /></Button>
          <span className="w-10 text-center text-xs">{Math.round(scale * 100)}%</span>
          <Button variant="ghost" size="sm" onClick={() => setScale((s) => Math.min(3, s + 0.2))}><ZoomIn className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}
