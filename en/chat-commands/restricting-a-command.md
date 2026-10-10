---
title: Restricting a command
icon: shield-check
description: Limit where a command runs and who can run it, add a cooldown, and react when a check refuses it.
tags: [commands, permissions, cooldown]
syntaxes:
  - events#discord-command-failed
  - discordcommand#cooldown
order: 3
---

This page covers the entries that restrict a [declared command](doc:chat-commands/declaring-a-command):
where it runs, who can run it, its cooldown, and how to react when a check turns it away. You're
assumed to have a bot named `"my-bot"` logged in.

## How checks work

[`on discord command used`](doc:chat-commands/listing-and-events) fires first, before any check below;
cancelling it stops the command outright. Past that point, checks run in a fixed order and the
first one that fails stops the rest:

| Step | Check | Failure reason | Configured message |
| --- | --- | --- | --- |
| 1 | `bots` | `wrong bot` | none |
| 2 | `executable in` | `wrong channel` | none |
| 3 | `roles` | `missing role` | none |
| 4 | `permissions` | `missing permission` | `permission message` |
| 5 | `cooldown` | `cooldown` | `cooldown message` |
| 6 | argument parsing | `invalid arguments` | `usage message` |

An entry you don't set is skipped, not enforced as "none allowed": no `roles` means any role, no
`executable in` means every channel type. `permission message`, `cooldown message` and
`usage message` are the only entries that send a reply by themselves; the other three reasons
send nothing unless [`on discord command failed`](#reacting-to-a-refusal) replies too.

```skript
discord command admin:
    prefixes: "!"
    permissions: administrator
    permission message: "You need to be an administrator, %event-user%."
    trigger:
        reply with "you are an admin"
```

## Where a command runs

`executable in` takes a list of words and narrows the channel types the command answers in.
Leaving it out is the same as listing every word below.

| Word | Channels |
| --- | --- |
| `guild`, `server` | every guild channel type: text, news, voice, stage, and the three thread kinds |
| `dm`, `pm`, `private message`, `direct message`, `private` | direct messages |
| `thread`, `threads` | public, private and news threads |
| `voice` | voice and stage channels |
| `text` | text and news channels |

```skript
discord command dmonly:
    prefixes: "!"
    executable in: dm
    trigger:
        reply with "this only works in DMs"
```

## Who can run it

`roles`, `permissions` and `bots` each narrow who may run the command; set as many as you need,
they all have to pass. `roles` takes a comma-separated list of role names or ids:

```skript
discord command vip:
    prefixes: "!"
    roles: VIP, 1335575588307734528
    trigger:
        reply with "you have the role"
```

`permissions` takes Skript's permission literals, the same `administrator` used above; list
several with a comma: `permissions: kick members, ban members`. An unrecognised permission name is
a load error, not a runtime one (see [Errors below](#errors-you-may-see)).

`bots` scopes the command to one or more [bots](doc:getting-started/multiple-bots) by name; on any
other bot the command is refused with `wrong bot` instead of running:

```skript
discord command onlyminimal:
    prefixes: "!"
    bots: my-bot
    trigger:
        reply with "handled by %event-bot%"
```

## Cooldowns

`cooldown` takes a timespan and blocks reuse until it elapses; `cooldown scope` decides who shares
that timer, and defaults to `user`.

| Scope | Shared between |
| --- | --- |
| `user`, `member` | the same user, in every guild and channel |
| `guild`, `server` | every member of that guild |
| `channel` | everyone in that channel |

A use is only marked once every check above has passed, argument parsing included: a call refused
for `invalid arguments` never starts the cooldown.

```skript
discord command slow:
    prefixes: "!"
    cooldown: 10 seconds
    cooldown message: "Wait %remaining cooldown% before using %name of event-discordcommand% again."
    trigger:
        reply with "slow command used"
```

```skript
discord command guildslow:
    prefixes: "!"
    cooldown: 10 seconds
    cooldown scope: guild
    trigger:
        reply with "guild-wide cooldown started"
```

syntax: discordcommand#cooldown compact

## Reacting to a refusal

[`on discord command failed`](event:events#discord-command-failed) fires for every refused call,
whichever check stopped it. `failure reason` tells which one:

| Reason | When | Has a configured message |
| --- | --- | --- |
| `invalid arguments` | an argument is missing or doesn't parse | `usage message` |
| `wrong channel` | `executable in` refused the channel | none |
| `missing role` | `roles` refused the member | none |
| `missing permission` | `permissions` refused the member | `permission message` |
| `cooldown` | the cooldown hasn't elapsed | `cooldown message` |
| `wrong bot` | `bots` doesn't list this bot | none |

`remaining cooldown` is only set for a `cooldown` failure; it's a timespan, ready for
`%remaining cooldown%`. Use this event to reply for the three reasons that have no configured
message:

```skript
on discord command failed:
    send "[CMD] failed %name of event-discordcommand%: %failure reason% (remaining %remaining cooldown%)" to console
    if failure reason is "wrong channel":
        reply with "wrong channel for %name of event-discordcommand%"
    if failure reason is "missing role":
        reply with "you lack the role for %name of event-discordcommand%"
    if failure reason is "wrong bot":
        reply with "not for %event-bot%"
```

event: events#discord-command-failed compact

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *Unknown permission 'x' in the discord command 'name'* | A `permissions` entry isn't a valid permission literal | Use a permission name Discord recognises, canonical (`kick members`) or aliased (`manage messages`) |
| *'x' is not a valid place for 'executable in' (expected guild, dm, threads, voice or text)* | An `executable in` word is misspelled | Use one of the words in the [table above](#where-a-command-runs) |
| *'x' is not a valid cooldown scope (expected user, guild or channel)* | `cooldown scope` isn't one of `user`, `guild` or `channel` | Use one of the three scopes |
