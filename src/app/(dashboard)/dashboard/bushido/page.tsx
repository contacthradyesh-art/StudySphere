'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Fraunces, Work_Sans } from 'next/font/google';
import {
  Footprints,
  Flame,
  TrendingUp,
  Trophy,
  Zap,
  Link2,
  ShieldCheck,
  Brain,
  BookOpen,
  Mail,
  Shield,
  Sunrise,
  Check,
  X,
  Lock,
  Unlock,
  Compass,
  AlertTriangle,
  AlertOctagon,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CalendarCheck,
  Target,
  PieChart,
  Quote as QuoteGlyph,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
});

const workSans = Work_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
});

/* ============================== TYPES ============================== */

interface DayEntry {
  completed: boolean;
  completedAt: string | null;
  missed: boolean;
  reflection: string;
  deepWorkMinutes: number;
  xpAwarded: number;
  honorAwarded: number;
}

interface PenaltyRecord {
  day: number;
  date: string;
  amount: number;
  reason: string;
}

interface FutureLetterEntry {
  id: string;
  content: string;
  sealedAt: string;
  unlockAt: string;
  opened: boolean;
  openedAt: string | null;
}

interface ProgressState {
  startDate: string | null;
  days: Record<number, DayEntry>;
  xp: number;
  honor: number;
  minHonorReached: number;
  longestStreak: number;
  badges: string[];
  badgeDates: Record<string, string>;
  penaltyLog: PenaltyRecord[];
  letters: FutureLetterEntry[];
  draftLetter: string;
}

interface Challenge {
  day: number;
  en: string;
  hi: string;
  trait: string;
}

interface QuoteItem {
  en: string;
  hi: string;
}

interface Rule {
  en: string;
  hi: string;
}

interface Stats {
  doneCount: number;
  totalDeepWork: number;
  reflectionCount: number;
  totalReflectionWords: number;
  traitsCount: number;
  timeBuckets: { morning: number; afternoon: number; evening: number; night: number };
  currentStreak: number;
  bestStreak: number;
  missedCount: number;
  elapsedDays: number;
  consistency: number;
  completionRate: number;
  week1: number;
  week2: number;
  week3: number;
  honor: number;
  minHonor: number;
  lettersSealed: number;
  lettersOpened: number;
}

interface Badge {
  id: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  icon: LucideIcon;
  condition: (s: Stats) => boolean;
}

type TabId = 'dashboard' | 'tracker' | 'journal' | 'letter' | 'achievements' | 'analytics' | 'rules' | 'quotes';
type DayStatus = 'unstarted' | 'locked' | 'available' | 'completed' | 'missed';

/* ============================== CONSTANTS ============================== */

const STORAGE_KEY = 'bushido-x-v2';

const CHALLENGES: Challenge[] = [
  { day: 1, en: 'Wake up at 5:30 AM without snooze. Drink water first.', hi: 'Bina snooze ke 5:30 AM uthna. Pehle paani peeyo.', trait: 'Discipline / Anushasan' },
  { day: 2, en: 'No phone for first 1 hour after waking up.', hi: 'Uthne ke pehle 1 ghante mein phone mat chhuo.', trait: 'Self-Control / Sanyam' },
  { day: 3, en: 'Do 20 pushups and 20 squats today.', hi: 'Aaj 20 pushups aur 20 squats karo.', trait: 'Strength / Shakti' },
  { day: 4, en: 'Eat clean today, no junk food, drink 2.5L water.', hi: 'Aaj clean khao - junk nahi, 2.5L paani.', trait: 'Moderation / Santulan' },
  { day: 5, en: '90 minute deep work block. Phone in another room.', hi: '90 min deep work - phone doosre kamre mein.', trait: 'Focus / Ekagrata' },
  { day: 6, en: 'Cold shower for 60 seconds minimum.', hi: 'Kam se kam 60 second cold shower lo.', trait: 'Resilience / Drudhata' },
  { day: 7, en: 'Write three things you are grateful for today.', hi: 'Aaj 3 cheezein likho jinke liye grateful ho.', trait: 'Gratitude / Kritagyata' },
  { day: 8, en: 'Wake up 5:30 AM and walk 30 minutes without phone.', hi: '5:30 AM uthna aur bina phone 30 min walk.', trait: 'Consistency / Niyamitta' },
  { day: 9, en: 'Do your hardest task first today.', hi: 'Aaj sabse mushkil kaam pehle karo.', trait: 'Priority / Pradhamikta' },
  { day: 10, en: '2 hours of deep work and no social media today.', hi: '2 ghante deep work aur aaj social media nahi.', trait: 'Willpower / Ichha Shakti' },
  { day: 11, en: '25 pushups, 25 squats, and a cold shower.', hi: '25 pushups, 25 squats aur cold shower.', trait: 'Endurance / Sahanshilta' },
  { day: 12, en: 'Sleep by 11 PM. Screen off at 10:30 PM.', hi: '11 baje tak sona. 10:30 pe screen off.', trait: 'Rest Discipline / Vishram Anushasan' },
  { day: 13, en: 'Help someone today without expecting anything back.', hi: 'Aaj kisi ki madad karo bina kisi expectation ke.', trait: 'Service / Seva' },
  { day: 14, en: 'Review your last two weeks. What improved? Write it.', hi: 'Apne 2 hafte review karo. Kya sudhra? Likho.', trait: 'Reflection / Atmachintan' },
  { day: 15, en: '3 hours of deep work in two sessions. Phone away.', hi: '2 sessions mein 3 ghante deep work. Phone door.', trait: 'Deep Focus / Gehri Ekagrata' },
  { day: 16, en: '30 pushups and 10 minutes of meditation or silence.', hi: '30 pushups aur 10 min meditation ya khamoshi.', trait: 'Stillness / Shanti' },
  { day: 17, en: 'Eat only until 80% full today. Stop before you feel stuffed.', hi: 'Aaj sirf 80% pet bharo. Pura bharne se pehle ruk jao.', trait: 'Restraint / Sanyam' },
  { day: 18, en: 'No complaints today. Zero. Accept everything.', hi: 'Aaj zero complaining. Sab accept karo.', trait: 'Acceptance / Sweekriti' },
  { day: 19, en: 'Teach someone one thing you learned this week.', hi: 'Is hafte jo seekha usme se kuch kisi ko sikhao.', trait: 'Wisdom Sharing / Gyan Daan' },
  { day: 20, en: 'Full digital detox 6 AM to 6 PM. Essential only.', hi: 'Subah 6 se sham 6 - sirf zaroori kaam ke liye phone.', trait: 'Detachment / Vairagya' },
  { day: 21, en: 'Write your before vs after. Who are you now?', hi: 'Pehle aur ab likho. Ab tum kaun ho?', trait: 'Transformation / Parivartan' },
];

