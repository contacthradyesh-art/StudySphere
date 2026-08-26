'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BookOpen, BrainCircuit, CheckCircle2, ChevronDown, Clock3,
  GraduationCap, Headphones, Languages, LibraryBig, Mic2, PenLine, Search,
  Sparkles, Target, Trophy, Volume2, X
} from 'lucide-react';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

type Track = 'all' | 'foundation' | 'ssc' | 'fluency';
type Skill = 'all' | 'grammar' | 'vocabulary' | 'reading' | 'writing' | 'speaking' | 'pronunciation';

type Lesson = {
  id: string;
  title: string;
  track: Exclude<Track, 'all'>;
  skill: Exclude<Skill, 'all'>;
  level: string;
  time: string;
  exam: string;
  summary: string;
  learn: string[];
  examples: string[];
  practice: string[];
};

const LESSONS: Lesson[] = [
  {
    id: 'sentence-core', title: 'Sentence Core: Subject, Verb, Object', track: 'foundation', skill: 'grammar', level: 'A1 → A2', time: '20 min', exam: 'All',
    summary: 'Learn how English sentences are built before memorising rules. This becomes the base for error spotting, sentence improvement and writing.',
    learn: ['Subject = who/what performs or experiences the action.', 'Verb = action or state; every complete sentence needs a finite verb.', 'Object = receives the action; not every sentence needs one.', 'Learn the common patterns: S+V, S+V+O, S+V+C, S+V+O+O.'],
    examples: ['Birds fly. → S + V', 'She reads books. → S + V + O', 'He is honest. → S + V + Complement', 'They gave me a book. → S + V + O + O'],
    practice: ['Underline the subject and verb in 10 sentences.', 'Convert short Hindi thoughts into S+V+O English sentences.', 'In an SSC error question, first locate the main subject and finite verb.']
  },
  {
    id: 'parts-of-speech', title: 'Parts of Speech — the working system', track: 'foundation', skill: 'grammar', level: 'A1 → B1', time: '30 min', exam: 'CGL + CHSL',
    summary: 'Noun, pronoun, adjective, verb, adverb, preposition, conjunction, determiner/article and interjection — learn them by function, not definitions alone.',
    learn: ['Nouns name people, places, things, ideas; pronouns replace nouns.', 'Adjectives modify nouns; adverbs commonly modify verbs, adjectives or other adverbs.', 'Prepositions show relationships such as time, place, direction and cause.', 'Conjunctions connect words, phrases or clauses; identify the relationship they create.'],
    examples: ['a quick runner → adjective + noun', 'runs quickly → verb + adverb', 'under the table → preposition + noun phrase', 'because he studied → conjunction + clause'],
    practice: ['Label every word in five short sentences.', 'Find the word whose grammatical role changes with context.', 'Build one sentence using each major part of speech.']
  },
  {
    id: 'articles', title: 'Articles & Determiners', track: 'ssc', skill: 'grammar', level: 'A2 → B1', time: '35 min', exam: 'CGL + CHSL',
    summary: 'Master a/an/the, zero article and high-frequency determiner traps used in fill-in-the-blanks, error spotting and sentence improvement.',
    learn: ['Use a/an for a singular countable noun when it is non-specific; choose by sound, not spelling.', 'Use the for a specific/identified noun and many unique or superlative references.', 'Do not automatically put an article before plural or uncountable nouns when speaking generally.', 'Watch fixed patterns: go to school, have breakfast, by bus — article choice depends on meaning.'],
    examples: ['an honest man — vowel sound', 'a university — /juː/ consonant sound', 'The sun rises in the east.', 'Books are useful. / The books on my desk are useful.'],
    practice: ['Make 20 a/an/the decisions and explain every choice.', 'Collect article errors from PYQs.', 'Rewrite general vs specific noun sentences.']
  },
  {
    id: 'tenses', title: 'Tenses: timeline before formula', track: 'ssc', skill: 'grammar', level: 'A2 → B2', time: '50 min', exam: 'CGL + CHSL',
    summary: 'Understand tense through time + aspect. Then use it for spotting errors, cloze passages and sentence completion.',
    learn: ['Present simple: habits, facts, routines; present continuous: happening/temporary situations.', 'Past simple: completed past event; past continuous: action in progress at a past time.', 'Present perfect connects a past event to the present; avoid using it with a finished past-time marker like yesterday.', 'Past perfect marks the earlier of two past events when the sequence matters.', 'Future meaning can be expressed through will, be going to and present continuous depending on intention/evidence/arrangement.'],
    examples: ['She studies every day.', 'She is studying now.', 'She visited Delhi last year.', 'She has visited Delhi three times.', 'When I arrived, the train had left.'],
    practice: ['Draw a timeline for 15 sentences.', 'Correct mixed-tense error questions.', 'Write a six-sentence story using six different tense patterns.']
  },
  {
    id: 'subject-verb', title: 'Subject–Verb Agreement', track: 'ssc', skill: 'grammar', level: 'B1 → B2', time: '40 min', exam: 'CGL + CHSL',
    summary: 'One of the highest-value grammar systems for competitive exams: identify the real subject before choosing the verb.',
    learn: ['Ignore interrupting phrases: The quality of the apples is good.', 'Each, every, everyone, everybody, either and neither normally take singular verbs.', 'With either/or and neither/nor, agreement follows the nearer subject in standard exam usage.', 'Amounts, distances and periods can take singular verbs when treated as one unit.', 'Collective nouns depend on intended meaning and exam convention; follow the sentence context.'],
    examples: ['The list of items is long.', 'Each of the boys is ready.', 'Neither the teacher nor the students are late.', 'Ten kilometres is a long distance to walk.'],
    practice: ['Circle the true subject before answering.', 'Solve 30 agreement questions without looking at options first.', 'Keep an error notebook of recurring traps.']
  },
  {
    id: 'modals', title: 'Modals: ability, duty, probability & permission', track: 'ssc', skill: 'grammar', level: 'B1 → B2', time: '35 min', exam: 'CGL + CHSL',
    summary: 'Can, could, may, might, must, should, ought to, need, dare and related structures — learn meaning and grammar together.',
    learn: ['Modal + base verb: can go, should study, must finish.', 'Must can express strong obligation or strong deduction; context decides the meaning.', 'Could/might commonly express possibility; could also express past ability or polite requests.', 'Should/ought to express advice, expectation or duty depending on context.'],
    examples: ['You must wear a helmet.', 'He must be tired. He worked all night.', 'She could swim when she was five.', 'You should revise before the test.'],
    practice: ['Classify 20 modal sentences by meaning.', 'Find modal + verb form errors.', 'Rewrite direct advice using different modal strengths.']
  },
  {
    id: 'prepositions', title: 'Prepositions: time, place, movement & collocation', track: 'ssc', skill: 'grammar', level: 'A2 → B2', time: '40 min', exam: 'CGL + CHSL',
    summary: 'Stop translating prepositions word-for-word. Learn them through relationships and fixed combinations.',
    learn: ['Time: at a clock time, on a day/date, in a month/year/period.', 'Place: at a point, on a surface, in an enclosed area/space — context matters.', 'Movement: to, into, onto, through, across and towards describe different paths.', 'Learn collocations: interested in, depend on, good at, afraid of, responsible for.'],
    examples: ['at 7 p.m. / on Monday / in July', 'She is good at mathematics.', 'He walked across the road.', 'The train went through the tunnel.'],
    practice: ['Create a personal preposition map.', 'Learn 10 exam-relevant adjective/verb + preposition pairs daily.', 'Solve fill-in-the-blank sets with explanation, not guessing.']
  },
  {
    id: 'voice', title: 'Active & Passive Voice', track: 'ssc', skill: 'grammar', level: 'B1 → B2', time: '45 min', exam: 'CGL + CHSL',
    summary: 'Convert meaning without losing tense, object, auxiliary or agreement.',
    learn: ['Passive normally uses be + past participle; the tense is carried by the auxiliary.', 'Only transitive verbs can normally form a passive because a passive needs an object-derived subject.', 'Keep the original tense: writes → is written; wrote → was written; has written → has been written.', 'Use by + agent only when the doer is relevant or useful.'],
    examples: ['The clerk checks the form. → The form is checked by the clerk.', 'They completed the work. → The work was completed.', 'She has written the letter. → The letter has been written.'],
    practice: ['Convert 5 sentences for each major tense.', 'Spot wrong auxiliaries in passive constructions.', 'Explain why an intransitive verb cannot be passivised in the usual way.']
  },
  {
    id: 'narration', title: 'Direct & Indirect Speech', track: 'ssc', skill: 'grammar', level: 'B1 → B2', time: '45 min', exam: 'CHSL + CGL',
    summary: 'Master reporting verbs, tense backshift, pronouns, time/place words and question/command structures.',
    learn: ['Statements commonly use that; yes/no questions use if/whether; wh-questions keep the wh-word.', 'Commands/requests often use to + base verb after an appropriate reporting verb.', 'When the reporting verb is past, exam questions often require tense backshift unless the fact is timeless or the context prevents it.', 'Pronouns and time/place references change according to speaker, listener and situation.'],
    examples: ['He said, “I am busy.” → He said that he was busy.', 'She said, “Do you know him?” → She asked if I knew him.', 'The teacher said, “Work hard.” → The teacher advised us to work hard.'],
    practice: ['Convert 10 statements, 10 questions and 10 commands.', 'Make a table of common tense changes.', 'Watch for pronoun-reference errors.']
  },
  {
    id: 'error-spotting', title: 'Error Spotting: a repeatable 7-step method', track: 'ssc', skill: 'grammar', level: 'B1 → B2', time: '30 min', exam: 'CGL + CHSL',
    summary: 'Turn error spotting from intuition into a checklist.',
    learn: ['1) Find the main subject + verb.', '2) Check agreement.', '3) Check tense and auxiliary.', '4) Check article/determiner.', '5) Check preposition/collocation.', '6) Check pronoun/reference and modifier placement.', '7) Read the whole sentence for meaning and parallel structure.'],
    examples: ['The quality of these products are poor. → is poor.', 'He is senior than me. → senior to me.', 'She discussed about the issue. → discussed the issue.'],
    practice: ['Do 20 questions in 10 minutes.', 'For every wrong answer, name the rule category.', 'Re-test only the categories where accuracy is below 80%.']
  },
  {
    id: 'vocabulary-engine', title: 'Vocabulary Engine: roots, families, collocations', track: 'foundation', skill: 'vocabulary', level: 'A2 → C1', time: '45 min', exam: 'All',
    summary: 'Build usable vocabulary instead of collecting isolated word lists.',
    learn: ['Learn a word with meaning, part of speech, pronunciation, one collocation and one sentence.', 'Use word families: decide, decision, decisive, decisively.', 'Use roots/prefixes/suffixes to infer unfamiliar words, but verify meaning from context.', 'Prioritise high-frequency academic and exam vocabulary before rare words.'],
    examples: ['benefit → benefit from / beneficial / beneficiary', 'predict → prediction / predictable / unpredictable', 'cred → credible / incredible / credibility'],
    practice: ['Create 10 word families per week.', 'Write a sentence from memory after 24 hours.', 'Use spaced review at roughly 1, 3, 7 and 14 days.']
  },
  {
    id: 'syn-ant', title: 'Synonyms, Antonyms & Context', track: 'ssc', skill: 'vocabulary', level: 'A2 → C1', time: '35 min', exam: 'CGL + CHSL',
    summary: 'Choose the closest meaning in context rather than the word that merely looks familiar.',
    learn: ['A synonym must fit the sentence, register and grammatical role.', 'Antonyms can be absolute, gradable or contextual; exam options often test the intended sense.', 'Part of speech matters: “object” as noun and verb have different meanings.', 'Learn common confusion pairs and false friends.'],
    examples: ['abandon ≈ leave/give up; opposite ≈ retain/keep', 'brief can mean short in duration or concise in expression.', 'novel can mean new or a book depending on context.'],
    practice: ['Solve context-based synonym questions.', 'Explain why each wrong option is wrong.', 'Keep a “confusing options” list.']
  },
  {
    id: 'idioms-oneword', title: 'Idioms, Phrases & One-word Substitution', track: 'ssc', skill: 'vocabulary', level: 'B1 → C1', time: '40 min', exam: 'CGL + CHSL',
    summary: 'Build a compact, revision-friendly bank of high-frequency expressions and one-word substitutions.',
    learn: ['Learn the literal image + actual meaning + one natural sentence.', 'Group idioms by theme: secrecy, success, failure, anger, money, speed, difficulty.', 'For one-word substitution, identify the definition’s core noun/verb/adjective and eliminate near-matches.', 'Do not memorise thousands blindly; retain items that recur in exam practice or strengthen general English.'],
    examples: ['once in a blue moon → very rarely', 'a blessing in disguise → something that seems bad but proves beneficial', 'one who cannot read or write → illiterate'],
    practice: ['Review 15 expressions with active recall.', 'Use five idioms in your own sentences.', 'Take a mixed timed quiz every Sunday.']
  },
  {
    id: 'spellings', title: 'Spellings & Word Formation', track: 'ssc', skill: 'vocabulary', level: 'A2 → B2', time: '25 min', exam: 'CHSL + CGL',
    summary: 'Improve spelling through patterns, roots and active recall instead of copying words repeatedly.',
    learn: ['Notice common suffix patterns and doubled consonants.', 'Separate pronunciation from spelling; English spelling is not fully phonetic.', 'Keep a personal error list and revisit it with cover-write-check.', 'Learn commonly confused pairs: affect/effect, advice/advise, principal/principle.'],
    examples: ['accommodate — double c, double m', 'necessary — one c, double s', 'separate — remember the “par” sound/spelling'],
    practice: ['Cover the word, write it, reveal, correct.', 'Use error logs from mocks.', 'Spell words inside sentences, not as isolated lists.']
  },
  {
    id: 'cloze', title: 'Cloze Test: grammar + vocabulary + discourse', track: 'ssc', skill: 'reading', level: 'B1 → B2', time: '35 min', exam: 'CGL + CHSL',
    summary: 'Treat the passage as a connected argument. The correct answer is usually constrained by grammar, meaning and nearby context.',
    learn: ['Read the whole passage once before filling every blank.', 'Check part of speech, tense, article and preposition first.', 'Then compare semantic fit and collocation.', 'Track pronouns, connectors and repeated ideas across sentences.'],
    examples: ['However signals contrast; therefore signals result; although introduces concession.', 'A noun blank after an article may need a countable noun; a verb blank must match tense and subject.'],
    practice: ['Attempt once without options.', 'Attempt again with options and explain the elimination.', 'Record whether each miss was grammar, vocabulary or context.']
  },
  {
    id: 'reading-comprehension', title: 'Reading Comprehension: evidence-first reading', track: 'ssc', skill: 'reading', level: 'B1 → C1', time: '40 min', exam: 'CGL + CHSL + General English',
    summary: 'Read for structure, claims, evidence and inference — not word-by-word translation.',
    learn: ['Identify topic, central idea, paragraph purpose and author attitude.', 'For factual questions, return to the text and locate evidence.', 'For inference, choose what is strongly supported rather than what is merely possible.', 'Build speed through regular reading of short editorials, explainers and exam passages.'],
    examples: ['Main idea ≠ first sentence automatically.', 'Inference = what logically follows from the passage, not outside knowledge.'],
    practice: ['Read 250–400 words and write the main idea in one sentence.', 'Answer questions with evidence locations.', 'Gradually reduce reading time while preserving accuracy.']
  },
  {
    id: 'sentence-improvement', title: 'Sentence Improvement & Parallelism', track: 'ssc', skill: 'grammar', level: 'B1 → C1', time: '35 min', exam: 'CGL + CHSL',
    summary: 'Fix grammar, idiom, word choice, comparison and parallel structure while preserving the intended meaning.',
    learn: ['Parallel items should share compatible grammatical form.', 'Comparisons must compare like with like.', 'Modifiers should sit close to the word they modify.', 'Prefer the option that is grammatical, precise and natural — not merely shorter.'],
    examples: ['She likes reading, swimming and to cycle. → reading, swimming and cycling.', 'The population of Delhi is larger than Mumbai. → larger than that of Mumbai.'],
    practice: ['Identify the broken element before seeing options.', 'Compare all options for grammar + meaning.', 'Keep a list of recurring construction errors.']
  },
  {
    id: 'writing-core', title: 'Writing Core: sentence → paragraph → formal response', track: 'fluency', skill: 'writing', level: 'A2 → B2', time: '45 min', exam: 'General + exam',
    summary: 'Build clear writing that helps descriptive tasks, applications, emails and everyday communication.',
    learn: ['A strong paragraph has one controlling idea, supporting detail and a logical close.', 'Use connectors intentionally: addition, contrast, cause, result and example.', 'Prefer clear sentences over unnecessary complexity.', 'Proofread in passes: grammar, punctuation, spelling, clarity.'],
    examples: ['Claim → reason → example → conclusion is a reliable paragraph structure.', 'Use “however” for contrast, “therefore” for result and “for example” for illustration.'],
    practice: ['Write 80 words on a familiar topic.', 'Rewrite it for clarity without changing the meaning.', 'Use a four-pass proofreading checklist.']
  },
  {
    id: 'speaking-core', title: 'Speaking Core: fluency without fear', track: 'fluency', skill: 'speaking', level: 'A1 → B2', time: '20 min', exam: 'General',
    summary: 'Build usable spoken English through controlled repetition, not memorised speeches.',
    learn: ['Start with short correct sentences, then add detail.', 'Use chunks: “In my opinion…”, “The main reason is…”, “For example…”.', 'Record yourself and track hesitation, pronunciation and grammar separately.', 'Shadow short audio: listen, pause, imitate rhythm and stress.'],
    examples: ['I think… because…', 'What I mean is…', 'Let me give an example…', 'On the other hand…'],
    practice: ['Speak for 60 seconds on one topic.', 'Repeat with fewer pauses.', 'Repeat again using two new vocabulary items.']
  },
  {
    id: 'pronunciation', title: 'Pronunciation & Listening: sound before spelling', track: 'fluency', skill: 'pronunciation', level: 'A1 → B2', time: '25 min', exam: 'General',
    summary: 'Improve intelligibility and listening by learning stress, connected speech and difficult sound contrasts.',
    learn: ['English rhythm is stress-timed; stressed words carry much of the information.', 'Learn troublesome contrasts such as ship/sheep and live/leave.', 'Use a dictionary audio model and repeat rather than guessing pronunciation from spelling.', 'Train listening with short clips: listen once for gist, again for details, then shadow.'],
    examples: ['record (noun) vs record (verb) can differ in stress.', 'want to may sound reduced in connected speech; train recognition, not forced imitation.'],
    practice: ['Shadow 30 seconds daily.', 'Mark stressed words in a sentence.', 'Record and compare rhythm, not just individual sounds.']
  },
  {
    id: 'exam-mixed', title: 'SSC Mixed English Sprint', track: 'ssc', skill: 'grammar', level: 'B1 → B2', time: '25 min', exam: 'CGL + CHSL',
    summary: 'A compact daily drill combining the exact families named in the SSC syllabus.',
    learn: ['Error spotting', 'Fill in the blanks', 'Synonyms/homonyms and antonyms', 'Spellings / mis-spelt words', 'Idioms & phrases', 'One-word substitution', 'Sentence improvement', 'Active/passive voice', 'Direct/indirect narration', 'Sentence shuffling, cloze and comprehension'],
    examples: ['Do not solve every question with the same method: grammar items need rules; vocabulary items need context; comprehension needs evidence.', 'Accuracy first, then speed.'],
    practice: ['5 grammar + 5 vocabulary + 5 passage-based questions.', 'Review every wrong answer.', 'Repeat weak categories until accuracy stabilises.']
  }
];

