export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    // Numeric entities like &#8217; (curly apostrophe) or hex &#x2019; —
    // common in newspaper RSS feeds. Converts any leftover numeric entity
    // to its actual character instead of showing the raw code.
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
}

function extractTag(block: string, tag: string): string {
  const cdataMatch = block.match(new RegExp(`<${tag}[^>]*>\\s*<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>\\s*</${tag}>`, 'i'));
  if (cdataMatch) return cdataMatch[1].trim();
  const plainMatch = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i'));
  if (plainMatch) return decodeEntities(plainMatch[1].trim());
  return '';
}

function stripHtml(s: string): string {
  return s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Parses an RSS 2.0 XML string into a plain array of items. Deliberately
 * simple (regex-based) rather than a full XML parser, to avoid adding a new
 * dependency for a well-known, consistently-shaped format. */
export function parseRss(xml: string): RssItem[] {
  const items: RssItem[] = [];
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/gi) || [];
  for (const block of itemBlocks) {
    const title = decodeEntities(stripHtml(extractTag(block, 'title')));
    const link = extractTag(block, 'link');
    if (!title || !link) continue;
    items.push({
      title,
      link,
      description: decodeEntities(stripHtml(extractTag(block, 'description'))).slice(0, 600),
      pubDate: extractTag(block, 'pubDate'),
      guid: extractTag(block, 'guid') || link
    });
  }
  return items;
}

export async function fetchRssItems(url: string): Promise<RssItem[]> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; StudySphereBot/1.0)' },
    cache: 'no-store'
  });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xml = await res.text();
  return parseRss(xml);
}