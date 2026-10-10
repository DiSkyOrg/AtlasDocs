---
title: Embeds
icon: layout-template
description: Build a Discord embed locally, set every property and its fields, then send it with post, reply with or a message builder.
tags: [messages, embeds]
syntaxes:
  - core/expressions#expression-new-embed
  - core/expressions#expression-new-embed-field
  - embedbuilder#fields
order: 2
---

This page covers building a Discord embed: every property you can set on it, its fields, and
what you get back when you read the embeds already on a message. You're assumed to have a bot
named `"my-bot"` logged in and to know how to [send a message](doc:messages/sending-messages).

## How embeds work

[A new discord embed](syntax:core/expressions#expression-new-embed) creates an empty embed,
entirely in memory; every `set <property> of {_e}` line only fills it further, with no call to
Discord. Nothing is sent until you hand the embed to something that talks to a channel: `post`
it, `reply with` it, or set it as the `embed` of a [message builder](doc:concepts/builders) and
read `the build result of` that builder. An embed is simpler than the full builder contract on
that page: it has no `await` and no `build result` of its own, because on its own it never talks
to Discord.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!embed":
        set {_e} to a new discord embed
        set title of {_e} to "DiSky V5"
        set description of {_e} to "An embed built entirely in Skript."
        set color of {_e} to orange
        post {_e} to event-channel
```

syntax: core/expressions#expression-new-embed compact

## Options

Every property is set with `set <property> of {_e} to <value>`. DiSky enforces the length and
url limits from JDA's `EmbedBuilder` immediately, on the `set` line itself; the field count and
total-length limits only apply once the embed is attached somewhere (see
[Errors you may see](#errors-you-may-see)).

| Property | Default | Accepted values |
| --- | --- | --- |
| [title](syntax:embedbuilder#title) | none | text, up to 256 characters |
| [title url](syntax:embedbuilder#title-url) | none | an `http(s)://` or `attachment://` url |
| [description](syntax:embedbuilder#description) | none | text, up to 4096 characters |
| [color](syntax:embedbuilder#color) | none | a color |
| [discord author](syntax:embedbuilder#discord-author) | none | text, up to 256 characters |
| [author icon](syntax:embedbuilder#author-icon) | none | an `http(s)://` or `attachment://` url |
| [author url](syntax:embedbuilder#author-url) | none | an `http(s)://` or `attachment://` url |
| [footer](syntax:embedbuilder#footer) | none | text, up to 2048 characters |
| [footer icon](syntax:embedbuilder#footer-icon) | none | an `http(s)://` or `attachment://` url |
| [image](syntax:embedbuilder#image) | none | an `http(s)://` or `attachment://` url |
| [thumbnail](syntax:embedbuilder#thumbnail) | none | an `http(s)://` or `attachment://` url |
| [timestamp](syntax:embedbuilder#timestamp) | none | a date |
| [fields](syntax:embedbuilder#fields) | none | add-only, see [Fields](#fields) below; 25 at most |

Reading a property back only works for two of them: `description of {_e}` returns what you set,
and `fields of {_e}` returns the list you added to. Every other property, including `title` and
`color`, reads back nothing even right after you set it: JDA's `EmbedBuilder` keeps no getter
for it, so DiSky has nothing to return.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!embed-full":
        set {_e} to a new discord embed
        set title of {_e} to "DiSky V5"
        set title url of {_e} to "https://disky.me"
        set description of {_e} to "An embed built entirely in Skript."
        set color of {_e} to orange
        set discord author of {_e} to "DiSky"
        set author icon of {_e} to "https://disky.me/icon.png"
        set footer of {_e} to "Powered by DiSky"
        set image of {_e} to "https://disky.me/banner.png"
        set thumbnail of {_e} to "https://disky.me/thumb.png"
        set timestamp of {_e} to now
        post {_e} to event-channel
```

## Fields

A field is its own object, built separately and added to the embed's `fields`. Three spellings
create one: bare (`inline` defaults to `false`), with an explicit `inline` value, or with
`inline` forced by the `new inline field` form.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!embed-fields":
        set {_e} to a new discord embed
        set title of {_e} to "Ping results"
        add (a new embed field named "Region" with value "eu-west") to fields of {_e}
        add (a new embed field named "Status" with value "OK" inline true) to fields of {_e}
        loop fields of {_e}:
            send "%name of loop-value% = %value of loop-value% (inline: %inline of loop-value%)" to console
        post {_e} to event-channel
```

The three attested spellings:

```skript
set {_f1} to a new embed field named "Region" with value "eu-west"
set {_f2} to a new embed field named "Status" with value "OK" inline true
set {_f3} to a new inline embed field named "Latency" with value "42ms"
```

`add {_f1} to fields of {_e}` attaches one to an embed; a field itself only reads back through
`name of`, `value of` and `inline of` (as used on `loop-value` above). A field name over 256
characters or a value over 1024 fails immediately, when the field is created, not when it's
added.

syntax: core/expressions#expression-new-embed-field compact

## Reading embeds

[`embeds of`](syntax:message#embeds) a sent message returns its embeds; a message built with
DiSky carries a single embed, so the list usually holds one element. Each one comes
back as JDA's own `MessageEmbed`, a read-only type with no Skript type of its own, but DiSky
converts it to an `embedbuilder` wherever one is expected: store it in a variable, set more
properties on it, and post it again as a new embed.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!requote":
        set {_e} to first element of embeds of event-message
        set footer of {_e} to "requoted by DiSky"
        post {_e} to event-channel
```

This never edits the original message: the converter copies the sent embed's content into a
fresh `EmbedBuilder`, so `post`, `reply with` or a message builder is still what puts the result
on Discord. To change the embed shown by an existing message in place, `edit` that message with
the new embed instead (see [managing messages](doc:messages/managing-messages)).

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *IllegalArgumentException: Title cannot be longer than 256 characters.* | `title` was set to more than 256 characters | Shorten the title, or move the rest into `description` |
| *IllegalArgumentException: URL must be a valid http(s) or attachment url.* | `title url`, `author icon`, `author url`, `footer icon`, `image` or `thumbnail` was set to something that isn't a proper `http://`, `https://` or `attachment://` link | Fix the url, or leave the property unset |
| *IllegalArgumentException: Name cannot be longer than 256 characters* (or *Value cannot be longer than 1024 characters*) | A field's name or value is too long | Shorten it before creating the field |
| *IllegalStateException: Cannot build an empty embed!* | The embed had nothing set (no title, description, fields, author, footer, image or thumbnail) when it was attached to a message | Set at least one property before `set embed of` or `a new message with embed` |
| *IllegalStateException: Cannot build an embed with more than 25 embed fields set!* | More than 25 fields were added | Keep the field count at 25 or fewer, or split the content across several embeds |

entity: embedbuilder
