import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { VOCABULARY_COLLECTION, type WordDifficulty } from '@/lib/mission-ias/vocabulary-schema';

export const maxDuration = 60;

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
const BATCH_SIZE = 12;

const SYSTEM_PROMPT = `You are building a daily vocabulary list for UPSC (Indian civil services) aspirants — the kind of advanced English words that appear in The Hindu / Indian Express editorials.
Generate exactly ${BATCH_SIZE} DIFFERENT words, none of which are in the "already used" list you'll be given.
For each word provide: the word itself, part of speech, a clear one-sentence meaning, an accurate Hindi meaning (Devanagari script), 3 synonyms, 2 antonyms (empty array if genuinely none), one natural example sentence, one sentence describing how it's typically used in Indian editorial/political writing, and a difficulty (easy/medium/hard).
Return ONLY valid JSON, no markdown, matching exactly:
{"words":[{"word":"...","partOfSpeech":"...","meaning":"...","hindiMeaning":"...","synonyms":["...","...","..."],"antonyms":["...","..."],"exampleSentence":"...","editorialUsage":"...","difficulty":"easy|medium|hard"}]}`;

/**
 * Core generation logic, shared by both the cron-triggered GET (daily,
 * automatic) and the session-authenticated POST (manual "Generate More"
 * button in the Vocabulary Lab UI). Pulls the most recent 300 words so the
 * model doesn't repeat itself, asks Gemini for a fresh batch, and writes any
 * genuinely new words into Firestore.
 */
async function generateVocabularyBatch(): Promise<{ ok: true; requested: number; added: number } | { ok: false; error: string }> {
  if (!adminDb) return { ok: false, error: 'Server not configured' };

  const existingSnap = await adminDb
    .collection(VOCABULARY_COLLECTION)
    .orderBy('createdAt', 'desc')
    .limit(300)
    .get();
  const existingWords = existingSnap.docs.map((d) => (d.data().word as string).toLowerCase());

  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{
        role: 'user',
        parts: [{ text: `Already used words (do NOT repeat any of these): ${existingWords.join(', ') || '(none yet)'}` }]
      }],
      generationConfig: { maxOutputTokens: 8000, temperature: 0.8, responseMimeType: 'application/json' }
    })
  });

  if (!res.ok) {
    const errBody = await res.text();
    console.error('generate-vocabulary: Gemini API error', res.status, errBody.slice(0, 500));
    return { ok: false, error: `AI request failed (${res.status})` };
  }

  const data = await res.json();
  const candidate = data.candidates?.[0];
  const text = candidate?.content?.parts?.[0]?.text;
  if (!text) {
    console.error('generate-vocabulary: no content in response', JSON.stringify(data).slice(0, 500));
    return { ok: false, error: `AI did not return content (finishReason: ${candidate?.finishReason || 'unknown'})` };
  }

  let parsed: { words: any[] };
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    console.error('generate-vocabulary: JSON parse failed', String(e), 'raw text (last 300 chars):', text.slice(-300));
    return { ok: false, error: 'AI returned invalid JSON (likely truncated — try again)' };
  }

  const validDifficulties: WordDifficulty[] = ['easy', 'medium', 'hard'];
  const existingSet = new Set(existingWords);
  let added = 0;

  for (const w of parsed.words || []) {
    if (!w.word || existingSet.has(String(w.word).toLowerCase())) continue;
    const docId = String(w.word).toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 100);
    const ref = adminDb.collection(VOCABULARY_COLLECTION).doc(docId);
    const exists = await ref.get();
    if (exists.exists) continue;

    await ref.set({
      id: docId,
      word: w.word,
      partOfSpeech: w.partOfSpeech || '',
      meaning: w.meaning || '',
      hindiMeaning: w.hindiMeaning || '',
      synonyms: Array.isArray(w.synonyms) ? w.synonyms.slice(0, 5) : [],
      antonyms: Array.isArray(w.antonyms) ? w.antonyms.slice(0, 5) : [],
      exampleSentence: w.exampleSentence || '',
      editorialUsage: w.editorialUsage || '',
      difficulty: validDifficulties.includes(w.difficulty) ? w.difficulty : 'medium',
      createdAt: Date.now()
    });
    existingSet.add(String(w.word).toLowerCase());
    added++;
  }

  return { ok: true, requested: BATCH_SIZE, added };
}

/**
 * Daily automatic generation, called by Vercel Cron (see vercel.json), which
 * sends the CRON_SECRET as an Authorization: Bearer header. The `secret`
 * query param is also accepted, for manual/browser testing.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const bearerSecret = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  const querySecret = req.nextUrl.searchParams.get('secret');
  const provided = bearerSecret || querySecret;

  if (!process.env.CRON_SECRET || provided !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await generateVocabularyBatch();
    if (!result.ok) return NextResponse.json(result, { status: 500 });
    return NextResponse.json(result);
  } catch (e) {
    console.error('generate-vocabulary GET: unexpected error', e);
    return NextResponse.json({ ok: false, error: 'Unexpected server error' }, { status: 500 });
  }
}

/**
 * Manual generation, called from the "Generate More Words" button in the
 * Vocabulary Lab UI. Any signed-in user (this app has a single owner) can
 * trigger it — protected by a valid Firebase ID token instead of the cron
 * secret, since the browser can't safely hold that secret.
 */
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization') || '';
  const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  if (!idToken || !adminAuth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    await adminAuth.verifyIdToken(idToken);
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await generateVocabularyBatch();
    if (!result.ok) return NextResponse.json(result, { status: 500 });
    return NextResponse.json(result);
  } catch (e) {
    console.error('generate-vocabulary POST: unexpected error', e);
    return NextResponse.json({ ok: false, error: 'Unexpected server error' }, { status: 500 });
  }
}
