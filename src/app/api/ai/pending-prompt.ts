const KEY = 'ss_pending_ai_prompt';

/** Stash a prompt (with optional context) so the AI Assistant page can pick it up right after navigation. */
export function setPendingAiPrompt(prompt: string) {
  try {
    sessionStorage.setItem(KEY, prompt);
  } catch {
    /* ignore */
  }
}

/** Reads and clears the pending prompt (one-time consume, so revisiting the page later doesn't re-fire it). */
export function consumePendingAiPrompt(): string | null {
  try {
    const value = sessionStorage.getItem(KEY);
    if (value) sessionStorage.removeItem(KEY);
    return value;
  } catch {
    return null;
  }
}