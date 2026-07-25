import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ProgressBar } from "@/components/shared/ProgressBar";

interface GoalItem {
  id: string;
  title: string;
  targetDate: string;
  done: boolean;
}

interface HabitItem {
  id: string;
  title: string;
  completed: boolean;
}

interface GoalsAndHabitsProps {
  goals: GoalItem[];
  habits: HabitItem[];
}

export function GoalsAndHabits({ goals, habits }: GoalsAndHabitsProps) {
  const goalCompletion = Math.round((goals.filter((g) => g.done).length / Math.max(goals.length, 1)) * 100);
  const habitCompletion = Math.round((habits.filter((h) => h.completed).length / Math.max(habits.length, 1)) * 100);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card variant="glass" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-charcoal-50">Goals</h3>
          <Badge variant="neon" size="sm">{goalCompletion}%</Badge>
        </div>
        <div className="space-y-2">
          {goals.map((goal) => (
            <div key={goal.id} className="flex items-center justify-between rounded-lg bg-charcoal-900/50 px-3 py-2">
              <div>
                <p className="text-sm text-charcoal-100">{goal.title}</p>
                <p className="text-xs text-charcoal-500">Target: {goal.targetDate}</p>
              </div>
              <Badge variant={goal.done ? "neon" : "outline"} size="sm">{goal.done ? "Done" : "Open"}</Badge>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <ProgressBar value={goalCompletion} variant="neon" showLabel label="Goal completion" />
        </div>
      </Card>

      <Card variant="glass" padding="md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-charcoal-50">Habits</h3>
          <Badge variant="electric" size="sm">{habitCompletion}%</Badge>
        </div>
        <div className="space-y-2">
          {habits.map((habit) => (
            <div key={habit.id} className="flex items-center justify-between rounded-lg bg-charcoal-900/50 px-3 py-2">
              <p className="text-sm text-charcoal-100">{habit.title}</p>
              <Badge variant={habit.completed ? "neon" : "outline"} size="sm">{habit.completed ? "Done" : "Pending"}</Badge>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <ProgressBar value={habitCompletion} variant="electric" showLabel label="Habit streak" />
        </div>
      </Card>
    </div>
  );
}