const QUOTES: QuoteItem[] = [
  { en: 'Discipline is choosing what you want most over what you want right now.', hi: 'Anushasan ka matlab hai - jo abhi chahiye usse zyada, jo sabse zyada chahiye use chunna.' },
  { en: 'Small actions, repeated daily, build an unbreakable will.', hi: 'Chhoti aadatein, roz dohrayi gayi, ek atoot iraada banati hain.' },
  { en: 'You do not rise to the level of your goals, you fall to the level of your habits.', hi: 'Tum apne goals ke star tak nahi uthte, apni aadaton ke star tak girte ho.' },
  { en: 'The path is not easy, but every step forward is a victory.', hi: 'Raasta aasaan nahi, par har kadam jeet hai.' },
  { en: 'Honor is built in the moments no one is watching.', hi: 'Samman un palon mein banta hai jab koi dekh nahi raha hota.' },
  { en: 'Comfort is the enemy of growth.', hi: 'Aaram, vikas ka dushman hai.' },
];

const RULES: Rule[] = [
  { en: 'Wake up at 5:30 AM every day.', hi: 'Roz 5:30 AM uthna.' },
  { en: 'No phone in the first hour of morning.', hi: 'Subah ke pehle ghante mein phone nahi.' },
  { en: 'Do physical exercise daily.', hi: 'Roz physical exercise karo.' },
  { en: 'Cold shower at least three times a week.', hi: 'Hafte mein kam se kam 3 baar cold shower.' },
  { en: 'No junk food. Eat clean.', hi: 'Junk food nahi. Clean khao.' },
  { en: 'Minimum 90 minutes of deep work daily.', hi: 'Roz kam se kam 90 min deep work.' },
  { en: 'Sleep by 11 PM every night.', hi: 'Roz raat 11 baje tak sona.' },
  { en: 'No complaints. Accept and move forward.', hi: 'Koi complaint nahi. Accept karo aur aage badho.' },
  { en: 'Help someone every day.', hi: 'Roz kisi ki madad karo.' },
  { en: 'Review your day every night.', hi: 'Raat ko apna din review karo.' },
];

const BADGES: Badge[] = [
  { id: 'first-step', titleEn: 'First Step', titleHi: 'Pehla Kadam', descEn: 'You completed Day 1.', descHi: 'Tumne Din 1 poora kiya.', icon: Footprints, condition: (s) => s.doneCount >= 1 },
  { id: 'week-warrior', titleEn: 'Week Warrior', titleHi: 'Hafte ka Yodha', descEn: '7 days completed.', descHi: '7 din poore.', icon: Flame, condition: (s) => s.doneCount >= 7 },
  { id: 'midpoint-warrior', titleEn: 'Midpoint Warrior', titleHi: 'Aadhe Raaste ka Yodha', descEn: '11 or more days completed.', descHi: '11+ din poore.', icon: TrendingUp, condition: (s) => s.doneCount >= 11 },
  { id: 'path-complete', titleEn: 'Path Complete', titleHi: 'Sampoorna Marg', descEn: 'All 21 days completed.', descHi: 'Sabhi 21 din poore.', icon: Trophy, condition: (s) => s.doneCount >= 21 },
  { id: 'streak-7', titleEn: 'Seven Day Fire', titleHi: 'Saat Din ki Aag', descEn: 'A 7-day streak.', descHi: '7 din ka streak.', icon: Zap, condition: (s) => s.bestStreak >= 7 },
  { id: 'streak-14', titleEn: 'Unbroken Chain', titleHi: 'Atoot Zanjeer', descEn: 'A 14-day streak.', descHi: '14 din ka streak.', icon: Link2, condition: (s) => s.bestStreak >= 14 },
  { id: 'iron-honor', titleEn: 'Iron Honor', titleHi: 'Loha Jaisa Samman', descEn: 'Honor score reached 95 or higher.', descHi: 'Honor score 95+ tak pahuncha.', icon: ShieldCheck, condition: (s) => s.honor >= 95 },
  { id: 'deep-worker', titleEn: 'Deep Worker', titleHi: 'Gehra Karyakarta', descEn: '300+ minutes of deep work logged.', descHi: '300+ minute ka deep work.', icon: Brain, condition: (s) => s.totalDeepWork >= 300 },
  { id: 'reflective-mind', titleEn: 'Reflective Mind', titleHi: 'Chintansheel Mann', descEn: '10 or more journal reflections written.', descHi: '10+ journal entries likhi.', icon: BookOpen, condition: (s) => s.reflectionCount >= 10 },
  { id: 'letter-sealed', titleEn: 'Letter to Tomorrow', titleHi: 'Kal ke Naam Patra', descEn: 'Sealed a letter to your future self.', descHi: 'Bhavishya ke khud ko ek patra seal kiya.', icon: Mail, condition: (s) => s.lettersSealed >= 1 },
  { id: 'unbroken-path', titleEn: 'Unbroken Path', titleHi: 'Atoot Marg', descEn: '10+ days completed with zero misses.', descHi: '10+ din, ek bhi din nahi chuka.', icon: Shield, condition: (s) => s.doneCount >= 10 && s.missedCount === 0 },
  { id: 'comeback', titleEn: 'Return of Light', titleHi: 'Roshni ki Wapsi', descEn: 'Recovered your honor after it fell below 50.', descHi: 'Honor 50 se neeche girne ke baad wapas uthaya.', icon: Sunrise, condition: (s) => s.minHonor < 50 && s.honor >= 80 },
];

const RANKS: { min: number; en: string; hi: string }[] = [
  { min: 1, en: 'Beginner', hi: 'Shuruati' },
  { min: 3, en: 'Disciple', hi: 'Sadhak' },
  { min: 5, en: 'Warrior', hi: 'Yodha' },
  { min: 7, en: 'Tactician', hi: 'Kushal Yodha' },
  { min: 9, en: 'Guardian', hi: 'Rakshak' },
  { min: 11, en: 'Vanguard', hi: 'Agrani' },
  { min: 14, en: 'Elite Warrior', hi: 'Visisht Yodha' },
  { min: 17, en: 'Master', hi: 'Guru' },
  { min: 21, en: 'Grandmaster', hi: 'Maha Guru' },
  { min: 26, en: 'Living Legend', hi: 'Mahan Vyakti' },
];

const TABS: { id: TabId; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'tracker', label: '21-Day Path' },
  { id: 'journal', label: 'Journal' },
  { id: 'letter', label: 'Future Letter' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'rules', label: 'Iron Rules' },
  { id: 'quotes', label: 'Quotes' },
];

