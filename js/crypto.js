/**
 * PeopleSafe SDLC Journal - Encryption Module
 * AES-256-GCM encryption with PBKDF2 key derivation via Web Crypto API.
 * All cryptographic operations happen client-side; no data leaves the browser.
 */

const Crypto = (() => {
  'use strict';

  const PBKDF2_ITERATIONS = 600000;
  const SALT_BYTES = 16;
  const IV_BYTES = 12;
  const KEY_BITS = 256;

  function isSupported() {
    return !!(
      window.crypto &&
      window.crypto.subtle &&
      window.indexedDB &&
      window.TextEncoder &&
      window.TextDecoder
    );
  }

  function generateSalt() {
    return window.crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  }

  function _arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  function _base64ToArrayBuffer(base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  async function _importPassphrase(passphrase) {
    const enc = new TextEncoder();
    return window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      'PBKDF2',
      false,
      ['deriveBits', 'deriveKey']
    );
  }

  /**
   * Derive an AES-GCM-256 CryptoKey from a passphrase and salt.
   * Uses PBKDF2 with 600,000 iterations and SHA-256.
   */
  async function deriveKey(passphrase, salt) {
    const baseKey = await _importPassphrase(passphrase);
    const saltBytes = typeof salt === 'string' ? _base64ToArrayBuffer(salt) : salt;

    return window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: KEY_BITS },
      false, // not extractable
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypt plaintext with AES-GCM-256. Returns { ciphertext, iv } as base64 strings.
   * A random 12-byte IV is generated per operation.
   */
  async function encrypt(plaintext, cryptoKey) {
    const enc = new TextEncoder();
    const iv = window.crypto.getRandomValues(new Uint8Array(IV_BYTES));

    const cipherBuffer = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      enc.encode(plaintext)
    );

    return {
      ciphertext: _arrayBufferToBase64(cipherBuffer),
      iv: _arrayBufferToBase64(iv)
    };
  }

  /**
   * Decrypt ciphertext with AES-GCM-256. Returns plaintext string.
   * Throws OperationError if the passphrase (key) is wrong.
   */
  async function decrypt(ciphertext, iv, cryptoKey) {
    const cipherBytes = _base64ToArrayBuffer(ciphertext);
    const ivBytes = _base64ToArrayBuffer(iv);

    const plainBuffer = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: ivBytes },
      cryptoKey,
      cipherBytes
    );

    return new TextDecoder().decode(plainBuffer);
  }

  /**
   * Hash a passphrase for verification purposes.
   * Uses a separate PBKDF2 derivation (different salt than encryption key).
   * Returns base64-encoded hash.
   */
  async function hashPassphrase(passphrase, salt) {
    const baseKey = await _importPassphrase(passphrase);
    const saltBytes = typeof salt === 'string' ? _base64ToArrayBuffer(salt) : salt;

    const bits = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBytes,
        iterations: PBKDF2_ITERATIONS,
        hash: 'SHA-256'
      },
      baseKey,
      256
    );

    return _arrayBufferToBase64(bits);
  }

  // Expose base64 helpers for storage module
  function saltToBase64(salt) {
    return _arrayBufferToBase64(salt);
  }

  function saltFromBase64(base64) {
    return _base64ToArrayBuffer(base64);
  }

  return {
    isSupported,
    generateSalt,
    deriveKey,
    encrypt,
    decrypt,
    hashPassphrase,
    saltToBase64,
    saltFromBase64
  };
})();
