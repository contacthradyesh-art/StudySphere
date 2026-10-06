import { NextRequest, NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { VOCABULARY_COLLECTION, type VocabLevel, type WordDifficulty } from '@/lib/mission-ias/vocabulary-schema';

export const maxDuration = 60;

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';
const BATCH_SIZE = 12;

const UPSC_SYSTEM_PROMPT = `You are building a daily vocabulary list for UPSC (Indian civil services) aspirants — the kind of advanced English words that appear in The Hindu / Indian Express editorials.
Generate exactly ${BATCH_SIZE} DIFFERENT words, none of which are in the "already used" list you'll be given.
For each word provide: the word itself, part of speech, a clear one-sentence meaning, an accurate Hindi meaning (Devanagari script), 3 synonyms, 2 antonyms (empty array if genuinely none), one natural example sentence, one sentence describing how it's typically used in Indian editorial/political writing, and a difficulty (easy/medium/hard).
Return ONLY valid JSON, no markdown, matching exactly:
{"words":[{"word":"...","partOfSpeech":"...","meaning":"...","hindiMeaning":"...","synonyms":["...","...","..."],"antonyms":["...","..."],"exampleSentence":"...","editorialUsage":"...","difficulty":"easy|medium|hard"}]}`;

const SSC_SYSTEM_PROMPT = `You are building a vocabulary list for SSC CGL/CHSL exam preparation.
Generate exactly ${BATCH_SIZE} DIFFERENT common exam vocabulary words, none of which are in the "already used" list you'll be given.
Prefer practical SSC-level words commonly tested in synonyms, antonyms, fill-in-the-blanks and reading comprehension. Keep the English meaning simple and clear, and provide an accurate Hindi meaning in Devanagari script. Give 3 synonyms, 2 antonyms (empty array if genuinely none), one natural example sentence, one short editorial/general usage sentence, and a difficulty (easy/medium/hard).
Return ONLY valid JSON, no markdown, matching exactly:
{"words":[{"word":"...","partOfSpeech":"...","meaning":"...","hindiMeaning":"...","synonyms":["...","...","..."],"antonyms":["...","..."],"exampleSentence":"...","editorialUsage":"...","difficulty":"easy|medium|hard"}]}`;

function getSystemPrompt(level: VocabLevel) {
  return level === 'ssc' ? SSC_SYSTEM_PROMPT : UPSC_SYSTEM_PROMPT;
}

const SSC_FALLBACK_WORDS = [
  ['Abundant', 'adjective', 'More than enough; plentiful.', 'प्रचुर; बहुत अधिक', ['Plentiful', 'Ample', 'Copious'], ['Scarce', 'Limited'], 'The region has abundant water resources.', 'Abundant rainfall helps farmers.', 'easy'],
  ['Benevolent', 'adjective', 'Kind and willing to help others.', 'दयालु; परोपकारी', ['Kind', 'Generous', 'Charitable'], ['Cruel', 'Selfish'], 'The benevolent man helped the poor.', 'A benevolent leader works for public welfare.', 'medium'],
  ['Candid', 'adjective', 'Honest and direct in speech.', 'स्पष्टवादी; ईमानदार', ['Frank', 'Honest', 'Open'], ['Deceitful', 'Dishonest'], 'She gave a candid answer.', 'The minister gave a candid response.', 'medium'],
  ['Diligent', 'adjective', 'Working carefully and regularly.', 'मेहनती; परिश्रमी', ['Hardworking', 'Industrious', 'Active'], ['Lazy', 'Negligent'], 'A diligent student revises every day.', 'Diligent preparation improves exam performance.', 'easy'],
  ['Eloquent', 'adjective', 'Able to express ideas clearly and effectively.', 'वाक्पटु; प्रभावशाली', ['Expressive', 'Fluent', 'Articulate'], ['Inarticulate', 'Tongue-tied'], 'He gave an eloquent speech.', 'Her eloquent argument impressed the audience.', 'medium'],
  ['Frugal', 'adjective', 'Careful about spending money.', 'मितव्ययी; कम खर्च करने वाला', ['Economical', 'Thrifty', 'Sparing'], ['Extravagant', 'Wasteful'], 'He lives a frugal life.', 'Frugal spending helps families save money.', 'easy'],
  ['Hostile', 'adjective', 'Unfriendly or opposed.', 'शत्रुतापूर्ण; विरोधी', ['Unfriendly', 'Antagonistic', 'Adverse'], ['Friendly', 'Cooperative'], 'The two groups had a hostile relationship.', 'Hostile conditions can affect negotiations.', 'easy'],
  ['Impartial', 'adjective', 'Fair and not favoring either side.', 'निष्पक्ष; पक्षपातरहित', ['Fair', 'Neutral', 'Unbiased'], ['Biased', 'Partial'], 'A judge must remain impartial.', 'An impartial decision builds public trust.', 'medium'],
  ['Lucid', 'adjective', 'Clear and easy to understand.', 'स्पष्ट; सुबोध', ['Clear', 'Plain', 'Intelligible'], ['Confusing', 'Obscure'], 'The teacher gave a lucid explanation.', 'The report presents a lucid analysis.', 'medium'],
  ['Meticulous', 'adjective', 'Very careful about small details.', 'सूक्ष्मदर्शी; बहुत सावधान', ['Careful', 'Precise', 'Thorough'], ['Careless', 'Negligent'], 'She is meticulous about her notes.', 'Meticulous preparation reduces errors.', 'hard'],
  ['Obsolete', 'adjective', 'No longer useful or in use.', 'अप्रचलित; पुराना', ['Outdated', 'Old-fashioned', 'Antiquated'], ['Modern', 'Current'], 'The old machine is obsolete.', 'Obsolete rules should be reviewed.', 'medium'],
  ['Vigilant', 'adjective', 'Carefully watching for danger or problems.', 'सतर्क; चौकस', ['Alert', 'Watchful', 'Attentive'], ['Careless', 'Negligent'], 'Security guards remained vigilant.', 'Citizens should remain vigilant against fraud.', 'medium']
] as const;

/**
 * Core generation logic, shared by both the cron-triggered GET (daily,
 * automatic) and the session-authenticated POST (manual "Generate More"
 * button in the Vocabulary Lab UI). Pulls the most recent 300 words so the
 * model doesn't repeat itself, asks Gemini for a fresh batch, and writes any
 * genuinely new words into Firestore.
 */
async function generateVocabularyBatch(level: VocabLevel = 'upsc'): Promise<{ ok: true; requested: number; added: number } | { ok: false; error: string }> {
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
      system_instruction: { parts: [{ text: getSystemPrompt(level) }] },
      contents: [{
        role: 'user',
        parts: [{ text: `Already used words (do NOT repeat any of these): ${existingWords.join(', ') || '(none yet)'}` }]
      }],
      generationConfig: { maxOutputTokens: 8000, temperature: 0.8, responseMimeType: 'application/json' }
    })
  });

  let parsed: { words: any[] };

  if (!res.ok) {
    const errBody = await res.text();
    console.error('generate-vocabulary: Gemini API error', res.status, errBody.slice(0, 500));
    if (res.status === 429 && level === 'ssc') {
      parsed = {
        words: SSC_FALLBACK_WORDS.map(([word, partOfSpeech, meaning, hindiMeaning, synonyms, antonyms, exampleSentence, editorialUsage, difficulty]) => ({
          word, partOfSpeech, meaning, hindiMeaning, synonyms, antonyms, exampleSentence, editorialUsage, difficulty
        }))
      };
    } else {
      return { ok: false, error: res.status === 429 ? 'AI limit abhi khatam hai. SSC ke liye built-in starter words available hain.' : `AI request failed (${res.status})` };
    }
  } else {
    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) {
      console.error('generate-vocabulary: no content in response', JSON.stringify(data).slice(0, 500));
      return { ok: false, error: `AI did not return content (finishReason: ${candidate?.finishReason || 'unknown'})` };
    }

    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error('generate-vocabulary: JSON parse failed', String(e), 'raw text (last 300 chars):', text.slice(-300));
      return { ok: false, error: 'AI returned invalid JSON (likely truncated — try again)' };
    }
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
      level,
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

  const requestedLevel = req.nextUrl.searchParams.get('level');
  const level: VocabLevel = requestedLevel === 'ssc' ? 'ssc' : 'upsc';

  try {
    const result = await generateVocabularyBatch(level);
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

  let body: { level?: VocabLevel } = {};
  try {
    body = await req.json();
  } catch {
    // Empty request body keeps the default UPSC level.
  }
  const level: VocabLevel = body.level === 'ssc' ? 'ssc' : 'upsc';

  try {
    const result = await generateVocabularyBatch(level);
    if (!result.ok) return NextResponse.json(result, { status: 500 });
    return NextResponse.json(result);
  } catch (e) {
    console.error('generate-vocabulary POST: unexpected error', e);
    return NextResponse.json({ ok: false, error: 'Unexpected server error' }, { status: 500 });
  }
}
