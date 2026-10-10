---
title: Declaring a command
icon: list-tree
description: The discord command structure, its entries, prefixes and aliases, and what the trigger can read.
tags: [commands, discord]
syntaxes:
  - core/structures#structure-discord-command
  - discordcommand#prefixes
  - discordcommand#aliases
order: 1
---

This page covers the `discord command` structure itself: its header, its entries, how a
message is matched against it, and what the `trigger` can read. You're assumed to have a bot
named `"my-bot"` logged in (see [Starting a bot](doc:getting-started/starting-a-bot)) and to
have read the [commands overview](doc:chat-commands).

## How a command works

A `discord command` is a top-level structure, declared next to your bot's `on ready` and
`options:` blocks, not inside them. Its header names the command; its `trigger` runs once a
message matches. The bot watches every message it receives and compares it against every
loaded command.

```skript
discord command ping:
    prefixes: "!"
    trigger:
        reply with "pong"
```

Sending `!ping` runs the trigger above. Matching works like this: the command's name is
compared case-insensitively, the message must start with `<prefix><name>` (in that order),
and anything after that, separated by whitespace, becomes the raw arguments. A message sent
by another bot, or by a webhook, never triggers a command. Without an `executable in` entry
(see [Restricting a command](doc:chat-commands/restricting-a-command)), a command works in DMs as
well as in guild channels.

syntax: core/structures#structure-discord-command compact

## Entries

Every entry below except `trigger` is optional.

| Entry | Default | Accepted values |
| --- | --- | --- |
| [prefixes](syntax:discordcommand#prefixes) | none: the bare name matches | an expression of text, one or more values |
| [aliases](syntax:discordcommand#aliases) | none | comma-separated names |
| [description](syntax:discordcommand#description) | none | any text |
| [usage](syntax:discordcommand#usage) | generated from the name and arguments | any text |
| [category](syntax:discordcommand#category) | none | any text |
| `trigger` | *(required)* | a section of Skript code |

`roles`, `permissions`, `bots`, `executable in`, `cooldown` and `cooldown scope` restrict who
can run the command; see [Restricting a command](doc:chat-commands/restricting-a-command). `usage
message` is covered with the rest of the argument grammar on
[Arguments](doc:chat-commands/arguments).

## Prefixes and aliases

A command declared without `prefixes:` answers to its bare name, nothing in front of it:

```skript
discord command hello <user>:
    trigger:
        reply with "Hello %arg-1%!"
```

`prefixes` accepts more than one value, so a command can answer to several:

```skript
discord command ping:
    prefixes: "!", "?"
    trigger:
        reply with "pong"
```

`prefixes` is an expression, evaluated fresh for every incoming message, not a fixed list read
once at load time. A prefix stored in a variable can therefore change while the script runs:

```skript
discord command ping:
    prefixes: "%{prefix}%"
    trigger:
        reply with "pong"
```

The entry is parsed before the command's event exists, so event values such as `event-guild`
cannot be used inside it; a per-guild prefix is not possible through `prefixes` alone.

Once a message matches, `used prefix` and `used alias` report exactly what matched, name or
alias:

```skript
discord command ping:
    prefixes: "!"
    aliases: p, pong
    trigger:
        reply with "matched with '%used prefix%%used alias%'"
```

!!! tip "Bare names are chatty"
    A command with no `prefixes:` reacts to any message that starts with its name, with
    nothing in front of it. Reserve the bare form for a command or two you want to feel like a
    conversation; prefix the rest.

## Inside the trigger

The trigger of a `discord command` is itself an event: everything below is readable there, and
in [`on discord command used`](doc:chat-commands/listing-and-events) and
[`on discord command failed`](doc:chat-commands/restricting-a-command) too.

| Value | Holds |
| --- | --- |
| `event-discordcommand` | the command that matched |
| `event-message` | the Discord message that triggered it |
| `event-user` | the message's author |
| `event-member` | the author as a guild member; unset in a DM |
| `event-guild` | the guild the message was sent in; unset in a DM |
| `event-channel` | the channel the message was sent in |
| `event-bot` | the bot that received the message |
| `used prefix` | the prefix that matched |
| `used alias` | the name or alias that matched |
| `used arguments` | the raw text after the name, before parsing |

Declared arguments are read with `arg-1` and friends; see
[Arguments](doc:chat-commands/arguments). [`reply with`](doc:messages/sending-messages) posts in
`event-channel`, the command's own channel, and every ordinary DiSky effect works in the
trigger exactly as it does in `on message received`.

## Reloading and clashes

Commands are registered by identity, not by name: reloading a script removes only the commands
it declared, and never touches another script's. Two commands sharing a name (or an alias)
with overlapping prefixes both still load, with a warning:

*The discord command '\<name>' is already declared in \<file>; both will run on the same
message.*

!!! warning "A clash is not a load failure"
    Both commands stay registered and both run for a message that matches either one; DiSky
    does not pick a winner. Rename one of them, or scope their prefixes apart, to fix it.

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *Unexpected entry '\<key>' in a discord command. Known entries: prefixes, aliases, description, usage, category, roles, permissions, bots, executable in, cooldown, cooldown scope, permission message, cooldown message, usage message, trigger.* | An entry name is misspelled, or doesn't exist | Use one of the listed entries |
| *Required entry 'trigger' is missing* | The structure has no `trigger:` section | Add a `trigger:` section |

Declaring a command never talks to Discord, so it has no Discord-side errors of its own; those
start once a message actually reaches the trigger (see [Errors](doc:concepts/errors)).

entity: discordcommand
