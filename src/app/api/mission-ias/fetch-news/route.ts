import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { fetchRssItems } from '@/lib/mission-ias/rss-parser';
import { CURRENT_AFFAIRS_COLLECTION, type UpscCategory } from '@/lib/mission-ias/current-affairs-schema';

export const maxDuration = 60;

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// Multiple sources for redundancy and broader UPSC-relevant coverage.
// PIB (a .gov.in / NIC-hosted site) blocks requests from many cloud-hosting
// IP ranges including Vercel's, so it's kept only as a fallback attempt.
// "Explained" is prioritized first — it gives background/context rather than
// just a headline, which is exactly what aids exam prep.
// Only headlines + short RSS snippets are ever read (never full article
// bodies), and everything shown to the user is an AI-written original
// summary with a link back to the source — never copied text.
const FEEDS: { url: string; source: string }[] = [
  { url: 'https://indianexpress.com/section/explained/feed/', source: 'The Indian Express (Explained)' },
  { url: 'https://indianexpress.com/section/india/feed/', source: 'The Indian Express' },
  { url: 'https://indianexpress.com/section/world/feed/', source: 'The Indian Express (World)' },
  { url: 'https://indianexpress.com/section/business/feed/', source: 'The Indian Express (Business)' },
  { url: 'https://www.thehindu.com/news/national/feeder/default.rss', source: 'The Hindu' },
  { url: 'https://www.thehindu.com/sci-tech/feeder/default.rss', source: 'The Hindu (Sci-Tech)' },
  { url: 'https://www.thehindu.com/society/feeder/default.rss', source: 'The Hindu (Society)' },
  { url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1', source: 'PIB (Press Information Bureau)' }
];

// Kept modest per feed since 8 feeds run in one 60s request — plenty of
// items are still skipped as "already saved" on repeat runs, so nothing
// is lost, it just gets picked up on the next scheduled run.
const ITEMS_PER_FEED = 8;

const SUMMARY_SYSTEM_PROMPT = `You are a UPSC current-affairs mentor preparing daily notes for a serious aspirant. Given a news headline and short description, write:
1. "summary": 2-3 original sentences in plain English explaining what happened and the essential background/context needed to understand it — rewrite fully in your own words, never copy the input wording.
2. "examRelevance": ONE short sentence (max 20 words) stating specifically why this matters for UPSC — e.g. a static-topic link, a scheme/law/institution it connects to, or a likely angle for prelims or a mains answer. Be concrete, not generic ("this is important" is not acceptable).
3. "category": the single most relevant UPSC category from exactly this list: polity, economy, international-relations, environment, science-tech, security, governance, agriculture, social-issues, other.
4. "gsPaper": the most relevant GS Paper for UPSC Mains, e.g. "GS2", "GS3", or "GS2, GS3" if it spans two.
Return ONLY valid JSON, no markdown, matching exactly: {"summary":"...","examRelevance":"...","category":"...","gsPaper":"..."}`;

async function summarize(
  title: string,
  description: string
): Promise<{ summary: string; examRelevance: string; category: UpscCategory; gsPaper: string }> {
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
    examRelevance: parsed.examRelevance || '',
    category: validCategories.includes(parsed.category) ? parsed.category : 'other',
    gsPaper: parsed.gsPaper || 'GS2'
  };
}

export async function GET(req: NextRequest) {
  if (!adminDb) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results = { fetched: 0, added: 0, skippedExisting: 0, errors: 0 };

  for (const feed of FEEDS) {
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
      const docId = Buffer.from(item.guid).toString('base64url').slice(0, 140);
      const ref = adminDb.collection(CURRENT_AFFAIRS_COLLECTION).doc(docId);
      const existing = await ref.get();
      if (existing.exists) {
        results.skippedExisting++;
        continue;
      }

      try {
        const { summary, examRelevance, category, gsPaper } = await summarize(item.title, item.description);
        const publishedAt = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
        await ref.set({
          id: docId,
          title: item.title,
          source: feed.source,
          link: item.link,
          publishedAt: Number.isFinite(publishedAt) ? publishedAt : Date.now(),
          summary,
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

  return NextResponse.json({ ok: true, ...results });
}