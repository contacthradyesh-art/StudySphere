'use client';

import { useRouter } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import { setPendingAiPrompt } from '@/lib/ai/pending-prompt';
import { cn } from '@/lib/utils';

interface AskAiButtonProps {
  /** The exact prompt sent to the AI Assistant on arrival, e.g. "Explain this article: ..." */
  prompt: string;
  /** Short label shown on the button, e.g. "Ask AI", "Explain", "Generate MCQs". */
  label?: string;
  className?: string;
}

/**
 * Opens the app's single, real AI Assistant (/dashboard/ai) with a prompt
 * pre-filled and auto-sent. Never creates a separate chat — every "Ask AI"
 * entry point across the app (Mission IAS, and future modules) funnels
 * through this same component and the same assistant.
 */
export function AskAiButton({ prompt, label = 'Ask AI', className }: AskAiButtonProps) {
  const router = useRouter();

  function handleClick() {
    setPendingAiPrompt(prompt);
    router.push('/dashboard/ai');
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20',
        className
      )}
    >
      <Sparkles className="h-3.5 w-3.5" /> {label}
    </button>
  );
}