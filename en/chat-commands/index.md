---
title: Chat commands
icon: terminal
description: Commands matched on what a user types in a channel, declared entirely in Skript and never registered on Discord.
tags: [commands, chat, discord]
order: 3
---

A *chat command* is matched on message text: the bot watches every message it receives and,
when the text matches `<prefix><name> <arguments>`, runs the command's `trigger`. Nothing is
registered on Discord. You're assumed to have a bot named `"my-bot"` logged in (see
[Starting a bot](doc:getting-started/starting-a-bot)).

```skript
discord command ping:
    prefixes: "!"
    trigger:
        reply with "pong"
```

Sending `!ping` in any channel the bot can see runs the trigger and replies `pong`.

## Chat or interaction commands

| Need | Use |
| --- | --- |
| Answers to typed text, no Discord registration, works on any client | a chat command, this section |
| A `/command` shown by Discord's own picker, or an entry in the right-click **Apps** menu | an [interaction command](doc:interaction-commands) |

Both families can live in the same script: a chat command reads its arguments from the message
text, an interaction command gets them typed and validated by Discord before the bot sees them.

## Reading order

1. [Declaring a command](declaring-a-command.md): the structure, prefixes, aliases, and what the
   trigger can read.
2. [Arguments](arguments.md): the argument grammar, types, resolution and named locals.
3. [Restricting a command](restricting-a-command.md): channels, roles, permissions, bots and
   cooldowns.
4. [Listing and events](listing-and-events.md): `on discord command used`, every loaded command,
   and a help command.
