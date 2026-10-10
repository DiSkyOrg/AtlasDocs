---
title: Listing and events
icon: list
description: Intercept every command before its checks run, list every one that's loaded, and log each use.
tags: [commands, events]
syntaxes:
  - events#discord-command-used
  - core/expressions#expression-all-discord-commands
order: 4
---

This page covers `on discord command used`, the event every command goes through before its
checks, and listing the [commands](doc:chat-commands/declaring-a-command) currently loaded. You're
assumed to have a bot named `"my-bot"` logged in.

## Intercepting a command

[`on discord command used`](event:events#discord-command-used) fires for every command, before
`executable in`, `roles`, `permissions` and `cooldown` are even [checked](doc:chat-commands/restricting-a-command).
`cancel event` inside it stops the command outright, before its trigger ever runs; it is one of
the two [cancellable DiSky events](doc:concepts/events).

```skript
discord command blocked:
    prefixes: "!"
    trigger:
        reply with "this should never run"

on discord command used:
    if name of event-discordcommand is "blocked":
        cancel event
        reply with "blocked by 'on discord command used'"
```

`event-discordcommand` is the command, and `used prefix`, `used alias`, `used arguments` say
exactly how it was typed; the same three expressions work inside the command's own `trigger`.
Filter to one bot the usual way, with `on discord command used seen by "my-bot":`.

Log every use the same way, before any check can refuse it:

```skript
on discord command used:
    send "%event-user% ran %name of event-discordcommand% (prefix=%used prefix%, alias=%used alias%, args='%used arguments%')" to console
```

event: events#discord-command-used compact

## Listing commands

[`all discord commands`](syntax:core/expressions#expression-all-discord-commands) returns every
command loaded from every script, as a list of [`discordcommand`](entity:discordcommand) values.
Each one exposes its declared entries, read-only:

| Property | Returns |
| --- | --- |
| [name](syntax:discordcommand#name) | the command's name |
| [description](syntax:discordcommand#description) | the `description` entry, if set |
| [usage](syntax:discordcommand#usage) | the `usage` entry, or one generated from the name and arguments |
| [category](syntax:discordcommand#category) | the `category` entry, if set |
| [aliases](syntax:discordcommand#aliases) | the command's aliases, without its main name |
| [prefixes](syntax:discordcommand#prefixes) | the command's prefixes; empty when it answers to its bare name |
| [cooldown](syntax:discordcommand#cooldown) | the `cooldown` entry, if set |

```skript
discord command help:
    prefixes: "!"
    trigger:
        set {_lines::*} to ""
        loop all discord commands:
            add "%name of loop-value%: %usage of loop-value%" to {_lines::*}
        reply with join {_lines::*} with nl
```

Group the reply by `category of loop-value` once you have more than a handful of commands. The
list always matches what's currently loaded: reloading a script adds or removes its commands from
it immediately, without restarting the bot.

syntax: core/expressions#expression-all-discord-commands compact

entity: discordcommand
