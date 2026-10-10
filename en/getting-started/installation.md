---
title: Installation
icon: download
description: Installing the DiSky plugin, its Skript dependency, and checking it loaded.
order: 1
---

This page covers getting DiSky running on a Paper server. It assumes you already have Skript
installed; see [what you need](index.md#what-you-need) for the version requirements.

## How installation works

::: steps
1. Drop the DiSky jar into your server's `plugins/` folder. Skript must already be installed
   and enabled: DiSky is a Skript addon, not a standalone plugin.

2. Make sure `use type properties: true` is set (or simply not overridden) in Skript's
   `config.sk`. DiSky's shared syntaxes, like `name of {_bot}`, are registered as type
   properties and depend on it.

3. Start (or restart) the server.
:::

If Skript isn't installed or fails to enable, DiSky logs *"Skript is not installed or failed
to enable; cannot start DiSky."* and disables itself. There is no config file to edit for v5:
DiSky has no `config.yml`, only the manifest described below.

## A successful load

On a successful load, the console shows DiSky registering its syntax and finishes with:

```text
[DiSky] DiSky5 enabled: types, properties, bot lifecycle and error layer registered.
```

If `use type properties` is disabled, DiSky still loads but warns:

*"Skript's 'use type properties' option is DISABLED in your config.sk. DiSky's shared
syntaxes (e.g. "name of %member%") rely on it and will NOT parse. It is ON by default in
Skript 2.15+, remove the override or set 'use type properties: true'."*

## The syntax manifest

At every boot, DiSky writes `plugins/DiSky/disky-syntax.json`: a machine-readable manifest of
every entity, syntax and core element it registered, along with the plugin version and a
timestamp. It's what the atlas itself is generated from; you don't need to edit or read it to
use DiSky, but it's useful if you're building tooling against a specific install.

Once the plugin is loaded, head to [starting a bot](starting-a-bot.md) to create your first
bot. You will need a bot token from the
[Discord Developer Portal](https://discord.com/developers/applications).

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *Skript is not installed or failed to enable; cannot start DiSky.* | Skript is missing, disabled, or failed to enable before DiSky. | Install or fix Skript, then restart the server. |
| *Skript's 'use type properties' option is DISABLED in your config.sk...* | `use type properties: false` is set in Skript's `config.sk`. | Remove the override or set `use type properties: true`, then restart. |
