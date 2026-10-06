#!/usr/bin/env node

import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { writeFile } from 'node:fs/promises';

const OUTPUT = 'scripts/vocabulary-audit-report.json';
const MIN_MEANING_LENGTH = 3;
const MAX_MEANING_LENGTH = 300;

function getDb() {
  if (getApps().length) return getFirestore();
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT || '{}');
  if (!serviceAccount.project_id) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT is missing or invalid.');
  }
  return getFirestore(initializeApp({ credential: cert(serviceAccount) }));
}

function normalize(value) {
  return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
}

const db = getDb();
const snapshot = await db.collection('vocabulary').get();
const seen = new Map();
const issues = [];

for (const doc of snapshot.docs) {
  const data = doc.data();
  const word = String(data.word || '').trim();
  const meaning = String(data.meaning || '').trim();
  const hindiMeaning = String(data.hindiMeaning || '').trim();
  const example = String(data.exampleSentence || '').trim();

  if (!word) issues.push({ id: doc.id, type: 'empty-word' });
  if (!meaning) issues.push({ id: doc.id, type: 'empty-meaning' });
  if (!hindiMeaning) issues.push({ id: doc.id, type: 'empty-hindiMeaning' });

  const normalizedWord = normalize(word);
  if (normalizedWord) {
    const previous = seen.get(normalizedWord);
    if (previous) {
      issues.push({ id: doc.id, type: 'duplicate-word', word, duplicateOf: previous });
    } else {
      seen.set(normalizedWord, doc.id);
    }
  }

  const normalizedExample = normalize(example);
  if (normalizedWord && !normalizedExample.includes(normalizedWord)) {
    issues.push({ id: doc.id, type: 'example-missing-word', word });
  }

  if (meaning && meaning.length < MIN_MEANING_LENGTH) {
    issues.push({ id: doc.id, type: 'meaning-too-short', length: meaning.length, word });
  }
  if (meaning && meaning.length > MAX_MEANING_LENGTH) {
    issues.push({ id: doc.id, type: 'meaning-too-long', length: meaning.length, word });
  }
}

const report = {
  generatedAt: new Date().toISOString(),
  collection: 'vocabulary',
  totalDocuments: snapshot.size,
  issueCount: issues.length,
  checks: {
    emptyFields: ['word', 'meaning', 'hindiMeaning'],
    duplicateWords: 'case-insensitive',
    exampleContainsWord: true,
    meaningLength: { min: MIN_MEANING_LENGTH, max: MAX_MEANING_LENGTH },
  },
  issues,
};

await writeFile(OUTPUT, JSON.stringify(report, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ output: OUTPUT, totalDocuments: report.totalDocuments, issueCount: report.issueCount }));
