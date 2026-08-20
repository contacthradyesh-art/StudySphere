'use client';

import { useState } from 'react';
import { Send, BookOpen, FileText, HelpCircle, Sparkles as SparklesIcon } from 'lucide-react';
import { toast } from 'sonner';
import { GlassCard } from '@/components/shared/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { askAi } from '@/lib/ai/ai-client';

const QUICK_ACTIONS = [
  { label: 'Explain a topic', icon: BookOpen, prompt: 'Explain ' },
  { label: 'Summarize notes', icon: FileText, prompt: 'Summarize my notes on ' },
  { label: 'Quiz me', icon: HelpCircle, prompt: 'Quiz me on ' },
  { label: 'Generate plan', icon: SparklesIcon, prompt: 'Generate a study plan for ' },
];

/** Compact dashboard chat box that reuses the same /api/ai/chat backend as the full Assistant page. */
export function AiAssistantWidget({ delay }: { delay?: number }) {
  const [input, setInput] = useState('');
  const [reply, setReply] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    setBusy(true);
    setReply(null);
    try {
      const res = await askAi({ task: 'chat', messages: [{ role: 'user', content }] });
      setReply(res.reply ?? '...');
      if (res.fallback) toast.message('Offline mode', { description: 'Configure an AI key for full answers.' });
    } catch {
      toast.error('Assistant unavailable');
    } finally {
      setBusy(false);
    }
  }

  return (
    <GlassCard delay={delay} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <SparklesIcon className="h-4 w-4 text-primary" />
        <h3 className="font-semibold">AI Assistant</h3>
      </div>

      {reply ? (
        <div className="max-h-40 overflow-y-auto rounded-lg bg-secondary/50 p-3 text-sm">
          {busy ? 'Thinking...' : reply}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">How can I help you today?</p>
      )}

      <div className="grid grid-cols-2 gap-2">
        {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
          <button
            key={label}
            type="button"
            onClick={() => setInput(prompt)}
            className="flex items-center gap-2 rounded-lg border border-input px-3 py-2 text-left text-xs hover:bg-accent"
          >
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            {label}
          </button>
        ))}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
          setInput('');
        }}
        className="flex gap-2"
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
          disabled={busy}
        />
        <Button type="submit" variant="gradient" size="icon" aria-label="Send" disabled={busy}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </GlassCard>
  );
}