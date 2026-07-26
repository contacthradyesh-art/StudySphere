'use client';

import { useRef, useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageBubble } from './message-bubble';
import { askAi } from '@/lib/ai/ai-client';
import type { ChatMessage } from '@/lib/firestore/flashcard-schema';

const SUGGESTIONS = ['Explain photosynthesis', 'Summarize my last topic', 'Quiz me on derivatives'];

/** Conversational assistant panel backed by the /api/ai/chat route. */
export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: ChatMessage[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setBusy(true);
    try {
      const res = await askAi({ task: 'chat', messages: next });
      setMessages([...next, { role: 'assistant', content: res.reply ?? '...' }]);
      if (res.fallback) toast.message('Offline mode', { description: 'Configure an AI key for full answers.' });
    } catch {
      toast.error('Assistant unavailable');
    } finally {
      setBusy(false);
      requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }));
    }
  }

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="grid h-full place-items-center text-center">
            <div className="space-y-3">
              <Sparkles className="mx-auto h-10 w-10 text-primary" />
              <p className="text-sm text-muted-foreground">Ask anything, or try a suggestion:</p>
              <div className="flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-input px-3 py-1 text-xs hover:bg-accent">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {messages.map((m, i) => <MessageBubble key={i} message={m} />)}
        {busy && <p className="text-sm text-muted-foreground">Thinking...</p>}
        <div ref={endRef} />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-3 flex gap-2">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask the assistant..." disabled={busy} />
        <Button type="submit" variant="gradient" size="icon" aria-label="Send" disabled={busy}><Send className="h-4 w-4" /></Button>
      </form>
    </div>
  );
}
