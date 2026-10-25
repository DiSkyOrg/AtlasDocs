---
title: Events
icon: zap
description: What changes in event triggers when you move a script from DiSky 4 to DiSky 5.
tags: [migration, events]
syntaxes:
  - events#discord-command-used
  - events#guild-log-entry-create-event
order: 4
---

Most event patterns are identical in DiSky 5; what changes is mostly the values they expose. This
page lists the renamed and removed events, the new way to read "old and new" values, and what
replaced the audit-log author and `retrieve`. You're assumed to know how a DiSky event works (see
[Events](doc:concepts/events)) and to have DiSky 4 scripts to port.

## Event names

Every DiSky 4 event pattern still parses in DiSky 5, with a few exceptions. The bot filter is
unchanged: every pattern still accepts `seen by "<bot name>"`, and `event-bot` is available in every
event, exactly as before.

The `disky command` event became [`on discord command used`](event:events#discord-command-used).
It is still cancellable, and a new sibling, `on discord command failed`, fires when a command is
refused (cooldown, missing permission, bad argument).

```skript
# DiSky 4
on disky command:
    cancel event

# DiSky 5
on discord command used seen by "my-bot":
    send "%event-user% used %name of event-discordcommand%" to console

on discord command failed seen by "my-bot":
    send "refused: %failure reason%" to console
```

`on disky error` still works under the same name, and `on discord error` or `on disky exception`
are accepted too. It now exposes `event-discorderror` instead of `event-string`, a new
`error location` expression, and fires only for errors no `try` block caught (see
[errors](doc:concepts/errors)).

`on member ban` and `on member kick` are removed. For a ban, use
[`on guild ban`](event:events#guild-ban-event) (`event-user`, `event-guild`; there is no
`event-member`, since the user may have left). DiSky 5 has no kick event: a kick is recorded in
the audit log, so read it from [`on guild log entry create`](event:events#guild-log-entry-create-event)
and check the entry's `log action type`.

```skript
on guild log entry create seen by "my-bot":
    send "%log action type of event-entry%: %logged user of event-entry%" to console
```

## Old and new values

DiSky 4 gave every "X changed" event two expressions, `new X` and `old X` (also `current` and
`past`). In DiSky 5 about 45 of these events expose the values as typed event-values instead: the
new one is `event-<type>`, the previous one is `past event-<type>`, and the `new X` / `old X`
expressions no longer exist.

```skript
# DiSky 4
on channel name change:
    send "%old channel name% -> %new channel name%" to console

# DiSky 5
on channel name change seen by "my-bot":
    send "%past event-text% -> %event-text%" to console
```

The families moved to values are the channel updates (name, topic, nsfw, position, parent,
slowmode, user limit, bitrate, archived, locked, and so on), the guild updates (afk channel, banner,
boost count, icon, name, owner, splash), the role updates (color, name, hoisted, icon, position,
mentionable), and the emoji and sticker name updates. Voice join and leave expose the channel as
`event-channel`, and `past event-channel` for the one that was left.

Events that kept expressions are the member, user and scheduled event updates, role permissions,
emoji roles and sticker tags. They lost the `new` and `current` prefix: the current value is the
bare form, and the old one still accepts `old`, `past` and `previous`.

```skript
# DiSky 4
on member nickname change:
    send "%old member nickname% -> %new member nickname%" to console

# DiSky 5
on member nickname change seen by "my-bot":
    send "%old member nickname% -> %member nickname%" to console
```

A few values changed type as well:

- Channel region update gives a text, and `<none>` when the region is automatic.
- Channel auto archive duration update gives a number of minutes.
- Channel flags update exposes `new flags` and `old flags` as a list of texts.
- Channel default reaction update exposes `new default reaction` and `old default reaction`,
  because Skript parses `event-emoji` as a plural.

| Event | DiSky 5 new value | DiSky 5 old value |
| --- | --- | --- |
| `on channel name change` | `event-text` | `past event-text` |
| `on channel slowmode change` | `event-number` | `past event-number` |
| `on guild name change` | `event-text` | `past event-text` |
| `on role color change` | `event-color` | `past event-color` |
| `on member nickname change` | `member nickname` | `old member nickname` |
| `on user name change` | `name` | `old name` |
| `on channel flags change` | `new flags` | `old flags` |

The [events reference](/events) lists the exact values of each event; prefer it over guessing the
type.

## The event author

DiSky 4 exposed `event-author` on about 80 events (role added, channel created, member banned,
guild updated...), filled by reading the guild's audit log. DiSky 5 has no `event-author` on any
event, so a script that reads it fails to parse.

The audit log itself is still readable, and it is where the author lives. In
`on guild log entry create`, `event-entry` is the entry and `logged user of event-entry` is the
user who did it. Outside that event, `audit logs of %guild%` returns the recent entries, and
needs [`await`](doc:concepts/cache-and-await) because it asks Discord.

```skript
on guild log entry create seen by "my-bot":
    send "%logged user of event-entry% did %log action type of event-entry% (%log reason of event-entry%)" to console
```

To react to the author of a specific change, listen to the log entry event and filter on
`log action type`, instead of reading `event-author` in the change event.

## Retrieved values

In DiSky 4, some values were marked as REST values and had to be fetched with
`retrieve event-message and store it in {_m}`. The `retrieve event-x` effect is gone: DiSky 5
fetches those values before your trigger starts, so they are ordinary values and never need `await`.

- Poll vote added and removed: `event-message`, `event-member` and `event-user`.
- Scheduled event user added and removed: `event-user` and `event-member`.
- Reaction add, remove and remove all: the message is the `reaction message` expression
  (the word `reaction` is mandatory), not `event-message`.

```skript
# DiSky 4
on reaction add:
    retrieve event-message and store it in {_m}

# DiSky 5
on reaction add seen by "my-bot":
    send "%event-user% reacted to '%discord content of reaction message%'" to console
```

The trigger starts after the network round trip. Message delete and message edit lost the cached
content DiSky 4 kept: `on message delete` no longer exposes the deleted message nor its old text,
only `event-guild`, `event-channel` and the message id as `event-number`; `on message edit`
exposes the new `event-message` but no `event-string` with the previous content. DiSky 5 has no
message cache to restore them from.

In reaction add and remove, `event-emote` is now the custom emote only, and `<none>` for a unicode
emoji. To read any reaction, custom or unicode, use the `reaction emoji` expression (`event-emoji`
does not parse: Skript reads the word as a plural).

```skript
on reaction add seen by "my-bot":
    send "%event-user% reacted with %reaction emoji%" to console
```

## What to change

| In DiSky 4 | In DiSky 5 |
| --- | --- |
| `on disky command` | `on discord command used`, and `on discord command failed` |
| `on member ban`, `on member kick` | `on guild ban`, `on guild log entry create` |
| `new X`, `old X` in a change event | `event-X`, `past event-X` |
| `new nickname`, `current name` | `nickname`, `name` |
| `event-author` | `logged user of event-entry` in `on guild log entry create` |
| `retrieve event-message and store it in {_m}` | `event-message`, or `reaction message` |
| `event-string` in message delete and edit | none |
| `event-emote` in reaction add and remove | `reaction emoji` (custom or unicode) |

event: events#discord-command-used compact

event: events#guild-log-entry-create-event compact
