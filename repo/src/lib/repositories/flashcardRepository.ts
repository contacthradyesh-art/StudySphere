import { fetchDocument, fetchDocuments, createDocument, removeDocument } from "@/lib/firebase/firestore";
import { getCurrentUserId } from "@/utils/getCurrentUserId";
import { where } from "firebase/firestore";

const DECKS_COLLECTION = "flashcardDecks";
const CARDS_COLLECTION = "flashcards";
const SM2_COLLECTION = "sm2Data";

export async function getDecks() {
  const userId = getCurrentUserId();
  return fetchDocuments(DECKS_COLLECTION, [where("userId", "==", userId)]);
}

export async function saveDeck(deck: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(DECKS_COLLECTION, `${userId}_${deck.id}`, { ...deck, userId });
}

export async function getCards(deckId: string) {
  const userId = getCurrentUserId();
  return fetchDocuments(CARDS_COLLECTION, [where("userId", "==", userId), where("deckId", "==", deckId)]);
}

export async function saveCard(card: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(CARDS_COLLECTION, `${userId}_${card.id}`, { ...card, userId });
}

export async function deleteCard(cardId: string) {
  const userId = getCurrentUserId();
  await removeDocument(CARDS_COLLECTION, `${userId}_${cardId}`);
}

export async function getSM2Data(cardId: string) {
  const userId = getCurrentUserId();
  return fetchDocument(SM2_COLLECTION, `${userId}_${cardId}`);
}

export async function saveSM2Data(data: Record<string, unknown>) {
  const userId = getCurrentUserId();
  await createDocument(SM2_COLLECTION, `${userId}_${data.cardId}`, { ...data, userId });
}
