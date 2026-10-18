---
title: Builders
icon: hammer
description: Configure a role, channel, message or invite locally, then create it on Discord in one line.
tags: [concepts, builders]
syntaxes:
  - roleaction#new-role-builder
  - roleaction#result
order: 4
---

This page covers the contract every DiSky builder follows: how a builder is created, why its
properties are write-only, and what `the build result of` does. Feature pages only list the
setters of their own builder and rely on this page for the rest. You're assumed to have a bot
named `"my-bot"` logged in and running.

## How a builder works

A builder is a pending Discord request. Creating one with
[`a new role builder`](syntax:roleaction#new-role-builder) costs nothing and talks to nobody;
setting its properties only fills the request locally. Reading
[`the build result of`](syntax:roleaction#result) the builder is the single line that sends the
request to Discord and returns the created entity. Because that line blocks on the network, it
requires `await` (see [cache and await](doc:concepts/cache-and-await)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!make-role":
        set {_b} to a new role builder named "Moderator" in event-guild
        set color of {_b} to orange
        set hoisted of {_b} to true
        set mentionable of {_b} to false
        await set {_role} to the build result of {_b}
        reply with "created %name of {_role}%"
```

Nothing exists on Discord until the `await` line runs; the four lines before it never leave the
server. Once it returns, `{_role}` is a regular role: every role property and effect works on
it. `the built role from {_b}` is the same expression as `the build result of {_b}`, spelled
with the entity it produces; every builder has that alias (`the built guildchannel from`,
`the built message from`, and so on).

Only what Discord freezes at creation goes in the constructor: a role needs a name and a guild,
a thread needs a name and a parent channel or message, a message needs its content or embed
and a channel. Everything else is a property you set afterwards, or leave alone.

syntax: roleaction#new-role-builder compact
syntax: roleaction#result compact

## What a builder does not do

A builder's properties are **write-only**. Reading `color of {_b}` gives nothing: a pending
request has no readable state, so the readable side of every property is the entity you get
back from the build. Read `color of {_role}` after the build instead.

A builder is a **template, not a memoised result**. Reading `the build result of` the same
builder twice sends two requests and creates two entities:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!twice":
        set {_b} to a new role builder named "Temp" in event-guild
        await set {_first} to the build result of {_b}
        await set {_second} to the build result of {_b}
        reply with "%discord id of {_first}% and %discord id of {_second}%"
```

Validation happens at **build time**, not when you set a property. Setting a topic on a voice
channel builder, or an auto archive duration Discord does not accept, is stored without
complaint; the request fails when `the build result of` runs, and the failure reaches you
through DiSky's [error layer](doc:concepts/errors) like any other Discord refusal. A few checks
DiSky can do locally (a guild already at Discord's role or channel cap, a message with nothing
to send) fail at the same line, before any request leaves.

!!! info "Builders and bots"
    The bot that sends the request is the one the constructor's scope belongs to: `event-guild`
    or `event-channel` in a handler seen by `"my-bot"` builds with `"my-bot"`. Builders take no
    bot argument.

## The builder kinds

Every builder below follows the contract above; only the constructor and the setters differ.
The patterns are the minimal spelling: `named` also accepts `with the name`, and `in` accepts
`in the guild` or `in the channel` everywhere.

| Builder | Creates | Constructor pattern | Guide |
| --- | --- | --- | --- |
| [Role](entity:roleaction) | a role | `a new role builder named %string% in %guild%` | this page |
| [Text channel](entity:channelaction) | a text channel | `a new text channel builder named %string% in %guild%` | later |
| [Voice channel](entity:channelaction) | a voice channel | `a new voice channel builder named %string% in %guild%` | later |
| [Stage channel](entity:channelaction) | a stage channel | `a new stage channel builder named %string% in %guild%` | later |
| [News channel](entity:channelaction) | an announcement channel | `a new news channel builder named %string% in %guild%` | later |
| [Forum channel](entity:channelaction) | a forum channel | `a new forum channel builder named %string% in %guild%` | later |
| [Media channel](entity:channelaction) | a media channel | `a new media channel builder named %string% in %guild%` | later |
| [Category](entity:channelaction) | a category | `a new category builder named %string% in %guild%` | later |
| [Public thread](entity:threadaction) | a public thread | `a new thread builder named %string% in %threadcontainer%` | later |
| [Private thread](entity:threadaction) | a private thread | `a new private thread builder named %string% in %threadcontainer%` | later |
| [Thread from message](entity:threadaction) | a thread attached to a message | `a new thread builder named %string% from %message%` | later |
| [Forum post](entity:forumpostaction) | a post (thread) in a forum or media channel | `a new post builder named %string% with message content %string% in %forumchannel/mediachannel%` | later |
| [Invite](entity:inviteaction) | an invite | `a new invite builder in %guildchannel%` | later |
| [Webhook](entity:webhookaction) | a webhook | `a new webhook builder named %string% in %guildchannel%` | [webhook clients](doc:webhooks/webhook-clients) |
| [Webhook message](entity:webhookmessageaction) | a message sent by a webhook | `a new webhook message with content %string% through %webhookclient%` | [posting through a webhook](doc:webhooks/posting-through-webhooks) |
| [AutoMod rule](entity:automodrulebuilder) | an AutoMod rule | `a new automod rule builder named %string% in %guild% for messages using %triggerconfig%` | [creating a rule](doc:automod/creating-rules) |
| [Emote](entity:emotebuilder) | a guild emote | `a new emote builder named %string% with image %string/fileupload% in %guild%` | [emotes and stickers](doc:guilds/emotes-and-stickers) |
| [Sticker](entity:stickerbuilder) | a guild sticker | `a new sticker builder named %string% with image %string/fileupload% in %guild%` | [emotes and stickers](doc:guilds/emotes-and-stickers) |
| [Scheduled event (channel)](entity:scheduledeventaction) | a scheduled event held in a voice or stage channel | `a new scheduled event builder named %string% in %guildchannel% starting at %date%` | later |
| [Scheduled event (external)](entity:scheduledeventaction) | a scheduled event held at a location | `a new scheduled event builder named %string% at %string% starting at %date% ending at %date% in %guild%` | later |
| [Message](entity:messageaction) | a sent message | `a new message with content %string% in %messagechannel%` or `a new message with embed %embedbuilder% in %messagechannel%` | [sending messages](doc:messages/sending-messages) |

Two objects look like builders without following this contract. A
[poll](doc:messages/creating-polls) is sent by `post` or `reply with` and has no
`build result of`; a [welcome screen builder](doc:guilds/welcome-screen) edits a screen that
already exists, so it is sent by the `update the welcome screen using` effect, which returns
nothing. A poll's properties also read back, unlike every builder above.

Every kind exposes the same `the build result of %builder%` expression; an untyped variable
holding any of them resolves by its runtime type, so the chain below needs no cast. The
category comes back as a real category, which is what the text channel builder's `category`
property expects:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!staff-area":
        set {_cat} to a new category builder named "Staff" in event-guild
        await set {_category} to the build result of {_cat}
        set {_b} to a new text channel builder named "staff-chat" in event-guild
        set category of {_b} to {_category}
        await set {_channel} to the build result of {_b}
        reply with "created %name of {_channel}% under %name of {_category}%"
```

!!! tip "Keep a build in one block"
    Keep the constructor, its setters and the `await` line together. A builder kept around in
    a variable is easy to build twice by mistake, and each build creates a new entity.

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *building talks to Discord, so this requires 'await'* (parse error, the script does not load) | `the build result of` was read without `await` in front of the line. | Write `await set {_x} to the build result of {_b}`. |
| *IllegalStateException: this guild already has the maximum of 250 roles* (same shape with *500 channels*) | The guild is at Discord's cap; DiSky refuses before sending the request. | Delete unused roles or channels first. |
| *IllegalStateException: this message has no content, no embed, no attachment and no component; Discord refuses an empty message* | A message builder was built with nothing to send. | Give it a content, an embed, an attachment or a component before building. |
| A *Discord error* block naming a missing permission or an invalid field | Discord refused the request at build time (missing **Manage Roles**, a topic on a voice channel, an invalid value). | Fix the offending property; wrap the build in `try` / `catch` to handle it in the script, see [errors](doc:concepts/errors). |
| No message; `color of {_b}` is empty | Builder properties are write-only. | Read the property on the built entity, not on the builder. |
