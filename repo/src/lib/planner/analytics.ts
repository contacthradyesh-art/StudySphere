/**
 * Analytics derivation functions for StudySphere Life OS.
 * Pure functions only — no Firestore access. All types used by premium
 * planner components (focus-analytics, study-heatmap, study-timeline,
 * subject-progress) are defined and exported here.
 */

import { startOfDayMs, DAY_MS } from '@/lib/streak';
import type { PomodoroSession } from '@/lib/firestore/pomodoro-schema';
import type { Task, WeeklySlot, Subject } from '@/lib/firestore/planner-schema';

// ─── Types ───────────────────────────────────────────────────────────────────

/** One day's cell in the 30-day study heatmap. */
export interface HeatmapDay {
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** Total focused seconds that day. */
  seconds: number;
  /** Intensity bucket 0–4 (0 = no study). */
  level: 0 | 1 | 2 | 3 | 4;
}

/** Per-subject stats for the SubjectProgress component. */
export interface SubjectStat {
  subject: Subject;
  hoursThisWeek: number;
  hoursLastWeek: number;
  /** Percentage change vs last week (positive = up). */
  trendPct: number;
  tasksDone: number;
  tasksTotal: number;
  progressPct: number;
}

/** Aggregate focus analytics for the current week. */
export interface FocusAnalytics {
  /** 7-day bar chart series (Mon … Sun), current week. */
  weeklySeries: { day: string; hours: number }[];
  mostProductiveSubject: Subject | null;
  /** e.g. "Morning (8–12)" */
  bestHourLabel: string | null;
  weeklyTotalHours: number;
  /** % of this week's sessions that ran to full duration. */
  completionRate: number;
}

