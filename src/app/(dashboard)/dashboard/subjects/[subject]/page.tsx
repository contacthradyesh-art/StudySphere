"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
}

interface FileMetadata {
  id: string;
  name: string;
  type: "pdf" | "docx" | "image" | "other";
  size: number;
  uploadedAt: string;
  dataUrl?: string;
}

interface Flashcard {
  id: string;
  front: string;
  back: string;
  createdAt: string;
  mastered: boolean;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number;
}

interface QuizResult {
  id: string;
  score: number;
  total: number;
  completedAt: string;
  accuracy: number;
}

interface Chapter {
  id: string;
  title: string;
  completed: boolean;
  addedAt: string;
}

interface WeeklyActivity {
  day: string;
  minutes: number;
}

interface SubjectData {
  files: FileMetadata[];
  flashcards: Flashcard[];
  quizResults: QuizResult[];
  chapters: Chapter[];
  studyHours: number;
  revisionCount: number;
  xp: number;
  weeklyActivity: WeeklyActivity[];
  strongTopics: string[];
  weakTopics: string[];
}

// ─── Minimal store hooks (replace with real imports) ─────────────────────────

function useNotesStore(subject: string) {
  const [notes, setNotes] = useState<Note[]>(() => {
    if (typeof window === "undefined") return [];
    const raw = localStorage.getItem(`notes_${subject}`);
    return raw ? JSON.parse(raw) : [];
  });

  const addNote = useCallback(
    (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
      const n: Note = {
        ...note,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => {
        const updated = [n, ...prev];
        localStorage.setItem(`notes_${subject}`, JSON.stringify(updated));
        return updated;
      });
    },
    [subject]
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => {
        const updated = prev.filter((n) => n.id !== id);
        localStorage.setItem(`notes_${subject}`, JSON.stringify(updated));
        return updated;
      });
    },
    [subject]
  );

  return { notes, addNote, deleteNote };
}

function useNotesSync(_subject: string) {
  return { syncing: false, lastSynced: null };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SUBJECT_ICONS: Record<string, string> = {
  mathematics: "📐",
  math: "📐",
  physics: "⚛️",
  chemistry: "🧪",
  biology: "🧬",
  history: "📜",
  geography: "🌍",
  english: "📖",
  hindi: "🗣️",
  science: "🔬",
  computer: "💻",
  economics: "📊",
  political: "🏛️",
  default: "📚",
};

function getSubjectIcon(name: string): string {
  const lower = name.toLowerCase();
  for (const key of Object.keys(SUBJECT_ICONS)) {
    if (lower.includes(key)) return SUBJECT_ICONS[key];
  }
  return SUBJECT_ICONS.default;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function loadSubjectData(subject: string): SubjectData {
  if (typeof window === "undefined")
    return {
      files: [],
      flashcards: [],
      quizResults: [],
      chapters: [],
      studyHours: 0,
      revisionCount: 0,
      xp: 0,
      weeklyActivity: [],
      strongTopics: [],
      weakTopics: [],
    };
  const raw = localStorage.getItem(`subject_data_${subject}`);
  if (raw) return JSON.parse(raw);
  return {
    files: [],
    flashcards: [],
    quizResults: [],
    chapters: [],
    studyHours: 0,
    revisionCount: 0,
    xp: 0,
    weeklyActivity: [
      { day: "Mon", minutes: 0 },
      { day: "Tue", minutes: 0 },
      { day: "Wed", minutes: 0 },
      { day: "Thu", minutes: 0 },
      { day: "Fri", minutes: 0 },
      { day: "Sat", minutes: 0 },
      { day: "Sun", minutes: 0 },
    ],
    strongTopics: [],
    weakTopics: [],
  };
}

function saveSubjectData(subject: string, data: SubjectData) {
  localStorage.setItem(`subject_data_${subject}`, JSON.stringify(data));
}

function getLevel(xp: number): { level: number; title: string; next: number } {
  const thresholds = [0, 100, 300, 600, 1000, 1500, 2200, 3000, 4000, 5500];
  const titles = [
    "Beginner",
    "Explorer",
    "Learner",
    "Scholar",
    "Adept",
    "Expert",
    "Master",
    "Elite",
    "Legend",
    "Sage",
  ];
  let level = 0;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) {
      level = i;
      break;
    }
  }
  return {
    level: level + 1,
    title: titles[level],
    next: thresholds[Math.min(level + 1, thresholds.length - 1)],
  };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}
    >
      {label}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="relative bg-[#111827] border border-[#1f2937] rounded-2xl p-5 flex flex-col gap-2 overflow-hidden group hover:border-[#6366f1]/50 transition-all duration-300">
      <div
        className={`absolute -top-4 -right-4 w-20 h-20 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity ${accent ?? "bg-indigo-500"}`}
      />
      <span className="text-2xl">{icon}</span>
      <p className="text-gray-400 text-xs uppercase tracking-widest font-medium">
        {label}
      </p>
      <p className="text-white text-2xl font-bold">{value}</p>
      {sub && <p className="text-gray-500 text-xs">{sub}</p>}
    </div>
  );
}

