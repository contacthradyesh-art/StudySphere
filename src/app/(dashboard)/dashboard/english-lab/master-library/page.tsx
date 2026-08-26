'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { BookOpen, CheckCircle2, ChevronRight, Clock3, GraduationCap, Search, Sparkles, Target } from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

const LESSONS = [
  {
    id: 'parts-of-speech', level: 'Foundation', category: 'Grammar', title: 'Parts of Speech', duration: '18 min',
    summary: 'संज्ञा, सर्वनाम, क्रिया, विशेषण, क्रिया-विशेषण, preposition, conjunction और interjection को examples के साथ समझें।',
    rules: ['हर sentence में शब्द का role पहचानना सीखें।', 'Question में underlined word का grammatical function देखें।'],
    examples: ['Riya is smart. → Riya = noun, smart = adjective.', 'He runs quickly. → runs = verb, quickly = adverb.'],
    practice: ['Identify the adjective: She bought a beautiful dress.', 'Identify the adverb: He solved the problem quickly.']
  },
  {
    id: 'tenses', level: 'Foundation', category: 'Grammar', title: 'Tenses Mastery', duration: '25 min',
    summary: 'Present, Past और Future के 12 tenses को signal words, formulas, Hindi clues और exam traps के साथ सीखें।',
    rules: ['Simple Present: habits, facts, routines.', 'Present Perfect: completed action with present relevance.', 'Past Perfect: past में पहले हुई action.'],
    examples: ['He goes to school every day.', 'She has finished her work.', 'They had left before I arrived.'],
    practice: ['She ___ to the market every Sunday. (go/goes)', 'By the time we reached, the train ___. (left/had left)']
  },
  {
    id: 'subject-verb-agreement', level: 'Intermediate', category: 'Grammar', title: 'Subject–Verb Agreement', duration: '20 min',
    summary: 'SSC CGL/CHSL में बार-बार आने वाले subject–verb errors को rules और traps के साथ सीखें।',
    rules: ['Singular subject → singular verb in present simple.', 'Each, every, everyone, either, neither normally take singular verbs.', 'Do not let words between subject and verb confuse the number.'],
    examples: ['He goes to school. ✅', 'Each of the students is ready. ✅', 'The quality of the apples is good. ✅'],
    practice: ['Each of the players ___ ready. (is/are)', 'The list of items ___ on the table. (is/are)']
  },
  {
    id: 'articles', level: 'Foundation', category: 'Grammar', title: 'Articles: A, An, The', duration: '16 min',
    summary: 'Indefinite और definite articles का practical use, pronunciation-based traps और SSC error patterns।',
    rules: ['A/An depends on sound, not simply the first written letter.', 'The is used for a specific/known noun and certain unique references.'],
    examples: ['an hour', 'a university', 'the Ganga', 'the sun'],
    practice: ['He is ___ honest man. (a/an)', 'She studies at ___ university. (a/an)']
  },
  {
    id: 'prepositions', level: 'Intermediate', category: 'Grammar', title: 'Prepositions', duration: '22 min',
    summary: 'in/on/at, since/for, between/among, by/with और common preposition errors को examples से master करें।',
    rules: ['at for a point of time/place, on for days/dates, in for longer periods/areas.', 'Since = starting point; for = duration.'],
    examples: ['at 6 PM', 'on Monday', 'in 2026', 'since Monday', 'for two years'],
    practice: ['He has lived here ___ 2022. (since/for)', 'The meeting is ___ Monday. (in/on)']
  },
  {
    id: 'error-spotting', level: 'Exam', category: 'SSC CGL + CHSL', title: 'Error Spotting', duration: '30 min',
    summary: 'Sentence correction को rule-by-rule approach से करें: subject, tense, article, preposition, pronoun और modifier checks।',
    rules: ['Read the whole sentence first.', 'Check subject–verb, tense, pronoun, article, preposition and parallelism in that order.'],
    examples: ['Neither of the boys are ready. ❌ → Neither of the boys is ready. ✅'],
    practice: ['Find the error: Each of the candidates have submitted the form.', 'Find the error: She is senior than me.']
  },
  {
    id: 'vocabulary', level: 'All Levels', category: 'Vocabulary', title: 'High-Frequency Vocabulary', duration: '15 min',
    summary: 'SSC और competitive English में repeatedly useful words को Hindi meaning, synonym, antonym और sentence के साथ सीखें।',
    rules: ['Learn words in context, not as isolated lists.', 'Use one synonym and one original sentence after learning each word.'],
    examples: ['Abate = कम होना; synonym: lessen.', 'Prudent = विवेकपूर्ण; antonym: reckless.'],
    practice: ['Choose the synonym of “prudent”.', 'Choose the antonym of “abate”.']
  },
  {
    id: 'cloze-test', level: 'Exam', category: 'SSC CGL + CHSL', title: 'Cloze Test Strategy', duration: '24 min',
    summary: 'Context, grammar और collocation clues से cloze test solve करने की systematic method।',
    rules: ['Read the full passage before committing to an option.', 'Check grammar + meaning + natural word pairing.'],
    examples: ['make a decision ✅, do a decision ❌'],
    practice: ['The policy aims to ___ poverty. (reduce/reduction)', 'She is good ___ mathematics. (at/in)']
  },
  {
    id: 'reading-comprehension', level: 'Exam', category: 'Reading', title: 'Reading Comprehension', duration: '28 min',
    summary: 'Passage को structure, central idea, tone और evidence के आधार पर पढ़ें; guess नहीं, text evidence से answer करें।',
    rules: ['Read the question type first: fact, inference, tone or main idea.', 'Return to the passage for evidence.'],
    examples: ['Main idea = passage का overall argument, not one detail.'],
    practice: ['Find the central idea of a short passage.', 'Identify the author’s tone.']
  },
  {
    id: 'active-passive', level: 'Advanced', category: 'Grammar', title: 'Active & Passive Voice', duration: '22 min',
    summary: 'Tense identify करें, object find करें और passive construction को rule-based तरीके से बनाएं।',
    rules: ['Only transitive verbs normally form passive voice.', 'Keep the tense while changing the structure.'],
    examples: ['Riya writes a letter. → A letter is written by Riya.'],
    practice: ['Change into passive: The committee approved the proposal.', 'Identify whether the sentence is active or passive.']
  },
  {
    id: 'direct-indirect', level: 'Advanced', category: 'Grammar', title: 'Direct & Indirect Speech', duration: '25 min',
    summary: 'Reporting verbs, tense backshift, pronoun changes और time-word changes को examples के साथ सीखें।',
    rules: ['Check reporting verb first.', 'Pronouns change according to speaker/listener/context.'],
    examples: ['He said, “I am tired.” → He said that he was tired.'],
    practice: ['Convert: She said, “I have finished my work.”']
  },
];

