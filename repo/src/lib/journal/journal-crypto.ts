/**
 * Client-side encryption for password-protected journal entries.
 *
 * Uses the Web Crypto API: a passphrase is stretched with PBKDF2 (SHA-256,
 * 150k iterations) into an AES-GCM 256-bit key, then content is encrypted with
 * a random IV. Salt + IV are stored alongside the ciphertext; the passphrase
 * is never persisted. This is best-effort, browser-side privacy: anyone with
 * the passphrase can decrypt, and losing it means the entry is unrecoverable.
 */
const enc = new TextEncoder();
const dec = new TextDecoder();

function toB64(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function fromB64(b64: string): Uint8Array {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}

async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: salt.buffer as ArrayBuffer, iterations: 150_000, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export interface EncryptedPayload {
  ciphertext: string;
  salt: string;
  iv: string;
}

export async function encryptText(plaintext: string, passphrase: string): Promise<EncryptedPayload> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);
  const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: iv.buffer as ArrayBuffer }, key, enc.encode(plaintext));
  return { ciphertext: toB64(buf), salt: toB64(salt.buffer), iv: toB64(iv.buffer) };
}

export async function decryptText(payload: EncryptedPayload, passphrase: string): Promise<string> {
  const key = await deriveKey(passphrase, fromB64(payload.salt));
  const ivBuf = fromB64(payload.iv);
  const cipherBuf = fromB64(payload.ciphertext);
  const plainBuf = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: ivBuf.buffer as ArrayBuffer },
    key,
    cipherBuf.buffer as ArrayBuffer
  );
  return dec.decode(plainBuf);
}
