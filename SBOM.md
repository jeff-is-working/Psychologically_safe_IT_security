---
title: Software Bill of Materials (SBOM)
scope: Complete inventory of all software components, their versions, licenses, and origins
last_updated: 2026-03-01
---

# Software Bill of Materials

This document inventories every software component included in or used by PeopleSafe SDLC Journal, including vendored libraries, browser APIs, build/deploy tooling, and development dependencies.

## Application Components

These components are shipped as part of the application and execute in the user's browser.

| Component | Version | License | Source | Vendored | Size |
|-----------|---------|---------|--------|----------|------|
| Alpine.js | 3.14.x | MIT | [github.com/alpinejs/alpine](https://github.com/alpinejs/alpine) | Yes (`js/vendor/alpine.min.js`) | 44 KB |
| PeopleSafe SDLC — utils.js | 1.0.0 | Project | Custom | N/A | 6 KB |
| PeopleSafe SDLC — crypto.js | 1.0.0 | Project | Custom | N/A | 4 KB |
| PeopleSafe SDLC — storage.js | 1.0.0 | Project | Custom | N/A | 7 KB |
| PeopleSafe SDLC — rollups.js | 1.0.0 | Project | Custom | N/A | 6 KB |
| PeopleSafe SDLC — app.js | 1.0.0 | Project | Custom | N/A | 20 KB |
| Circle 6 Systems logo | N/A | Proprietary | Circle 6 Systems | Yes (`assets/`) | 395 KB |

## Browser APIs

These are native browser APIs used by the application. They are not bundled — they are provided by the user's browser runtime.

| API | Specification | Usage |
|-----|---------------|-------|
| Web Crypto API (`crypto.subtle`) | [W3C Web Cryptography API](https://www.w3.org/TR/WebCryptoAPI/) | PBKDF2 key derivation, AES-256-GCM encrypt/decrypt |
| IndexedDB | [W3C Indexed Database API 3.0](https://www.w3.org/TR/IndexedDB-3/) | Persistent encrypted data storage |
| Storage API (`navigator.storage`) | [WHATWG Storage Standard](https://storage.spec.whatwg.org/) | Persistent storage request, quota estimation |
| TextEncoder / TextDecoder | [WHATWG Encoding Standard](https://encoding.spec.whatwg.org/) | UTF-8 string/binary conversion for crypto operations |

## CI/CD and Deploy Dependencies

These GitHub Actions run in the deployment pipeline. They execute in GitHub's hosted runners, not in the application itself.

| Action | Version | License | Publisher |
|--------|---------|---------|-----------|
| actions/checkout | v4 | MIT | GitHub |
| actions/configure-pages | v5 | MIT | GitHub |
| actions/upload-pages-artifact | v3 | MIT | GitHub |
| actions/deploy-pages | v4 | MIT | GitHub |

## Infrastructure

| Service | Provider | Purpose |
|---------|----------|---------|
| Static hosting | GitHub Pages | Serves HTML, CSS, JS, and assets over HTTPS |
| DNS | Cloudflare (via circle6systems.com) | CNAME record for `sdlc.circle6systems.com` |
| TLS certificate | GitHub (Let's Encrypt) | Automatic HTTPS for custom domain |

## Development Tools

These tools are used during development but are not part of the deployed application.

| Tool | Purpose |
|------|---------|
| Python 3 `http.server` | Local development server |
| Git | Version control |
| GitHub CLI (`gh`) | Repository and Pages management |

## External Network Requests

**After initial page load, the application makes zero network requests.** All JavaScript, CSS, and image assets are loaded in the initial page request. There are no CDN calls, analytics scripts, font downloads, or API endpoints. This is enforced by the Content Security Policy (`connect-src 'self'`).

## License Summary

| License | Components |
|---------|------------|
| MIT | Alpine.js, GitHub Actions (checkout, configure-pages, upload-pages-artifact, deploy-pages) |
| Proprietary | Circle 6 Systems logo, all custom application code |
