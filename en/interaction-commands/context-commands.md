---
title: Context commands
icon: mouse-pointer-click
description: The user and message context-menu command structures and builders, and what their trigger can read.
tags: [commands, context-menu, application-commands]
syntaxes:
  - core/structures#structure-context-command-structure
  - usercommand#new-user-command
  - messagecommand#new-message-command
order: 3
---

This page covers `user command` and `message command`: the structures behind Discord's right-click
**Apps** menu, and their builder equivalents. You're assumed to have a bot named `"my-bot"` logged
in and to have read [Slash commands](doc:interaction-commands/slash-commands).

## How context commands work

Right-clicking a user or a message in Discord opens an **Apps** submenu; each entry there is a
context command. A `user command` structure answers a click on a user, a `message command` one
answers a click on a message; both are models, exactly like `slash command`, with a `trigger` that
runs once someone picks the entry.

```skript
user command Report user:
    trigger:
        reply with hidden "Reported %target user%"

message command Quote this:
    trigger:
        reply with hidden "> %discord content of target message%"
```

A name is 1 to 32 characters and, unlike a slash command's, may contain spaces and capitals:
"Report user" and "Quote this" are valid entries on Discord's menu. `trigger` is the only required
entry.

Nothing reaches Discord until a script pushes it, the same way as a slash command: `update the
discord commands (all structured application commands) in event-guild` from `on guild ready` sends
every structure, context commands included. See [Registering
commands](doc:interaction-commands/registering-commands) for `register`, `unregister` and the global/guild
split. Context commands changed from v4 to v5 the same way slash commands did; see the admonition
on [Slash commands](doc:interaction-commands/slash-commands) for what changed.

syntax: core/structures#structure-context-command-structure compact

## Entries

| Entry | Default | Accepted values |
| --- | --- | --- |
| [name](syntax:applicationcommand#name-localizations) | the header's own name | a section of `locale: text` translated names |
| `trigger` | *(required)* | a section of Skript code |

`enabled for`, `disabled`, `nsfw`, `contexts`, `integration types`, `cooldown`, `cooldown scope` and
`on cooldown` work the same as on a slash command; see [Command
settings](doc:interaction-commands/command-settings).

## Inside the trigger

| Value | Holds |
| --- | --- |
| `target user` | the clicked user, in a `user command` trigger |
| `target message` | the clicked message, in a `message command` trigger |
| `used user command` / `used message command` | the command's name |
| `event-user`, `event-member`, `event-guild`, `event-channel`, `event-bot` | the invocation's context |
| `event-message` | the clicked message, same value as `target message` (message commands only) |

event: events#user-command compact

event: events#message-command compact

## Building one instead

A context command builder is a plain object with a name and nothing else: no path, no `trigger`.
Nothing reaches Discord until it's pushed, and a builder-declared command is answered in the
generic event instead of running a trigger of its own.

```skript
on guild ready:
    set {_report} to a new user command named "Report user"
    register the discord command {_report} in event-guild

on user command:
    if used user command is "Report user":
        reply with hidden "Reported %target user%"
```

```skript
on guild ready:
    set {_quote} to a new message command named "Quote this"
    register the discord command {_quote} in event-guild

on message command:
    if used message command is "Quote this":
        reply with hidden "> %discord content of target message%"
```

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *A context command name is 1 to 32 characters long* | the header's name is empty or too long | shorten or lengthen it to fit |
| *Unexpected entry 'x' in a context command. Known entries: name, enabled for, disabled, nsfw, contexts, integration types, cooldown, cooldown scope, on cooldown, trigger.* | an entry name is misspelled, or belongs to `slash command` only | use one of the listed entries |

entity: usercommand
