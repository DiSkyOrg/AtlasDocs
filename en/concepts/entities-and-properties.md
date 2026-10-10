---
title: Entities and properties
icon: shapes
description: Every Discord object is an entity; its data is read and written as a property.
tags: [reference, concepts, properties]
syntaxes: [snowflake#discord-id, snowflake#creation-date, mentionable#mention-tag]
order: 1
---

This page covers the pattern behind almost every syntax in the atlas: a Discord object is an
entity, and its data is a property you read and write with a fixed grammar. You're assumed to
have a bot logged in as `"my-bot"` and Skript's `use type properties: true` enabled (see
[What you need](doc:getting-started)).

## How properties work

A guild, a member, a role, a message, a channel: each is an *entity*, a Skript type backed by
a real Discord object. An entity's data is a *property*, read with either of two equivalent
forms:

```skript
on ready seen by "my-bot":
    send "[DiSky] %name of event-bot% (%discord id of event-bot%)" to console
    send "[DiSky] %event-bot's name%" to console
```

`name of event-bot` and `event-bot's name` read the same value; use whichever reads better in
the sentence. Both forms parse for every property in the atlas, on every entity that has it.

Entities also form a hierarchy: a more specific entity converts into a broader one wherever
that broader type is expected. A text channel is also a guild channel, a message channel and a
channel, so `name of event-channel` parses even when `event-channel` is really a text channel;
a member converts into its user the same way, so a property that only exists on `user` still
reads from a `member` variable.

## Shared properties

Some properties are registered once and shared across every entity that has them, instead of
being reimplemented per entity. Reading or writing one requires
[`use type properties: true`](doc:getting-started) in Skript's config, which recent
Skript versions enable by default.

| Property | Carried by |
| --- | --- |
| `name` | applicationinfo, bot, embedfield, emote, forumtag, guild, member, role, scheduledevent, sticker, user, channel, webhook |
| `avatar url` | applicationinfo, bot, guild, member, sticker, user |
| `guild` | logentry, member, message, role, scheduledevent, webhook, guildchannel, guildsticker |
| `online status` | bot, member |
| `color` | embedbuilder, role, roleaction |
| `jump url` | message, guildchannel |
| `value` | embedfield |
| `title` | embedbuilder, modal |
| `style` | button, textinput |

```skript
on ready seen by "my-bot":
    set {_g} to first element of (guilds of event-bot)
    send "[DiSky] guild %name of {_g}%, avatar %avatar url of {_g}%" to console
```

## Ids and mentions

Two properties come from interface-level entities rather than a specific one, so they read
the same on anything Discord assigns an id or a mention to. [`discord id`](syntax:snowflake#discord-id)
and [`creation date`](syntax:snowflake#creation-date) work on any *snowflake* (a member, a
user, a guild, a role, a channel, a message...); [`mention tag`](syntax:mentionable#mention-tag)
works on any *mentionable* entity (a user, a member, a role, a channel, an emoji), and renders
as a clickable ping when sent in a message.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!id":
        reply with "Your id is %discord id of event-member%, your account dates from %creation date of event-member%"
        reply with "Hey %mention tag of event-member%!"
```

syntax: snowflake#discord-id compact
syntax: mentionable#mention-tag compact

## Changing a property

A settable property is written with `set <property> of <entity> to <value>`; a property that
holds a list also accepts `add ... to` and `remove ... from`.

```skript
on ready seen by "my-bot":
    set {_g} to first element of (guilds of event-bot)
    set {_m} to first element of (members of {_g})
    set {_r} to first element of (roles of {_g})
    set nickname of {_m} to "new nick"
    add {_r} to roles of {_m}
    remove {_r} from roles of {_m}
```

A setter is not a plain assignment: most of them send a request to Discord, and the trigger
moves on without waiting for the answer. Prefix the line with `await` when the next line
reads the value back; see [Cache and await](doc:concepts/cache-and-await) for that and for
the properties that need `await` on the *reading* side.

!!! info "Some properties never read back"
    Builders and embeds are write-only: you set their properties to shape what gets created,
    but reading one back gives nothing, because there is no live Discord object to read from
    until the builder runs. See [Builders](doc:concepts/builders).

## Enum values

Some properties hold one value out of a fixed set, parsed as a literal rather than text.
Compare or set them without quotes, and wrap the left side of a comparison in parentheses so
Skript doesn't try to parse the whole condition as one expression.

| Enum | Example literal |
| --- | --- |
| `onlinestatus` | `idle` |
| `channeltype` | `text` |
| `memberflag` | `did rejoin` |
| `activitytype` | `playing` |
| `permission` | `manage channel` |
| `buttonstyle` | `primary` |
| `selecttarget` | `role` |
| `separatorspacing` | `small` |
| `textinputstyle` | `short` |

```skript
on ready seen by "my-bot":
    set online status of event-bot to dnd
    if (online status of event-bot) is dnd:
        send "[DiSky] my-bot is set to do not disturb" to console
```

`online status` prints as *do not disturb*, but the word "not" breaks a bare literal, so the
literal you write is `dnd`, not `do not disturb`.
