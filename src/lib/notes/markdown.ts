/**
 * Minimal, dependency-free Markdown -> HTML renderer.
 *
 * Supports headings, bold, italic, inline code, fenced code blocks, links,
 * unordered/ordered lists and paragraphs. Input is HTML-escaped first so the
 * output is safe to inject. Kept intentionally small; swap for a full parser
 * later if richer Markdown is needed.
 */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

export function renderMarkdown(md: string): string {
  const lines = escapeHtml(md).split(/\r?\n/);
  const html: string[] = [];
  let inCode = false;
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => { if (listType) { html.push(`</${listType}>`); listType = null; } };

  for (const raw of lines) {
    const line = raw;
    if (line.trim().startsWith('```')) {
      if (inCode) { html.push('</code></pre>'); inCode = false; }
      else { closeList(); html.push('<pre><code>'); inCode = true; }
      continue;
    }
    if (inCode) { html.push(line + '\n'); continue; }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) { closeList(); const lvl = heading[1].length; html.push(`<h${lvl}>${inline(heading[2])}</h${lvl}>`); continue; }

    if (/^\s*[-*]\s+/.test(line)) {
      if (listType !== 'ul') { closeList(); html.push('<ul>'); listType = 'ul'; }
      html.push(`<li>${inline(line.replace(/^\s*[-*]\s+/, ''))}</li>`); continue;
    }
    if (/^\s*\d+\.\s+/.test(line)) {
      if (listType !== 'ol') { closeList(); html.push('<ol>'); listType = 'ol'; }
      html.push(`<li>${inline(line.replace(/^\s*\d+\.\s+/, ''))}</li>`); continue;
    }

    if (line.trim() === '') { closeList(); continue; }
    closeList();
    html.push(`<p>${inline(line)}</p>`);
  }
  if (inCode) html.push('</code></pre>');
  closeList();
  return html.join('\n');
}
