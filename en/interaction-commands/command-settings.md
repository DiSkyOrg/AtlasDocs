---
title: Command settings
icon: settings-2
description: Permissions, contexts, localised names and descriptions, and cooldowns, shared by every slash, user and message command.
tags: [commands, application-commands, permissions, localization, cooldown]
syntaxes:
  - applicationcommand#enabled-for
  - applicationcommand#contexts
  - core/effects#effect-localize-command
  - events#application-command-cooldown
order: 6
---

This page covers the settings [slash](doc:interaction-commands/slash-commands),
[context](doc:interaction-commands/context-commands) and [builder](doc:interaction-commands/command-builders) commands
all share: who sees them, where they work, their translated names and descriptions, and their
cooldown. You're assumed to have a bot named `"my-bot"` logged in and a command, structure or
builder, to set them on.

## How settings work

Every one of these settings exists twice: as a structure entry, next to `description` and
`trigger`, and as a property on the builder object. Both end up on the same command; use
whichever form matches how the command was declared.

| Setting | Structure entry | Builder property | Default | Accepted values |
| --- | --- | --- | --- | --- |
| Permissions needed | `enabled for` | [enabled for](syntax:applicationcommand#enabled-for) | none: everyone | comma-separated permission names |
| Hidden by default | `disabled` | `disabled` | `false` | `true`, `false` |
| Age-restricted | `nsfw` | `nsfw` | `false` | `true`, `false` |
| Where it works | `contexts` | [contexts](syntax:applicationcommand#contexts) | guild only | `guild`/`server`, `bot dm`/`dm`/`private message`, `group dm` |
| How it's installed | `integration types` | `integration types` | `guild install` | `guild install`/`server install`, `user install` |
| Reuse delay | `cooldown` | not available on a builder | none | a timespan, e.g. `10 seconds` |
| Who shares a cooldown | `cooldown scope` | not available on a builder | `user` | `user`, `guild`, `channel` |
| Translated name | `name:` section | `localize the name of ...` | header/builder name | `locale: text` lines |
| Translated description | `description:` section | `localize the description of ...` | none | `locale: text` lines |

```skript
slash command roll <sides: integer>:
    description: Roll a dice
    enabled for: manage server
    contexts: guild, bot dm
    cooldown: 5 seconds
    trigger:
        reply with hidden "You rolled between 1 and %{_sides}%"
```

## Who sees a command

`enabled for` lists the permissions a member needs to see and use the command by default;
administrators can always use it, and an empty list means everyone can. `disabled` hides the
command from everyone but administrators, regardless of `enabled for`. Both are defaults only:
a guild's own integration settings, changed by a member with **Manage Server**, can still
override them on Discord's side.

```skript
set {_ban} to a new slash command named "ban" with description "Ban a member"
set enabled for of {_ban} to ban members
```

A `slash command mod` root merged from subcommands (see [Slash commands](doc:interaction-commands/slash-commands))
without its own descriptor inherits `enabled for` as the intersection of what its subcommands
allow: a permission has to be on every subcommand to end up on the root.

## Where a command is available

`contexts` narrows which surfaces the command can be used from: `guild` (Discord's default,
the only one set if you leave this out), `bot dm`, and `group dm`. `integration types` narrows
how it got installed: `guild install`, the default, or `user install`, which puts the command in
a user's own command list, usable in servers that never installed the bot.

```skript
set {_roll} to a new slash command named "roll" with description "Roll a dice"
set contexts of {_roll} to guild and bot dm
```

## Translations

A structure's `name:` and `description:` sections hold one `locale: text` line per language; a
`description:` section needs an `en-US` (or `en`) line as the default shown everywhere else.
`name:` never needs one, since the header already gives the default name.

```skript
slash command greet <who: user>:
    description:
        en-US: Greet someone
        fr: Saluer quelqu'un
    name:
        fr: saluer
    arguments:
        who: Who to greet
    trigger:
        reply with hidden "Hello %{_who}%!"
```

A builder, its options, subcommands, groups and choices (name only) take
[`localize the name/description of`](syntax:core/effects#effect-localize-command) instead, one
call per locale:

```skript
set {_cmd} to a new slash command named "ban" with description "Ban a member"
localize the name of {_cmd} in "fr" to "bannir"
localize the description of {_cmd} in "fr" to "Bannir un membre"
```

Read the translations back with `name localizations of {_cmd}` and
`description localizations of {_cmd}`, both a list of `"locale: text"` lines. Locales are
Discord's own codes (`fr`, `en-GB`, `pt-BR`...); a plain language name (`"french"`) also works.

syntax: core/effects#effect-localize-command compact

## Cooldowns

`cooldown` blocks reuse for a timespan; `cooldown scope` decides who shares that timer.

| Scope | Shared between |
| --- | --- |
| `user` (default) | the same user, across every guild and channel |
| `guild` | every member of that guild |
| `channel` | everyone in that channel |

An `on cooldown:` section reacts to a blocked call, with `remaining cooldown` set:

```skript
slash command slow:
    description: 10 seconds cooldown
    cooldown: 10 seconds
    cooldown scope: user
    on cooldown:
        reply with hidden "Wait %remaining cooldown%"
    trigger:
        reply with hidden "Not on cooldown!"
```

Without an `on cooldown:` section, DiSky answers by itself: an ephemeral *"You can use this
command again in \<time\>."*, so the interaction is never left unacknowledged. The generic
[`on slash command cooldown`](event:events#application-command-cooldown) event (also
`on user command cooldown`, `on message command cooldown`, `on application command cooldown`)
fires too, and is cancellable:
[cancelling it](doc:concepts/events) lets the command run anyway and leaves the interaction to
the trigger to answer. A reload resets every cooldown, since it starts from a fresh model; see
[Registering commands](doc:interaction-commands/registering-commands).

event: events#application-command-cooldown compact

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *Unknown permission 'x' in the slash command 'name'* | an `enabled for` word isn't a permission Discord recognises | use a permission name Discord recognises, canonical or aliased |
| *'x' is not an interaction context (expected guild, bot dm or group dm)* | a `contexts` word is misspelled | use one of the words in [Where a command is available](#where-a-command-is-available) |
| *'x' is not an integration type (expected guild install or user install)* | an `integration types` word is misspelled | use `guild install` (or `server install`) / `user install` |
| *'x' is not a Discord locale (available: ...)* | a locale code before `localize` or in a `name:`/`description:` section isn't recognised | use a Discord locale code or a language name |
| *A localized description needs a default 'en-US' (or 'en') line* | a `description:` section has no `en-US`/`en` line | add one, it becomes the fallback for every other locale |
| *The slash command 'name' has an 'on cooldown' section but no 'cooldown' entry* | `on cooldown:` was set without `cooldown` | add a `cooldown` entry, or drop the section |
| *'x' is not a valid cooldown scope (expected user, guild or channel)* | `cooldown scope` isn't one of the three words | use `user`, `guild` or `channel` |
