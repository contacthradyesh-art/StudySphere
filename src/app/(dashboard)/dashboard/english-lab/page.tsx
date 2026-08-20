'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import {
  Languages, PenTool, Mic, Square, Shuffle, Sparkles, CheckCircle2, TrendingUp,
  LayoutGrid, BookOpen, SpellCheck2, Wand2, ArrowRight, Trophy
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  subscribeWritingSessions, subscribeSpeakingSessions,
  saveWritingSession, saveSpeakingSession
} from '@/lib/english-lab/english-lab-service';
import {
  WRITING_PROMPTS, SPEAKING_PROMPTS,
  type WritingSession, type WritingFeedback,
  type SpeakingSession, type SpeakingFeedback
} from '@/lib/english-lab/english-lab-schema';
import { subscribeVocabulary, getLearnedWordIds, markWordLearned } from '@/lib/mission-ias/vocabulary-service';
import type { VocabWord } from '@/lib/mission-ias/vocabulary-schema';
import type { QuickToolType } from '@/app/api/english-lab/quick-tool/route';

function randomPrompt(list: string[], exclude?: string): string {
  const options = list.filter((p) => p !== exclude);
  return options[Math.floor(Math.random() * options.length)] || list[0];
}

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10'
    : score >= 50 ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
    : 'text-red-400 border-red-500/30 bg-red-500/10';
  return <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', color)}>{score}/100</span>;
}

type Tab = 'overview' | 'vocabulary' | 'grammar' | 'writing' | 'speaking' | 'tools';

// ---------------------------------------------------------------------------
// Overview
// ---------------------------------------------------------------------------