/* ============================== PURE HELPERS ============================== */

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function todayISO(): string {
  const d = new Date();
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function addDaysISO(iso: string, n: number): string {
  const parts = iso.split('-').map(Number);
  const d = new Date(parts[0], parts[1] - 1, parts[2]);
  d.setDate(d.getDate() + n);
  const yy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

function daysBetween(a: string, b: string): number {
  const ap = a.split('-').map(Number);
  const bp = b.split('-').map(Number);
  const da = new Date(ap[0], ap[1] - 1, ap[2]).getTime();
  const db = new Date(bp[0], bp[1] - 1, bp[2]).getTime();
  return Math.round((db - da) / 86400000);
}

function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function defaultDayEntry(): DayEntry {
  return { completed: false, completedAt: null, missed: false, reflection: '', deepWorkMinutes: 0, xpAwarded: 0, honorAwarded: 0 };
}

function defaultProgress(): ProgressState {
  return {
    startDate: null,
    days: {},
    xp: 0,
    honor: 100,
    minHonorReached: 100,
    longestStreak: 0,
    badges: [],
    badgeDates: {},
    penaltyLog: [],
    letters: [],
    draftLetter: '',
  };
}

function getDay(p: ProgressState, day: number): DayEntry {
  return p.days[day] ?? defaultDayEntry();
}

function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...defaultProgress(), ...parsed, days: parsed.days ?? {} };
    }
  } catch {
    /* ignore */
  }
  return defaultProgress();
}

function saveProgress(p: ProgressState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
}

function computeStreaks(days: Record<number, DayEntry>) {
  let best = 0, run = 0, current = 0;
  for (let d = 1; d <= 21; d++) {
    if (days[d]?.completed) { run++; best = Math.max(best, run); } else { run = 0; }
  }
  for (let d = 21; d >= 1; d--) {
    if (days[d]?.completed) current++; else break;
  }
  return { current, best };
}

function countRange(days: Record<number, DayEntry>, start: number, end: number): number {
  let c = 0;
  for (let d = start; d <= end; d++) if (days[d]?.completed) c++;
  return c;
}

function computeStats(p: ProgressState): Stats {
  const days = p.days;
  let doneCount = 0, totalDeepWork = 0, reflectionCount = 0, totalReflectionWords = 0;
  const traitDone = new Set<string>();
  const timeBuckets = { morning: 0, afternoon: 0, evening: 0, night: 0 };

  for (let d = 1; d <= 21; d++) {
    const e = days[d];
    if (!e) continue;
    if (e.completed) {
      doneCount++;
      traitDone.add(CHALLENGES[d - 1].trait);
      if (e.completedAt) {
        const h = new Date(e.completedAt).getHours();
        if (h >= 5 && h < 12) timeBuckets.morning++;
        else if (h >= 12 && h < 17) timeBuckets.afternoon++;
        else if (h >= 17 && h < 21) timeBuckets.evening++;
        else timeBuckets.night++;
      }
    }
    totalDeepWork += e.deepWorkMinutes || 0;
    if (e.reflection && e.reflection.trim().length > 10) {
      reflectionCount++;
      totalReflectionWords += e.reflection.trim().split(/\s+/).length;
    }
  }

  const { current: currentStreak, best: bestStreakComputed } = computeStreaks(days);
  const bestStreak = Math.max(bestStreakComputed, p.longestStreak);
  const missedCount = p.penaltyLog.length;
  const elapsedDays = p.startDate ? clamp(daysBetween(p.startDate, todayISO()) + 1, 0, 21) : 0;
  const consistency = elapsedDays > 0 ? Math.round((doneCount / elapsedDays) * 100) : 0;
  const completionRate = Math.round((doneCount / 21) * 100);

  return {
    doneCount,
    totalDeepWork,
    reflectionCount,
    totalReflectionWords,
    traitsCount: traitDone.size,
    timeBuckets,
    currentStreak,
    bestStreak,
    missedCount,
    elapsedDays,
    consistency,
    completionRate,
    week1: countRange(days, 1, 7),
    week2: countRange(days, 8, 14),
    week3: countRange(days, 15, 21),
    honor: p.honor,
    minHonor: p.minHonorReached,
    lettersSealed: p.letters.length,
    lettersOpened: p.letters.filter((l) => l.opened).length,
  };
}

function applyMissedCheck(p: ProgressState): ProgressState {
  if (!p.startDate) return p;
  const today = todayISO();
  let honor = p.honor;
  let xp = p.xp;
  let minHonor = p.minHonorReached;
  let penaltyLog = p.penaltyLog;
  let days = p.days;
  let changed = false;

  for (let day = 1; day <= 21; day++) {
    const due = addDaysISO(p.startDate, day - 1);
    const entry = days[day] ?? defaultDayEntry();
    if (due < today && !entry.completed && !entry.missed) {
      changed = true;
      days = { ...days, [day]: { ...entry, missed: true } };
      honor = clamp(honor - 8, 0, 100);
      xp = Math.max(0, xp - 10);
      penaltyLog = [...penaltyLog, { day, date: today, amount: 8, reason: 'Challenge missed' }];
    }
  }

  if (!changed) return p;
  minHonor = Math.min(minHonor, honor);
  return { ...p, days, honor, xp, minHonorReached: minHonor, penaltyLog };
}

function applyBadgeCheck(p: ProgressState): ProgressState {
  const stats = computeStats(p);
  const newlyUnlocked = BADGES.filter((b) => !p.badges.includes(b.id) && b.condition(stats)).map((b) => b.id);
  if (newlyUnlocked.length === 0) return p;
  const badgeDates = { ...p.badgeDates };
  const now = new Date().toISOString();
  newlyUnlocked.forEach((id) => { badgeDates[id] = now; });
  return { ...p, badges: [...p.badges, ...newlyUnlocked], badgeDates, xp: p.xp + newlyUnlocked.length * 25 };
}

function xpThreshold(level: number): number {
  return 50 * (level - 1) * level;
}

function getLevelInfo(xp: number) {
  let level = 1;
  while (xp >= xpThreshold(level + 1) && level < 50) level++;
  const curStart = xpThreshold(level);
  const nextStart = xpThreshold(level + 1);
  const span = nextStart - curStart;
  const into = xp - curStart;
  const pct = span > 0 ? clamp(Math.round((into / span) * 100), 0, 100) : 100;
  return { level, pct, xpInto: into, xpSpan: span };
}

function getRank(level: number) {
  let r = RANKS[0];
  for (const item of RANKS) if (level >= item.min) r = item;
  return r;
}

/* ============================== SMALL COMPONENTS ============================== */

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border border-[#27272f] bg-[#15151A] p-5 sm:p-6', className)}>{children}</div>;
}

function SectionHeading({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Icon size={14} className="text-[#8C8A86]" />
      <h3 className="text-sm tracking-widest text-[#8C8A86]">{children}</h3>
    </div>
  );
}

function StatTile({ label, value, accent, icon: Icon }: { label: string; value: string | number; accent?: string; icon?: LucideIcon }) {
  return (
    <div className="rounded-xl border border-[#27272f] bg-[#15151A] p-4 text-center space-y-1.5">
      {Icon && <Icon size={16} className={cn('mx-auto', accent ?? 'text-[#8C8A86]')} />}
      <div className={cn('font-mono text-2xl font-bold', accent ?? 'text-[#EDEAE3]')}>{value}</div>
      <div className="text-[11px] text-[#8C8A86] tracking-wide">{label}</div>
    </div>
  );
}

