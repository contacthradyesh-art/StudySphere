import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";

interface CoachInsight {
  id: string;
  tone: "alert" | "focus" | "tip";
  message: string;
}

interface AiCoachProps {
  insights: CoachInsight[];
}

const toneStyles = {
  alert: "border-red-500/30 bg-red-500/10",
  focus: "border-electric/30 bg-electric/10",
  tip: "border-neon/30 bg-neon/10",
};

export function AiCoach({ insights }: AiCoachProps) {
  return (
    <Card variant="glass" padding="md">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-charcoal-50">AI Coach</h3>
          <p className="text-sm text-charcoal-400">Smart nudges based on your current planner state.</p>
        </div>
        <Badge variant="electric" size="sm">Coach</Badge>
      </div>
      <div className="space-y-2">
        {insights.map((insight) => (
          <div key={insight.id} className={`rounded-xl border px-3 py-2 ${toneStyles[insight.tone]}`}>
            <p className="text-sm text-charcoal-100">{insight.message}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
