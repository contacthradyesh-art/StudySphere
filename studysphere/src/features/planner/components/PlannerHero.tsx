import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";
import { ProgressRing } from "@/components/shared/ProgressRing";

interface PlannerHeroProps {
  name: string;
  streak: number;
  xp: number;
  level: number;
}

export function PlannerHero({ name, streak, xp, level }: PlannerHeroProps) {
  return (
    <Card variant="glow-neon" padding="lg" className="overflow-hidden">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-electric-300">Premium Planner V2</p>
          <h2 className="text-2xl font-bold text-charcoal-50 mt-2">Welcome back, {name}</h2>
          <p className="text-sm text-charcoal-400 mt-1">Your AI study rhythm is aligned with your current exam goals.</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="electric" size="sm">Streak {streak} days</Badge>
            <Badge variant="neon" size="sm">XP {xp}</Badge>
            <Badge variant="outline" size="sm">Level {level}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ProgressRing value={74} size={72} strokeWidth={6} variant="neon" />
          <div>
            <p className="text-xs text-charcoal-500">Weekly completion</p>
            <p className="text-lg font-semibold text-charcoal-50">74%</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
