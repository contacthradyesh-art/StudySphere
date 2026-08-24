import { adminDb } from '@/lib/firebase/admin';
import { fetchRssItems } from './rss-parser';
import { CURRENT_AFFAIRS_COLLECTION, type UpscCategory } from './current-affairs-schema';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// Broad spread across UPSC's GS papers: background/explainer pieces (best for
// exam prep, not just headlines), plus dedicated international, economy,
// science, society, and opinion coverage for a mains-answer-writing angle.
// PIB (a .gov.in / NIC-hosted site) blocks requests from many cloud-hosting
// IP ranges including Vercel's, so it's kept only as a fallback attempt.
// Only headlines + short RSS snippets are ever read (never full article
// bodies), and everything shown to the user is an AI-written original
// summary with a link back to the source — never copied text.
const FEEDS: { url: string; source: string }[] = [
  { url: 'https://indianexpress.com/section/explained/feed/', source: 'The Indian Express (Explained)' },
  { url: 'https://indianexpress.com/section/india/feed/', source: 'The Indian Express' },
  { url: 'https://indianexpress.com/section/world/feed/', source: 'The Indian Express (World)' },
  { url: 'https://indianexpress.com/section/business/feed/', source: 'The Indian Express (Business)' },
  { url: 'https://indianexpress.com/section/opinion/feed/', source: 'The Indian Express (Opinion)' },
  { url: 'https://indianexpress.com/section/political-pulse/feed/', source: 'The Indian Express (Politics)' },
  { url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu' },
  { url: 'https://www.thehindu.com/news/international/feeder/default.rss', source: 'The Hindu (International)' },
  { url: 'https://www.thehindu.com/business/feeder/default.rss', source: 'The Hindu (Business)' },
  { url: 'https://www.thehindu.com/sci-tech/feeder/default.rss', source: 'The Hindu (Sci-Tech)' },
  { url: 'https://www.thehindu.com/society/feeder/default.rss', source: 'The Hindu (Society)' },
  { url: 'https://www.thehindu.com/opinion/feeder/default.rss', source: 'The Hindu (Opinion)' },
  { url: 'https://www.livemint.com/rss/economy', source: 'Mint (Economy)' },
  { url: 'https://www.livemint.com/rss/politics', source: 'Mint (Politics)' },
  { url: 'https://www.downtoearth.org.in/rss/environment', source: 'Down To Earth (Environment)' },
  { url: 'https://www.downtoearth.org.in/rss/climate-change', source: 'Down To Earth (Climate)' },
  { url: 'https://www.business-standard.com/rss/economy-policy-10802.rss', source: 'Business Standard (Economy Policy)' },
  { url: 'https://www.livelaw.in/feed', source: 'LiveLaw' },
  { url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1', source: 'PIB (Press Information Bureau)' }
];

// Kept modest per feed since many feeds run in one request — items not
// processed this run are simply picked up on the next run (nothing is
// lost, only already-saved items are skipped), so a lower per-run cap
// here is the safer choice against the serverless time limit.
const ITEMS_PER_FEED = 5;

// Gemini's free-tier rate limit is well under what 13 feeds * 5 items can
// produce if fired back-to-back — the whole batch was hitting 429 after the
// first handful of calls. Both caps below keep a single run inside the
// free-tier RPM budget; leftover items are simply picked up next run.
const MIN_CALL_INTERVAL_MS = 4300; // keeps us under ~14 requests/minute
const MAX_ITEMS_PER_RUN = 8;

const SUMMARY_SYSTEM_PROMPT = `You are a UPSC current-affairs mentor preparing daily notes for a serious aspirant, across ALL GS papers (Polity, Economy, IR, Environment, Science & Tech, Security, Social Issues, Agriculture) — not just international affairs. Given a news headline and short description, write:
1. "summary": 2-3 original sentences in plain English explaining what happened AND the essential background/context an aspirant needs (the "why", not just the "what") — rewrite fully in your own words, never copy the input wording.
2. "topic": the specific static-syllabus concept this connects to, in 2-5 words, e.g. "Federalism", "Repo Rate & Inflation", "Indo-Pacific Strategy", "Fundamental Rights", "Panchayati Raj", "Monsoon & Agriculture". Be precise and specific, never just repeat the category name.
3. "examRelevance": ONE concrete sentence (max 20 words) stating exactly why this matters for UPSC — a scheme/law/institution/theory it links to, or a likely prelims fact or mains-answer angle. Never generic ("this is important" is unacceptable).
4. "category": the single most relevant UPSC category from exactly this list: polity, economy, international-relations, environment, science-tech, security, governance, agriculture, social-issues, other.
5. "gsPaper": the most relevant GS Paper for UPSC Mains, e.g. "GS2", "GS3", or "GS2, GS3" if it spans two.
Return ONLY valid JSON, no markdown, matching exactly: {"summary":"...","topic":"...","examRelevance":"...","category":"...","gsPaper":"..."}`;

class GeminiError extends Error {
  constructor(message: string, public status?: number, public retryAfterMs?: number) {
    super(message);
    this.name = 'GeminiError';
  }
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function summarize(
  title: string,
  description: string
): Promise<{ summary: string; topic: string; examRelevance: string; category: UpscCategory; gsPaper: string }> {
  // Falls back to the shared GEMINI_API_KEY if a dedicated Mission IAS key
  // isn't set — GEMINI_API_KEY_MISSION_IAS was never documented in
  // .env.example, so on most deployments it simply doesn't exist and this
  // whole refresh pipeline was silently failing every run.
  const apiKey = process.env.GEMINI_API_KEY_MISSION_IAS || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new GeminiError('Neither GEMINI_API_KEY_MISSION_IAS nor GEMINI_API_KEY is set in this environment');
  }

  const res = await fetch(`${GEMINI_URL}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SUMMARY_SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: `Title: ${title}\n\nDescription: ${description}` }] }],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.4,
        responseMimeType: 'application/json',
        responseSchema: {
          type: 'OBJECT',
          properties: {
            summary: { type: 'STRING' },
            topic: { type: 'STRING' },
            examRelevance: { type: 'STRING' },
            category: {
              type: 'STRING',
              enum: ['polity', 'economy', 'international-relations', 'environment', 'science-tech', 'security', 'governance', 'agriculture', 'social-issues', 'other']
            },
            gsPaper: { type: 'STRING' }
          },
          required: ['summary', 'topic', 'examRelevance', 'category', 'gsPaper']
        }
      }
    })
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => '');
    const retryAfterHeader = res.headers.get('retry-after');
    const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : undefined;
    throw new GeminiError(`Gemini API returned ${res.status}: ${errBody.slice(0, 300)}`, res.status, retryAfterMs);
  }

  const data = await res.json();
  const parts = data.candidates?.[0]?.content?.parts;
  const text = Array.isArray(parts) ? parts.map((p: { text?: string }) => p.text ?? '').join('') : undefined;
  if (!text) {
    const finishReason = data.candidates?.[0]?.finishReason;
    throw new GeminiError(`Gemini returned no content (finishReason: ${finishReason}). Raw response: ${JSON.stringify(data).slice(0, 300)}`);
  }

  let parsed: { summary?: string; topic?: string; examRelevance?: string; category?: string; gsPaper?: string };
  try {
    parsed = JSON.parse(text);
  } catch {
    // Last-resort fallback if the model still returns malformed JSON despite
    // the schema constraint (e.g. an unescaped quote inside a string field) —
    // pull each field out with a regex instead of discarding the whole item.
    const field = (key: string) => {
      const m = text.match(new RegExp(`"${key}"\\s*:\\s*"([\\s\\S]*?)"\\s*[,}]`));
      return m ? m[1] : undefined;
    };
    parsed = {
      summary: field('summary'),
      topic: field('topic'),
      examRelevance: field('examRelevance'),
      category: field('category'),
      gsPaper: field('gsPaper')
    };
  }

  const validCategories: UpscCategory[] = [
    'polity', 'economy', 'international-relations', 'environment', 'science-tech',
    'security', 'governance', 'agriculture', 'social-issues', 'other'
  ];
  return {
    summary: parsed.summary || description.slice(0, 200),
    topic: parsed.topic || '',
    examRelevance: parsed.examRelevance || '',
    category: validCategories.includes(parsed.category as UpscCategory) ? (parsed.category as UpscCategory) : 'other',
    gsPaper: parsed.gsPaper || 'GS2'
  };
}

/** Throttled + single-retry wrapper around summarize(), so one run never bursts past Gemini's free-tier rate limit. */
async function summarizeThrottled(
  title: string,
  description: string,
  lastCallAt: { value: number }
): Promise<{ summary: string; topic: string; examRelevance: string; category: UpscCategory; gsPaper: string }> {
  const wait = lastCallAt.value + MIN_CALL_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastCallAt.value = Date.now();

  try {
    return await summarize(title, description);
  } catch (err) {
    if (err instanceof GeminiError && err.status === 429) {
      // One retry after the interval Gemini asked for (or a safe default) —
      // if it's still rate-limited after that, let it fail; the item is
      // picked up automatically on the next scheduled/manual run.
      await sleep(err.retryAfterMs ?? 6000);
      lastCallAt.value = Date.now();
      return await summarize(title, description);
    }
    throw err;
  }
}

export interface RefreshResults {
  fetched: number;
  added: number;
  skippedExisting: number;
  errors: number;
  stoppedEarly: boolean;
  fatalError?: string;
}

/**
 * Fetches all configured RSS feeds, AI-summarizes new items, and saves them.
 * Shared by the daily automatic cron route and the user-facing manual
 * "Refresh" button, so both stay in sync with one implementation.
 * Stops gracefully near the serverless time limit AND near Gemini's
 * free-tier rate limit rather than bursting into 429s — unprocessed items
 * are simply picked up on the next run.
 */
export async function runCurrentAffairsRefresh(timeBudgetMs = 42000): Promise<RefreshResults> {
  if (!adminDb) throw new Error('Server not configured');
  if (!process.env.GEMINI_API_KEY_MISSION_IAS && !process.env.GEMINI_API_KEY) {
    console.error('runCurrentAffairsRefresh: no Gemini API key set (GEMINI_API_KEY_MISSION_IAS or GEMINI_API_KEY)');
    return { fetched: 0, added: 0, skippedExisting: 0, errors: 0, stoppedEarly: false, fatalError: 'No Gemini API key set' };
  }

  const start = Date.now();
  const outOfTime = () => Date.now() - start > timeBudgetMs;
  const lastCallAt = { value: 0 };

  const results: RefreshResults = { fetched: 0, added: 0, skippedExisting: 0, errors: 0, stoppedEarly: false };
  let attempted = 0;

  feedLoop: for (const feed of FEEDS) {
    if (outOfTime() || attempted >= MAX_ITEMS_PER_RUN) { results.stoppedEarly = true; break; }

    let items;
    try {
      items = await fetchRssItems(feed.url);
    } catch (err) {
      console.error(`Failed to fetch feed ${feed.url}`, err);
      results.errors++;
      continue;
    }

    results.fetched += items.length;

    for (const item of items.slice(0, ITEMS_PER_FEED)) {
      if (outOfTime() || attempted >= MAX_ITEMS_PER_RUN) { results.stoppedEarly = true; break feedLoop; }

      const docId = Buffer.from(item.guid).toString('base64url').slice(0, 140);
      const ref = adminDb.collection(CURRENT_AFFAIRS_COLLECTION).doc(docId);
      const existing = await ref.get();
      if (existing.exists) {
        results.skippedExisting++;
        continue;
      }

      attempted++;
      try {
        const { summary, topic, examRelevance, category, gsPaper } = await summarizeThrottled(item.title, item.description, lastCallAt);
        const publishedAt = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
        await ref.set({
          id: docId,
          title: item.title,
          source: feed.source,
          link: item.link,
          publishedAt: Number.isFinite(publishedAt) ? publishedAt : Date.now(),
          summary,
          topic,
          examRelevance,
          category,
          gsPaper,
          createdAt: Date.now()
        });
        results.added++;
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`Failed to summarize/save item "${item.title}": ${message}`);
        results.errors++;
      }
    }
  }

  return results;
}