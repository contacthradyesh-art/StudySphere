'use client';

import { GlassCard } from '@/components/shared/glass-card';
import { ChatPanel } from '@/components/ai/chat-panel';

export default function AssistantPage() {
  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Study Assistant</h1>
        <p className="text-sm text-muted-foreground">Ask questions, summarize topics, and generate study material.</p>
      </div>
      <GlassCard><ChatPanel /></GlassCard>
    </div>
  );
}
