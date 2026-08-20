'use client';

import { renderMarkdown } from '@/lib/notes/markdown';
import { cn } from '@/lib/utils';
import type { ChatMessage } from '@/lib/firestore/flashcard-schema';

/** Single chat message; assistant messages render Markdown. */
export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2 text-sm',
          isUser ? 'bg-gradient-brand text-white' : 'glass'
        )}
      >
        {isUser ? (
          message.content
        ) : (
          <div className="prose-note" dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }} />
        )}
      </div>
    </div>
  );
}
