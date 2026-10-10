---
title: Slash commands
icon: square-slash
description: The slash command structure, its path, description and trigger, and pushing it to Discord.
tags: [commands, slash, application-commands]
syntaxes:
  - core/structures#structure-slash-command-structure
  - core/expressions#expression-structured-discord-commands
order: 1
---

This page covers the `slash command` structure: its header, entries, trigger, and how a script
pushes it to Discord. You're assumed to have a bot named `"my-bot"` logged in and to have read
the [commands overview](doc:interaction-commands).

## How a slash command works

A `slash command` structure is a **model**, declared next to your bot's `on ready` block, not
inside it. Its header names the command and its arguments; its `trigger` runs once a user
actually uses `/name` on Discord. Nothing reaches Discord at load, reload or unload: a script
pushes the result explicitly, typically from `on guild ready`.

```skript
slash command ping:
    description: Pong!
    trigger:
        reply with hidden "Pong! (%used slash command%)"
```

```skript
on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

`/ping` now runs the trigger above and replies with an ephemeral `Pong! (ping)`.

syntax: core/structures#structure-slash-command-structure compact

!!! warning "Coming from v4"
    In v4 the structure registered itself on Discord, with `bot:` and `guilds:` entries; in v5
    the structure registers nothing, and a script calls `update the discord commands ...` from
    `on guild ready` (or `on ready` for global commands). Nothing is deleted from Discord at
    unload or shutdown, either: pushing again is what removes a command. Arguments are declared
    in the header as `<name: type>` instead of an `arguments:` list, and can't have a default
    value, since Discord has none. Cancelling `on cooldown` still lets the command run.

## Entries

Every entry below is optional; `description` defaults to "No description provided".

| Entry | Default | Accepted values |
| --- | --- | --- |
| [description](syntax:slashcommand#description) | "No description provided" | text, or a section of `locale: text` lines with a mandatory `en-US` line |
| [name](syntax:applicationcommand#name-localizations) | the header's own name | a section of `locale: text` translated names |
| arguments | none | a section: per argument, `name: description` or a sub-section (`description`, `choices`, `on completion request`) |
| `trigger` | none for a root or a group | a section of Skript code |

`enabled for`, `disabled`, `nsfw`, `contexts`, `integration types`, `cooldown`, `cooldown scope`
and `on cooldown` restrict and localise the command; see
[Command settings](doc:interaction-commands/command-settings).

## Subcommands and groups

A path is one to three lowercase words: a command, an optional group, an optional subcommand.
Two structures sharing the first word merge into one Discord command:

```skript
slash command mod ban <target: member> [<reason: string>]:
    description: Ban a member
    trigger:
        reply with hidden "Would ban %{_target}%"

slash command mod kick <target: member>:
    description: Kick a member
    trigger:
        reply with hidden "Would kick %{_target}%"
```

`mod ban` and `mod kick` become one `/mod` with two subcommands. A path with no `trigger`
describes the root or a group instead of a leaf command:

```skript
slash command mod:
    description: Moderation tools
    enabled for: manage server

slash command settings color:
    description: Colour settings

slash command settings color set <color: color>:
    description: Set the colour
    trigger:
        reply with hidden "Colour %{_color}%"
```

`settings color` groups `settings color set` under `/settings color`. Without a root descriptor,
the root inherits its permissions from the intersection of its subcommands. Declaring the same
root in two different scripts merges too, but logs a warning; keep one script per root.

## Inside the trigger

| Value | Holds |
| --- | --- |
| `{_name}` | a named argument's value, as declared in the header |
| `arg-1` | the same argument, by position |
| `member argument` | the first argument whose type is `member` |
| `used slash command` | the full path that ran, e.g. `mod ban` |
| `event-user`, `event-member`, `event-guild`, `event-channel`, `event-bot` | the invocation's context |

[`reply with hidden`](doc:messages/sending-messages) answers only the user who ran the command;
`defer the interaction` acknowledges it early when the trigger is slow, before Discord's own
3-second timeout. See [Slash options](doc:interaction-commands/slash-options) for argument types, choices
and autocomplete.

## Pushing to Discord

`update the discord commands (all structured application commands) in event-guild` from
`on guild ready` pushes every structure-declared command to that guild; the global variant reads
`update the discord commands {_ping} globally in event-bot` from `on ready`. A reload never
touches Discord by itself. See [Registering commands](doc:interaction-commands/registering-commands) for
`register`, `unregister` and the global/guild timing.

syntax: core/expressions#expression-structured-discord-commands compact

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *'x' is not a valid slash command name (lowercase, 1 to 32 letters, digits, - or _)* | a path word breaks Discord's naming rules | use lowercase letters, digits, `-` or `_` only |
| *A slash command argument needs a name: \<user\> should be \<name: user\>* | an argument in the header has no `name:` | write `<name: type>`, not a bare `<type>` |
| *A slash command argument cannot have a default value* | `<name: type = default>` was used | make the argument optional (`[<name: type>]`) and test `{_name}` in the trigger |
| *A required argument cannot follow an optional one in a slash command* | a required `<...>` sits after `[<...>]` | move required arguments first |
| *The slash command has arguments but no trigger* | arguments are declared but `trigger:` is missing | add a `trigger:` section, or drop the arguments to describe a root or group |

entity: slashcommand
