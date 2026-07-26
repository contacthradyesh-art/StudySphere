import {
  addDoc, collection, deleteDoc, doc, increment, onSnapshot, orderBy,
  query, serverTimestamp, updateDoc, where
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { COLLECTIONS } from '@/lib/firestore/schema';
import { FLASHCARD_COLLECTIONS, type Deck, type Flashcard, type NewDeck, type NewFlashcard } from '@/lib/firestore/flashcard-schema';
import { initialState, scheduleCard, type Grade } from './sm2';

function decksCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, FLASHCARD_COLLECTIONS.decks);
}
function cardsCol(uid: string) {
  return collection(db, COLLECTIONS.users, uid, FLASHCARD_COLLECTIONS.cards);
}

export function subscribeDecks(uid: string, cb: (decks: Deck[]) => void) {
  const q = query(decksCol(uid), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Deck)));
}

export function subscribeCards(uid: string, deckId: string, cb: (cards: Flashcard[]) => void) {
  const q = query(cardsCol(uid), where('deckId', '==', deckId));
  return onSnapshot(q, (snap) => cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Flashcard)));
}

export async function createDeck(uid: string, data: NewDeck): Promise<string> {
  const ref = await addDoc(decksCol(uid), { ...data, cardCount: 0, createdAt: serverTimestamp() });
  return ref.id;
}

export async function deleteDeck(uid: string, deckId: string) {
  await deleteDoc(doc(decksCol(uid), deckId));
}

/** Add a card with initial SM-2 state and bump the deck's card count. */
export async function createCard(uid: string, data: NewFlashcard) {
  const init = initialState();
  await addDoc(cardsCol(uid), { ...data, ...init, createdAt: serverTimestamp() });
  await updateDoc(doc(decksCol(uid), data.deckId), { cardCount: increment(1) });
}

/** Bulk-add AI-generated cards to a deck. */
export async function createCards(uid: string, deckId: string, pairs: { front: string; back: string }[]) {
  for (const p of pairs) {
    await createCard(uid, { deckId, front: p.front, back: p.back, source: 'ai' });
  }
}

/** Apply an SM-2 grade to a card and persist the new schedule. */
export async function reviewCard(uid: string, card: Flashcard, grade: Grade) {
  const next = scheduleCard(card, grade);
  await updateDoc(doc(cardsCol(uid), card.id), next as any);
}

export async function deleteCard(uid: string, deckId: string, cardId: string) {
  await deleteDoc(doc(cardsCol(uid), cardId));
  await updateDoc(doc(decksCol(uid), deckId), { cardCount: increment(-1) });
}
