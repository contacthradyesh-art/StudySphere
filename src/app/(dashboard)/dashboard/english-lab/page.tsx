'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight, BookOpen, CheckCircle2, Mic, Shuffle, Sparkles, Square, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { authedFetch } from '@/lib/auth/authed-fetch';
import { subscribeSpeakingSessions, saveSpeakingSession } from '@/lib/english-lab/english-lab-service';
import { SPEAKING_PROMPTS, type SpeakingFeedback, type SpeakingSession } from '@/lib/english-lab/english-lab-schema';
import { subscribeVocabulary, getLearnedWordIds, markWordLearned } from '@/lib/mission-ias/vocabulary-service';
import type { VocabLevel, VocabWord } from '@/lib/mission-ias/vocabulary-schema';

function randomPrompt(list: string[], exclude?: string): string {
  const options = list.filter((item) => item !== exclude);
  return options[Math.floor(Math.random() * options.length)] || list[0];
}
function ScoreBadge({ score }: { score: number }) {
  const color = score >= 75 ? 'text-emerald-600 border-emerald-500/30 bg-emerald-500/10' : score >= 50 ? 'text-amber-600 border-amber-500/30 bg-amber-500/10' : 'text-red-600 border-red-500/30 bg-red-500/10';
  return <span className={cn('rounded-full border px-2.5 py-1 text-xs font-bold', color)}>{score}/100</span>;
}

