---
title: Security
scope: Threat model, encryption controls, content security policy, session management, and incident response
last_updated: 2026-03-01
---

# Security

Privacy is the foundational requirement of PeopleSafe SDLC Journal. The app's security model is built on a simple principle: **data never leaves the browser**. There is no server to compromise, no API to intercept, and no telemetry to analyze. This document details the threat model, cryptographic controls, and residual risks.

## Threat Model

The app protects against these threat categories, ordered by likelihood in the target use case (personal journaling on a personal or work device).

| Threat | Mitigation | Residual Risk |
|--------|------------|---------------|
| **Casual device access** — someone opens the browser and reads journal entries | Entries encrypted at rest in IndexedDB; session auto-locks after 5 min tab inactivity; key cleared on page unload | If the browser tab remains open and active, entries are visible until manual lock |
| **IndexedDB inspection** — attacker examines browser storage directly | All entry and rollup content stored as AES-256-GCM ciphertext; only encrypted blobs visible in DevTools | Meta store contains salts and verification hash (not plaintext, not the encryption key) |
| **Weak passphrase** — brute-force or dictionary attack against the passphrase | PBKDF2 with 600,000 iterations; minimum 12-character passphrase enforced in UI | No server-side rate limiting (offline attack); passphrase strength depends on user choice |
| **Network interception** — MITM or eavesdropping | HTTPS enforced via GitHub Pages; CSP restricts all connections to `'self'`; no outbound requests after page load | Initial page load over HTTPS is the trust anchor; a compromised CDN or DNS could serve altered code |
| **XSS / code injection** — malicious script accesses the CryptoKey | CSP meta tag: `script-src 'self' 'unsafe-eval'`; no inline scripts; all user content rendered via Alpine.js `x-text` (auto-escaped) | `unsafe-eval` required by Alpine.js; mitigated by `default-src 'self'` blocking external code |
| **Clickjacking** — embedding the app in a malicious frame | `X-Frame-Options: DENY` and `frame-ancestors 'none'` in CSP | Relies on browser honoring these headers |
| **Data exfiltration via browser extensions** — malicious extension reads DOM/storage | Out of scope; browser extensions run with elevated privileges | Users should audit installed extensions |

## Encryption Controls

All cryptographic operations use the **Web Crypto API** (`crypto.subtle`), which provides hardware-accelerated, constant-time implementations.

| Parameter | Value | Notes |
|-----------|-------|-------|
| Key derivation | PBKDF2 | Password-based key derivation function 2 |
| PBKDF2 iterations | 600,000 | Exceeds OWASP 2023 recommendation of 600,000 for SHA-256 |
| PBKDF2 hash | SHA-256 | Standard choice for PBKDF2 |
| Encryption algorithm | AES-256-GCM | Authenticated encryption with associated data |
| Key length | 256 bits | Maximum for AES |
| IV length | 12 bytes (96 bits) | NIST recommended length for GCM |
| IV generation | `crypto.getRandomValues` | Cryptographically secure random; unique per encrypt operation |
| Salt length | 16 bytes (128 bits) | Separate random salts for key derivation and passphrase hashing |
| CryptoKey extractable | `false` | Key material cannot be exported from the Web Crypto API |

**Dual-salt design**: The encryption key and the passphrase verification hash are derived from the same passphrase but with different salts stored in separate meta keys (`keySalt` and `passphraseSalt`). This ensures the verification hash reveals no information about the encryption key, even if an attacker obtains both salts and the hash.

## Content Security Policy

The CSP is set via a `<meta>` tag in `index.html`, providing defense-in-depth against injection attacks.

| Directive | Value | Purpose |
|-----------|-------|---------|
| `default-src` | `'self'` | Block all external resources by default |
| `script-src` | `'self' 'unsafe-eval'` | Allow only local scripts; `unsafe-eval` needed by Alpine.js |
| `style-src` | `'self'` | Allow only local stylesheets |
| `img-src` | `'self'` | Allow only local images |
| `connect-src` | `'self'` | Block all XHR/fetch/WebSocket to external origins |
| `frame-ancestors` | `'none'` | Prevent embedding in iframes |
| `base-uri` | `'self'` | Prevent base tag injection |
| `form-action` | `'self'` | Prevent form submissions to external origins |

Additional security headers set via `<meta>` tags: `X-Frame-Options: DENY`, `Referrer-Policy: no-referrer`, and a `Permissions-Policy` disabling camera, microphone, geolocation, and payment APIs.

## Session Management

The master CryptoKey exists only as a JavaScript object in memory. It is never serialized, never written to storage, and never transmitted.

**Lock triggers**:
- `beforeunload` event: key reference set to `null` on page close/refresh
- `visibilitychange` event: 5-minute timer starts when the tab is hidden; if the timer expires, the app locks and clears the key
- Manual lock: user clicks the "Lock" button in the header

**On lock**, the app clears: `cryptoKey`, `entryForm`, `selectedEntry`, `currentRollup`, `searchResults`, and navigates to the auth view.

## Export and Import Security

The export function downloads all IndexedDB content (entries, rollups, meta) as a JSON file. Exported data remains encrypted — the backup file contains ciphertext, IVs, salts, and the verification hash. **It does not contain the passphrase or the CryptoKey.**

Importing a backup merges data using a "newer wins" strategy (comparing `updatedAt` timestamps). Because the backup includes the `keySalt` and `passphraseHash`, importing a backup from a different passphrase will overwrite authentication material. The user must then re-lock and authenticate with the passphrase that matches the imported data.

## Known Limitations

- **No passphrase recovery**: If the user forgets their passphrase, encrypted data is permanently inaccessible. This is by design — there is no recovery mechanism, no security questions, and no server-side reset.
- **`unsafe-eval` in CSP**: Alpine.js requires `unsafe-eval` for its expression evaluation. This widens the XSS attack surface compared to a strict CSP. The risk is mitigated by `default-src 'self'` blocking all external script sources.
- **No integrity verification on static files**: GitHub Pages does not support Subresource Integrity (SRI) for same-origin scripts. A compromised GitHub account or supply chain attack on GitHub Pages could serve altered JavaScript. Users concerned about this should self-host or verify source integrity via git.
- **Browser extension access**: Extensions running with `<all_urls>` permission can read DOM content and IndexedDB. This is outside the app's control.

## Incident Response

Because this is a client-side-only application with no server infrastructure, "incidents" are limited to local device compromise or code integrity issues.

| Severity | Scenario | Response |
|----------|----------|----------|
| **Critical** | Passphrase exposed or device compromised | Export data immediately, clear all data via Settings, re-create journal with a new passphrase, change passphrase on any other services where it was reused |
| **High** | Suspicious browser extension detected | Remove the extension, lock and re-lock the journal, consider exporting and re-creating with a new passphrase |
| **Medium** | Unexpected JavaScript errors during encrypt/decrypt | Check browser console for error details, verify browser is up to date, export a backup, report the issue |
| **Low** | IndexedDB storage quota warning | Export a backup, clear old entries if needed, check `navigator.storage.estimate()` in Settings |
