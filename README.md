# PeopleSafe SDLC Journal

A client-side encrypted journaling app for IT and cybersecurity professionals. Built on the SDLC framework — **Success, Delight, Learning, Compliment** — adapted from Donald Altman's G.L.A.D. Technique.

**Live at:** [https://jeff-is-working.github.io/Psychologically_safe_IT_security/](https://jeff-is-working.github.io/Psychologically_safe_IT_security/)

## Features

- **Daily SDLC Journaling** — Four focused reflections: Success, Delight, Learning, Compliment
- **Client-Side Encryption** — AES-256-GCM with PBKDF2 key derivation (600,000 iterations). Data never leaves your browser.
- **Rollup Summaries** — Weekly, monthly, quarterly, and yearly aggregations with editable reflections
- **Browse & Search** — Full-text search across all encrypted entries (decrypt-then-search, entirely local)
- **Export/Import** — JSON backup and restore for data portability
- **Zero Network Requests** — After initial page load, the app makes no network requests whatsoever
- **Mobile Responsive** — Full functionality on mobile with bottom navigation
- **Auto-Lock** — Session automatically locks after 5 minutes of tab inactivity

## Privacy Commitment

- All encryption/decryption happens in your browser using the Web Crypto API
- Your passphrase is never stored — only a verification hash (PBKDF2, separate salt)
- No cookies, no analytics, no telemetry, no server-side processing
- IndexedDB stores only encrypted blobs
- The master encryption key exists only in JavaScript memory and is cleared on page unload
- Content Security Policy restricts all external connections

## Technology

- **Alpine.js 3.x** (vendored, no CDN) — Reactive UI without build tools
- **Web Crypto API** — AES-256-GCM encryption, PBKDF2 key derivation
- **IndexedDB** — Persistent encrypted storage (50MB+)
- **GitHub Pages** — Static hosting, no server required
- **Zero dependencies** — No build step, no npm, no bundler

## Usage

1. Open the app in a modern browser
2. Create a passphrase (minimum 12 characters) — this derives your encryption key
3. Write your daily SDLC entry
4. Review rollup summaries to spot patterns over time
5. Export backups regularly from Settings

**Important:** If you forget your passphrase, your data cannot be recovered. There is no reset mechanism by design.

## Local Development

```bash
cd Psychologically_safe_IT_security
python3 -m http.server 8000
# Open http://localhost:8000
```

## About

The SDLC technique is a mental health resource for IT professionals, adapting positive psychology practices to the unique challenges of technology and cybersecurity work. See [SDLC-2.md](SDLC-2.md) for the full technique description.

A [Circle 6 Systems](https://circle6.systems) initiative for psychological safety in IT.
