import { Card } from "@/components/shared/Card";
import { Button } from "@/components/shared/Button";
import { Badge } from "@/components/shared/Badge";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { Input } from "@/components/shared/Input";

interface AiSmartPlannerProps {
  completionPct: number;
  weakSubjects: string[];
  goal: string;
  weeklyHours: number;
  prompt: string;
  isGenerating?: boolean;
  onGoalChange: (value: string) => void;
  onWeeklyHoursChange: (value: number) => void;
  onPromptChange: (value: string) => void;
  onGenerate: () => void;
  onRegenerate: () => void;
}

export function AiSmartPlanner({
  completionPct,
  weakSubjects,
  goal,
  weeklyHours,
  prompt,
  isGenerating = false,
  onGoalChange,
  onWeeklyHoursChange,
  onPromptChange,
  onGenerate,
  onRegenerate,
}: AiSmartPlannerProps) {
  return (
    <Card variant="glass" padding="md">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-charcoal-50">AI Smart Planner</h3>
            <Badge variant="electric" size="sm">Live</Badge>
          </div>
          <p className="text-sm text-charcoal-400 mt-1">Generate the user&apos;s full day schedule with study, breaks, revision, and recovery blocks.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="neon" size="sm" onClick={onGenerate} disabled={isGenerating}>{isGenerating ? "Planning..." : "Generate Day Plan"}</Button>
          <Button variant="secondary" size="sm" onClick={onRegenerate}>Regenerate Entire Day</Button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <Input label="Goal" value={goal} onChange={(event) => onGoalChange(event.target.value)} placeholder="SSC CHSL 2026" />
        <Input label="Weekly study hours" type="number" value={weeklyHours} onChange={(event) => onWeeklyHoursChange(Number(event.target.value))} placeholder="14" />
        <Input label="AI prompt" value={prompt} onChange={(event) => onPromptChange(event.target.value)} placeholder="I have coaching from 3 PM to 7 PM and need a full-day plan." />
      </div>

      <div className="mt-4 space-y-3">
        <ProgressBar value={completionPct} variant="gradient" showLabel label="AI schedule alignment" />
        <div className="flex flex-wrap gap-2">
          {weakSubjects.length > 0 ? weakSubjects.map((subject) => (
            <Badge key={subject} variant="warning" size="sm">{subject}</Badge>
          )) : <Badge variant="outline" size="sm">No weak subjects flagged</Badge>}
        </div>
      </div>
    </Card>
  );
}
