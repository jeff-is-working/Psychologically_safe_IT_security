---
title: Documentation Index
scope: Navigation hub for all PeopleSafe SDLC Journal documentation
last_updated: 2026-03-01
---

# PeopleSafe SDLC Journal — Documentation

## Documents

| Document | Description |
|----------|-------------|
| [README.md](../README.md) | Project overview, features, getting started, and local development |
| [ARCHITECTURE.md](ARCHITECTURE.md) | System design, data flow, cryptographic architecture, and storage schema |
| [SECURITY.md](SECURITY.md) | Threat model, encryption controls, CSP policy, and incident response |
| [DEPLOYMENT.md](DEPLOYMENT.md) | GitHub Pages setup, CI/CD pipeline, custom domain, and troubleshooting |
| [DEVELOPER_GUIDE.md](DEVELOPER_GUIDE.md) | Coding conventions, file organization, and how to extend the app |
| [FRONTEND.md](FRONTEND.md) | Alpine.js architecture, view states, component hierarchy, and CSS design system |
| [SBOM.md](../SBOM.md) | Software Bill of Materials — all components, versions, and licenses |
| [SDLC-2.md](../SDLC-2.md) | The SDLC journaling technique — methodology, rationale, and practice guidance |

## About This Documentation

These documents follow the **Enterprise Documentation v1.2** methodology:

- Each topic lives in exactly one place — documents cross-reference rather than duplicate
- Setup and deployment steps live solely in the root README
- Every section contains substantive content (no stub headings)
- Mermaid diagrams include protocol/label annotations on edges
- Troubleshooting is consolidated into structured tables

## Contributing to Documentation

When updating docs, follow these conventions:

1. Keep the YAML metadata block (`title`, `scope`, `last_updated`) current
2. Limit each file to 10 or fewer top-level (`##`) headings
3. Add context before every code snippet — explain *what* and *why* before showing *how*
4. Link to other docs instead of copying content across files
