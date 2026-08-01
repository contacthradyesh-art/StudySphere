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
  { url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1', source: 'PIB (Press Information Bureau)' }
];

// Kept modest per feed since many feeds run in one request — items not
// processed this run are simply picked up on the next run (nothing is
// lost, only already-saved items are skipped), so a lower per-run cap
// here is the safer choice against the serverless time limit.
const ITEMS_PER_FEED = 5;

const SUMMARY_SYSTEM_PROMPT = `You are a UPSC current-affairs mentor preparing daily notes for a serious aspirant, across ALL GS papers (Polity, Economy, IR, Environment, Science & Tech, Security, Social Issues, Agriculture) — not just international affairs. Given a news headline and short description, write:
1. "summary": 2-3 original sentences in plain English explaining what happened AND the essential background/context an aspirant needs (the "why", not just the "what") — rewrite fully in your own words, never copy the input wording.
2. "topic": the specific static-syllabus concept this connects to, in 2-5 words, e.g. "Federalism", "Repo Rate & Inflation", "Indo-Pacific Strategy", "Fundamental Rights", "Panchayati Raj", "Monsoon & Agriculture". Be precise and specific, never just repeat the category name.
3. "examRelevance": ONE concrete sentence (max 20 words) stating exactly why this matters for UPSC — a scheme/law/institution/theory it links to, or a likely prelims fact or mains-answer angle. Never generic ("this is important" is unacceptable).
4. "category": the single most relevant UPSC category from exactly this list: polity, economy, international-relations, environment, science-tech, security, governance, agriculture, social-issues, other.
5. "gsPaper": the most relevant GS Paper for UPSC Mains, e.g. "GS2", "GS3", or "GS2, GS3" if it spans two.
Return ONLY valid JSON, no markdown, matching exactly: {"summary":"...","topic":"...","examRelevance":"...","category":"...","gsPaper":"..."}`;

async function summarize(
  title: string,
  description: string
): Promise<{ summary: string; topic: string; examRelevance: string; category: UpscCategory; gsPaper: string }> {
  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SUMMARY_SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text: `Title: ${title}\n\nDescription: ${description}` }] }],
      generationConfig: { maxOutputTokens: 500, temperature: 0.4, responseMimeType: 'application/json' }
    })
  });
  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error('AI did not return content');
  const parsed = JSON.parse(text);
  const validCategories: UpscCategory[] = [
    'polity', 'economy', 'international-relations', 'environment', 'science-tech',
    'security', 'governance', 'agriculture', 'social-issues', 'other'
  ];
  return {
    summary: parsed.summary || description.slice(0, 200),
    topic: parsed.topic || '',
    examRelevance: parsed.examRelevance || '',
    category: validCategories.includes(parsed.category) ? parsed.category : 'other',
    gsPaper: parsed.gsPaper || 'GS2'
  };
}

export interface RefreshResults {
  fetched: number;
  added: number;
  skippedExisting: number;
  errors: number;
  stoppedEarly: boolean;
}

/**
 * Fetches all configured RSS feeds, AI-summarizes new items, and saves them.
 * Shared by the daily automatic cron route and the user-facing manual
 * "Refresh" button, so both stay in sync with one implementation.
 * Stops gracefully near the serverless time limit rather than timing out —
 * unprocessed items are simply picked up on the next run.
 */
export async function runCurrentAffairsRefresh(timeBudgetMs = 50000): Promise<RefreshResults> {
  if (!adminDb) throw new Error('Server not configured');

  const start = Date.now();
  const outOfTime = () => Date.now() - start > timeBudgetMs;

  const results: RefreshResults = { fetched: 0, added: 0, skippedExisting: 0, errors: 0, stoppedEarly: false };

  feedLoop: for (const feed of FEEDS) {
    if (outOfTime()) { results.stoppedEarly = true; break; }

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
      if (outOfTime()) { results.stoppedEarly = true; break feedLoop; }

      const docId = Buffer.from(item.guid).toString('base64url').slice(0, 140);
      const ref = adminDb.collection(CURRENT_AFFAIRS_COLLECTION).doc(docId);
      const existing = await ref.get();
      if (existing.exists) {
        results.skippedExisting++;
        continue;
      }

      try {
        const { summary, topic, examRelevance, category, gsPaper } = await summarize(item.title, item.description);
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
        console.error('Failed to summarize/save item', item.title, err);
        results.errors++;
      }
    }
  }

  return results;
}