/** One block in the smart study timeline. */
export interface TimelineBlock {
  id: string;
  /** 'anchor' = fixed event (wake/sleep), 'break' = rest, 'focus'/'revision' = study. */
  type: 'anchor' | 'break' | 'focus' | 'revision';
  label: string;
  subject: Subject | null;
  /** Display time string e.g. "9:00 AM". */
  time: string;
  durationMinutes: number;
  completed: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function tsToDate(session: PomodoroSession): Date | null {
  const ts = session.endedAt as unknown as { toDate?: () => Date } | null;
  return ts?.toDate ? ts.toDate() : null;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function formatHour(h: number): string {
  const suffix = h < 12 ? 'AM' : 'PM';
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${display}:00 ${suffix}`;
}

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/** Map JS getDay() (0=Sun) to Mon-first index 0-6. */
function monFirstIndex(d: Date): number {
  return (d.getDay() + 6) % 7;
}

// ─── Heatmap ─────────────────────────────────────────────────────────────────

/** Build a 30-day heatmap from completed focus sessions. */
export function buildHeatmap(sessions: PomodoroSession[]): HeatmapDay[] {
  const todayMs = startOfDayMs(new Date());
  const secsByDay = new Map<number, number>();

  for (const s of sessions) {
    if (s.phase !== 'focus' || !s.completed) continue;
    const d = tsToDate(s);
    if (!d) continue;
    const key = startOfDayMs(d);
    secsByDay.set(key, (secsByDay.get(key) ?? 0) + s.completedSeconds);
  }

  const days: HeatmapDay[] = [];
  for (let i = 29; i >= 0; i--) {
    const ms = todayMs - i * DAY_MS;
    const secs = secsByDay.get(ms) ?? 0;
    const h = secs / 3600;
    const level: HeatmapDay['level'] = h === 0 ? 0 : h < 1 ? 1 : h < 2 ? 2 : h < 4 ? 3 : 4;
    days.push({ date: isoDate(new Date(ms)), seconds: secs, level });
  }
  return days;
}

/** Current streak from heatmap data (non-zero days counting back from today). */
export function currentHeatmapStreak(days: HeatmapDay[]): number {
  const sorted = [...days].reverse(); // newest first
  let streak = 0;
  for (const d of sorted) {
    if (d.seconds > 0) streak++;
    else break;
  }
  return streak;
}

// ─── Focus Analytics ─────────────────────────────────────────────────────────

/** Derive weekly focus analytics from session history. */
export function buildFocusAnalytics(sessions: PomodoroSession[]): FocusAnalytics {
  const todayMs = startOfDayMs(new Date());
  const todayDate = new Date(todayMs);
  const dayOfWeek = monFirstIndex(todayDate);
  const weekStartMs = todayMs - dayOfWeek * DAY_MS;

  const weekSeries: number[] = Array(7).fill(0);
  const subjectSecs = new Map<string, number>();
  const hourSecs = new Map<number, number>();
  let weekTotal = 0;
  let weekSessions = 0;
  let weekFull = 0;

  for (const s of sessions) {
    if (s.phase !== 'focus' || !s.completed) continue;
    const d = tsToDate(s);
    if (!d) continue;
    const dayMs = startOfDayMs(d);
    if (dayMs >= weekStartMs && dayMs <= todayMs) {
      const idx = Math.round((dayMs - weekStartMs) / DAY_MS);
      if (idx >= 0 && idx < 7) weekSeries[idx] += s.completedSeconds;
      weekTotal += s.completedSeconds;
      weekSessions++;
      if (s.completedSeconds >= s.durationSeconds) weekFull++;
      if (s.subject) subjectSecs.set(s.subject, (subjectSecs.get(s.subject) ?? 0) + s.completedSeconds);
      const hour = (d as any).getHours?.() ?? 0;
      hourSecs.set(hour, (hourSecs.get(hour) ?? 0) + s.completedSeconds);
    }
  }

  let mostProductiveSubject: Subject | null = null;
  let maxSubjectSecs = 0;
  for (const [sub, secs] of subjectSecs) {
    if (secs > maxSubjectSecs) { maxSubjectSecs = secs; mostProductiveSubject = sub as Subject; }
  }

  let bestHourLabel: string | null = null;
  let maxHourSecs = 0;
  for (const [h, secs] of hourSecs) {
    if (secs > maxHourSecs) { maxHourSecs = secs; bestHourLabel = formatHour(h); }
  }

  return {
    weeklySeries: DAY_LABELS.map((day, i) => ({ day, hours: Math.round((weekSeries[i] / 3600) * 10) / 10 })),
    mostProductiveSubject,
    bestHourLabel,
    weeklyTotalHours: Math.round((weekTotal / 3600) * 10) / 10,
    completionRate: weekSessions === 0 ? 0 : Math.round((weekFull / weekSessions) * 100)
  };
}

// ─── Subject Stats ────────────────────────────────────────────────────────────

/** Derive per-subject stats from tasks + pomodoro sessions. */
export function buildSubjectStats(tasks: Task[], sessions: PomodoroSession[]): SubjectStat[] {
  const todayMs = startOfDayMs(new Date());
  const thisWeekStart = todayMs - monFirstIndex(new Date()) * DAY_MS;
  const lastWeekStart = thisWeekStart - 7 * DAY_MS;

  const secsBySubjectThisWeek = new Map<Subject, number>();
  const secsBySubjectLastWeek = new Map<Subject, number>();

  for (const s of sessions) {
    if (s.phase !== 'focus' || !s.completed || !s.subject) continue;
    const d = tsToDate(s);
    if (!d) continue;
    const dayMs = startOfDayMs(d);
    const sub = s.subject as Subject;
    if (dayMs >= thisWeekStart) {
      secsBySubjectThisWeek.set(sub, (secsBySubjectThisWeek.get(sub) ?? 0) + s.completedSeconds);
    } else if (dayMs >= lastWeekStart) {
      secsBySubjectLastWeek.set(sub, (secsBySubjectLastWeek.get(sub) ?? 0) + s.completedSeconds);
    }
  }

  const subjects = new Set<Subject>();
  tasks.forEach((t) => { if (t.subject) subjects.add(t.subject); });
  secsBySubjectThisWeek.forEach((_, s) => subjects.add(s));

  const stats: SubjectStat[] = [];
  for (const subject of subjects) {
    const thisWeekSecs = secsBySubjectThisWeek.get(subject) ?? 0;
    const lastWeekSecs = secsBySubjectLastWeek.get(subject) ?? 0;
    const trendPct = lastWeekSecs === 0
      ? (thisWeekSecs > 0 ? 100 : 0)
      : Math.round(((thisWeekSecs - lastWeekSecs) / lastWeekSecs) * 100);
    const subjectTasks = tasks.filter((t) => t.subject === subject);
    const tasksDone = subjectTasks.filter((t) => t.completed).length;
    const tasksTotal = subjectTasks.length;
    stats.push({
      subject,
      hoursThisWeek: Math.round((thisWeekSecs / 3600) * 10) / 10,
      hoursLastWeek: Math.round((lastWeekSecs / 3600) * 10) / 10,
      trendPct,
      tasksDone,
      tasksTotal,
      progressPct: tasksTotal === 0 ? 0 : Math.round((tasksDone / tasksTotal) * 100)
    });
  }

  return stats.sort((a, b) => b.hoursThisWeek - a.hoursThisWeek).slice(0, 6);
}

// ─── Study Timeline ───────────────────────────────────────────────────────────

/** Build today's timeline from the user's weekly plan slots. */
export function buildTodayTimeline(weeklySlots: WeeklySlot[]): TimelineBlock[] {
  const todayIdx = monFirstIndex(new Date()); // 0=Mon..6=Sun
  const todaySlots = weeklySlots.filter((s) => s.day === todayIdx);
  if (todaySlots.length === 0) return [];

  const blocks: TimelineBlock[] = [];
  let hour = 8; // start at 8 AM

  blocks.push({
    id: 'anchor-start', type: 'anchor', label: 'Start study session',
    subject: null, time: '8:00 AM', durationMinutes: 0, completed: false
  });

  for (let i = 0; i < todaySlots.length; i++) {
    const slot = todaySlots[i];
    const durationMins = slot.hours * 60;
    const h = Math.floor(hour);
    const m = Math.round((hour - h) * 60);
    const suffix = h < 12 ? 'AM' : 'PM';
    const hDisplay = h === 0 ? 12 : h > 12 ? h - 12 : h;
    const timeStr = `${hDisplay}:${String(m).padStart(2, '0')} ${suffix}`;

    blocks.push({
      id: `slot-${i}`,
      type: slot.isRevision ? 'revision' : 'focus',
      label: `${slot.subject}${slot.isRevision ? ' — Revision' : ''}`,
      subject: slot.subject,
      time: timeStr,
      durationMinutes: durationMins,
      completed: false
    });

    hour += slot.hours;

    if (i < todaySlots.length - 1) {
      const breakH = Math.floor(hour);
      const breakSuffix = breakH < 12 ? 'AM' : 'PM';
      const breakHDisplay = breakH === 0 ? 12 : breakH > 12 ? breakH - 12 : breakH;
      blocks.push({
        id: `break-${i}`,
        type: 'break',
        label: 'Break',
        subject: null,
        time: `${breakHDisplay}:00 ${breakSuffix}`,
        durationMinutes: 15,
        completed: false
      });
      hour += 0.25;
    }
  }

  return blocks;
}
