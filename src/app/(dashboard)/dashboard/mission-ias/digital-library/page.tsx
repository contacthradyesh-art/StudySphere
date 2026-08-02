'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Upload, FolderPlus, Search, Star, Trash2, ExternalLink, FileText,
  Image as ImageIcon, Presentation, File as FileIcon, Library, X, LayoutGrid, List
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  subscribeLibraryFiles, subscribeLibraryFolders, uploadLibraryFile,
  createLibraryFolder, deleteLibraryFolder, toggleLibraryFavorite, deleteLibraryFile
} from '@/lib/mission-ias/library-service';
import type { LibraryFile, LibraryFolder } from '@/lib/mission-ias/library-schema';
import type { UpscCategory } from '@/lib/mission-ias/current-affairs-schema';

const SUBJECT_LABELS: Record<UpscCategory, string> = {
  polity: 'Polity', economy: 'Economy', 'international-relations': 'Int\u2019l Relations',
  environment: 'Environment', 'science-tech': 'Science & Tech', security: 'Security',
  governance: 'Governance', agriculture: 'Agriculture', 'social-issues': 'Social Issues', other: 'Other'
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIconFor(type: string) {
  if (type.includes('pdf')) return FileText;
  if (type.includes('image')) return ImageIcon;
  if (type.includes('presentation') || type.includes('powerpoint')) return Presentation;
  if (type.includes('word') || type.includes('document')) return FileText;
  return FileIcon;
}

export default function DigitalLibraryPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'library' | 'official'>('library');
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFolder, setActiveFolder] = useState<string | 'all'>('all');
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<UpscCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'name' | 'size'>('newest');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [uploading, setUploading] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [uploadSubject, setUploadSubject] = useState<UpscCategory>('other');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const unsubFiles = subscribeLibraryFiles(user.uid, (f) => { setFiles(f); setLoading(false); });
    const unsubFolders = subscribeLibraryFolders(user.uid, setFolders);
    return () => { unsubFiles(); unsubFolders(); };
  }, [user]);

  const filtered = useMemo(() => {
    let result = files;
    if (activeFolder !== 'all') result = result.filter((f) => f.folderId === activeFolder);
    if (subjectFilter !== 'all') result = result.filter((f) => f.subject === subjectFilter);
    if (search.trim()) result = result.filter((f) => f.name.toLowerCase().includes(search.trim().toLowerCase()));
    const sorted = [...result];
    if (sortBy === 'newest') sorted.sort((a, b) => b.uploadedAt - a.uploadedAt);
    if (sortBy === 'name') sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'size') sorted.sort((a, b) => b.size - a.size);
    return sorted;
  }, [files, activeFolder, subjectFilter, search, sortBy]);

  const totalSize = useMemo(() => files.reduce((sum, f) => sum + f.size, 0), [files]);
  const favoritesCount = useMemo(() => files.filter((f) => f.favorite).length, [files]);

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !requireAuth(user)) return;
    if (file.size > 25 * 1024 * 1024) { toast.error('File must be under 25MB'); return; }
    setUploading(true);
    try {
      await uploadLibraryFile(user.uid, file, {
        subject: uploadSubject,
        folderId: activeFolder === 'all' ? null : activeFolder
      });
      toast.success('Uploaded to your library');
    } catch {
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }
  async function handleDeleteFolder(folder: LibraryFolder, e: React.MouseEvent) {
    e.stopPropagation();
    if (!requireAuth(user)) return;
    if (!confirm(`Delete "${folder.name}"? Files inside will move to All Files, not be deleted.`)) return;
    try {
      if (activeFolder === folder.id) setActiveFolder('all');
      await deleteLibraryFolder(user.uid, folder.id);
      toast.success('Folder deleted');
    } catch {
      toast.error('Could not delete folder');
    }
  }

  async function handleCreateFolder() {

  async function handleCreateFolder() {
    if (!requireAuth(user) || !newFolderName.trim()) return;
    try {
      await createLibraryFolder(user.uid, newFolderName.trim());
      toast.success('Folder created');
      setNewFolderName('');
      setShowNewFolder(false);
    } catch {
      toast.error('Could not create folder');
    }
  }

  async function handleToggleFavorite(file: LibraryFile) {
    if (!requireAuth(user)) return;
    await toggleLibraryFavorite(user.uid, file.id, !file.favorite);
  }

  async function handleDelete(file: LibraryFile) {
    if (!requireAuth(user)) return;
    try {
      await deleteLibraryFile(user.uid, file);
      toast.success('File deleted');
    } catch {
      toast.error('Could not delete file');
    }
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Library className="h-6 w-6 text-primary" /> Digital Library
          </h1>
          <p className="text-sm text-muted-foreground">Your personal study library — upload, organize, and revisit your material.</p>
        </div>
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileChosen} accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg" />
          <Button variant="outline" size="sm" onClick={() => setShowNewFolder(true)}>
            <FolderPlus className="h-4 w-4" /> New Folder
          </Button>
          <Button
            variant="gradient" size="sm"
            disabled={uploading}
            onClick={() => {
              if (!requireAuth(user)) return;
              fileInputRef.current?.click();
            }}
          >
            <Upload className="h-4 w-4" /> {uploading ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={() => setTab('library')}
          className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors', tab === 'library' ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}
        >
          My Library
        </button>
        <button
          onClick={() => setTab('official')}
          className={cn('rounded-full border px-3 py-1 text-xs font-medium transition-colors', tab === 'official' ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}
        >
          Official Resources
        </button>
      </div>

      {tab === 'official' ? (
        <GlassCard>
          <p className="text-sm text-muted-foreground">
            🚧 Curated official resources (NCERT, PIB archives, Yojana, etc.) are planned for a future phase — not built yet.
          </p>
        </GlassCard>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Total Files</p><p className="text-xl font-bold">{files.length}</p></GlassCard>
            <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Total Size</p><p className="text-xl font-bold">{formatBytes(totalSize)}</p></GlassCard>
            <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Folders</p><p className="text-xl font-bold">{folders.length}</p></GlassCard>
            <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Favorites</p><p className="text-xl font-bold">{favoritesCount}</p></GlassCard>
          </div>

          <div className="overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex w-fit gap-1.5">
              <button
                onClick={() => setActiveFolder('all')}
                className={cn('whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium', activeFolder === 'all' ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}
              >
                All Files
              </button>
             {folders.map((f) => (
                <span
                  key={f.id}
                  className={cn('group flex items-center gap-1 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium', activeFolder === f.id ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}
                >
                  <button onClick={() => setActiveFolder(f.id)}>{f.name}</button>
                  <button onClick={(e) => handleDeleteFolder(f, e)} className="text-muted-foreground/60 hover:text-red-400" aria-label={`Delete ${f.name}`}>
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search files..."
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            <select value={subjectFilter} onChange={(e) => setSubjectFilter(e.target.value as UpscCategory | 'all')} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs">
              <option value="all">All Subjects</option>
              {(Object.keys(SUBJECT_LABELS) as UpscCategory[]).map((s) => <option key={s} value={s}>{SUBJECT_LABELS[s]}</option>)}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs">
              <option value="newest">Sort: Newest</option>
              <option value="name">Sort: Name</option>
              <option value="size">Sort: Size</option>
            </select>
            <div className="flex gap-1 rounded-lg border border-white/10 p-0.5">
              <button onClick={() => setView('grid')} className={cn('rounded p-1.5', view === 'grid' && 'bg-primary/20 text-primary')}><LayoutGrid className="h-3.5 w-3.5" /></button>
              <button onClick={() => setView('list')} className={cn('rounded p-1.5', view === 'list' && 'bg-primary/20 text-primary')}><List className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          {loading && <GlassCard><p className="text-sm text-muted-foreground">Loading your library...</p></GlassCard>}

          {!loading && filtered.length === 0 && (
            <GlassCard><p className="text-sm text-muted-foreground">No files here yet. Tap Upload to add your first one.</p></GlassCard>
          )}

          <div className={cn(view === 'grid' ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4' : 'space-y-2')}>
            {filtered.map((file) => {
              const Icon = fileIconFor(file.type);
              return (
                <GlassCard key={file.id} className={cn('space-y-2', view === 'list' && 'flex flex-row items-center gap-3 space-y-0')}>
                  <div className={cn('flex items-center gap-2', view === 'grid' && 'justify-between')}>
                    <Icon className="h-8 w-8 shrink-0 text-primary" />
                    {view === 'list' && (
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{file.name}</p>
                        <p className="text-xs text-muted-foreground">{file.subject ? SUBJECT_LABELS[file.subject] : 'Uncategorized'} \u00b7 {formatBytes(file.size)}</p>
                      </div>
                    )}
                    <button onClick={() => handleToggleFavorite(file)} className="shrink-0">
                      <Star className={cn('h-4 w-4', file.favorite ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                    </button>
                  </div>
                  {view === 'grid' && (
                    <div>
                      <p className="truncate text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{file.subject ? SUBJECT_LABELS[file.subject] : 'Uncategorized'} \u00b7 {formatBytes(file.size)}</p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 pt-1">
                    <a href={file.downloadUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> Open
                    </a>
                    <button onClick={() => handleDelete(file)} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-red-400">
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </div>
                </GlassCard>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>Uploading as:</span>
            <select value={uploadSubject} onChange={(e) => setUploadSubject(e.target.value as UpscCategory)} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs">
              {(Object.keys(SUBJECT_LABELS) as UpscCategory[]).map((s) => <option key={s} value={s}>{SUBJECT_LABELS[s]}</option>)}
            </select>
            <span>(applies to your next upload{activeFolder !== 'all' ? ', into the selected folder' : ''})</span>
          </div>
        </>
      )}

      {showNewFolder && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm" onClick={() => setShowNewFolder(false)}>
          <div onClick={(e) => e.stopPropagation()} className="glass w-full max-w-sm space-y-3 rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">New folder</h3>
              <button onClick={() => setShowNewFolder(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
            </div>
            <Input value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} placeholder="e.g. Polity" autoFocus />
            <Button variant="gradient" className="w-full" onClick={handleCreateFolder}>Create</Button>
          </div>
        </div>
      )}
    </div>
  );
}