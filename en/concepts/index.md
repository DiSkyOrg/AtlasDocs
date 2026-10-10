---
title: Concepts
icon: lightbulb
description: The mechanics shared by every DiSky feature, before you touch messages, interactions or guilds.
tags: [reference, concepts]
order: 1
---

This section covers the mechanics that repeat across the whole atlas: entities and their
properties, waiting for Discord, looking entities up by id, builders, errors and events. You
already have a bot logged in under `"my-bot"` (see [Starting a bot](doc:getting-started/starting-a-bot)).

## What a concept page covers

A feature guide (working with messages, interactions, guilds...) shows you *what* to build.
A concept page shows you the pattern that guide leans on without re-explaining it: how a
property read differs from a property write, when a line needs `await`, how a builder turns
into a real Discord object, what an error looks like in the console, how an event fires. Once
you know a pattern here, every feature guide that uses it reads as a straight application of
it, not a new thing to learn.

## Reading order

1. [Entities and properties](entities-and-properties.md): every Discord object is an entity;
   properties are read and written as `X of %entity%`.
2. [Cache and await](cache-and-await.md): the three `await` rules, and why some reads need it.
3. [Getting entities by id](getting-by-id.md): the `X with id "..."` family, cache versus REST.
4. [Builders](builders.md): the builder contract and `the build result of`.
5. [Errors](errors.md): `try`/`catch`, `the last discord error`, the console error format.
6. [Events](events.md): event anatomy, `event-bot`, `seen by`, event values.