const TRACKS: { id: Track; label: string; desc: string }[] = [
  { id: 'all', label: 'All Library', desc: 'Complete English system' },
  { id: 'foundation', label: 'Foundation', desc: 'Build from zero' },
  { id: 'ssc', label: 'SSC CGL + CHSL', desc: 'Exam-focused English' },
  { id: 'fluency', label: 'Real English', desc: 'Speak, listen, write' },
];

const SKILLS: { id: Skill; label: string }[] = [
  { id: 'all', label: 'All skills' }, { id: 'grammar', label: 'Grammar' }, { id: 'vocabulary', label: 'Vocabulary' },
  { id: 'reading', label: 'Reading' }, { id: 'writing', label: 'Writing' }, { id: 'speaking', label: 'Speaking' }, { id: 'pronunciation', label: 'Pronunciation' }
];

function Stat({ icon: Icon, label, value }: { icon: typeof BookOpen; label: string; value: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4"><Icon className="h-4 w-4 text-primary" /><p className="mt-3 text-lg font-black">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>;
}

function LessonCard({ lesson, open, onOpen }: { lesson: Lesson; open: boolean; onOpen: () => void }) {
  return <GlassCard className="overflow-hidden p-0">
    <button type="button" onClick={onOpen} className="w-full p-5 text-left transition-colors hover:bg-white/[0.025]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em]">
            <span className="rounded-full bg-primary/10 px-2 py-1 text-primary">{lesson.skill}</span>
            <span className="rounded-full bg-white/5 px-2 py-1 text-muted-foreground">{lesson.level}</span>
            <span className="rounded-full bg-white/5 px-2 py-1 text-muted-foreground">{lesson.exam}</span>
          </div>
          <h3 className="text-base font-bold">{lesson.title}</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">{lesson.summary}</p>
        </div>
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180 text-primary')} />
      </div>
      <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground"><span className="inline-flex items-center gap-1"><Clock3 className="h-3.5 w-3.5" />{lesson.time}</span><span>{lesson.learn.length} concepts</span><span>{lesson.practice.length} drills</span></div>
    </button>
    {open && <div className="border-t border-white/10 p-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">Learn</p><ul className="space-y-2 text-sm leading-6 text-muted-foreground">{lesson.learn.map((x) => <li key={x} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{x}</li>)}</ul></div>
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">Examples</p><div className="space-y-2">{lesson.examples.map((x) => <div key={x} className="rounded-xl border border-white/10 bg-black/10 p-3 text-sm">{x}</div>)}</div></div>
        <div><p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-primary">Practice</p><ol className="space-y-2 text-sm leading-6 text-muted-foreground">{lesson.practice.map((x, i) => <li key={x} className="flex gap-2"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">{i + 1}</span>{x}</li>)}</ol></div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2"><Link href="/dashboard/english-lab"><Button size="sm" variant="gradient">Practice in English Lab <ArrowRight className="h-3.5 w-3.5" /></Button></Link><Link href="/dashboard/flashcards"><Button size="sm" variant="outline">Make flashcards</Button></Link></div>
    </div>}
  </GlassCard>;
}