function OverviewTab({
  writingSessions, speakingSessions, wordOfDay, onNavigate
}: {
  writingSessions: WritingSession[];
  speakingSessions: SpeakingSession[];
  wordOfDay: VocabWord | null;
  onNavigate: (tab: Tab) => void;
}) {
  const avgWriting = writingSessions.length
    ? Math.round(writingSessions.reduce((s, x) => s + x.feedback.score, 0) / writingSessions.length) : null;
  const avgSpeaking = speakingSessions.length
    ? Math.round(speakingSessions.reduce((s, x) => s + x.feedback.score, 0) / speakingSessions.length) : null;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Writing sessions</p><p className="text-xl font-bold">{writingSessions.length}</p></GlassCard>
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Speaking sessions</p><p className="text-xl font-bold">{speakingSessions.length}</p></GlassCard>
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Avg. writing score</p><p className="text-xl font-bold">{avgWriting ?? '\u2014'}</p></GlassCard>
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Avg. speaking score</p><p className="text-xl font-bold">{avgSpeaking ?? '\u2014'}</p></GlassCard>
      </div>

      {wordOfDay && (
        <GlassCard className="space-y-2 border-primary/20 bg-primary/5">
          <p className="text-xs font-medium text-primary">\ud83d\udcda Word of the Day</p>
          <p className="text-lg font-bold">{wordOfDay.word} <span className="text-sm font-normal text-muted-foreground">({wordOfDay.partOfSpeech})</span></p>
          <p className="text-sm text-muted-foreground">{wordOfDay.meaning}</p>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('vocabulary')}>Practice vocabulary <ArrowRight className="h-3.5 w-3.5" /></Button>
        </GlassCard>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <GlassCard className="flex items-center justify-between gap-3">
          <div><p className="font-medium">Grammar Quiz</p><p className="text-xs text-muted-foreground">AI-generated, 5 questions</p></div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('grammar')}>Start</Button>
        </GlassCard>
        <GlassCard className="flex items-center justify-between gap-3">
          <div><p className="font-medium">Writing Practice</p><p className="text-xs text-muted-foreground">Get scored AI feedback</p></div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('writing')}>Write</Button>
        </GlassCard>
        <GlassCard className="flex items-center justify-between gap-3">
          <div><p className="font-medium">Speaking Practice</p><p className="text-xs text-muted-foreground">Record & get feedback</p></div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('speaking')}>Speak</Button>
        </GlassCard>
        <GlassCard className="flex items-center justify-between gap-3">
          <div><p className="font-medium">Quick Tools</p><p className="text-xs text-muted-foreground">Synonyms, idioms & more</p></div>
          <Button variant="outline" size="sm" onClick={() => onNavigate('tools')}>Open</Button>
        </GlassCard>
      </div>

      <GlassCard className="flex items-center gap-3">
        <Trophy className="h-8 w-8 shrink-0 text-muted-foreground/50" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">Leaderboard</p>
          <p className="text-xs text-muted-foreground">\ud83d\udea7 Coming soon \u2014 needs a shared ranking system across users, planned for a later phase.</p>
        </div>
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vocabulary (surfaces the existing Vocabulary Lab, doesn't duplicate it)
// ---------------------------------------------------------------------------

function VocabularyTab({ uid, words, wordOfDay }: { uid: string; words: VocabWord[]; wordOfDay: VocabWord | null }) {
  const [learned, setLearned] = useState<Set<string>>(new Set());

  useEffect(() => {
    getLearnedWordIds(uid).then(setLearned);
  }, [uid]);

  async function toggleLearned(word: VocabWord) {
    const isLearned = learned.has(word.id);
    const next = new Set(learned);
    if (isLearned) next.delete(word.id); else next.add(word.id);
    setLearned(next);
    await markWordLearned(uid, word.id, !isLearned);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Total words</p><p className="text-xl font-bold">{words.length}</p></GlassCard>
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Learned</p><p className="text-xl font-bold">{learned.size}</p></GlassCard>
        <GlassCard className="p-4"><p className="text-xs text-muted-foreground">Remaining</p><p className="text-xl font-bold">{Math.max(0, words.length - learned.size)}</p></GlassCard>
      </div>

      {wordOfDay && (
        <GlassCard className="space-y-2 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-primary">\ud83d\udcda Word of the Day</p>
            <button onClick={() => toggleLearned(wordOfDay)} className="text-xs text-primary hover:underline">
              {learned.has(wordOfDay.id) ? '\u2713 Learned' : 'Mark as learned'}
            </button>
          </div>
          <p className="text-lg font-bold">{wordOfDay.word} <span className="text-sm font-normal text-muted-foreground">({wordOfDay.partOfSpeech})</span></p>
          <p className="text-sm">{wordOfDay.meaning}</p>
          {wordOfDay.hindiMeaning && <p className="text-sm text-muted-foreground">{wordOfDay.hindiMeaning}</p>}
          {wordOfDay.synonyms.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {wordOfDay.synonyms.map((s) => <span key={s} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs">{s}</span>)}
            </div>
          )}
          <p className="text-xs italic text-muted-foreground">"{wordOfDay.exampleSentence}"</p>
        </GlassCard>
      )}

      <GlassCard className="flex items-center justify-between gap-3">
        <div>
          <p className="font-medium">Full Vocabulary Lab</p>
          <p className="text-xs text-muted-foreground">Browse all {words.length} words, quiz mode, and turn words into flashcards.</p>
        </div>
        <Link href="/dashboard/mission-ias/vocabulary-lab">
          <Button variant="gradient" size="sm">Open <ArrowRight className="h-3.5 w-3.5" /></Button>
        </Link>
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grammar Quiz
// ---------------------------------------------------------------------------

interface GrammarQuestion { question: string; options: string[]; correctIndex: number; explanation: string; }

function GrammarTab() {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<GrammarQuestion[] | null>(null);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  async function generateQuiz() {
    setLoading(true);
    setQuestions(null);
    setAnswers({});
    setSubmitted(false);
    try {
      const res = await fetch('/api/english-lab/grammar-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setQuestions(data.questions);
    } catch {
      toast.error('Could not generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const score = questions ? questions.reduce((s, q, i) => s + (answers[i] === q.correctIndex ? 1 : 0), 0) : 0;

  return (
    <div className="space-y-4">
      <GlassCard className="space-y-3">
        <p className="text-sm font-medium">Pick a topic (optional)</p>
        <div className="flex gap-2">
          <Input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Tenses, Prepositions, Subject-Verb Agreement..." />
          <Button variant="gradient" onClick={generateQuiz} disabled={loading}>
            <Sparkles className="h-4 w-4" /> {loading ? 'Generating...' : 'Start Quiz'}
          </Button>
        </div>
      </GlassCard>

      {questions && (
        <div className="space-y-3">
          {questions.map((q, i) => (
            <GlassCard key={i} className="space-y-2">
              <p className="font-medium">{i + 1}. {q.question}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[i] === oi;
                  const isCorrect = submitted && oi === q.correctIndex;
                  const isWrong = submitted && isSelected && oi !== q.correctIndex;
                  return (
                    <button
                      key={oi}
                      disabled={submitted}
                      onClick={() => setAnswers((a) => ({ ...a, [i]: oi }))}
                      className={cn(
                        'rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                        isCorrect && 'border-emerald-500/40 bg-emerald-500/10',
                        isWrong && 'border-red-500/40 bg-red-500/10',
                        !submitted && isSelected && 'border-primary bg-primary/10',
                        !submitted && !isSelected && 'border-white/10 bg-white/5 hover:border-primary/30'
                      )}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {submitted && <p className="text-xs text-muted-foreground">{q.explanation}</p>}
            </GlassCard>
          ))}
          {!submitted ? (
            <Button variant="gradient" className="w-full" onClick={() => setSubmitted(true)}>Submit answers</Button>
          ) : (
            <GlassCard className="text-center">
              <p className="text-lg font-bold">You scored {score} / {questions.length}</p>
              <Button variant="outline" size="sm" className="mt-2" onClick={generateQuiz}>Try another quiz</Button>
            </GlassCard>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Quick Tools
// ---------------------------------------------------------------------------

const TOOLS: { id: QuickToolType; label: string; placeholder: string }[] = [
  { id: 'synonym', label: 'Synonym Finder', placeholder: 'Enter a word...' },
  { id: 'antonym', label: 'Antonym Finder', placeholder: 'Enter a word...' },
  { id: 'one-word', label: 'One Word Substitution', placeholder: 'Enter a phrase...' },
  { id: 'idiom', label: 'Idioms & Phrases', placeholder: 'Enter a word or topic...' },
  { id: 'sentence-improve', label: 'Sentence Improvement', placeholder: 'Paste a sentence...' },
  { id: 'paraphrase', label: 'Paraphrasing Tool', placeholder: 'Paste a sentence or paragraph...' }
];

function QuickToolsTab() {
  const [active, setActive] = useState<QuickToolType>('synonym');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ results: string[]; note?: string } | null>(null);

  async function run() {
    if (!input.trim()) { toast.error('Type something first.'); return; }
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/english-lab/quick-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: active, input })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
    } catch {
      toast.error('Could not process that. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const activeTool = TOOLS.find((t) => t.id === active)!;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => { setActive(t.id); setResult(null); setInput(''); }}
            className={cn('rounded-xl border px-3 py-2 text-xs font-medium transition-colors', active === t.id ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 bg-white/5 text-muted-foreground')}
          >
            {t.label}
          </button>
        ))}
      </div>

      <GlassCard className="space-y-3">
        <p className="text-sm font-medium">{activeTool.label}</p>
        <div className="flex gap-2">
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder={activeTool.placeholder} onKeyDown={(e) => e.key === 'Enter' && run()} />
          <Button variant="gradient" onClick={run} disabled={loading}><Wand2 className="h-4 w-4" /> {loading ? '...' : 'Go'}</Button>
        </div>
        {result && (
          <div className="space-y-1.5">
            {result.results.map((r, i) => (
              <p key={i} className="rounded-lg bg-white/5 px-3 py-2 text-sm">{r}</p>
            ))}
            {result.note && <p className="text-xs text-muted-foreground">{result.note}</p>}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Writing Practice
// ---------------------------------------------------------------------------

function WritingPractice({ uid, sessions }: { uid: string; sessions: WritingSession[] }) {
  const [prompt, setPrompt] = useState(() => randomPrompt(WRITING_PROMPTS));
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);

  function shufflePrompt() {
    setPrompt((p) => randomPrompt(WRITING_PROMPTS, p));
    setText('');
    setFeedback(null);
  }

  async function handleSubmit() {
    if (text.trim().length < 10) { toast.error('Write at least a couple of sentences first.'); return; }
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/english-lab/writing-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, text })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setFeedback(data.feedback);
      await saveWritingSession(uid, prompt, text, data.feedback);
      toast.success('Feedback ready \u2014 +12 XP');
    } catch {
      toast.error('Could not get feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <GlassCard className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">Today's prompt</p>
          <Button variant="ghost" size="sm" onClick={shufflePrompt}><Shuffle className="h-3.5 w-3.5" /> New prompt</Button>
        </div>
        <p className="font-semibold leading-snug">{prompt}</p>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your response here (aim for 4-6 sentences)..."
          rows={6}
          className="w-full resize-none rounded-xl border border-white/10 bg-white/5 p-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/40"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{text.trim().split(/\s+/).filter(Boolean).length} words</span>
          <Button variant="gradient" size="sm" onClick={handleSubmit} disabled={loading}>
            <Sparkles className="h-4 w-4" /> {loading ? 'Analyzing...' : 'Get AI Feedback'}
          </Button>
        </div>
      </GlassCard>

      {feedback && (
        <GlassCard className="space-y-3 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Feedback</p>
            <ScoreBadge score={feedback.score} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-emerald-400">Strengths</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {feedback.strengths.map((s, i) => <li key={i} className="flex gap-1.5"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />{s}</li>)}
            </ul>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-amber-400">To improve</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {feedback.improvements.map((s, i) => <li key={i} className="flex gap-1.5"><TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />{s}</li>)}
            </ul>
          </div>
          {feedback.vocabularySuggestions.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-medium text-primary">Stronger word choices</p>
              <div className="flex flex-wrap gap-1.5">
                {feedback.vocabularySuggestions.map((v, i) => (
                  <span key={i} className="rounded-full border border-primary/20 bg-primary/10 px-2 py-0.5 text-xs text-primary">{v}</span>
                ))}
              </div>
            </div>
          )}
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">Corrected version</p>
            <p className="rounded-lg bg-white/5 p-3 text-sm">{feedback.correctedText}</p>
          </div>
        </GlassCard>
      )}

      {sessions.length > 0 && (
        <GlassCard className="space-y-2">
          <p className="text-sm font-semibold">Recent sessions</p>
          {sessions.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2">
              <p className="truncate text-xs text-muted-foreground">{s.prompt}</p>
              <ScoreBadge score={s.feedback.score} />
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Speaking Practice
// ---------------------------------------------------------------------------

function SpeakingPractice({ uid, sessions }: { uid: string; sessions: SpeakingSession[] }) {
  const [prompt, setPrompt] = useState(() => randomPrompt(SPEAKING_PROMPTS));
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function shufflePrompt() {
    setPrompt((p) => randomPrompt(SPEAKING_PROMPTS, p));
    setHasRecording(false);
    setFeedback(null);
    audioBlobRef.current = null;
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.onstop = () => {
        audioBlobRef.current = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setHasRecording(true);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      setFeedback(null);
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } catch {
      toast.error('Microphone access is needed to record. Please allow it and try again.');
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  async function handleSubmit() {
    if (!audioBlobRef.current) return;
    setLoading(true);
    setFeedback(null);
    try {
      const blob = audioBlobRef.current;
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const res = await fetch('/api/english-lab/speaking-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, audio: base64, mimeType: blob.type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setFeedback(data.feedback);
      await saveSpeakingSession(uid, prompt, data.feedback);
      toast.success('Feedback ready \u2014 +12 XP');
    } catch {
      toast.error('Could not analyze your recording. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <GlassCard className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium text-muted-foreground">Today's prompt</p>
          <Button variant="ghost" size="sm" onClick={shufflePrompt} disabled={recording}><Shuffle className="h-3.5 w-3.5" /> New prompt</Button>
        </div>
        <p className="font-semibold leading-snug">{prompt}</p>

        <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 py-8">
          {recording ? (
            <>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                <div className="h-4 w-4 animate-pulse rounded-full bg-red-500" />
              </div>
              <p className="text-sm text-muted-foreground">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</p>
              <Button variant="destructive" size="sm" onClick={stopRecording}><Square className="h-4 w-4" /> Stop</Button>
            </>
          ) : (
            <>
              <button onClick={startRecording} className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand text-white shadow-lg transition-transform hover:scale-105">
                <Mic className="h-6 w-6" />
              </button>
              <p className="text-xs text-muted-foreground">{hasRecording ? 'Recorded \u2014 tap to re-record' : 'Tap to start speaking'}</p>
            </>
          )}
        </div>

        {hasRecording && !recording && (
          <Button variant="gradient" className="w-full" onClick={handleSubmit} disabled={loading}>
            <Sparkles className="h-4 w-4" /> {loading ? 'Analyzing your speech...' : 'Get AI Feedback'}
          </Button>
        )}
      </GlassCard>

      {feedback && (
        <GlassCard className="space-y-3 border-primary/20 bg-primary/5">
          <div className="flex items-center justify-between">
            <p className="font-semibold">Feedback</p>
            <ScoreBadge score={feedback.score} />
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-muted-foreground">What you said</p>
            <p className="rounded-lg bg-white/5 p-3 text-sm italic text-muted-foreground">"{feedback.transcript}"</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-3">
            <div><p className="text-xs font-medium text-primary">Fluency</p><p className="text-xs text-muted-foreground">{feedback.fluencyNotes}</p></div>
            <div><p className="text-xs font-medium text-primary">Grammar</p><p className="text-xs text-muted-foreground">{feedback.grammarNotes}</p></div>
            <div><p className="text-xs font-medium text-primary">Vocabulary</p><p className="text-xs text-muted-foreground">{feedback.vocabularyNotes}</p></div>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-amber-400">Tips for next time</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              {feedback.suggestions.map((s, i) => <li key={i} className="flex gap-1.5"><TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />{s}</li>)}
            </ul>
          </div>
        </GlassCard>
      )}

      {sessions.length > 0 && (
        <GlassCard className="space-y-2">
          <p className="text-sm font-semibold">Recent sessions</p>
          {sessions.slice(0, 5).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-white/5 px-3 py-2">
              <p className="truncate text-xs text-muted-foreground">{s.prompt}</p>
              <ScoreBadge score={s.feedback.score} />
            </div>
          ))}
        </GlassCard>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'vocabulary', label: 'Vocabulary', icon: BookOpen },
  { id: 'grammar', label: 'Grammar', icon: SpellCheck2 },
  { id: 'writing', label: 'Writing', icon: PenTool },
  { id: 'speaking', label: 'Speaking', icon: Mic },
  { id: 'tools', label: 'Quick Tools', icon: Wand2 }
];

export default function EnglishLabPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('overview');
  const [writingSessions, setWritingSessions] = useState<WritingSession[]>([]);
  const [speakingSessions, setSpeakingSessions] = useState<SpeakingSession[]>([]);
  const [words, setWords] = useState<VocabWord[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubW = subscribeWritingSessions(user.uid, setWritingSessions);
    const unsubS = subscribeSpeakingSessions(user.uid, setSpeakingSessions);
    const unsubV = subscribeVocabulary(setWords);
    return () => { unsubW(); unsubS(); unsubV(); };
  }, [user]);

  const wordOfDay = useMemo(() => {
    if (words.length === 0) return null;
    const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
    return words[dayIndex % words.length];
  }, [words]);

  if (!user) {
    return <GlassCard><p className="text-sm text-muted-foreground">Please sign in to use the English Lab.</p></GlassCard>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Languages className="h-6 w-6 text-primary" /> English Lab
        </h1>
        <p className="text-sm text-muted-foreground">Build strong English for exams & interviews \u2014 vocabulary, grammar, writing & speaking.</p>
      </div>

      <div className="overflow-x-auto pb-1 scrollbar-hide">
        <div className="flex w-fit gap-1.5">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={cn('flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-colors', tab === t.id ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}
              >
                <Icon className="h-4 w-4" /> {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {tab === 'overview' && <OverviewTab writingSessions={writingSessions} speakingSessions={speakingSessions} wordOfDay={wordOfDay} onNavigate={setTab} />}
      {tab === 'vocabulary' && <VocabularyTab uid={user.uid} words={words} wordOfDay={wordOfDay} />}
      {tab === 'grammar' && <GrammarTab />}
      {tab === 'writing' && <WritingPractice uid={user.uid} sessions={writingSessions} />}
      {tab === 'speaking' && <SpeakingPractice uid={user.uid} sessions={speakingSessions} />}
      {tab === 'tools' && <QuickToolsTab />}
    </div>
  );
}