function FlashcardItem({
  card,
  onDelete,
  onToggleMaster,
}: {
  card: Flashcard;
  onDelete: () => void;
  onToggleMaster: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="cursor-pointer"
      style={{ perspective: "1000px" }}
      onClick={() => setFlipped((f) => !f)}
    >
      <div
        className="relative w-full h-40 transition-transform duration-500"
        style={{
          transformStyle: "preserve-3d",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#1a1f2e] to-[#111827] border border-[#1f2937] rounded-2xl p-4 flex flex-col justify-between"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-white text-sm font-medium leading-relaxed flex-1">
              {card.front}
            </p>
            <span className="text-indigo-400 text-xs font-bold mt-0.5 shrink-0">
              Q
            </span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-600 text-xs">Tap to flip</span>
            <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={onToggleMaster}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                  card.mastered
                    ? "border-emerald-500/50 text-emerald-400"
                    : "border-gray-700 text-gray-500 hover:border-emerald-500/50 hover:text-emerald-400"
                }`}
              >
                {card.mastered ? "✓ Mastered" : "Mark mastered"}
              </button>
              <button
                onClick={onDelete}
                className="text-xs text-red-500 hover:text-red-400 transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
        {/* Back */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-[#1a1f2e] to-[#0f172a] border border-indigo-500/30 rounded-2xl p-4 flex flex-col justify-between"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-indigo-200 text-sm leading-relaxed flex-1">
              {card.back}
            </p>
            <span className="text-indigo-400 text-xs font-bold mt-0.5 shrink-0">
              A
            </span>
          </div>
          <span className="text-gray-600 text-xs">Tap to flip back</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const subjectSlug = (params?.subject as string) ?? "subject";
  const subjectName = subjectSlug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const { notes, addNote, deleteNote } = useNotesStore(subjectSlug);
  useNotesSync(subjectSlug);

  const [data, setData] = useState<SubjectData>(() =>
    loadSubjectData(subjectSlug)
  );
  const [activeTab, setActiveTab] = useState("overview");

  // Files
  const [fileSearch, setFileSearch] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Notes
  const [noteSearch, setNoteSearch] = useState("");
  const [showAddNote, setShowAddNote] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");

  // Flashcards
  const [newFront, setNewFront] = useState("");
  const [newBack, setNewBack] = useState("");

  // Quiz
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [quizRunning, setQuizRunning] = useState(false);
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [quizDone, setQuizDone] = useState(false);
  const [newQText, setNewQText] = useState("");
  const [newQOptions, setNewQOptions] = useState(["", "", "", ""]);
  const [newQCorrect, setNewQCorrect] = useState(0);

  // Chapters
  const [newChapter, setNewChapter] = useState("");

  // AI
  const [aiTool, setAiTool] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");

  // Weak/Strong topics
  const [newWeakTopic, setNewWeakTopic] = useState("");
  const [newStrongTopic, setNewStrongTopic] = useState("");

  const persist = useCallback(
    (update: Partial<SubjectData>) => {
      setData((prev) => {
        const next = { ...prev, ...update };
        saveSubjectData(subjectSlug, next);
        return next;
      });
    },
    [subjectSlug]
  );

  // Computed stats
  const completedChapters = data.chapters.filter((c) => c.completed).length;
  const completionPct =
    data.chapters.length > 0
      ? Math.round((completedChapters / data.chapters.length) * 100)
      : 0;

  const avgAccuracy = useMemo(() => {
    if (!data.quizResults.length) return 0;
    return Math.round(
      data.quizResults.reduce((s, r) => s + r.accuracy, 0) /
        data.quizResults.length
    );
  }, [data.quizResults]);

  const { level, title: levelTitle, next: nextXp } = getLevel(data.xp);
  const xpPct = Math.min(100, Math.round((data.xp / nextXp) * 100));

  const streak = Math.min(
    7,
    data.weeklyActivity.filter((d) => d.minutes > 0).length
  );

  // ── File Upload ──────────────────────────────────────────────────────────────

  const processFiles = useCallback(
    async (files: FileList | File[]) => {
      const arr = Array.from(files);
      const newMeta: FileMetadata[] = [];
      for (const f of arr) {
        const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
        const type: FileMetadata["type"] =
          ext === "pdf"
            ? "pdf"
            : ext === "docx"
            ? "docx"
            : ["jpg", "jpeg", "png", "gif", "webp"].includes(ext)
            ? "image"
            : "other";
        const dataUrl = await new Promise<string>((res) => {
          const reader = new FileReader();
          reader.onload = (e) => res(e.target?.result as string);
          reader.readAsDataURL(f);
        });
        newMeta.push({
          id: crypto.randomUUID(),
          name: f.name,
          type,
          size: f.size,
          uploadedAt: new Date().toISOString(),
          dataUrl,
        });
      }
      persist({
        files: [...newMeta, ...data.files],
        xp: data.xp + newMeta.length * 10,
      });
    },
    [data.files, data.xp, persist]
  );

  const deleteFile = (id: string) =>
    persist({ files: data.files.filter((f) => f.id !== id) });

  const renameFile = (id: string) => {
    const file = data.files.find((f) => f.id === id);
    if (!file) return;
    const name = prompt("Rename file:", file.name);
    if (name)
      persist({
        files: data.files.map((f) => (f.id === id ? { ...f, name } : f)),
      });
  };

  const filteredFiles = data.files.filter((f) =>
    f.name.toLowerCase().includes(fileSearch.toLowerCase())
  );

  // ── Notes ────────────────────────────────────────────────────────────────────

  const filteredNotes = notes.filter(
    (n) =>
      n.title.toLowerCase().includes(noteSearch.toLowerCase()) ||
      n.content.toLowerCase().includes(noteSearch.toLowerCase())
  );

  const handleAddNote = () => {
    if (!newNoteTitle.trim()) return;
    addNote({ title: newNoteTitle, content: newNoteContent });
    persist({ xp: data.xp + 15, revisionCount: data.revisionCount + 1 });
    setNewNoteTitle("");
    setNewNoteContent("");
    setShowAddNote(false);
  };

  // ── Flashcards ───────────────────────────────────────────────────────────────

  const addFlashcard = () => {
    if (!newFront.trim() || !newBack.trim()) return;
    const card: Flashcard = {
      id: crypto.randomUUID(),
      front: newFront,
      back: newBack,
      createdAt: new Date().toISOString(),
      mastered: false,
    };
    persist({
      flashcards: [card, ...data.flashcards],
      xp: data.xp + 5,
    });
    setNewFront("");
    setNewBack("");
  };

  const toggleMaster = (id: string) =>
    persist({
      flashcards: data.flashcards.map((c) =>
        c.id === id ? { ...c, mastered: !c.mastered } : c
      ),
    });

  const deleteFlashcard = (id: string) =>
    persist({ flashcards: data.flashcards.filter((c) => c.id !== id) });

  // ── Quiz ─────────────────────────────────────────────────────────────────────

  const addQuestion = () => {
    if (!newQText.trim() || newQOptions.some((o) => !o.trim())) return;
    setQuizQuestions((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        question: newQText,
        options: [...newQOptions],
        correct: newQCorrect,
      },
    ]);
    setNewQText("");
    setNewQOptions(["", "", "", ""]);
    setNewQCorrect(0);
  };

  const startQuiz = () => {
    if (!quizQuestions.length) return;
    setQuizIndex(0);
    setQuizAnswers([]);
    setQuizDone(false);
    setQuizRunning(true);
  };

  const answerQuestion = (idx: number) => {
    const answers = [...quizAnswers, idx];
    if (quizIndex + 1 >= quizQuestions.length) {
      const score = answers.filter(
        (a, i) => a === quizQuestions[i].correct
      ).length;
      const accuracy = Math.round((score / quizQuestions.length) * 100);
      const result: QuizResult = {
        id: crypto.randomUUID(),
        score,
        total: quizQuestions.length,
        accuracy,
        completedAt: new Date().toISOString(),
      };
      persist({
        quizResults: [result, ...data.quizResults],
        xp: data.xp + score * 20,
      });
      setQuizAnswers(answers);
      setQuizRunning(false);
      setQuizDone(true);
    } else {
      setQuizAnswers(answers);
      setQuizIndex((i) => i + 1);
    }
  };

  // ── Chapters ─────────────────────────────────────────────────────────────────

  const addChapter = () => {
    if (!newChapter.trim()) return;
    const ch: Chapter = {
      id: crypto.randomUUID(),
      title: newChapter,
      completed: false,
      addedAt: new Date().toISOString(),
    };
    persist({ chapters: [...data.chapters, ch] });
    setNewChapter("");
  };

  const toggleChapter = (id: string) =>
    persist({
      chapters: data.chapters.map((c) =>
        c.id === id ? { ...c, completed: !c.completed } : c
      ),
      xp: data.xp + 25,
    });

  const deleteChapter = (id: string) =>
    persist({ chapters: data.chapters.filter((c) => c.id !== id) });

  // ── AI Tool ──────────────────────────────────────────────────────────────────

  const runAiTool = async (tool: string, prompt: string) => {
    setAiTool(tool);
    setAiLoading(true);
    setAiResult("");
    const notesContext = notes
      .slice(0, 5)
      .map((n) => `${n.title}: ${n.content}`)
      .join("\n");

    const systemMap: Record<string, string> = {
      summarize: `Summarize the following study notes for ${subjectName} concisely in 5-8 bullet points. Be precise and use student-friendly language.`,
      quiz: `Generate 5 multiple choice quiz questions for ${subjectName} based on the notes. Format as numbered list with options A-D and mark correct answer.`,
      flashcards: `Create 6 flashcard pairs (Q&A) for ${subjectName} from the notes. Format as: Q: ... | A: ...`,
      keypoints: `Extract the 8 most important key points from these ${subjectName} notes. Use bullet points, be crisp.`,
      explain: `Explain the topic "${prompt || subjectName}" in simple, student-friendly language with examples. Keep it under 200 words.`,
    };

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 1000,
          system: systemMap[tool] ?? systemMap.explain,
          messages: [
            {
              role: "user",
              content:
                tool === "explain"
                  ? prompt || `Explain ${subjectName} basics`
                  : `Notes:\n${notesContext || `[No notes yet — generate generic content for ${subjectName}]`}`,
            },
          ],
        }),
      });
      const json = await res.json();
      const text =
        json.content?.find((b: { type: string }) => b.type === "text")?.text ??
        "No response received.";
      setAiResult(text);
      persist({ xp: data.xp + 30 });
    } catch {
      setAiResult("Failed to connect to AI. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Tabs ─────────────────────────────────────────────────────────────────────

  const TABS = [
    { id: "overview", label: "Overview", icon: "🏠" },
    { id: "notes", label: "Notes", icon: "📝" },
    { id: "files", label: "Files", icon: "📁" },
    { id: "flashcards", label: "Flashcards", icon: "🃏" },
    { id: "quiz", label: "Quiz", icon: "🧠" },
    { id: "analytics", label: "Analytics", icon: "📊" },
  ];

  const subjectIcon = getSubjectIcon(subjectName);

  const maxActivity = Math.max(...data.weeklyActivity.map((d) => d.minutes), 1);

  return (
    <div className="min-h-screen bg-[#080c14] text-white font-sans">
      {/* Background grid */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(99,102,241,0.08) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(168,85,247,0.06) 0%, transparent 50%)",
        }}
      />
      <div
        className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* ── Back nav ── */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
        >
          <span className="group-hover:-translate-x-0.5 transition-transform">
            ←
          </span>{" "}
          Dashboard
        </button>

        {/* ════════════════════════════════════════════════════
            HERO HEADER
        ════════════════════════════════════════════════════ */}
        <div className="relative bg-gradient-to-br from-[#0e1528] via-[#111827] to-[#0e1528] border border-[#1f2937] rounded-3xl p-6 sm:p-8 overflow-hidden">
          {/* Glow */}
          <div className="absolute top-0 left-1/3 w-96 h-40 bg-indigo-600/10 blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-64 h-32 bg-violet-600/10 blur-3xl rounded-full pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Icon + name */}
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center text-4xl shrink-0">
                {subjectIcon}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap mb-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                    {subjectName}
                  </h1>
                  <Badge
                    label={`Lv.${level} ${levelTitle}`}
                    color="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                  />
                  {streak >= 5 && (
                    <Badge
                      label={`🔥 ${streak}-day streak`}
                      color="bg-orange-500/20 text-orange-300 border border-orange-500/30"
                    />
                  )}
                </div>
                {/* XP bar */}
                <div className="flex items-center gap-3 mt-2">
                  <div className="flex-1 max-w-xs h-1.5 bg-[#1f2937] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-700"
                      style={{ width: `${xpPct}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400">
                    {data.xp} / {nextXp} XP
                  </span>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-4 sm:gap-6">
              {[
                { label: "Notes", value: notes.length, icon: "📝" },
                { label: "Files", value: data.files.length, icon: "📁" },
                { label: "Streak", value: `${streak}d`, icon: "🔥" },
                { label: "Progress", value: `${completionPct}%`, icon: "📈" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="text-lg font-bold text-white">{s.value}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    {s.icon} {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="relative mt-6 flex flex-wrap gap-3">
            {[
              {
                label: "Add Note",
                icon: "✏️",
                action: () => {
                  setActiveTab("notes");
                  setShowAddNote(true);
                },
                style:
                  "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-600",
              },
              {
                label: "Upload File",
                icon: "📤",
                action: () => {
                  setActiveTab("files");
                  fileInputRef.current?.click();
                },
                style:
                  "bg-[#1a2035] hover:bg-[#1f2845] text-gray-200 border-[#1f2937]",
              },
              {
                label: "New Flashcard",
                icon: "🃏",
                action: () => setActiveTab("flashcards"),
                style:
                  "bg-[#1a2035] hover:bg-[#1f2845] text-gray-200 border-[#1f2937]",
              },
              {
                label: "Start Quiz",
                icon: "🧠",
                action: () => setActiveTab("quiz"),
                style:
                  "bg-[#1a2035] hover:bg-[#1f2845] text-gray-200 border-[#1f2937]",
              },
            ].map((btn) => (
              <button
                key={btn.label}
                onClick={btn.action}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all duration-200 ${btn.style}`}
              >
                {btn.icon} {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════════════════════════════════════════
            OVERVIEW STATS GRID
        ════════════════════════════════════════════════════ */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatCard
            icon="📝"
            label="Notes"
            value={notes.length}
            accent="bg-indigo-500"
          />
          <StatCard
            icon="📁"
            label="Files"
            value={data.files.length}
            accent="bg-violet-500"
          />
          <StatCard
            icon="🎯"
            label="Quiz Accuracy"
            value={`${avgAccuracy}%`}
            accent="bg-emerald-500"
          />
          <StatCard
            icon="⏱️"
            label="Study Hours"
            value={data.studyHours}
            accent="bg-cyan-500"
          />
          <StatCard
            icon="🔁"
            label="Revisions"
            value={data.revisionCount}
            accent="bg-amber-500"
          />
          <StatCard
            icon="✅"
            label="Completion"
            value={`${completionPct}%`}
            sub={`${completedChapters}/${data.chapters.length} chapters`}
            accent="bg-pink-500"
          />
        </div>

        {/* ════════════════════════════════════════════════════
            TAB SYSTEM
        ════════════════════════════════════════════════════ */}
        <div className="bg-[#0e1320] border border-[#1f2937] rounded-2xl overflow-hidden">
          {/* Tab bar */}
          <div className="flex overflow-x-auto border-b border-[#1f2937] scrollbar-none">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                    : "border-transparent text-gray-500 hover:text-gray-300 hover:bg-white/[0.02]"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* ── OVERVIEW TAB ── */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {/* AI Study Tools */}
                <section>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-indigo-500 rounded-full inline-block" />
                    AI Study Tools
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[
                      {
                        id: "summarize",
                        icon: "📋",
                        title: "Summarize Notes",
                        desc: "Get a crisp summary of all your notes",
                        color: "from-indigo-500/10 to-indigo-500/5",
                        border: "border-indigo-500/20",
                        accent: "text-indigo-400",
                      },
                      {
                        id: "quiz",
                        icon: "❓",
                        title: "Generate Quiz",
                        desc: "Auto-create MCQs from your notes",
                        color: "from-violet-500/10 to-violet-500/5",
                        border: "border-violet-500/20",
                        accent: "text-violet-400",
                      },
                      {
                        id: "flashcards",
                        icon: "🃏",
                        title: "Generate Flashcards",
                        desc: "Create Q&A pairs instantly",
                        color: "from-emerald-500/10 to-emerald-500/5",
                        border: "border-emerald-500/20",
                        accent: "text-emerald-400",
                      },
                      {
                        id: "keypoints",
                        icon: "🔑",
                        title: "Extract Key Points",
                        desc: "Pull the most critical concepts",
                        color: "from-amber-500/10 to-amber-500/5",
                        border: "border-amber-500/20",
                        accent: "text-amber-400",
                      },
                      {
                        id: "explain",
                        icon: "💡",
                        title: "Explain Topic",
                        desc: "Get a plain-language explanation",
                        color: "from-cyan-500/10 to-cyan-500/5",
                        border: "border-cyan-500/20",
                        accent: "text-cyan-400",
                      },
                    ].map((tool) => (
                      <button
                        key={tool.id}
                        onClick={() => runAiTool(tool.id, aiPrompt)}
                        className={`text-left bg-gradient-to-br ${tool.color} border ${tool.border} rounded-2xl p-4 hover:scale-[1.02] transition-all duration-200 group`}
                      >
                        <div className="text-2xl mb-2">{tool.icon}</div>
                        <h3
                          className={`font-semibold text-sm ${tool.accent} mb-1`}
                        >
                          {tool.title}
                        </h3>
                        <p className="text-gray-500 text-xs">{tool.desc}</p>
                      </button>
                    ))}
                    {/* Explain topic input */}
                    <div className="sm:col-span-2 lg:col-span-1 flex flex-col gap-2">
                      <input
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="Enter topic to explain..."
                        className="bg-[#111827] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                      />
                    </div>
                  </div>

                  {/* AI Result */}
                  {(aiLoading || aiResult) && (
                    <div className="mt-4 bg-[#0a0f1a] border border-indigo-500/20 rounded-2xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs text-indigo-400 font-semibold uppercase tracking-widest">
                          AI Response — {aiTool}
                        </span>
                        {aiResult && (
                          <button
                            onClick={() => setAiResult("")}
                            className="text-gray-600 hover:text-gray-400 text-xs"
                          >
                            ✕ Close
                          </button>
                        )}
                      </div>
                      {aiLoading ? (
                        <div className="flex items-center gap-3 text-gray-400 text-sm">
                          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                          Generating with AI...
                        </div>
                      ) : (
                        <pre className="text-gray-300 text-sm whitespace-pre-wrap font-sans leading-relaxed">
                          {aiResult}
                        </pre>
                      )}
                    </div>
                  )}
                </section>

                {/* Chapter Tracker */}
                <section>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-emerald-500 rounded-full inline-block" />
                    Chapter Tracker
                  </h2>
                  <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-5">
                    {/* Progress bar */}
                    <div className="flex items-center gap-4 mb-5">
                      <div className="flex-1 h-2 bg-[#1f2937] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-700"
                          style={{ width: `${completionPct}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-emerald-400">
                        {completionPct}%
                      </span>
                      <span className="text-xs text-gray-500">
                        {completedChapters}/{data.chapters.length} chapters
                      </span>
                    </div>

                    {/* Add chapter */}
                    <div className="flex gap-2 mb-4">
                      <input
                        value={newChapter}
                        onChange={(e) => setNewChapter(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addChapter()}
                        placeholder="Add a chapter..."
                        className="flex-1 bg-[#0e1320] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                      />
                      <button
                        onClick={addChapter}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        Add
                      </button>
                    </div>

                    {/* Chapter list */}
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                      {data.chapters.length === 0 && (
                        <p className="text-gray-600 text-sm text-center py-6">
                          No chapters yet — add your first one above
                        </p>
                      )}
                      {data.chapters.map((ch) => (
                        <div
                          key={ch.id}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors ${ch.completed ? "bg-emerald-500/5 border border-emerald-500/20" : "bg-[#0e1320] border border-[#1a2035]"}`}
                        >
                          <button
                            onClick={() => toggleChapter(ch.id)}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${ch.completed ? "bg-emerald-500 border-emerald-500" : "border-gray-600 hover:border-emerald-500"}`}
                          >
                            {ch.completed && (
                              <span className="text-white text-xs">✓</span>
                            )}
                          </button>
                          <span
                            className={`flex-1 text-sm ${ch.completed ? "text-gray-400 line-through" : "text-gray-200"}`}
                          >
                            {ch.title}
                          </span>
                          <button
                            onClick={() => deleteChapter(ch.id)}
                            className="text-gray-700 hover:text-red-500 transition-colors text-xs"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                {/* Weak / Strong topics */}
                <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Weak */}
                  <div className="bg-[#111827] border border-red-500/20 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-red-400 mb-4 flex items-center gap-2">
                      ⚠️ Weak Topics
                    </h3>
                    <div className="flex gap-2 mb-3">
                      <input
                        value={newWeakTopic}
                        onChange={(e) => setNewWeakTopic(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newWeakTopic.trim()) {
                            persist({
                              weakTopics: [
                                ...data.weakTopics,
                                newWeakTopic.trim(),
                              ],
                            });
                            setNewWeakTopic("");
                          }
                        }}
                        placeholder="Add weak topic..."
                        className="flex-1 bg-[#0e1320] border border-[#1f2937] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50"
                      />
                      <button
                        onClick={() => {
                          if (!newWeakTopic.trim()) return;
                          persist({
                            weakTopics: [
                              ...data.weakTopics,
                              newWeakTopic.trim(),
                            ],
                          });
                          setNewWeakTopic("");
                        }}
                        className="bg-red-600/30 hover:bg-red-600/50 text-red-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.weakTopics.map((t, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 bg-red-500/10 border border-red-500/20 text-red-300 text-xs px-2.5 py-1 rounded-full"
                        >
                          {t}
                          <button
                            onClick={() =>
                              persist({
                                weakTopics: data.weakTopics.filter(
                                  (_, j) => j !== i
                                ),
                              })
                            }
                            className="hover:text-red-200 ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {!data.weakTopics.length && (
                        <p className="text-gray-700 text-xs">None added yet</p>
                      )}
                    </div>
                  </div>

                  {/* Strong */}
                  <div className="bg-[#111827] border border-emerald-500/20 rounded-2xl p-5">
                    <h3 className="text-sm font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      💪 Strong Topics
                    </h3>
                    <div className="flex gap-2 mb-3">
                      <input
                        value={newStrongTopic}
                        onChange={(e) => setNewStrongTopic(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && newStrongTopic.trim()) {
                            persist({
                              strongTopics: [
                                ...data.strongTopics,
                                newStrongTopic.trim(),
                              ],
                            });
                            setNewStrongTopic("");
                          }
                        }}
                        placeholder="Add strong topic..."
                        className="flex-1 bg-[#0e1320] border border-[#1f2937] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50"
                      />
                      <button
                        onClick={() => {
                          if (!newStrongTopic.trim()) return;
                          persist({
                            strongTopics: [
                              ...data.strongTopics,
                              newStrongTopic.trim(),
                            ],
                          });
                          setNewStrongTopic("");
                        }}
                        className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 px-3 py-1.5 rounded-lg text-xs transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {data.strongTopics.map((t, i) => (
                        <span
                          key={i}
                          className="flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs px-2.5 py-1 rounded-full"
                        >
                          {t}
                          <button
                            onClick={() =>
                              persist({
                                strongTopics: data.strongTopics.filter(
                                  (_, j) => j !== i
                                ),
                              })
                            }
                            className="hover:text-emerald-200 ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {!data.strongTopics.length && (
                        <p className="text-gray-700 text-xs">None added yet</p>
                      )}
                    </div>
                  </div>
                </section>

                {/* Achievements */}
                <section>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
                    Achievements
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      {
                        icon: "📝",
                        label: "Note Taker",
                        earned: notes.length >= 1,
                        desc: "Add your first note",
                      },
                      {
                        icon: "🔥",
                        label: "On Fire",
                        earned: streak >= 3,
                        desc: "3-day study streak",
                      },
                      {
                        icon: "🧠",
                        label: "Quiz Master",
                        earned: avgAccuracy >= 80,
                        desc: "80%+ quiz accuracy",
                      },
                      {
                        icon: "🃏",
                        label: "Flashcard Pro",
                        earned: data.flashcards.length >= 5,
                        desc: "Create 5 flashcards",
                      },
                      {
                        icon: "📁",
                        label: "Organized",
                        earned: data.files.length >= 1,
                        desc: "Upload your first file",
                      },
                      {
                        icon: "✅",
                        label: "Half Way",
                        earned: completionPct >= 50,
                        desc: "50% subject complete",
                      },
                      {
                        icon: "🌟",
                        label: "Scholar",
                        earned: data.xp >= 100,
                        desc: "Earn 100 XP",
                      },
                      {
                        icon: "🏆",
                        label: "Champion",
                        earned: data.xp >= 500,
                        desc: "Earn 500 XP",
                      },
                    ].map((badge) => (
                      <div
                        key={badge.label}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border text-center transition-all ${
                          badge.earned
                            ? "bg-amber-500/10 border-amber-500/30"
                            : "bg-[#111827] border-[#1f2937] opacity-40 grayscale"
                        }`}
                      >
                        <span className="text-2xl">{badge.icon}</span>
                        <span
                          className={`text-xs font-semibold ${badge.earned ? "text-amber-300" : "text-gray-500"}`}
                        >
                          {badge.label}
                        </span>
                        <span className="text-gray-600 text-[10px]">
                          {badge.desc}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ── NOTES TAB ── */}
            {activeTab === "notes" && (
              <div className="space-y-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      🔍
                    </span>
                    <input
                      value={noteSearch}
                      onChange={(e) => setNoteSearch(e.target.value)}
                      placeholder="Search notes..."
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <button
                    onClick={() => setShowAddNote(true)}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0"
                  >
                    ✏️ New Note
                  </button>
                </div>

                {/* Add note form */}
                {showAddNote && (
                  <div className="bg-[#111827] border border-indigo-500/30 rounded-2xl p-5 space-y-3">
                    <h3 className="text-sm font-semibold text-indigo-400">
                      New Note
                    </h3>
                    <input
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      placeholder="Note title..."
                      className="w-full bg-[#0e1320] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                    />
                    <textarea
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      placeholder="Write your note here..."
                      rows={4}
                      className="w-full bg-[#0e1320] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleAddNote}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        Save Note
                      </button>
                      <button
                        onClick={() => setShowAddNote(false)}
                        className="text-gray-500 hover:text-gray-300 px-4 py-2 rounded-xl text-sm transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Notes grid */}
                {filteredNotes.length === 0 && (
                  <div className="text-center py-16 text-gray-600">
                    <p className="text-3xl mb-3">📝</p>
                    <p className="text-sm">
                      {noteSearch
                        ? "No notes match your search"
                        : "No notes yet — create your first one"}
                    </p>
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredNotes.map((note) => (
                    <div
                      key={note.id}
                      className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 hover:border-indigo-500/30 transition-all group flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-white text-sm font-semibold leading-snug flex-1">
                          {note.title}
                        </h3>
                        <button
                          onClick={() => deleteNote(note.id)}
                          className="text-gray-700 hover:text-red-500 transition-colors text-xs opacity-0 group-hover:opacity-100"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-gray-500 text-xs leading-relaxed line-clamp-4">
                        {note.content || "No content"}
                      </p>
                      <p className="text-gray-700 text-[10px] mt-auto">
                        {new Date(note.updatedAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── FILES TAB ── */}
            {activeTab === "files" && (
              <div className="space-y-5">
                {/* Search */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                      🔍
                    </span>
                    <input
                      value={fileSearch}
                      onChange={(e) => setFileSearch(e.target.value)}
                      placeholder="Search files..."
                      className="w-full bg-[#111827] border border-[#1f2937] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50"
                    />
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors shrink-0"
                  >
                    📤 Upload
                  </button>
                </div>

                {/* Hidden input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.doc,.jpg,.jpeg,.png,.gif,.webp"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files && processFiles(e.target.files)
                  }
                />

                {/* Drag & drop */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOver(false);
                    processFiles(e.dataTransfer.files);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 ${
                    dragOver
                      ? "border-indigo-500 bg-indigo-500/5"
                      : "border-[#1f2937] hover:border-indigo-500/40 hover:bg-white/[0.01]"
                  }`}
                >
                  <div className="text-4xl mb-3">📂</div>
                  <p className="text-gray-400 text-sm font-medium">
                    Drag & drop files here, or click to browse
                  </p>
                  <p className="text-gray-600 text-xs mt-1">
                    PDF, DOCX, Images supported
                  </p>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    {["PDF", "DOCX", "Images"].map((t) => (
                      <span
                        key={t}
                        className="bg-[#1a2035] border border-[#1f2937] text-gray-400 text-xs px-3 py-1 rounded-full"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* File cards */}
                {filteredFiles.length === 0 && !dragOver && (
                  <div className="text-center py-10 text-gray-600 text-sm">
                    {fileSearch
                      ? "No files match your search"
                      : "No files uploaded yet"}
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFiles.map((file) => {
                    const iconMap: Record<string, string> = {
                      pdf: "📕",
                      docx: "📘",
                      image: "🖼️",
                      other: "📄",
                    };
                    return (
                      <div
                        key={file.id}
                        className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 hover:border-indigo-500/30 transition-all group"
                      >
                        {/* Preview */}
                        {file.type === "image" && file.dataUrl ? (
                          <img
                            src={file.dataUrl}
                            alt={file.name}
                            className="w-full h-28 object-cover rounded-xl mb-3"
                          />
                        ) : (
                          <div className="w-full h-28 bg-[#0e1320] rounded-xl flex items-center justify-center text-4xl mb-3">
                            {iconMap[file.type]}
                          </div>
                        )}
                        <p className="text-white text-sm font-medium truncate mb-1">
                          {file.name}
                        </p>
                        <p className="text-gray-600 text-xs mb-3">
                          {formatBytes(file.size)} ·{" "}
                          {new Date(file.uploadedAt).toLocaleDateString(
                            "en-IN"
                          )}
                        </p>
                        <div className="flex gap-2">
                          {file.dataUrl && (
                            <a
                              href={file.dataUrl}
                              download={file.name}
                              className="flex-1 text-center bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              ⬇️ Download
                            </a>
                          )}
                          <button
                            onClick={() => renameFile(file.id)}
                            className="bg-[#1a2035] hover:bg-[#1f2845] text-gray-400 hover:text-white px-2 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteFile(file.id)}
                            className="bg-red-600/10 hover:bg-red-600/30 text-red-400 px-2 py-1.5 rounded-lg text-xs transition-colors"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── FLASHCARDS TAB ── */}
            {activeTab === "flashcards" && (
              <div className="space-y-5">
                {/* Create form */}
                <div className="bg-[#111827] border border-indigo-500/20 rounded-2xl p-5 space-y-3">
                  <h3 className="text-sm font-semibold text-indigo-400">
                    🃏 Create Flashcard
                  </h3>
                  <textarea
                    value={newFront}
                    onChange={(e) => setNewFront(e.target.value)}
                    placeholder="Question / front side..."
                    rows={2}
                    className="w-full bg-[#0e1320] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                  />
                  <textarea
                    value={newBack}
                    onChange={(e) => setNewBack(e.target.value)}
                    placeholder="Answer / back side..."
                    rows={2}
                    className="w-full bg-[#0e1320] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                  />
                  <button
                    onClick={addFlashcard}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Save Flashcard
                  </button>
                </div>

                {/* Stats */}
                <div className="flex gap-4 text-sm">
                  <span className="text-gray-400">
                    Total:{" "}
                    <strong className="text-white">
                      {data.flashcards.length}
                    </strong>
                  </span>
                  <span className="text-emerald-400">
                    Mastered:{" "}
                    <strong>
                      {data.flashcards.filter((c) => c.mastered).length}
                    </strong>
                  </span>
                </div>

                {/* Cards grid */}
                {data.flashcards.length === 0 && (
                  <div className="text-center py-14 text-gray-600 text-sm">
                    <p className="text-3xl mb-3">🃏</p>No flashcards yet
                  </div>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.flashcards.map((card) => (
                    <FlashcardItem
                      key={card.id}
                      card={card}
                      onDelete={() => deleteFlashcard(card.id)}
                      onToggleMaster={() => toggleMaster(card.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* ── QUIZ TAB ── */}
            {activeTab === "quiz" && (
              <div className="space-y-6">
                {!quizRunning && !quizDone && (
                  <>
                    {/* Add question */}
                    <div className="bg-[#111827] border border-violet-500/20 rounded-2xl p-5 space-y-3">
                      <h3 className="text-sm font-semibold text-violet-400">
                        ➕ Add Question
                      </h3>
                      <input
                        value={newQText}
                        onChange={(e) => setNewQText(e.target.value)}
                        placeholder="Question text..."
                        className="w-full bg-[#0e1320] border border-[#1f2937] rounded-xl px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {newQOptions.map((opt, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <button
                              onClick={() => setNewQCorrect(i)}
                              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs shrink-0 transition-colors ${newQCorrect === i ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-600 text-gray-500"}`}
                            >
                              {String.fromCharCode(65 + i)}
                            </button>
                            <input
                              value={opt}
                              onChange={(e) => {
                                const next = [...newQOptions];
                                next[i] = e.target.value;
                                setNewQOptions(next);
                              }}
                              placeholder={`Option ${String.fromCharCode(65 + i)}`}
                              className="flex-1 bg-[#0e1320] border border-[#1f2937] rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50"
                            />
                          </div>
                        ))}
                      </div>
                      <p className="text-gray-600 text-xs">
                        Click a letter to mark the correct answer
                      </p>
                      <button
                        onClick={addQuestion}
                        className="bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                      >
                        Add Question
                      </button>
                    </div>

                    {/* Question list */}
                    {quizQuestions.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-white">
                            {quizQuestions.length} question
                            {quizQuestions.length !== 1 ? "s" : ""} ready
                          </h3>
                          <button
                            onClick={startQuiz}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                          >
                            🚀 Start Quiz
                          </button>
                        </div>
                        {quizQuestions.map((q, i) => (
                          <div
                            key={q.id}
                            className="bg-[#111827] border border-[#1f2937] rounded-xl p-3 flex items-start gap-3"
                          >
                            <span className="text-gray-600 text-xs font-bold mt-0.5 w-5 shrink-0">
                              {i + 1}.
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-gray-300 text-sm mb-1">
                                {q.question}
                              </p>
                              <p className="text-emerald-500 text-xs">
                                ✓ {q.options[q.correct]}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setQuizQuestions((prev) =>
                                  prev.filter((qq) => qq.id !== q.id)
                                )
                              }
                              className="text-gray-700 hover:text-red-500 text-xs transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Past results */}
                    {data.quizResults.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-3">
                          Past Results
                        </h3>
                        <div className="space-y-2">
                          {data.quizResults.slice(0, 5).map((r) => (
                            <div
                              key={r.id}
                              className="bg-[#111827] border border-[#1f2937] rounded-xl px-4 py-3 flex items-center justify-between"
                            >
                              <span className="text-gray-400 text-xs">
                                {new Date(r.completedAt).toLocaleDateString(
                                  "en-IN"
                                )}
                              </span>
                              <span className="text-white text-sm font-semibold">
                                {r.score}/{r.total}
                              </span>
                              <span
                                className={`text-xs font-bold ${r.accuracy >= 80 ? "text-emerald-400" : r.accuracy >= 60 ? "text-amber-400" : "text-red-400"}`}
                              >
                                {r.accuracy}%
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Running quiz */}
                {quizRunning && (
                  <div className="max-w-xl mx-auto space-y-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">
                        Question {quizIndex + 1} of {quizQuestions.length}
                      </span>
                      <button
                        onClick={() => setQuizRunning(false)}
                        className="text-gray-600 hover:text-gray-400 text-xs"
                      >
                        Quit
                      </button>
                    </div>
                    <div className="h-1 bg-[#1f2937] rounded-full">
                      <div
                        className="h-full bg-violet-500 rounded-full transition-all duration-300"
                        style={{
                          width: `${((quizIndex + 1) / quizQuestions.length) * 100}%`,
                        }}
                      />
                    </div>
                    <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
                      <p className="text-white text-base font-medium leading-relaxed mb-6">
                        {quizQuestions[quizIndex].question}
                      </p>
                      <div className="space-y-3">
                        {quizQuestions[quizIndex].options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => answerQuestion(i)}
                            className="w-full text-left bg-[#0e1320] hover:bg-indigo-500/10 border border-[#1f2937] hover:border-indigo-500/40 text-gray-200 text-sm px-4 py-3 rounded-xl transition-all"
                          >
                            <span className="text-indigo-400 font-bold mr-3">
                              {String.fromCharCode(65 + i)}.
                            </span>
                            {opt}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Done */}
                {quizDone && (() => {
                  const last = data.quizResults[0];
                  return (
                    <div className="max-w-sm mx-auto text-center space-y-5">
                      <div className="text-6xl">
                        {last?.accuracy >= 80
                          ? "🏆"
                          : last?.accuracy >= 60
                          ? "👏"
                          : "💪"}
                      </div>
                      <h3 className="text-2xl font-bold text-white">
                        {last?.score}/{last?.total} Correct
                      </h3>
                      <div
                        className={`text-4xl font-bold ${last?.accuracy >= 80 ? "text-emerald-400" : last?.accuracy >= 60 ? "text-amber-400" : "text-red-400"}`}
                      >
                        {last?.accuracy}%
                      </div>
                      <p className="text-gray-500 text-sm">
                        {last?.accuracy >= 80
                          ? "Excellent work! Keep it up."
                          : last?.accuracy >= 60
                          ? "Good effort — review the weak areas."
                          : "Keep practicing — you'll get better!"}
                      </p>
                      <div className="flex gap-3 justify-center">
                        <button
                          onClick={() => {
                            setQuizDone(false);
                            startQuiz();
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        >
                          Retry
                        </button>
                        <button
                          onClick={() => {
                            setQuizDone(false);
                            setQuizQuestions([]);
                          }}
                          className="bg-[#1a2035] hover:bg-[#1f2845] text-gray-300 px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
                        >
                          New Quiz
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            {/* ── ANALYTICS TAB ── */}
            {activeTab === "analytics" && (
              <div className="space-y-8">
                {/* Weekly activity */}
                <section>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-cyan-500 rounded-full inline-block" />
                    Weekly Activity
                  </h2>
                  <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6">
                    <div className="flex items-end justify-between gap-2 h-40">
                      {data.weeklyActivity.map((d, i) => (
                        <div
                          key={i}
                          className="flex-1 flex flex-col items-center gap-2"
                        >
                          <div className="w-full flex flex-col justify-end h-28">
                            <div
                              className="w-full bg-gradient-to-t from-indigo-500 to-violet-500 rounded-t-lg transition-all duration-700"
                              style={{
                                height: `${Math.max(4, (d.minutes / maxActivity) * 100)}%`,
                                minHeight: "4px",
                              }}
                            />
                          </div>
                          <span className="text-gray-500 text-xs">{d.day}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-600">
                      <span>Minutes studied per day</span>
                      <button
                        onClick={() => {
                          const dayIdx = new Date().getDay();
                          const days = [
                            "Sun",
                            "Mon",
                            "Tue",
                            "Wed",
                            "Thu",
                            "Fri",
                            "Sat",
                          ];
                          const today = days[dayIdx];
                          const updated = data.weeklyActivity.map((d) =>
                            d.day === today
                              ? { ...d, minutes: d.minutes + 30 }
                              : d
                          );
                          persist({
                            weeklyActivity: updated,
                            studyHours: data.studyHours + 0.5,
                          });
                        }}
                        className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 px-3 py-1 rounded-lg text-xs transition-colors"
                      >
                        + Log 30 min today
                      </button>
                    </div>
                  </div>
                </section>

                {/* Stats cards */}
                <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    {
                      icon: "🎯",
                      label: "Quiz Accuracy",
                      value: `${avgAccuracy}%`,
                      color: "text-emerald-400",
                    },
                    {
                      icon: "📊",
                      label: "Quizzes Taken",
                      value: data.quizResults.length,
                      color: "text-violet-400",
                    },
                    {
                      icon: "🃏",
                      label: "Flashcards",
                      value: data.flashcards.length,
                      color: "text-indigo-400",
                    },
                    {
                      icon: "✅",
                      label: "Chapters Done",
                      value: completedChapters,
                      color: "text-cyan-400",
                    },
                    {
                      icon: "⭐",
                      label: "Total XP",
                      value: data.xp,
                      color: "text-amber-400",
                    },
                    {
                      icon: "📝",
                      label: "Notes Written",
                      value: notes.length,
                      color: "text-pink-400",
                    },
                    {
                      icon: "📁",
                      label: "Files Uploaded",
                      value: data.files.length,
                      color: "text-teal-400",
                    },
                    {
                      icon: "🔁",
                      label: "Revisions",
                      value: data.revisionCount,
                      color: "text-orange-400",
                    },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="bg-[#111827] border border-[#1f2937] rounded-2xl p-4 text-center"
                    >
                      <div className="text-2xl mb-2">{s.icon}</div>
                      <div className={`text-xl font-bold ${s.color}`}>
                        {s.value}
                      </div>
                      <div className="text-gray-600 text-xs mt-1">
                        {s.label}
                      </div>
                    </div>
                  ))}
                </section>

                {/* XP progress */}
                <section>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-amber-500 rounded-full inline-block" />
                    Level Progress
                  </h2>
                  <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-bold text-white">
                          Level {level}
                        </span>
                        <span className="ml-2 text-amber-400 text-sm">
                          {levelTitle}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {data.xp} / {nextXp} XP
                      </span>
                    </div>
                    <div className="h-3 bg-[#1f2937] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 rounded-full transition-all duration-700"
                        style={{ width: `${xpPct}%` }}
                      />
                    </div>
                    <p className="text-gray-600 text-xs">
                      {nextXp - data.xp} XP to reach Level {level + 1}
                    </p>
                  </div>
                </section>

                {/* Subject completion */}
                <section>
                  <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="w-1 h-5 bg-emerald-500 rounded-full inline-block" />
                    Subject Completion
                  </h2>
                  <div className="bg-[#111827] border border-[#1f2937] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{subjectName}</span>
                      <span className="text-emerald-400 font-bold">
                        {completionPct}%
                      </span>
                    </div>
                    <div className="h-4 bg-[#1f2937] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-700 flex items-center justify-end pr-2"
                        style={{ width: `${completionPct}%` }}
                      >
                        {completionPct > 10 && (
                          <span className="text-white text-[9px] font-bold">
                            {completionPct}%
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-xs">
                      {completedChapters} of {data.chapters.length} chapters
                      completed
                    </p>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
