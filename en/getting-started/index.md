---
title: Getting started
icon: rocket
description: What DiSky v5 is, what you need before writing a bot, and where to go next.
order: 0
---

DiSky v5 is a Skript addon that lets you write Discord bots directly in Skript. It runs on a
Paper server and is built on top of [JDA](https://jda.wiki) for the Discord connection, so
every bot you create behaves like a normal JDA bot underneath.

## What you need

- A **Paper server** running **1.21** or newer.
- **Java 21** or newer.
- **Skript 2.16.1** or newer, with `use type properties: true` in Skript's `config.sk`. This
  option is on by default in recent Skript versions; DiSky's shared syntaxes (properties like
  `name of {_bot}`) rely on it and won't parse if it's disabled.
- A **Discord application** with a bot token, created on the
  [Discord Developer Portal](https://discord.com/developers/applications).

## Reading order

1. [Installation](installation.md): installing the plugin and checking it loaded.
2. [Starting a bot](starting-a-bot.md): create a bot, log it in, and shut it down cleanly.
3. [Bot options](bot-options.md): every connection option, intents to shard count.
4. [Multiple bots](multiple-bots.md): running several bots and looking them up.

!!! tip "Imperative API only"
    Every example in this section uses the imperative bot API: `a new discord bot`, then
    `set` its properties, then `login`. It's the only form covered here and in the rest of
    the atlas.