const FILTERS = ['All', 'Foundation', 'Intermediate', 'Advanced', 'SSC CGL + CHSL', 'Vocabulary', 'Reading'];

function LessonCard({ lesson, onOpen }: { lesson: typeof LESSONS[number]; onOpen: (id: string) => void }) {
  return (
    <GlassCard className="group flex h-full flex-col justify-between border-white/[0.08] bg-white/[0.025] p-5 transition hover:-translate-y-0.5 hover:border-primary/30 hover:bg-white/[0.04]">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">{lesson.level}</span>
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><Clock3 className="h-3.5 w-3.5" /> {lesson.duration}</span>
        </div>
        <h3 className="mt-3 text-lg font-semibold tracking-tight">{lesson.title}</h3>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{lesson.summary}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-muted-foreground">{lesson.category}</span>
          <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-[10px] text-emerald-300">Learn → Practice → Revise</span>
        </div>
      </div>
      <Button className="mt-5 w-full" variant="outline" onClick={() => onOpen(lesson.id)}>Open lesson <ChevronRight className="h-4 w-4" /></Button>
    </GlassCard>
  );
}

export default function EnglishMasterLibraryPage() {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [completed, setCompleted] = useState<string[]>([]);

  const filtered = useMemo(() => LESSONS.filter((l) => {
    const matchesFilter = filter === 'All' || l.level === filter || l.category === filter;
    const q = query.trim().toLowerCase();
    return matchesFilter && (!q || `${l.title} ${l.category} ${l.summary}`.toLowerCase().includes(q));
  }), [filter, query]);

  const active = activeId ? LESSONS.find((x) => x.id === activeId) : null;

  if (active) {
    const isComplete = completed.includes(active.id);
    return (
      <div className="mx-auto max-w-4xl space-y-5 animate-fade-in">
        <button onClick={() => setActiveId(null)} className="text-sm text-muted-foreground hover:text-foreground">← Back to Master Library</button>
        <GlassCard className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.12] via-white/[0.03] to-transparent p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div><span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary">{active.level}</span><h1 className="mt-4 text-3xl font-bold tracking-tight">{active.title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{active.summary}</p></div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">{active.duration}</div>
          </div>
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Concept</h2></div>
          <p className="text-sm leading-7 text-muted-foreground">नीचे दिए गए नियमों को पहले समझें। फिर examples पढ़ें और अंत में practice करें। यह lesson SSC CGL/CHSL और general English learning के लिए exam-oriented बनाया गया है।</p>
          <div className="grid gap-3 sm:grid-cols-2">{active.rules.map((rule) => <div key={rule} className="rounded-xl border border-white/8 bg-white/4 p-4 text-sm leading-6">{rule}</div>)}</div>
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Examples</h2></div>
          <div className="space-y-3">{active.examples.map((example) => <div key={example} className="rounded-xl border border-white/8 bg-white/4 p-4 text-sm leading-7">{example}</div>)}</div>
        </GlassCard>

        <GlassCard className="space-y-4 p-6">
          <div className="flex items-center gap-2"><Target className="h-5 w-5 text-primary" /><h2 className="text-xl font-semibold">Quick Practice</h2></div>
          <div className="space-y-3">{active.practice.map((q, i) => <div key={q} className="rounded-xl border border-white/8 bg-white/4 p-4 text-sm"><span className="mr-2 text-primary">{i + 1}.</span>{q}</div>)}</div>
          <div className="flex flex-wrap gap-2 pt-1"><Link href="/dashboard/english-lab"><Button variant="gradient">Practice in English Lab <ChevronRight className="h-4 w-4" /></Button></Link><Button variant="outline" onClick={() => setCompleted((c) => c.includes(active.id) ? c.filter((x) => x !== active.id) : [...c, active.id])}>{isComplete ? <><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Completed</> : 'Mark lesson complete'}</Button></div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-in">
      <GlassCard className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/[0.13] via-white/[0.03] to-transparent p-6 sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl"><div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"><GraduationCap className="h-3.5 w-3.5" /> English Master Library</div><h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">Learn English from concept to exam mastery.</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">SSC CGL / CHSL + everyday English के लिए structured lessons. हर lesson में concept, rules, examples और practice है।</p></div>
          <div className="grid grid-cols-3 gap-2 text-center"><div className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="text-xl font-bold">{LESSONS.length}</div><div className="text-[10px] text-muted-foreground">Lessons</div></div><div className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="text-xl font-bold">{completed.length}</div><div className="text-[10px] text-muted-foreground">Completed</div></div><div className="rounded-xl border border-white/10 bg-white/5 p-3"><div className="text-xl font-bold">4</div><div className="text-[10px] text-muted-foreground">Skills</div></div></div>
        </div>
      </GlassCard>

      <div className="flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search Tenses, Error Spotting, Vocabulary..." className="pl-9" /></div><Link href="/dashboard/english-lab"><Button variant="outline">Open English Lab</Button></Link></div>
      <div className="flex flex-wrap gap-2">{FILTERS.map((f) => <button key={f} onClick={() => setFilter(f)} className={cn('rounded-full border px-3 py-1.5 text-xs font-medium transition', filter === f ? 'border-primary bg-primary/12 text-primary' : 'border-white/10 text-muted-foreground hover:border-primary/20 hover:text-foreground')}>{f}</button>)}</div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} onOpen={setActiveId} />)}</div>
    </div>
  );
}
