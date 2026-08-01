import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { fetchRssItems } from '@/lib/mission-ias/rss-parser';
import { CURRENT_AFFAIRS_COLLECTION, type UpscCategory } from '@/lib/mission-ias/current-affairs-schema';

export const maxDuration = 60;

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

// Official government RSS sources only — legal to fetch headlines/links from.
// (No copyrighted newspaper article text is ever stored or reproduced.)
const FEEDS: { url: string; source: string }[] = [
  { url: 'https://pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=1', source: 'PIB (Press Information Bureau)' }
];

const SUMMARY_SYSTEM_PROMPT = `You are a UPSC current-affairs editor. Given a government press-release title and description, write:
1. A short, original 2-sentence plain-English summary (never copy the input wording verbatim, rewrite in your own words).
2. The single most relevant UPSC category from exactly this list: polity, economy, international-relations, environment, science-tech, security, governance, agriculture, social-issues, other.
3. The most relevant GS Paper for UPSC Mains, e.g. "GS2", "GS3", or "GS2, GS3" if it spans two.
Return ONLY valid JSON, no markdown, matching exactly: {"summary":"...","category":"...","gsPaper":"..."}`;

async function summarize(title: string, description: string): Promise<{ summary: string; category: UpscCategory; gsPaper: string }> {
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

    // Only process the newest handful per run to stay within time/cost limits.
    for (const item of items.slice(0, 15)) {
      const docId = Buffer.from(item.guid).toString('base64url').slice(0, 140);
      const ref = adminDb.collection(CURRENT_AFFAIRS_COLLECTION).doc(docId);
      const existing = await ref.get();
      if (existing.exists) {
        results.skippedExisting++;
        continue;
      }

      try {
        const { summary, category, gsPaper } = await summarize(item.title, item.description);
        const publishedAt = item.pubDate ? new Date(item.pubDate).getTime() : Date.now();
        await ref.set({
          id: docId,
          title: item.title,
          source: feed.source,
          link: item.link,
          publishedAt: Number.isFinite(publishedAt) ? publishedAt : Date.now(),
          summary,
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
