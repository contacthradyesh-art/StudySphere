import { SUBJECTS, type Subject, type WeeklySlot } from '@/lib/firestore/planner-schema';

export interface PlanRequest {
  /** Subjects the student wants to focus on. */
  subjects: Subject[];
  /** Total study hours available across the week. */
  weeklyHours: number;
  /** Subjects the student feels weak in get a heavier weighting. */
  weakSubjects?: Subject[];
}

/**
 * Deterministic study-plan generator (Milestone 2).
 *
 * Balances workload across the chosen subjects, weights weak subjects more
 * heavily, and reserves the final day of each subject block for revision.
 * This is intentionally local + dependency-free; a Cloud Function with an LLM
 * can be swapped in later behind the same interface.
 */
export function generateWeeklyPlan(req: PlanRequest): WeeklySlot[] {
  const subjects = req.subjects.length ? req.subjects : [...SUBJECTS].slice(0, 4);
  const weak = new Set(req.weakSubjects ?? []);

  // Weight: weak subjects count double when splitting hours.
  const weights = subjects.map((s) => (weak.has(s) ? 2 : 1));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const totalHours = Math.max(1, req.weeklyHours);

  const slots: WeeklySlot[] = [];
  let day = 0;

  subjects.forEach((subject, i) => {
    const subjectHours = Math.round((totalHours * weights[i]) / totalWeight);
    if (subjectHours <= 0) return;

    // Split a subject's hours into ~2h study blocks across consecutive days.
    let remaining = subjectHours;
    while (remaining > 0) {
      const hours = Math.min(2, remaining);
      slots.push({ day: day % 7, subject, hours, isRevision: false });
      remaining -= hours;
      day += 1;
    }
    // Reserve a 1h revision slot for this subject.
    slots.push({ day: day % 7, subject, hours: 1, isRevision: true });
    day += 1;
  });

  return slots.sort((a, b) => a.day - b.day);
}
