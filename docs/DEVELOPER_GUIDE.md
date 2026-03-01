---
title: Developer Guide
scope: Coding conventions, file organization, module patterns, and how to extend the application
last_updated: 2026-03-01
---

# Developer Guide

## Development Setup

For prerequisites, installation, and running the app locally, see [README.md — Local Development](../README.md#local-development).

## File Organization

The project has no build tooling. All source files are served directly by the static host.

```
index.html              ← App shell: all HTML views as Alpine.js templates
css/styles.css          ← Single stylesheet, CSS custom properties for theming
js/utils.js             ← Date helpers, formatters, escaping (loaded first)
js/crypto.js            ← Web Crypto API wrapper (depends on nothing)
js/storage.js           ← IndexedDB abstraction (depends on Utils for export filename)
js/rollups.js           ← Period aggregation (depends on Utils, Storage, Crypto)
js/app.js               ← Alpine.js component (depends on all above)
js/vendor/alpine.min.js ← Vendored Alpine.js 3.x (loaded with defer, runs last)
```

Scripts are loaded synchronously in `index.html` in this exact order. Alpine.js has the `defer` attribute so it executes after all other scripts have registered the `alpine:init` event listener in `app.js`.

## Module Pattern

Each JavaScript file uses the **IIFE (Immediately Invoked Function Expression)** pattern, exposing a single global namespace object. This was chosen over ES modules to avoid the need for a bundler or `type="module"` script tags.

The pattern for every module is:

```javascript
const ModuleName = (() => {
  'use strict';
  // private functions and state
  function _privateHelper() { ... }
  // public API
  function publicMethod() { ... }
  return { publicMethod };
})();
```

Private functions are prefixed with `_`. The public API is the returned object at the bottom of the IIFE.

## Coding Conventions

- **No external dependencies** at runtime. The only vendored library is Alpine.js. All other functionality uses browser-native APIs.
- **No build step**. Changes to any `.js`, `.css`, or `.html` file take effect immediately on reload.
- **CSS custom properties** for all colors, spacing, and sizing. Modify `:root` variables in `css/styles.css` to change the theme.
- **Alpine.js directives** (`x-data`, `x-show`, `x-if`, `x-text`, `x-model`, `x-transition`) handle all DOM manipulation. There is no direct DOM manipulation in JavaScript.
- **Async/await** for all asynchronous operations (crypto, IndexedDB, storage estimates).
- **Error handling**: crypto and storage operations are wrapped in try/catch. User-facing errors are set on `this.error`; success messages on `this.message`. Both are cleared on navigation.

## Adding a New View

To add a new view to the application:

1. **Add state value** in `app.js` — extend the `view` comment on line 10 with the new view name.
2. **Add navigation** — add a `<button>` to both the desktop `nav-bar` and mobile `bottom-nav` in `index.html`.
3. **Add view template** — add a `<div x-show="view === 'yourview'" x-transition>` block inside the authenticated section of `index.html`.
4. **Add loader method** — if the view needs data, add an `async _loadYourView()` method in the `navigate()` switch in `app.js`.

## Adding a New SDLC Category

The four categories (success, delight, learning, compliment) are referenced in several places. To add or rename a category:

1. **`js/rollups.js`** — update the `CATEGORIES` array
2. **`js/app.js`** — update `entryForm`, `editForm`, `getCategoryLabel()`, and `getCategoryIcon()`
3. **`index.html`** — update all four `sdlc-field` blocks in the dashboard, browse edit, and rollup views
4. **`css/styles.css`** — add CSS variables (`--newcat-color`, `--newcat-bg`) and class rules (`.sdlc-field.newcat`, `.sdlc-label.newcat`, etc.)

## Security Considerations for Contributors

Any code change must maintain the encryption guarantees documented in [SECURITY.md](SECURITY.md). Key rules:

- Never persist the `CryptoKey` to storage. It must only exist in a JavaScript variable.
- Never log or display plaintext entry content to the console in production.
- All user-generated content must be rendered via `x-text` (which auto-escapes HTML), never `x-html`.
- Do not add external script sources, CDN links, or analytics. The CSP and privacy commitment prohibit external connections.
- New IndexedDB stores or schema changes require incrementing `DB_VERSION` in `storage.js` and adding migration logic in `onupgradeneeded`.
