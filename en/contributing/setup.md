---
title: Setup
icon: wrench
description: Cloning the project and the contribution rules.
order: 1
---

This page covers previewing the site on your machine and what happens once your change is pushed.
Pages are plain markdown: the DiSky Atlas application is only needed to render them.

## Previewing locally

The docs live in their own repository, next to the application that renders them.

1. Clone this repository next to the DiSkyAtlas project, so that both folders share a parent folder.
2. Check that `Docs:LocalPath` in the application's `appsettings.Development.json` points to this clone.
   It is set to `../DiSkyAtlasDocs` by default.
3. Run the application in Development mode and open `/docs`.

In Development mode the site reads the files of `LocalPath` directly. Refresh the browser after each
save; no build step is needed.

## Publishing

Pushing to `main` publishes your change. Once the CI lint passes, the site syncs from GitHub: a
webhook triggers the sync, and a poll every 10 minutes catches anything it missed. The application
is not rebuilt.

## Contribution rules

- Follow the [style guide](style-guide.md) and the [writing pages](writing-pages.md) reference.
- Only the pages under `en/` are written by hand. This section stays English-only.
- Translations of other sections are described in `TRANSLATING.md`, at the root of the repository.
