---
title: Beta status
icon: flask-conical
description: What the DiSky v5 beta means for your scripts, and what isn't available yet.
tags: [beta, stability]
order: 0
---

DiSky v5 is in public beta. This page tells you what you can rely on today, what may still move,
and what isn't available yet, so you can decide whether to run it on a production bot.

## What beta means

The beta covers most of what you need to write a Discord bot, but the plugin is still young: you
may hit bugs, unexpected errors in the console or, in rare cases, a crash. Each beta build fixes
what was reported against the previous one, so always run the latest build.

If something breaks, open an issue on the
[DiSky5 repository](https://github.com/DiSkyOrg/DiSky5/issues) with your DiSky, Skript and Paper
versions, the script that triggers it, and the full console output.

## Syntax stability

The syntax documented in this atlas is stable. Patterns, property names and return types are not
expected to change between beta builds, so a script you write today keeps parsing on the next
build.

A syntax only changes in an extreme case, for example when Discord removes the feature behind it.
Those cases are rare and stay limited to the syntaxes directly concerned.

## Modules

The module system is not available in v5 yet. Modules made for DiSky 4 don't load, and there is
no way to register a new module for now. Addons that depend on DiSky as a regular Skript addon
are not affected.

## Skript version

DiSky v5 needs **Skript 2.16.1** or newer (see [what you need](index.md#what-you-need)), but the
recommended setup is the **latest Skript release**. DiSky follows Skript closely, and recent
releases fix parser issues that can affect addon syntaxes.

## Not supported yet

A few niche features from DiSky 4 are not available in v5 yet. Everything else is covered, with a
slightly different syntax in places: check the atlas for the v5 form of a syntax before porting a
script.

If a DiSky 4 syntax has no equivalent in the atlas, it is one of those features. Open an issue if
your bot depends on it, so it can be prioritized.