function StampSeal({ icon: Icon, size = 64, cracked = false, pulse = false }: { icon: LucideIcon; size?: number; cracked?: boolean; pulse?: boolean }) {
  const color = cracked ? '#6B6965' : '#D9472E';
  return (
    <div style={{ width: size, height: size }} className={cn('relative shrink-0', pulse && 'stamp-pop')}>
      <svg viewBox="0 0 100 100" width={size} height={size} className="absolute inset-0">
        <g filter="url(#stampInk)">
          <circle cx="50" cy="50" r="42" fill="none" stroke={color} strokeWidth="6" opacity={cracked ? 0.55 : 0.95} />
          {cracked && <path d="M18 32 L54 50 L34 76 L78 58" stroke="#0A0A0C" strokeWidth="5" fill="none" opacity="0.85" />}
        </g>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Icon size={size * 0.4} color={color} strokeWidth={2.5} />
      </div>
    </div>
  );
}

function HonorDial({ value, size = 140 }: { value: number; size?: number }) {
  const r = size / 2 - 10;
  const c = 2 * Math.PI * r;
  const v = clamp(value, 0, 100);
  const offset = c - (v / 100) * c;
  const color = v >= 80 ? '#C9A24B' : v >= 50 ? '#D9472E' : '#8B3A2F';
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn(v < 50 && 'honor-pulse')}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#27272f" strokeWidth="10" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={c}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease' }}
      />
      <text x="50%" y="46%" textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.22} fill="#EDEAE3" fontWeight={700} fontFamily="var(--font-body)">
        {v}
      </text>
      <text x="50%" y="66%" textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.08} fill="#8C8A86" fontFamily="var(--font-body)">
        HONOR
      </text>
    </svg>
  );
}

/* ============================== MAIN PAGE ============================== */

