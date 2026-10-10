---
title: Interaction commands
icon: slash-square
description: Slash commands and right-click context commands, declared by a structure or a builder and pushed to Discord by the script.
tags: [commands, slash, context-menu, application-commands]
order: 4
---

An *interaction command* is registered on Discord and shown by the client itself: a `/command`
in the picker, or an entry in the right-click **Apps** menu on a user or a message. Discord types
and validates its arguments before the bot sees them. You're assumed to have a bot named
`"my-bot"` logged in (see [Starting a bot](doc:getting-started/starting-a-bot)).

```skript
slash command ping:
    description: Pong!
    trigger:
        reply with hidden "Pong! (%used slash command%)"

on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

The structure declares the command and its trigger; the `on guild ready` block is what puts it
on Discord. Nothing reaches Discord on its own, at load, reload or unload.

## Structure or builder

| Need | Use |
| --- | --- |
| A `/command` with its own trigger, known when the script loads | a [slash structure](slash-commands.md) |
| A `/command` assembled at runtime, from data or per guild | a [command builder](command-builders.md) |
| An entry in the right-click **Apps** menu | a [context command](context-commands.md), structure or builder |
| A command matched on typed text, with no Discord registration | a [chat command](doc:chat-commands) |

Both forms produce the same command objects and can be pushed in the same call; a structure
keeps its own `trigger`, a builder is answered in the generic `on slash command` event.

## Reading order

1. [Slash commands](slash-commands.md): the structure, its path, description, trigger, and what
   changed from v4.
2. [Slash options](slash-options.md): argument types, choices, autocomplete, typed options.
3. [Context commands](context-commands.md): `user command` and `message command`, their targets.
4. [Command builders](command-builders.md): building a command as an object, mixing with structures.
5. [Registering commands](registering-commands.md): `update`, `register`, `unregister`, reload.
6. [Command settings](command-settings.md): permissions, contexts, localisation, cooldowns.