export default function EnglishLibraryPage() {
  const [track, setTrack] = useState<Track>('all');
  const [skill, setSkill] = useState<Skill>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(null);
  const [level, setLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LESSONS.filter((x) => {
      const matchesTrack = track === 'all' || x.track === track;
      const matchesSkill = skill === 'all' || x.skill === skill;
      const matchesQuery = !q || [x.title, x.summary, x.exam, x.skill, ...x.learn].join(' ').toLowerCase().includes(q);
      const matchesLevel = level === 'all' || (level === 'beginner' ? /A1|A2/.test(x.level) : level === 'intermediate' ? /B1|B2/.test(x.level) : /C1|C2/.test(x.level));
      return matchesTrack && matchesSkill && matchesQuery && matchesLevel;
    });
  }, [track, skill, query, level]);

  return <div className="space-y-5 animate-fade-in">
    <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-[radial-gradient(circle_at_80%_10%,hsl(var(--primary)/.22),transparent_35%),linear-gradient(135deg,hsl(var(--background)/.98),hsl(var(--primary)/.05))] p-6 sm:p-8">
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative grid gap-7 lg:grid-cols-[1.2fr_.8fr] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-primary"><LibraryBig className="h-4 w-4" /> English Master Library <span className="rounded-full border border-primary/20 px-2 py-1">Advanced</span></div>
          <h1 className="mt-3 max-w-3xl text-3xl font-black tracking-tight sm:text-5xl">One English system for exams, fluency and life.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">A structured, self-contained path from basic sentence building to advanced exam English. SSC CGL and CHSL topics are mapped directly to practice so students do not need to jump between random notes and videos.</p>
          <div className="mt-5 flex flex-wrap gap-2"><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">CEFR A1 → C2</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">SSC CGL + CHSL</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">Grammar + Vocab + Reading</span><span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs">Speaking + Writing</span></div>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-2">
          <Stat icon={BookOpen} label="Structured lessons" value={String(LESSONS.length)} />
          <Stat icon={Target} label="SSC-focused modules" value={String(LESSONS.filter((x) => x.track === 'ssc').length)} />
          <Stat icon={BrainCircuit} label="Skill coverage" value="6" />
          <Stat icon={GraduationCap} label="Learning levels" value="A1–C2" />
        </div>
      </div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <GlassCard className="p-4"><div className="flex items-center gap-3"><Languages className="h-5 w-5 text-primary" /><div><p className="text-sm font-bold">Learn the rule</p><p className="text-xs text-muted-foreground">Simple explanation + examples</p></div></div></GlassCard>
      <GlassCard className="p-4"><div className="flex items-center gap-3"><Target className="h-5 w-5 text-primary" /><div><p className="text-sm font-bold">Apply it</p><p className="text-xs text-muted-foreground">Exam-style drills</p></div></div></GlassCard>
      <GlassCard className="p-4"><div className="flex items-center gap-3"><Trophy className="h-5 w-5 text-primary" /><div><p className="text-sm font-bold">Master it</p><p className="text-xs text-muted-foreground">Review weak areas</p></div></div></GlassCard>
      <GlassCard className="p-4"><div className="flex items-center gap-3"><Sparkles className="h-5 w-5 text-primary" /><div><p className="text-sm font-bold">Use it</p><p className="text-xs text-muted-foreground">Speak + write naturally</p></div></div></GlassCard>
    </section>

    <section className="sticky top-16 z-20 rounded-2xl border border-white/10 bg-background/90 p-3 shadow-xl backdrop-blur-xl">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search grammar, tenses, idioms, cloze, voice..." className="pl-9 pr-9" />{query && <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"><X className="h-4 w-4" /></button>}</div>
        <div className="flex gap-1 overflow-x-auto scrollbar-hide">{TRACKS.map((x) => <button key={x.id} onClick={() => setTrack(x.id)} className={cn('whitespace-nowrap rounded-xl px-3 py-2 text-xs font-semibold', track === x.id ? 'bg-primary/15 text-primary' : 'text-muted-foreground hover:bg-white/5')}>{x.label}</button>)}</div>
      </div>
      <div className="mt-2 flex gap-1 overflow-x-auto scrollbar-hide">{SKILLS.map((x) => <button key={x.id} onClick={() => setSkill(x.id)} className={cn('whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-medium', skill === x.id ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/5')}>{x.label}</button>)}<span className="mx-1 h-5 w-px bg-white/10" />{(['all','beginner','intermediate','advanced'] as const).map((x) => <button key={x} onClick={() => setLevel(x)} className={cn('whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[11px] font-medium capitalize', level === x ? 'bg-white/10 text-foreground' : 'text-muted-foreground hover:bg-white/5')}>{x}</button>)}</div>
    </section>

    <div className="flex items-center justify-between gap-3"><div><p className="text-sm font-bold">Your English curriculum</p><p className="text-xs text-muted-foreground">{filtered.length} modules matched • Start with Foundation if English is weak.</p></div><Link href="/dashboard/english-lab"><Button size="sm" variant="outline">Open Practice Lab <ArrowRight className="h-3.5 w-3.5" /></Button></Link></div>

    <div className="grid gap-3">{filtered.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} open={openId === lesson.id} onOpen={() => setOpenId(openId === lesson.id ? null : lesson.id)} />)}</div>

    {filtered.length === 0 && <GlassCard className="py-12 text-center"><BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50" /><p className="mt-3 font-bold">No module found</p><p className="mt-1 text-sm text-muted-foreground">Try “tenses”, “vocabulary”, “cloze” or “voice”.</p></GlassCard>}

    <section className="grid gap-4 lg:grid-cols-3">
      <GlassCard className="lg:col-span-2"><div className="flex items-start gap-3"><Target className="mt-1 h-5 w-5 text-primary" /><div><p className="font-bold">Recommended 60-minute daily loop</p><ol className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2"><li>1. 10 min — spaced vocabulary review</li><li>2. 15 min — one grammar concept</li><li>3. 15 min — SSC mixed questions</li><li>4. 10 min — reading / cloze</li><li>5. 10 min — speaking or writing</li></ol></div></div></GlassCard>
      <GlassCard><div className="flex items-start gap-3"><CheckCircle2 className="mt-1 h-5 w-5 text-primary" /><div><p className="font-bold">Mastery rule</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Do not mark a topic complete because you read it. Mark it mastered when you can explain the rule, solve mixed questions accurately and use it in your own sentence.</p></div></div></GlassCard>
    </section>

    <GlassCard className="border-primary/15 bg-primary/[0.035]"><div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-primary">Complete path</p><h2 className="mt-1 text-lg font-black">Foundation → SSC Mastery → Real Fluency</h2><p className="mt-1 text-sm text-muted-foreground">The library follows a progressive model: build the language system, train the exact exam task families, then transfer the skill into reading, writing and speaking.</p></div><Link href="/dashboard/english-lab"><Button variant="gradient">Continue in English Lab <ArrowRight className="h-4 w-4" /></Button></Link></div></GlassCard>
  </div>;
}