export default function BushidoXPage() {
  const [progress, setProgress] = useState<ProgressState>(defaultProgress());
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [openDay, setOpenDay] = useState<number | null>(null);
  const [stampingDay, setStampingDay] = useState<number | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const stampTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let loaded = loadProgress();
    loaded = applyMissedCheck(loaded);
    loaded = applyBadgeCheck(loaded);
    saveProgress(loaded);
    setProgress(loaded);
    setHydrated(true);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((prev) => {
        if (!prev.startDate) return prev;
        let next = applyMissedCheck(prev);
        next = applyBadgeCheck(next);
        if (next !== prev) saveProgress(next);
        return next;
      });
    }, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setQIndex((i) => (i + 1) % QUOTES.length), 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => () => { if (stampTimer.current) clearTimeout(stampTimer.current); }, []);

  const stats = useMemo(() => computeStats(progress), [progress]);
  const levelInfo = useMemo(() => getLevelInfo(progress.xp), [progress.xp]);
  const rank = getRank(levelInfo.level);
  const currentDayNumber = progress.startDate ? clamp(daysBetween(progress.startDate, todayISO()) + 1, 1, 21) : null;

  function getDayStatus(day: number): DayStatus {
    const entry = getDay(progress, day);
    if (entry.completed) return 'completed';
    if (!progress.startDate) return 'unstarted';
    if (entry.missed) return 'missed';
    const due = addDaysISO(progress.startDate, day - 1);
    return due <= todayISO() ? 'available' : 'locked';
  }

  function startChallenge() {
    setProgress((prev) => {
      if (prev.startDate) return prev;
      let next: ProgressState = { ...prev, startDate: todayISO(), xp: prev.xp + 10 };
      next = applyBadgeCheck(next);
      saveProgress(next);
      return next;
    });
  }

  function toggleDay(day: number) {
    setProgress((prev) => {
      const entry = getDay(prev, day);
      let nextDays = { ...prev.days };
      let xp = prev.xp;
      let honor = prev.honor;

      if (entry.completed) {
        xp = Math.max(0, xp - entry.xpAwarded);
        honor = clamp(honor - entry.honorAwarded, 0, 100);
        nextDays[day] = { ...entry, completed: false, completedAt: null, xpAwarded: 0, honorAwarded: 0 };
      } else {
        const tempDays = { ...prev.days, [day]: { ...entry, completed: true } };
        const { current } = computeStreaks(tempDays);
        const streakBonus = Math.min(current * 5, 50);
        const xpGain = 40 + streakBonus;
        const honorGain = 3;
        xp += xpGain;
        honor = clamp(honor + honorGain, 0, 100);
        nextDays[day] = { ...entry, completed: true, completedAt: new Date().toISOString(), xpAwarded: xpGain, honorAwarded: honorGain };
        setStampingDay(day);
        if (stampTimer.current) clearTimeout(stampTimer.current);
        stampTimer.current = setTimeout(() => setStampingDay(null), 600);
      }

      const minHonor = Math.min(prev.minHonorReached, honor);
      const { best } = computeStreaks(nextDays);
      const longestStreak = Math.max(prev.longestStreak, best);

      let next: ProgressState = { ...prev, days: nextDays, xp, honor, minHonorReached: minHonor, longestStreak };
      next = applyMissedCheck(next);
      next = applyBadgeCheck(next);
      saveProgress(next);
      return next;
    });
  }

  function saveReflection(day: number, text: string) {
    setProgress((prev) => {
      const entry = getDay(prev, day);
      const hadBefore = entry.reflection.trim().length > 10;
      const nextDays = { ...prev.days, [day]: { ...entry, reflection: text } };
      let xp = prev.xp;
      if (!hadBefore && text.trim().length > 10) xp += 15;
      let next: ProgressState = { ...prev, days: nextDays, xp };
      next = applyBadgeCheck(next);
      saveProgress(next);
      return next;
    });
  }

  function setDeepWork(day: number, minutes: number) {
    setProgress((prev) => {
      const entry = getDay(prev, day);
      const nextDays = { ...prev.days, [day]: { ...entry, deepWorkMinutes: clamp(Math.round(minutes) || 0, 0, 600) } };
      let next: ProgressState = { ...prev, days: nextDays };
      next = applyBadgeCheck(next);
      saveProgress(next);
      return next;
    });
  }

  function updateDraft(text: string) {
    setProgress((prev) => {
      const next = { ...prev, draftLetter: text };
      saveProgress(next);
      return next;
    });
  }

  function sealLetter() {
    setProgress((prev) => {
      if (!prev.draftLetter.trim()) return prev;
      const base = prev.startDate ? addDaysISO(prev.startDate, 21) : addDaysISO(todayISO(), 21);
      const unlockAt = base > todayISO() ? base : addDaysISO(todayISO(), 1);
      const entry: FutureLetterEntry = { id: generateId(), content: prev.draftLetter, sealedAt: new Date().toISOString(), unlockAt, opened: false, openedAt: null };
      let next: ProgressState = { ...prev, letters: [entry, ...prev.letters], draftLetter: '' };
      next = applyBadgeCheck(next);
      saveProgress(next);
      return next;
    });
  }

  function openLetter(id: string) {
    setProgress((prev) => {
      const letters = prev.letters.map((l) => (l.id === id ? { ...l, opened: true, openedAt: new Date().toISOString() } : l));
      const next = { ...prev, letters };
      saveProgress(next);
      return next;
    });
  }

  function resetProgress() {
    if (!confirm('Pura safar reset karna hai? Sab kuch mit jayega. / Reset your entire journey? Everything will be erased.')) return;
    const fresh = defaultProgress();
    setProgress(fresh);
    setOpenDay(null);
    saveProgress(fresh);
  }

  if (!hydrated) {
    return (
      <div className={cn('min-h-[60vh] flex items-center justify-center bg-[#0A0A0C] text-[#8C8A86]', fraunces.variable, workSans.variable)} style={{ fontFamily: 'var(--font-body), sans-serif' }}>
        <div className="text-center space-y-3">
          <Compass size={32} className="text-[#D9472E] mx-auto animate-pulse" />
          <p className="text-sm">Loading your path...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('min-h-screen bg-[#0A0A0C] text-[#EDEAE3]', fraunces.variable, workSans.variable)} style={{ fontFamily: 'var(--font-body), sans-serif' }}>
      <svg width="0" height="0" className="absolute">
        <defs>
          <filter id="stampInk" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise" seed="4" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="2.5" />
          </filter>
        </defs>
      </svg>

      <style jsx global>{`
        @keyframes stampPop {
          0% { transform: scale(0.3) rotate(-15deg); opacity: 0; }
          60% { transform: scale(1.15) rotate(4deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .stamp-pop { animation: stampPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
        @keyframes honorPulse {
          0%, 100% { filter: drop-shadow(0 0 0 rgba(139, 58, 47, 0)); }
          50% { filter: drop-shadow(0 0 8px rgba(139, 58, 47, 0.55)); }
        }
        .honor-pulse { animation: honorPulse 2.2s ease-in-out infinite; }
        @keyframes bannerPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(139, 58, 47, 0.35); }
          50% { box-shadow: 0 0 0 6px rgba(139, 58, 47, 0); }
        }
        .banner-pulse { animation: bannerPulse 2s ease-in-out infinite; }
        @keyframes letterReveal {
          0% { opacity: 0; transform: translateY(6px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .letter-reveal { animation: letterReveal 0.6s ease; }
        @keyframes pageIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .page-in { animation: pageIn 0.45s ease; }
      `}</style>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 space-y-6 page-in">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#D9472E] font-mono text-xs tracking-widest">BUSHIDO X</span>
              <span className="text-xs text-[#5C5A56] tracking-widest">· SELF MASTERY CHALLENGE</span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-display), serif' }}>
              Bushido X
            </h1>
            <p className="text-sm text-[#8C8A86] mt-0.5">21 din mein khud ko nirmit karo. / Build yourself in 21 days.</p>
          </div>
          <Compass size={40} className="text-[#D9472E] opacity-20 shrink-0" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1 border-b border-[#27272f]">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'shrink-0 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-t-lg transition-colors -mb-px border-b-2 whitespace-nowrap',
                activeTab === t.id ? 'text-[#D9472E] border-[#D9472E] bg-[#D9472E]/5' : 'text-[#8C8A86] border-transparent hover:text-[#EDEAE3] hover:bg-[#15151A]'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ===================== DASHBOARD ===================== */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {!progress.startDate ? (
              <SectionCard className="text-center py-12 space-y-5">
                <Compass size={48} className="mx-auto text-[#D9472E]" />
                <h2 className="text-2xl sm:text-3xl" style={{ fontFamily: 'var(--font-display), serif' }}>
                  The Path Has Not Begun
                </h2>
                <p className="text-sm text-[#8C8A86] max-w-md mx-auto">
                  Bushido X tumhe 21 din mein anushasan, focus aur honor sikhayega. Shuru karne ke baad, har din ginta hai. / Bushido X builds discipline, focus and honor over 21 days. Once you begin, every day counts.
                </p>
                <button onClick={startChallenge} className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#D9472E] text-white font-medium hover:bg-[#c13b25] transition-colors">
                  <Compass size={16} /> Begin the Path — Patha Shuru Karo
                </button>
              </SectionCard>
            ) : (
              <>
                {stats.honor < 50 && (
                  <div className="rounded-xl border border-[#8B3A2F] bg-[#8B3A2F]/10 px-4 py-3 text-sm text-[#e8a99e] banner-pulse flex items-center gap-2.5">
                    <AlertTriangle size={16} className="shrink-0" />
                    <span>Tumhara honor khatre mein hai. Aaj ka challenge poora karo. / Your honor is in danger. Complete today&apos;s challenge to restore it.</span>
                  </div>
                )}

                <SectionCard className="flex flex-col sm:flex-row items-center gap-6">
                  <HonorDial value={progress.honor} />
                  <div className="flex-1 w-full space-y-3 text-center sm:text-left">
                    <div>
                      <span className="text-xs tracking-widest text-[#8C8A86]">
                        LEVEL {levelInfo.level} · {rank.en.toUpperCase()}
                      </span>
                      <p className="text-xs text-[#8C8A86]">{rank.hi}</p>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-[#8C8A86]">
                        <span>{progress.xp} XP</span>
                        <span>{levelInfo.xpInto} / {levelInfo.xpSpan} to next level</span>
                      </div>
                      <div className="h-2 rounded-full bg-[#1B1B22] overflow-hidden">
                        <div className="h-2 rounded-full bg-[#C9A24B] transition-all duration-700" style={{ width: `${levelInfo.pct}%` }} />
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatTile label="Din Poore / Days" value={`${stats.doneCount}/21`} icon={CalendarCheck} />
                  <StatTile label="Streak" value={stats.currentStreak} accent="text-[#D9472E]" icon={Flame} />
                  <StatTile label="Consistency" value={`${stats.consistency}%`} accent="text-[#4F8767]" icon={Target} />
                  <StatTile label="Deep Work" value={`${Math.round((stats.totalDeepWork / 60) * 10) / 10}h`} accent="text-[#C9A24B]" icon={Brain} />
                </div>

                {stats.completionRate === 100 ? (
                  <SectionCard className="text-center py-10 space-y-4">
                    <StampSeal icon={Trophy} size={72} />
                    <h2 className="text-2xl" style={{ fontFamily: 'var(--font-display), serif' }}>
                      The Path is Complete
                    </h2>
                    <p className="text-sm text-[#8C8A86] max-w-md mx-auto">
                      Tumne 21 din ka Bushido path poora kar liya. Final honor: {progress.honor}. / You have completed the 21-day Bushido path. Final honor: {progress.honor}.
                    </p>
                    <button onClick={() => setActiveTab('letter')} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#C9A24B]/50 text-[#C9A24B] text-sm hover:bg-[#C9A24B]/10">
                      Write to Your Future Self <ArrowRight size={14} />
                    </button>
                  </SectionCard>
                ) : (
                  currentDayNumber && (
                    <SectionCard>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs tracking-widest text-[#8C8A86]">AAJ / TODAY · DIN {currentDayNumber}</span>
                        {getDay(progress, currentDayNumber).completed && (
                          <span className="text-xs text-[#4F8767] inline-flex items-center gap-1">
                            <Check size={12} /> Poora hua
                          </span>
                        )}
                      </div>
                      <p className="text-base font-medium mb-1">{CHALLENGES[currentDayNumber - 1].en}</p>
                      <p className="text-sm text-[#8C8A86] mb-4">{CHALLENGES[currentDayNumber - 1].hi}</p>
                      <button
                        onClick={() => { setActiveTab('tracker'); setOpenDay(currentDayNumber); }}
                        className="inline-flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border border-[#D9472E]/50 text-[#D9472E] hover:bg-[#D9472E]/10"
                      >
                        View in Tracker <ArrowRight size={14} />
                      </button>
                    </SectionCard>
                  )
                )}

                <SectionCard>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Trophy size={14} className="text-[#8C8A86]" />
                      <h3 className="text-sm tracking-widest text-[#8C8A86]">RECENT ACHIEVEMENTS</h3>
                    </div>
                    <button onClick={() => setActiveTab('achievements')} className="text-xs text-[#D9472E] inline-flex items-center gap-1">
                      View all <ArrowRight size={12} />
                    </button>
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    {progress.badges.length === 0 && (
                      <p className="text-sm text-[#5C5A56]">Abhi tak koi badge nahi. Apna pehla din poora karo. / No badges yet. Complete your first day.</p>
                    )}
                    {progress.badges.slice(-4).reverse().map((id) => {
                      const b = BADGES.find((x) => x.id === id);
                      if (!b) return null;
                      const Icon = b.icon;
                      return (
                        <div key={id} className="flex flex-col items-center gap-1 w-16">
                          <div className="w-12 h-12 rounded-full bg-[#C9A24B]/10 border border-[#C9A24B]/40 flex items-center justify-center text-[#C9A24B]">
                            <Icon size={20} />
                          </div>
                          <span className="text-[10px] text-center text-[#8C8A86]">{b.titleEn}</span>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              </>
            )}
          </div>
        )}

        {/* ===================== TRACKER ===================== */}
        {activeTab === 'tracker' && (
          <div className="space-y-6">
            {!progress.startDate && (
              <SectionCard className="text-center py-8">
                <p className="text-sm text-[#8C8A86] mb-4">Shuru karne ke liye Dashboard pe jao. / Go to Dashboard to begin the path.</p>
                <button onClick={() => setActiveTab('dashboard')} className="text-sm text-[#D9472E] inline-flex items-center gap-1">
                  Go to Dashboard <ArrowRight size={14} />
                </button>
              </SectionCard>
            )}

            <div className="flex justify-end">
              <button onClick={resetProgress} className="inline-flex items-center gap-1.5 text-xs text-[#8C8A86] hover:text-[#8B3A2F] border border-[#27272f] rounded-lg px-3 py-1.5">
                <RotateCcw size={12} /> Reset Path / Phir Shuru Karo
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-7 gap-2">
              {CHALLENGES.map(({ day }) => {
                const status = getDayStatus(day);
                const isOpen = openDay === day;
                return (
                  <button
                    key={day}
                    onClick={() => setOpenDay(isOpen ? null : day)}
                    className={cn(
                      'aspect-square rounded-xl border flex flex-col items-center justify-center relative overflow-hidden transition-all duration-200',
                      status === 'completed' && 'border-[#D9472E] bg-[#D9472E]/5',
                      status === 'missed' && 'border-[#8B3A2F]/60 bg-[#8B3A2F]/5',
                      status === 'available' && 'border-[#C9A24B]/60 bg-[#C9A24B]/5',
                      (status === 'locked' || status === 'unstarted') && 'border-[#27272f] bg-[#15151A] opacity-50',
                      isOpen && 'ring-2 ring-[#D9472E]/50'
                    )}
                  >
                    {status !== 'completed' && status !== 'missed' && <span className="font-mono text-xs text-[#8C8A86]">{day}</span>}
                    {status === 'completed' && <StampSeal icon={Check} size={40} pulse={stampingDay === day} />}
                    {status === 'missed' && <StampSeal icon={X} size={40} cracked />}
                    {status === 'locked' && <Lock size={10} className="absolute bottom-1.5 text-[#5C5A56]" />}
                  </button>
                );
              })}
            </div>

            {openDay !== null && (() => {
              const entry = getDay(progress, openDay);
              const status = getDayStatus(openDay);
              const challenge = CHALLENGES[openDay - 1];
              const canAct = status === 'available' || status === 'completed' || status === 'missed';
              return (
                <SectionCard className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm text-[#D9472E]">DIN {openDay} / DAY {openDay}</span>
                    <button onClick={() => setOpenDay(null)} className="inline-flex items-center gap-1 text-xs text-[#8C8A86] hover:text-[#EDEAE3]">
                      <X size={14} /> Band Karo
                    </button>
                  </div>

                  <span className="inline-block text-[11px] px-2 py-1 rounded-full bg-[#C9A24B]/10 text-[#C9A24B] border border-[#C9A24B]/30">{challenge.trait}</span>

                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-[#8C8A86]">Aaj ka Challenge / Today&apos;s Challenge</p>
                    <p className="text-base font-medium">{challenge.en}</p>
                    <p className="text-sm text-[#8C8A86]">{challenge.hi}</p>
                  </div>

                  {(status === 'locked' || status === 'unstarted') && (
                    <p className="text-xs text-[#5C5A56] flex items-start gap-1.5">
                      <Lock size={12} className="mt-0.5 shrink-0" />
                      Yeh din abhi locked hai. Pehle aaj ka din poora karo. / This day is still locked. Complete today&apos;s challenge first.
                    </p>
                  )}
                  {status === 'missed' && !entry.completed && (
                    <p className="text-xs text-[#c98074] flex items-start gap-1.5">
                      <AlertOctagon size={12} className="mt-0.5 shrink-0" />
                      Yeh din chhoot gaya — honor mein -8 ka asar hua. Ab bhi poora kar sakte ho. / This day was missed, honor took an -8 penalty. You can still complete it.
                    </p>
                  )}

                  {canAct && (
                    <button
                      onClick={() => toggleDay(openDay)}
                      className={cn(
                        'w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                        entry.completed ? 'border border-[#D9472E]/50 text-[#D9472E] hover:bg-[#D9472E]/10' : 'bg-[#D9472E] text-white hover:bg-[#c13b25]'
                      )}
                    >
                      <Check size={16} />
                      {entry.completed ? 'Complete — Undo Karo' : 'Mark Complete — Stamp Lagao'}
                    </button>
                  )}

                  <div className="pt-2 border-t border-[#27272f]">
                    <label className="text-xs uppercase tracking-widest text-[#8C8A86] flex items-center gap-1.5">
                      <Clock size={12} /> Deep Work (minutes)
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={600}
                      value={entry.deepWorkMinutes}
                      onChange={(e) => setDeepWork(openDay, Number(e.target.value))}
                      className="mt-1 w-full rounded-lg bg-[#1B1B22] border border-[#27272f] px-3 py-2 text-sm focus:outline-none focus:border-[#D9472E]"
                    />
                  </div>

                  <div>
                    <label className="text-xs uppercase tracking-widest text-[#8C8A86] flex items-center gap-1.5">
                      <BookOpen size={12} /> Reflection / Atmaparikshan
                    </label>
                    <textarea
                      value={entry.reflection}
                      onChange={(e) => saveReflection(openDay, e.target.value)}
                      rows={3}
                      placeholder="Aaj kya seekha? / What did you learn today?"
                      className="mt-1 w-full rounded-lg bg-[#1B1B22] border border-[#27272f] px-3 py-2 text-sm focus:outline-none focus:border-[#D9472E] resize-none"
                    />
                  </div>
                </SectionCard>
              );
            })()}
          </div>
        )}

        {/* ===================== JOURNAL ===================== */}
        {activeTab === 'journal' && (
          <div className="space-y-4">
            <p className="text-sm text-[#8C8A86] flex items-center gap-2">
              <BookOpen size={14} /> Tumhari atma-chintan ki diary. / Your reflection journal.
            </p>
            {stats.reflectionCount === 0 ? (
              <SectionCard className="text-center py-10">
                <p className="text-sm text-[#5C5A56]">
                  Abhi koi entry nahi. Tracker mein din complete karke likhna shuru karo. / No entries yet. Complete a day in the Tracker to start writing.
                </p>
              </SectionCard>
            ) : (
              Array.from({ length: 21 }, (_, i) => 21 - i).map((day) => {
                const entry = getDay(progress, day);
                if (!entry.reflection || entry.reflection.trim().length <= 10) return null;
                return (
                  <SectionCard key={day}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-[#D9472E]">DIN {day}</span>
                      <span className="text-[11px] text-[#5C5A56]">{entry.completedAt ? new Date(entry.completedAt).toLocaleDateString() : ''}</span>
                    </div>
                    <p className="text-xs text-[#C9A24B] mb-2">{CHALLENGES[day - 1].trait}</p>
                    <p className="text-sm text-[#EDEAE3] whitespace-pre-wrap">{entry.reflection}</p>
                    {entry.deepWorkMinutes > 0 && (
                      <p className="text-[11px] text-[#8C8A86] mt-2 flex items-center gap-1">
                        <Clock size={11} /> {entry.deepWorkMinutes} min deep work
                      </p>
                    )}
                  </SectionCard>
                );
              })
            )}
          </div>
        )}

        {/* ===================== FUTURE LETTER ===================== */}
        {activeTab === 'letter' && (
          <div className="space-y-6">
            <SectionCard className="space-y-4">
              <SectionHeading icon={Mail}>WRITE TO YOUR FUTURE SELF</SectionHeading>
              <p className="text-xs text-[#5C5A56]">
                Apne bhavishya ke khud ko ek patra likho. Seal karne ke baad yeh 21 din tak band rahega. / Write a letter to your future self. Once sealed, it stays locked for 21 days.
              </p>
              <textarea
                value={progress.draftLetter}
                onChange={(e) => updateDraft(e.target.value)}
                rows={6}
                placeholder="Pyare bhavishya ke mujhe... / Dear future me..."
                className="w-full rounded-lg bg-[#1B1B22] border border-[#27272f] px-3 py-3 text-sm focus:outline-none focus:border-[#D9472E] resize-none"
              />
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <span className="text-[11px] text-[#5C5A56]">{progress.draftLetter.trim().length} characters</span>
                <button
                  disabled={!progress.draftLetter.trim()}
                  onClick={sealLetter}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D9472E] text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#c13b25]"
                >
                  <Lock size={16} /> Seal Letter — Patra Seal Karo
                </button>
              </div>
            </SectionCard>

            <div className="space-y-3">
              {progress.letters.length === 0 && <p className="text-sm text-[#5C5A56] text-center py-6">Koi sealed letter nahi. / No sealed letters yet.</p>}
              {progress.letters.map((letter) => {
                const unlocked = todayISO() >= letter.unlockAt;
                return (
                  <SectionCard key={letter.id} className="space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs text-[#8C8A86]">Sealed {new Date(letter.sealedAt).toLocaleDateString()}</span>
                      {!unlocked && <span className="text-xs text-[#C9A24B]">Unlocks {letter.unlockAt}</span>}
                    </div>
                    {!unlocked ? (
                      <div className="flex flex-col items-center py-6 gap-3">
                        <StampSeal icon={Lock} size={56} />
                        <p className="text-xs text-[#5C5A56]">Yeh patra abhi seal hai. / This letter is still sealed.</p>
                      </div>
                    ) : !letter.opened ? (
                      <div className="flex flex-col items-center py-6 gap-3">
                        <StampSeal icon={Unlock} size={56} />
                        <button onClick={() => openLetter(letter.id)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#C9A24B]/50 text-[#C9A24B] text-sm hover:bg-[#C9A24B]/10">
                          <Unlock size={14} /> Open Letter — Patra Kholo
                        </button>
                      </div>
                    ) : (
                      <div className="letter-reveal">
                        {letter.openedAt && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#8C8A86] mb-2">
                            <Mail size={11} /> Opened {new Date(letter.openedAt).toLocaleDateString()}
                          </span>
                        )}
                        <p className="text-sm whitespace-pre-wrap text-[#EDEAE3]">{letter.content}</p>
                      </div>
                    )}
                  </SectionCard>
                );
              })}
            </div>
          </div>
        )}

        {/* ===================== ACHIEVEMENTS ===================== */}
        {activeTab === 'achievements' && (
          <div className="grid sm:grid-cols-2 gap-3">
            {BADGES.map((b) => {
              const unlocked = progress.badges.includes(b.id);
              const Icon = b.icon;
              return (
                <SectionCard key={b.id} className={cn('flex items-center gap-4', !unlocked && 'opacity-50')}>
                  <div
                    className={cn(
                      'w-14 h-14 rounded-full flex items-center justify-center shrink-0',
                      unlocked ? 'bg-[#C9A24B]/10 border border-[#C9A24B]/50 text-[#C9A24B]' : 'bg-[#1B1B22] border border-[#27272f] text-[#5C5A56]'
                    )}
                  >
                    <Icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {b.titleEn} <span className="text-[#5C5A56] font-normal">/ {b.titleHi}</span>
                    </p>
                    <p className="text-xs text-[#8C8A86] mt-0.5">{unlocked ? b.descEn : '???'}</p>
                    {unlocked && progress.badgeDates[b.id] && (
                      <p className="text-[10px] text-[#5C5A56] mt-1">Unlocked {new Date(progress.badgeDates[b.id]).toLocaleDateString()}</p>
                    )}
                  </div>
                </SectionCard>
              );
            })}
          </div>
        )}

        {/* ===================== ANALYTICS ===================== */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatTile label="Completion Rate" value={`${stats.completionRate}%`} icon={PieChart} />
              <StatTile label="Consistency" value={`${stats.consistency}%`} accent="text-[#4F8767]" icon={Target} />
              <StatTile label="Missed Days" value={stats.missedCount} accent="text-[#8B3A2F]" icon={AlertOctagon} />
              <StatTile label="Best Streak" value={stats.bestStreak} accent="text-[#D9472E]" icon={Flame} />
            </div>

            <SectionCard>
              <SectionHeading icon={CalendarCheck}>WEEKLY BREAKDOWN</SectionHeading>
              <div className="space-y-3">
                {[
                  ['Week 1 (Din 1-7)', stats.week1],
                  ['Week 2 (Din 8-14)', stats.week2],
                  ['Week 3 (Din 15-21)', stats.week3],
                ].map(([label, val]) => (
                  <div key={label as string}>
                    <div className="flex justify-between text-xs text-[#8C8A86] mb-1">
                      <span>{label}</span>
                      <span>{val}/7</span>
                    </div>
                    <div className="h-2 rounded-full bg-[#1B1B22] overflow-hidden">
                      <div className="h-2 rounded-full bg-[#D9472E] transition-all duration-700" style={{ width: `${((val as number) / 7) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeading icon={Target}>CONSISTENCY MAP</SectionHeading>
              <div className="grid grid-cols-7 gap-1.5">
                {CHALLENGES.map(({ day }) => {
                  const status = getDayStatus(day);
                  return (
                    <div
                      key={day}
                      title={`Day ${day}: ${status}`}
                      className={cn(
                        'aspect-square rounded-md',
                        status === 'completed' && 'bg-[#D9472E]',
                        status === 'missed' && 'bg-[#8B3A2F]/60',
                        status === 'available' && 'bg-[#C9A24B]/50',
                        (status === 'locked' || status === 'unstarted') && 'bg-[#1B1B22]'
                      )}
                    />
                  );
                })}
              </div>
              <div className="flex gap-4 mt-3 text-[10px] text-[#8C8A86] flex-wrap">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#D9472E] inline-block" />Complete</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#8B3A2F]/60 inline-block" />Missed</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#C9A24B]/50 inline-block" />Due</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-[#1B1B22] inline-block" />Locked</span>
              </div>
            </SectionCard>

            <SectionCard>
              <SectionHeading icon={Clock}>WHEN YOU SHOW UP</SectionHeading>
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  ['Morning', '5-12', stats.timeBuckets.morning],
                  ['Afternoon', '12-5', stats.timeBuckets.afternoon],
                  ['Evening', '5-9', stats.timeBuckets.evening],
                  ['Night', '9-5', stats.timeBuckets.night],
                ].map(([label, range, val]) => (
                  <div key={label as string}>
                    <div className="font-mono text-xl text-[#C9A24B]">{val as number}</div>
                    <div className="text-[10px] text-[#8C8A86]">{label}</div>
                    <div className="text-[9px] text-[#5C5A56]">{range}</div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <div className="grid sm:grid-cols-2 gap-3">
              <SectionCard>
                <SectionHeading icon={Brain}>DEEP WORK</SectionHeading>
                <p className="font-mono text-3xl text-[#C9A24B]">{Math.round((stats.totalDeepWork / 60) * 10) / 10}h</p>
                <p className="text-xs text-[#8C8A86] mt-1">{stats.totalDeepWork} total minutes across {stats.doneCount} days</p>
              </SectionCard>
              <SectionCard>
                <SectionHeading icon={BookOpen}>REFLECTIONS</SectionHeading>
                <p className="font-mono text-3xl text-[#C9A24B]">{stats.reflectionCount}</p>
                <p className="text-xs text-[#8C8A86] mt-1">{stats.totalReflectionWords} words written · {stats.traitsCount}/21 traits practiced</p>
              </SectionCard>
            </div>
          </div>
        )}

        {/* ===================== RULES ===================== */}
        {activeTab === 'rules' && (
          <div className="space-y-3">
            <p className="text-sm text-[#8C8A86] flex items-center gap-2">
              <ShieldCheck size={14} /> Yeh rules hain, guidelines nahi. Inhe todna honor kam karta hai. / These are rules, not guidelines. Breaking them costs honor.
            </p>
            {RULES.map((r, i) => (
              <SectionCard key={i} className="flex gap-4">
                <span className="font-mono text-[#D9472E] text-sm shrink-0">{String(i + 1).padStart(2, '0')}</span>
                <div>
                  <p className="text-sm font-medium">{r.en}</p>
                  <p className="text-xs text-[#8C8A86] mt-0.5">{r.hi}</p>
                </div>
              </SectionCard>
            ))}
          </div>
        )}

        {/* ===================== QUOTES ===================== */}
        {activeTab === 'quotes' && (
          <div className="space-y-4">
            <SectionCard className="py-8 text-center space-y-4">
              <QuoteGlyph size={36} className="mx-auto text-[#D9472E] opacity-70" />
              <p className="text-lg font-medium">{QUOTES[qIndex].en}</p>
              <p className="text-sm text-[#8C8A86]">{QUOTES[qIndex].hi}</p>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => setQIndex((i) => (i - 1 + QUOTES.length) % QUOTES.length)}
                  className="w-9 h-9 rounded-full border border-[#27272f] flex items-center justify-center hover:border-[#D9472E] hover:text-[#D9472E]"
                >
                  <ChevronLeft size={16} />
                </button>
                <div className="flex gap-1.5">
                  {QUOTES.map((_, i) => (
                    <span
                      key={i}
                      onClick={() => setQIndex(i)}
                      className={cn('w-2 h-2 rounded-full cursor-pointer', i === qIndex ? 'bg-[#D9472E]' : 'bg-[#27272f]')}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setQIndex((i) => (i + 1) % QUOTES.length)}
                  className="w-9 h-9 rounded-full border border-[#27272f] flex items-center justify-center hover:border-[#D9472E] hover:text-[#D9472E]"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </SectionCard>
          </div>
        )}

        {/* Footer */}
        <div className="pt-8 border-t border-[#27272f] text-center space-y-2">
          <Compass size={22} className="text-[#D9472E] opacity-40 mx-auto" />
          <p className="text-xs text-[#5C5A56]">21 din ke baad jo bachega — wahi asli tum ho. / After 21 days, what remains is the real you.</p>
        </div>
      </div>
    </div>
  );
}