'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import {
  BookOpen, Bookmark, ChevronRight, Clock3, ExternalLink, FileText, Folder,
  FolderPlus, Grid2X2, HardDrive, Image as ImageIcon, Library, List, MoreHorizontal,
  Play, Search, Sparkles, Star, Trash2, Upload, X, Zap
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { requireAuth } from '@/lib/require-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AskAiButton } from '@/components/ai/ask-ai-button';
import {
  subscribeLibraryFiles, subscribeLibraryFolders, uploadLibraryFile,
  createLibraryFolder, deleteLibraryFolder, toggleLibraryFavorite, deleteLibraryFile
} from '@/lib/mission-ias/library-service';
import { MAX_UPLOAD_SIZE_BYTES, MAX_UPLOAD_SIZE_MB, type LibraryFile, type LibraryFolder } from '@/lib/mission-ias/library-schema';
import type { UpscCategory } from '@/lib/mission-ias/current-affairs-schema';
import { OFFICIAL_RESOURCES } from '@/lib/mission-ias/official-resources';
import { getRelativeTime } from '@/utils/formatters';
import { cn } from '@/lib/utils';

const PdfReader = dynamic(() => import('@/components/library/pdf-reader'), { ssr: false });

const SUBJECTS: { id: UpscCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All' }, { id: 'polity', label: 'Polity' }, { id: 'economy', label: 'Economy' },
  { id: 'environment', label: 'Environment' }, { id: 'history' as UpscCategory, label: 'History' },
  { id: 'science-tech', label: 'Science & Tech' }, { id: 'governance', label: 'Governance' },
];

const subjectTone: Record<string, string> = {
  polity: 'from-violet-950 via-purple-900 to-fuchsia-800', economy: 'from-blue-950 via-indigo-900 to-cyan-800',
  environment: 'from-emerald-950 via-green-900 to-teal-700', history: 'from-amber-950 via-orange-900 to-red-800',
  'science-tech': 'from-slate-950 via-blue-900 to-violet-800', governance: 'from-cyan-950 via-sky-900 to-indigo-800',
  other: 'from-slate-950 via-purple-950 to-fuchsia-900',
};