function VocabularyTab({ uid, words }: { uid: string; words: VocabWord[] }) {
  const [level, setLevel] = useState<VocabLevel>('ssc');
  const [learned, setLearned] = useState<Set<string>>(new Set());
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [quiz, setQuiz] = useState<{ word: VocabWord; options: string[] } | null>(null);
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null);
  useEffect(() => { getLearnedWordIds(uid).then(setLearned).catch(() => undefined); }, [uid]);
  const levelWords = useMemo(() => words.filter((word) => (word.level ?? 'upsc') === level), [words, level]);
  const practiceWord = levelWords.length ? levelWords[practiceIndex % levelWords.length] : null;
  const learnedCount = levelWords.reduce((count, word) => count + (learned.has(word.id) ? 1 : 0), 0);
  useEffect(() => { setPracticeIndex(0); setRevealed(false); setQuiz(null); setQuizAnswer(null); }, [level]);
  async function learnWord(word: VocabWord) {
    const next = new Set(learned); next.add(word.id); setLearned(next);
    try { await markWordLearned(uid, word.id, true); setRevealed(false); setPracticeIndex((index) => index + 1); }
    catch { toast.error('Progress save नहीं हो पाया।'); }
  }
  function startQuiz() {
    if (!practiceWord || levelWords.length < 4) return;
    const distractors = levelWords.filter((word) => word.id !== practiceWord.id).sort(() => Math.random() - 0.5).slice(0, 3).map((word) => word.meaning);
    setQuiz({ word: practiceWord, options: [practiceWord.meaning, ...distractors].sort(() => Math.random() - 0.5) }); setQuizAnswer(null);
  }
  if (!levelWords.length) return <GlassCard className="space-y-2"><p className="font-semibold">{level === 'ssc' ? 'SSC words jald aayenge · SSC शब्द जल्द आएंगे' : 'UPSC words jald aayenge · UPSC शब्द जल्द आएंगे'}</p><p className="text-sm text-muted-foreground">Abhi is level ke vocabulary words available nahi hain।</p></GlassCard>;
  return <div className="space-y-4">
    <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-semibold">Word Meaning · शब्द अर्थ</p><p className="text-xs text-muted-foreground">Exam level choose karke practice karein।</p></div>
      <div className="inline-flex rounded-full border bg-muted/20 p-1">{(['ssc', 'upsc'] as VocabLevel[]).map((item) => <button key={item} type="button" onClick={() => setLevel(item)} className={cn('rounded-full px-3 py-1.5 text-xs font-semibold uppercase transition-colors', level === item ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground')}>{item}</button>)}</div>
    </div>
    <GlassCard className="grid grid-cols-2 gap-3 sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Total · कुल</p><p className="text-xl font-bold">{levelWords.length}</p></div><div><p className="text-xs text-muted-foreground">Learned · याद</p><p className="text-xl font-bold">{learnedCount}</p></div><div><p className="text-xs text-muted-foreground">Remaining · बाकी</p><p className="text-xl font-bold">{Math.max(0, levelWords.length - learnedCount)}</p></div></GlassCard>
    {practiceWord && <GlassCard className="space-y-4"><div className="flex items-center justify-between gap-2"><span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{level.toUpperCase()}</span><span className="text-xs text-muted-foreground">{practiceIndex % levelWords.length + 1} / {levelWords.length}</span></div>
      <div><p className="text-2xl font-bold">{practiceWord.word}</p><p className="text-xs text-muted-foreground">{practiceWord.partOfSpeech}</p></div>
      {revealed ? <div className="space-y-3 rounded-xl border bg-muted/20 p-4"><div><p className="text-xs font-semibold text-primary">English Meaning</p><p className="text-sm">{practiceWord.meaning}</p></div><div><p className="text-xs font-semibold text-primary">हिंदी अर्थ</p><p className="text-sm">{practiceWord.hindiMeaning}</p></div><div><p className="text-xs font-semibold text-primary">Synonyms</p><p className="text-sm">{practiceWord.synonyms.length ? practiceWord.synonyms.join(', ') : '—'}</p></div><div><p className="text-xs font-semibold text-primary">Example</p><p className="text-sm leading-6">{practiceWord.exampleSentence}</p></div></div> : <Button variant="outline" className="w-full" onClick={() => setRevealed(true)}>Meaning dekhein · अर्थ देखें</Button>}
      <div className="grid gap-2 sm:grid-cols-2"><Button variant="gradient" onClick={() => learnWord(practiceWord)} disabled={learned.has(practiceWord.id)}><CheckCircle2 className="h-4 w-4" />{learned.has(practiceWord.id) ? 'Yaad hai ✓' : 'Yaad hai'}</Button><Button variant="outline" onClick={() => setRevealed(false)}>Dobara dekhna</Button></div>
    </GlassCard>}
    {levelWords.length >= 4 && <GlassCard className="space-y-3"><div className="flex items-center justify-between gap-3"><div><p className="font-semibold">Quick Quiz · त्वरित क्विज़</p><p className="text-xs text-muted-foreground">4 options mein sahi meaning chunein।</p></div><Button size="sm" variant="outline" onClick={startQuiz}>Quiz shuru karein</Button></div>
      {quiz && <div className="space-y-3 rounded-xl border bg-muted/20 p-4"><p className="font-semibold">{quiz.word.word}</p><div className="grid gap-2 sm:grid-cols-2">{quiz.options.map((option, index) => { const correct = option === quiz.word.meaning; const selected = quizAnswer === index; const state = quizAnswer === null ? (selected ? 'border-primary bg-primary/10' : 'hover:bg-muted/40') : (correct ? 'border-emerald-500/40 bg-emerald-500/10' : selected ? 'border-red-500/40 bg-red-500/10' : ''); return <button key={quiz.word.id + '-' + index} type="button" onClick={() => setQuizAnswer(index)} disabled={quizAnswer !== null} className={cn('rounded-lg border p-3 text-left text-sm transition-colors', state)}>{option}</button>; })}</div>{quizAnswer !== null && <p className={cn('text-sm font-medium', quiz.options[quizAnswer] === quiz.word.meaning ? 'text-emerald-600' : 'text-red-600')}>{quiz.options[quizAnswer] === quiz.word.meaning ? 'Sahi jawab! 🎉' : 'Sahi meaning: ' + quiz.word.meaning}</p>}</div>}
    </GlassCard>}
  </div>;
}

function SessionHistory({ title, sessions }: { title: string; sessions: { id: string; createdAt: number; prompt: string; score: number; onOpen: () => void }[] }) {
  if (!sessions.length) return <GlassCard><p className="text-sm text-muted-foreground">Abhi koi session history nahi hai.</p></GlassCard>;
  return <GlassCard className="space-y-3">
    <div><p className="font-semibold">{title}</p><p className="text-xs text-muted-foreground">Kisi bhi session par tap karke purana feedback kholo.</p></div>
    <div className="space-y-2">{sessions.map(session => <button key={session.id} type="button" onClick={session.onOpen} className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left hover:border-primary/30">
      <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{session.prompt}</p><p className="mt-1 text-[11px] text-muted-foreground">{new Date(session.createdAt).toLocaleDateString('en-IN')}</p></div>
      <ScoreBadge score={session.score} />
      <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground" />
    </button>)}</div>
  </GlassCard>;
}



function SpeakingPractice({ uid, sessions }: { uid: string; sessions: SpeakingSession[] }) {
  const [prompt, setPrompt] = useState(SPEAKING_PROMPTS[0]);
  useEffect(() => {
    setPrompt(randomPrompt(SPEAKING_PROMPTS));
  }, []);
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setRecording(false);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }

  async function startRecording() {
    let stream: MediaStream | null = null;
    try {
      if (typeof MediaRecorder === 'undefined') {
        toast.error('Is device par recording supported nahi.');
        return;
      }
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4'];
      const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => chunks.push(event.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        audioBlobRef.current = blob;
        setHasRecording(true);
        stream?.getTracks().forEach((track) => track.stop());
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setSeconds(0);
      setHasRecording(false);
      setFeedback(null);
      timerRef.current = setInterval(() => {
        setSeconds((previous) => {
          const next = previous + 1;
          if (next >= 90) {
            window.setTimeout(() => {
              if (mediaRecorderRef.current) stopRecording();
              toast.info('90 seconds complete — recording auto-stop ho gayi.');
            }, 0);
            return 90;
          }
          return next;
        });
      }, 1000);
    } catch (error) {
      stream?.getTracks().forEach((track) => track.stop());
      const errorName = error instanceof DOMException ? error.name : '';
      if (errorName === 'NotAllowedError') {
        toast.error('Microphone permission band hai. Browser ya phone ki Settings mein Microphone Allow karein.');
      } else if (errorName === 'NotFoundError') {
        toast.error('Mic nahi mila.');
      } else {
        toast.error('Recording start nahi ho payi.');
      }
    }
  }
  async function handleSubmit() {
    const blob = audioBlobRef.current;
    if (!blob) return;
    setLoading(true);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1] || '');
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      if (base64.length > 3 * 1024 * 1024) {
        toast.error('Recording chhoti karein — 3 MB se badi recording submit nahi ho sakti.');
        return;
      }
      const res = await authedFetch('/api/english-lab/speaking-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, audio: base64, mimeType: blob.type })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setFeedback(data.feedback);
      await saveSpeakingSession(uid, prompt, data.feedback);
      toast.success('Feedback ready');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Recording analysis failed.');
    } finally {
      setLoading(false);
    }
  }

  return <div className="space-y-4">
    <GlassCard className="space-y-3">
      <div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-muted-foreground">Today's prompt · आज का topic</p><Button variant="ghost" size="sm" onClick={() => setPrompt(randomPrompt(SPEAKING_PROMPTS, prompt))} disabled={recording}><Shuffle className="h-3.5 w-3.5" /> New prompt</Button></div>
      <p className="font-semibold">{prompt}</p>
      <div className="flex flex-col items-center gap-3 rounded-xl border border-white/10 bg-white/5 py-8">
        {recording ? <>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20"><div className="h-4 w-4 animate-pulse rounded-full bg-red-500" /></div>
          <p className="text-sm font-mono text-muted-foreground">{String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')} / 01:30</p>
          <p className="text-[11px] text-muted-foreground">Maximum 90 seconds</p>
          <Button variant="destructive" size="sm" onClick={stopRecording}><Square className="h-4 w-4" /> Stop</Button>
        </> : <>
          <button onClick={startRecording} className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-brand text-white shadow-lg transition-transform hover:scale-105"><Mic className="h-6 w-6" /></button>
          <p className="text-xs text-muted-foreground">{hasRecording ? 'Recorded — tap to re-record' : 'Tap to start speaking · 90 sec max'}</p>
        </>}
      </div>
      {hasRecording && !recording && <Button variant="gradient" className="w-full" onClick={handleSubmit} disabled={loading}><Sparkles className="h-4 w-4" />{loading ? 'Analyzing...' : 'Get AI Feedback'}</Button>}
    </GlassCard>

    {feedback && <GlassCard className="space-y-3 border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between"><p className="font-semibold">Speaking feedback</p><ScoreBadge score={feedback.score} /></div>
      <p className="rounded-lg bg-white/5 p-3 text-sm italic text-muted-foreground">“{feedback.transcript}”</p>
      <div className="grid gap-2 sm:grid-cols-3"><div><p className="text-xs font-medium text-primary">Fluency</p><p className="text-xs text-muted-foreground">{feedback.fluencyNotes}</p></div><div><p className="text-xs font-medium text-primary">Grammar</p><p className="text-xs text-muted-foreground">{feedback.grammarNotes}</p></div><div><p className="text-xs font-medium text-primary">Vocabulary</p><p className="text-xs text-muted-foreground">{feedback.vocabularyNotes}</p></div></div>
      <div><p className="mb-1 text-xs font-medium text-amber-400">Next steps</p><ul className="space-y-1 text-sm text-muted-foreground">{feedback.suggestions.map((s,i)=><li key={i} className="flex gap-1.5"><TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" />{s}</li>)}</ul></div>
    </GlassCard>}

    <SessionHistory
      title="Speaking History · पिछली 5"
      sessions={sessions.slice(0, 5).map(session => ({ id: session.id, createdAt: session.createdAt, prompt: session.prompt, score: session.feedback.score, onOpen: () => setFeedback(session.feedback) }))}
    />
  </div>;
}



export default function EnglishLabPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'vocabulary' | 'speaking'>('vocabulary');
  const [speakingSessions, setSpeakingSessions] = useState<SpeakingSession[]>([]);
  const [words, setWords] = useState<VocabWord[]>([]);
  useEffect(() => {
    if (!user) return;
    const speakingUnsub = subscribeSpeakingSessions(user.uid, setSpeakingSessions);
    const vocabUnsub = subscribeVocabulary(setWords);
    return () => { speakingUnsub(); vocabUnsub(); };
  }, [user]);
  if (!user) return <GlassCard><p className="text-sm text-muted-foreground">Please sign in to use the English Lab.</p></GlassCard>;
  return <div className="space-y-4"><div className="flex gap-2 overflow-x-auto pb-1">{[{ id: 'vocabulary' as const, label: 'Word Meaning / शब्द अर्थ', icon: BookOpen }, { id: 'speaking' as const, label: 'Speaking / बोलना', icon: Mic }].map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => setTab(item.id)} className={cn('flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors', tab === item.id ? 'border-primary bg-primary text-primary-foreground' : 'bg-muted/20 text-muted-foreground hover:text-foreground')}><Icon className="h-4 w-4" />{item.label}</button>; })}</div>{tab === 'vocabulary' ? <VocabularyTab uid={user.uid} words={words} /> : <SpeakingPractice uid={user.uid} sessions={speakingSessions} />}</div>;
}
