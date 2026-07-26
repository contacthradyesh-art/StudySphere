import { Card } from "@/components/shared/Card";
import { Badge } from "@/components/shared/Badge";

interface ExamCountdownProps {
  daysLeft: number;
  examLabel: string;
}

export function ExamCountdown({ daysLeft, examLabel }: ExamCountdownProps) {
  return (
    <Card variant="glow" padding="md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-electric-300">Exam countdown</p>
          <h3 className="text-lg font-semibold text-charcoal-50 mt-1">{examLabel}</h3>
        </div>
        <Badge variant="neon" size="sm">{daysLeft} days</Badge>
      </div>
    </Card>
  );
}