function bytes(bytes: number) { return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`; }
function typeLabel(type: string) { if (type.includes('pdf')) return 'PDF'; if (type.includes('word') || type.includes('document')) return 'DOCX'; if (type.includes('presentation')) return 'PPT'; if (type.includes('image')) return 'IMAGE'; return 'FILE'; }
function isPdf(file: LibraryFile) { return file.type.includes('pdf'); }

export function DigitalLibraryPremium() {
  const { user } = useAuth();
  const [files, setFiles] = useState<LibraryFile[]>([]);
  const [folders, setFolders] = useState<LibraryFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'library' | 'official'>('library');
  const [folder, setFolder] = useState<string | 'all'>('all');
  const [subject, setSubject] = useState<UpscCategory | 'all'>('all');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sort, setSort] = useState<'newest' | 'name' | 'size'>('newest');
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<{ name: string; percent: number }[]>([]);
  const [showFolder, setShowFolder] = useState(false);
  const [folderName, setFolderName] = useState('');
  const [uploadSubject, setUploadSubject] = useState<UpscCategory>('other');
  const [reader, setReader] = useState<LibraryFile | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const a = subscribeLibraryFiles(user.uid, (items) => { setFiles(items); setLoading(false); });
    const b = subscribeLibraryFolders(user.uid, setFolders);
    return () => { a(); b(); };
  }, [user]);

  const filtered = useMemo(() => {
    let result = files;
    if (folder !== 'all') result = result.filter((f) => f.folderId === folder);
    if (subject !== 'all') result = result.filter((f) => f.subject === subject);
    if (favoritesOnly) result = result.filter((f) => f.favorite);
    if (query.trim()) { const q = query.toLowerCase().trim(); result = result.filter((f) => f.name.toLowerCase().includes(q)); }
    return [...result].sort((a, b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'size' ? b.size - a.size : b.uploadedAt - a.uploadedAt);
  }, [files, folder, subject, favoritesOnly, query, sort]);

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const favorites = files.filter((file) => file.favorite).length;
  const recent = [...files].sort((a, b) => b.uploadedAt - a.uploadedAt).slice(0, 4);
  const viewed = [...files].filter((file) => file.lastOpenedAt).sort((a, b) => (b.lastOpenedAt ?? 0) - (a.lastOpenedAt ?? 0)).slice(0, 4);

  async function upload(filesToUpload: FileList | File[]) {
    if (!requireAuth(user)) return;
    const selected = Array.from(filesToUpload).filter((file) => file.size <= MAX_UPLOAD_SIZE_BYTES);
    if (!selected.length) return toast.error(`Files must be under ${MAX_UPLOAD_SIZE_MB}MB`);
    setUploading(selected.map((file) => ({ name: file.name, percent: 0 })));
    let ok = 0;
    await Promise.all(selected.map(async (file, index) => {
      const { promise } = uploadLibraryFile(user.uid, file, { subject: uploadSubject, folderId: folder === 'all' ? null : folder }, (percent) => setUploading((items) => items.map((item, i) => i === index ? { ...item, percent } : item)));
      try { await promise; ok += 1; } catch (error) { toast.error(`Upload failed: ${file.name}`); console.error(error); }
    }));
    setUploading([]); if (ok) toast.success(`${ok} file${ok > 1 ? 's' : ''} uploaded to your library`);
  }
  async function createFolder() { if (!requireAuth(user) || !folderName.trim()) return; await createLibraryFolder(user.uid, folderName.trim()); setFolderName(''); setShowFolder(false); toast.success('Folder created'); }
  async function removeFolder(item: LibraryFolder) { if (!requireAuth(user) || !confirm(`Delete ${item.name}? Files will stay safe.`)) return; await deleteLibraryFolder(user.uid, item.id); if (folder === item.id) setFolder('all'); }
  async function toggleFavorite(file: LibraryFile) { if (!requireAuth(user)) return; await toggleLibraryFavorite(user.uid, file.id, !file.favorite); }
  async function removeFile(file: LibraryFile) { if (!requireAuth(user) || !confirm(`Delete ${file.name}?`)) return; await deleteLibraryFile(user.uid, file); toast.success('Removed from library'); }
  function openFile(file: LibraryFile) { if (isPdf(file)) setReader(file); else window.open(file.downloadUrl, '_blank', 'noopener,noreferrer'); }
  function showFolders() { document.getElementById('library-folders')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

  const uploadControl = <><input ref={inputRef} hidden multiple type="file" accept=".pdf,.epub,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.webp" onChange={(e) => { if (e.target.files) void upload(e.target.files); e.currentTarget.value = ''; }} /><input ref={cameraRef} hidden type="file" accept="image/*" capture="environment" onChange={(e) => { if (e.target.files) void upload(e.target.files); e.currentTarget.value = ''; }} /></>;

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden animate-fade-in">
      {uploadControl}
      <section className="min-w-0 rounded-[26px] border border-white/[0.08] bg-[radial-gradient(circle_at_15%_20%,rgba(139,92,246,.18),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(217,70,239,.12),transparent_35%),rgba(10,8,22,.7)] p-5 shadow-[0_25px_80px_-45px_rgba(139,92,246,.7)] sm:p-7">
        <div className="flex min-w-0 flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0"><div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-primary"><BookOpen className="h-4 w-4" /> Study Vault</div><h1 className="flex items-center gap-3 text-2xl font-bold tracking-tight sm:text-3xl"><Library className="h-7 w-7 shrink-0 text-primary" /> <span>Digital Library</span></h1><p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">Your personal study library — upload books, organise notes, and return exactly where you stopped reading.</p></div>
          <div className="grid grid-cols-2 gap-2 sm:flex"><Button variant="outline" className="w-full sm:w-auto" onClick={() => setShowFolder(true)}><FolderPlus className="h-4 w-4" /> New Folder</Button><Button variant="gradient" className="w-full sm:w-auto" onClick={() => inputRef.current?.click()}><Upload className="h-4 w-4" /> Upload Book</Button></div>
        </div>
        <div className="mt-5 flex max-w-full gap-2 overflow-x-auto pb-1"><button type="button" onClick={() => setTab('library')} className={cn('shrink-0 rounded-full border px-4 py-2 text-sm', tab === 'library' ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}>My Library</button><button type="button" onClick={() => setTab('official')} className={cn('shrink-0 rounded-full border px-4 py-2 text-sm', tab === 'official' ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}>Official Resources</button></div>
      </section>

      {tab === 'library' ? <>
        <div className="grid min-w-0 grid-cols-2 gap-3 lg:grid-cols-4">{[['Total Files', String(files.length), FileText, '+ study materials'], ['Folders', String(folders.length), Folder, 'your organisation'], ['Total Size', `${(totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`, HardDrive, 'of 10 GB used'], ['Favorites', String(favorites), Star, 'saved for quick access']].map(([label, value, Icon, hint]) => <GlassCard key={String(label)} className="relative min-w-0 overflow-hidden p-4"><div className="flex items-center justify-between gap-2"><span className="truncate text-xs text-muted-foreground">{String(label)}</span><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="h-4 w-4" /></span></div><p className="mt-3 text-2xl font-bold">{String(value)}</p><p className="truncate text-[11px] text-muted-foreground">{String(hint)}</p></GlassCard>)}</div>

        <div className="flex gap-2 overflow-x-auto pb-1 lg:hidden"><button type="button" onClick={showFolders} className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs"><Folder className="h-4 w-4 text-primary" /> Folders</button><button type="button" onClick={() => { setFavoritesOnly((v) => !v); setFolder('all'); }} className={cn('flex shrink-0 items-center gap-2 rounded-xl border px-3 py-2 text-xs', favoritesOnly ? 'border-primary/30 bg-primary/10 text-primary' : 'border-white/10 bg-white/[0.03]')}><Star className="h-4 w-4" /> Favorites {favorites}</button><button type="button" onClick={() => { setSort('newest'); setQuery(''); setFavoritesOnly(false); }} className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs"><Clock3 className="h-4 w-4" /> Recent</button><button type="button" onClick={() => cameraRef.current?.click()} className="flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs"><ImageIcon className="h-4 w-4" /> Scan</button></div>

        <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-4">
            <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); void upload(e.dataTransfer.files); }} className={cn('min-w-0 rounded-2xl border border-dashed p-5 text-center transition-all sm:p-7', dragging ? 'border-primary bg-primary/10 shadow-[0_0_45px_-15px_rgba(139,92,246,.8)]' : 'border-white/15 bg-white/[0.02]')}>
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Upload className="h-6 w-6" /></div><p className="mt-3 font-semibold break-words">Drop your books and study material here</p><p className="mx-auto mt-1 max-w-xl text-sm leading-5 text-muted-foreground">PDF, EPUB, Word, PowerPoint, images and text · up to {MAX_UPLOAD_SIZE_MB}MB each</p><div className="mt-4 flex flex-wrap justify-center gap-2"><Button variant="gradient" size="sm" onClick={() => inputRef.current?.click()}>Browse Files</Button><Button variant="outline" size="sm" onClick={() => cameraRef.current?.click()}><ImageIcon className="h-4 w-4" /> Scan</Button></div>
              {uploading.length > 0 && <div className="mx-auto mt-5 max-w-xl space-y-2 text-left">{uploading.map((item) => <div key={item.name}><div className="mb-1 flex justify-between gap-2 text-xs"><span className="min-w-0 truncate">{item.name}</span><span>{item.percent}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-brand transition-all" style={{ width: `${item.percent}%` }} /></div></div>)}</div>}
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-2"><div className="relative min-w-0 flex-1 basis-full sm:basis-[240px]"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search books, notes, PDFs..." className="bg-white/[0.03] pl-9" /></div><select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="h-10 rounded-md border border-white/10 bg-background px-3 text-sm"><option value="newest">Newest</option><option value="name">Name</option><option value="size">Size</option></select><button type="button" onClick={() => setView('grid')} className={cn('rounded-lg p-2', view === 'grid' ? 'bg-primary/15 text-primary' : 'text-muted-foreground')} aria-label="Grid view"><Grid2X2 className="h-4 w-4" /></button><button type="button" onClick={() => setView('list')} className={cn('rounded-lg p-2', view === 'list' ? 'bg-primary/15 text-primary' : 'text-muted-foreground')} aria-label="List view"><List className="h-4 w-4" /></button></div>
            <div className="flex gap-2 overflow-x-auto pb-1">{SUBJECTS.map((item) => <button key={item.label} type="button" onClick={() => setSubject(item.id)} className={cn('shrink-0 rounded-xl border px-4 py-2 text-xs font-medium', subject === item.id ? 'border-primary/40 bg-primary/15 text-primary' : 'border-white/10 bg-white/[0.02] text-muted-foreground')}>{item.label}<span className="ml-2 opacity-60">{item.id === 'all' ? files.length : files.filter((f) => f.subject === item.id).length}</span></button>)}</div>
            {loading ? <GlassCard><p className="text-sm text-muted-foreground">Loading your library...</p></GlassCard> : filtered.length === 0 ? <GlassCard className="py-12 text-center"><BookOpen className="mx-auto h-8 w-8 text-muted-foreground" /><p className="mt-3 font-semibold">{favoritesOnly ? 'No favorite files yet' : 'Your library is ready for its first book'}</p><p className="mt-1 text-sm text-muted-foreground">{favoritesOnly ? 'Star a book to save it for quick access.' : 'Upload a PDF or drag your study material here.'}</p></GlassCard> : <div className={cn(view === 'grid' ? 'grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-2')}>{filtered.map((file) => { const tone = subjectTone[file.subject ?? 'other']; return view === 'grid' ? <GlassCard key={file.id} className="group min-w-0 overflow-hidden p-0"><button type="button" onClick={() => openFile(file)} className={cn('relative flex h-44 w-full items-end overflow-hidden bg-gradient-to-br p-4 text-left', tone)}><div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_25%,rgba(255,255,255,.18),transparent_28%)]" /><div className="relative w-full"><span className="rounded-md bg-black/35 px-2 py-1 text-[10px] font-bold text-white backdrop-blur">{typeLabel(file.type)}</span><p className="mt-3 line-clamp-2 break-words text-lg font-bold text-white drop-shadow">{file.name.replace(/\.[^.]+$/, '')}</p></div><span className="absolute right-3 top-3 rounded-full bg-black/25 p-2 text-white/80 backdrop-blur"><Play className="h-4 w-4" /></span></button><div className="p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><p className="line-clamp-1 text-sm font-semibold">{file.name}</p><p className="mt-1 text-xs text-muted-foreground">{bytes(file.size)} · {getRelativeTime(new Date(file.uploadedAt))}</p></div><button type="button" onClick={() => void toggleFavorite(file)} className={cn('rounded-lg p-1.5', file.favorite ? 'text-amber-300' : 'text-muted-foreground')}><Star className="h-4 w-4" fill={file.favorite ? 'currentColor' : 'none'} /></button></div><div className="mt-3 flex items-center justify-between"><span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-muted-foreground">{file.subject ?? 'Other'}</span><div className="flex gap-1"><button type="button" onClick={() => void removeFile(file)} className="rounded-lg p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-400"><Trash2 className="h-3.5 w-3.5" /></button><button type="button" onClick={() => openFile(file)} className="rounded-lg p-2 text-primary hover:bg-primary/10"><ChevronRight className="h-4 w-4" /></button></div></div></div></GlassCard> : <GlassCard key={file.id} className="flex min-w-0 items-center gap-3 p-3"><div className={cn('grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br text-white', tone)}><FileText className="h-5 w-5" /></div><button type="button" onClick={() => openFile(file)} className="min-w-0 flex-1 text-left"><p className="truncate text-sm font-semibold">{file.name}</p><p className="text-xs text-muted-foreground">{bytes(file.size)} · {file.subject ?? 'Other'}</p></button><button type="button" onClick={() => void toggleFavorite(file)} className={cn('p-2', file.favorite ? 'text-amber-300' : 'text-muted-foreground')}><Star className="h-4 w-4" fill={file.favorite ? 'currentColor' : 'none'} /></button><button type="button" onClick={() => void removeFile(file)} className="p-2 text-muted-foreground hover:text-red-400"><Trash2 className="h-4 w-4" /></button></GlassCard>; })}</div>}
          </div>

          <aside className="space-y-4">
            <GlassCard className="p-4"><div className="flex items-center justify-between"><h2 className="font-semibold">Quick Actions</h2><Zap className="h-4 w-4 text-primary" /></div><div className="mt-3 space-y-2"><button type="button" onClick={() => setShowFolder(true)} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left hover:bg-white/[0.06]"><FolderPlus className="h-5 w-5 text-amber-300" /><span><b className="block text-sm">Create New Folder</b><small className="text-xs text-muted-foreground">Organise your books better</small></span><ChevronRight className="ml-auto h-4 w-4" /></button><button type="button" onClick={() => inputRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left hover:bg-white/[0.06]"><Upload className="h-5 w-5 text-emerald-300" /><span><b className="block text-sm">Upload Files</b><small className="text-xs text-muted-foreground">Add study material</small></span><ChevronRight className="ml-auto h-4 w-4" /></button><button type="button" onClick={() => cameraRef.current?.click()} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left hover:bg-white/[0.06]"><ImageIcon className="h-5 w-5 text-violet-300" /><span><b className="block text-sm">Scan Document</b><small className="text-xs text-muted-foreground">Capture from camera</small></span><ChevronRight className="ml-auto h-4 w-4" /></button></div></GlassCard>
            <GlassCard id="library-folders" className="scroll-mt-20 p-4"><div className="flex items-center justify-between"><h2 className="font-semibold">Folders</h2><span className="text-xs text-muted-foreground">{folders.length}</span></div><div className="mt-3 space-y-1"><button type="button" onClick={() => setFolder('all')} className={cn('flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm', folder === 'all' ? 'bg-primary/10 text-primary' : 'hover:bg-white/5')}><Folder className="h-4 w-4" /> All Files <span className="ml-auto text-xs opacity-60">{files.length}</span></button>{folders.map((item) => <div key={item.id} className="flex items-center gap-1"><button type="button" onClick={() => setFolder(item.id)} className={cn('flex min-w-0 flex-1 items-center gap-2 rounded-lg px-3 py-2 text-left text-sm', folder === item.id ? 'bg-primary/10 text-primary' : 'hover:bg-white/5')}><Folder className="h-4 w-4 shrink-0" /><span className="truncate">{item.name}</span><span className="ml-auto text-xs opacity-60">{files.filter((f) => f.folderId === item.id).length}</span></button><button type="button" onClick={() => void removeFolder(item)} className="p-2 text-muted-foreground hover:text-red-400"><Trash2 className="h-3 w-3" /></button></div>)}</div></GlassCard>
            <GlassCard className="p-4"><h2 className="font-semibold">Recent Uploads</h2><div className="mt-3 space-y-2">{recent.length ? recent.map((file) => <button key={file.id} type="button" onClick={() => openFile(file)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/5"><div className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/10 text-red-300"><FileText className="h-4 w-4" /></div><span className="min-w-0 flex-1"><b className="block truncate text-xs">{file.name}</b><small className="text-[10px] text-muted-foreground">{bytes(file.size)} · {getRelativeTime(new Date(file.uploadedAt))}</small></span></button>) : <p className="text-xs text-muted-foreground">No uploads yet.</p>}</div></GlassCard>
            <GlassCard className="p-4"><h2 className="font-semibold">Recently Viewed</h2><div className="mt-3 space-y-2">{viewed.length ? viewed.map((file) => <button key={file.id} type="button" onClick={() => openFile(file)} className="flex w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-white/5"><Clock3 className="h-4 w-4 text-primary" /><span className="min-w-0 flex-1 truncate text-xs">{file.name}</span><ChevronRight className="h-3 w-3 text-muted-foreground" /></button>) : <p className="text-xs text-muted-foreground">Open a book to build your reading history.</p>}</div></GlassCard>
            <GlassCard className="border-primary/20 bg-primary/[0.05] p-4"><div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><h2 className="font-semibold">AI Study Vault</h2></div><p className="mt-2 text-xs text-muted-foreground">Turn study material into notes, flashcards, quizzes, or UPSC revision points.</p><AskAiButton className="mt-3" label="Ask AI to help me study" prompt="Help me organise my digital library study material into a practical UPSC revision plan." /></GlassCard>
          </aside>
        </div>
      </> : <div className="min-w-0 space-y-4"><div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search official resources..." className="bg-white/[0.03] pl-9" /></div><p className="text-xs leading-5 text-muted-foreground">Official resources stay linked to their original government or institutional source. StudySphere does not re-host copyrighted books.</p><div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{OFFICIAL_RESOURCES.map((item) => <GlassCard key={item.id} className="flex h-full min-w-0 flex-col"><div className="mb-3 flex items-center justify-between"><span className="rounded-full bg-primary/10 px-2 py-1 text-[10px] font-semibold text-primary">{item.type}</span><ExternalLink className="h-4 w-4 text-muted-foreground" /></div><h3 className="text-base font-semibold">{item.title}</h3><p className="mt-1 flex-1 text-sm text-muted-foreground">{item.description}</p><a href={item.url} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary">Open source <ExternalLink className="h-3.5 w-3.5" /></a></GlassCard>)}</div></div>}

      {showFolder && <div className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-2xl border border-white/10 bg-background p-5 shadow-2xl"><div className="flex items-center justify-between"><h2 className="font-semibold">Create folder</h2><button type="button" onClick={() => setShowFolder(false)} aria-label="Close"><X className="h-5 w-5 text-muted-foreground" /></button></div><Input autoFocus value={folderName} onChange={(e) => setFolderName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') void createFolder(); }} placeholder="e.g. Polity" className="mt-4" /><div className="mt-4 flex justify-end gap-2"><Button variant="outline" onClick={() => setShowFolder(false)}>Cancel</Button><Button variant="gradient" onClick={() => void createFolder()}>Create</Button></div></div></div>}
      {reader && <PdfReader file={reader} onClose={() => setReader(null)} />}
    </div>
  );
}
