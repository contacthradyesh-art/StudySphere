import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { VOCABULARY_COLLECTION, type WordDifficulty } from '@/lib/mission-ias/vocabulary-schema';

export const maxDuration = 60;

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
const BATCH_SIZE = 20;

const SYSTEM_PROMPT = `You are building a daily vocabulary list for UPSC (Indian civil services) aspirants — the kind of advanced English words that appear in The Hindu / Indian Express editorials.
Generate exactly ${BATCH_SIZE} DIFFERENT words, none of which are in the "already used" list you'll be given.
For each word provide: the word itself, part of speech, a clear one-sentence meaning, an accurate Hindi meaning (Devanagari script), 3 synonyms, 2 antonyms (empty array if genuinely none), one natural example sentence, one sentence describing how it's typically used in Indian editorial/political writing, and a difficulty (easy/medium/hard).
Return ONLY valid JSON, no markdown, matching exactly:
{"words":[{"word":"...","partOfSpeech":"...","meaning":"...","hindiMeaning":"...","synonyms":["...","...","..."],"antonyms":["...","..."],"exampleSentence":"...","editorialUsage":"...","difficulty":"easy|medium|hard"}]}`;

export async function GET(req: NextRequest) {
  if (!adminDb) return NextResponse.json({ error: 'Server not configured' }, { status: 500 });

  const secret = req.nextUrl.searchParams.get('secret');
  if (!process.env.CRON_SECRET || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Avoid regenerating words already in the bank — pull the most recent
  // 300 to keep the "already used" prompt list a reasonable size.
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
      generationConfig: { maxOutputTokens: 4000, temperature: 0.8, responseMimeType: 'application/json' }
    })
  });

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    return NextResponse.json({ ok: false, error: 'AI did not return content' }, { status: 500 });
  }

  let parsed: { words: any[] };
  try {
    parsed = JSON.parse(text);
  } catch {
    return NextResponse.json({ ok: false, error: 'AI returned invalid JSON' }, { status: 500 });
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

  return NextResponse.json({ ok: true, requested: BATCH_SIZE, added });
}
