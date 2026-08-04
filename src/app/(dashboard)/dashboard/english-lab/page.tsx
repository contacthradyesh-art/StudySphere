'use client';

import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import {
  Languages, PenTool, Mic, Square, Shuffle, Sparkles, CheckCircle2, TrendingUp
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
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

// ---------------------------------------------------------------------------
// Writing Practice
// ---------------------------------------------------------------------------

function WritingPractice({ uid }: { uid: string }) {
  const [prompt, setPrompt] = useState(() => randomPrompt(WRITING_PROMPTS));
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<WritingFeedback | null>(null);
  const [sessions, setSessions] = useState<WritingSession[]>([]);

  useEffect(() => {
    const unsub = subscribeWritingSessions(uid, setSessions);
    return () => unsub();
  }, [uid]);

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

function SpeakingPractice({ uid }: { uid: string }) {
  const [prompt, setPrompt] = useState(() => randomPrompt(SPEAKING_PROMPTS));
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [hasRecording, setHasRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null);
  const [sessions, setSessions] = useState<SpeakingSession[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const unsub = subscribeSpeakingSessions(uid, setSessions);
    return () => unsub();
  }, [uid]);

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

export default function EnglishLabPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<'writing' | 'speaking'>('writing');

  if (!user) {
    return <GlassCard><p className="text-sm text-muted-foreground">Please sign in to use the English Communication Lab.</p></GlassCard>;
  }

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Languages className="h-6 w-6 text-primary" /> English Communication Lab
        </h1>
        <p className="text-sm text-muted-foreground">Practice writing and speaking with real AI feedback \u2014 built for interviews and exams.</p>
      </div>

      <div className="flex gap-1.5">
        <button
          onClick={() => setTab('writing')}
          className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors', tab === 'writing' ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}
        >
          <PenTool className="h-4 w-4" /> Writing
        </button>
        <button
          onClick={() => setTab('speaking')}
          className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors', tab === 'speaking' ? 'border-primary bg-primary/15 text-primary' : 'border-white/10 text-muted-foreground')}
        >
          <Mic className="h-4 w-4" /> Speaking
        </button>
      </div>

      {tab === 'writing' ? <WritingPractice uid={user.uid} /> : <SpeakingPractice uid={user.uid} />}
    </div>
  );
}
