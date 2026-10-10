---
title: Managing messages
icon: message-square-more
description: Edit, pin, publish, forward, purge and destroy a message you hold, and read everything it carries.
tags: [messages, edit, pin, purge]
syntaxes:
  - message#edit
  - message#pin
  - message#purge
  - core/effects#destroy
  - message#forward
order: 4
---

This page covers what you can do to a message that already exists: change it, pin it,
publish it, forward it, delete it, and read its properties. You're assumed to have a bot
named `"my-bot"` logged in and to know how to [send a message](doc:messages/sending-messages).

## How a message is managed

Every effect on this page takes a `message`, and a `message` comes from one of four places:
the event you're in (`event-message`), the [build result](doc:concepts/builders) of a message
builder, a fetch by id, or the pinned messages of a channel. The last two are retrieve-only
reads and need `await` (see [cache and await](doc:concepts/cache-and-await)); the effects
themselves never take it, since each one waits for Discord's answer before the next line runs.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!edit":
        set {_m} to a new message with content "before" in event-channel
        await set {_sent} to the build result of {_m}
        edit {_sent} to show "after"
```

The builder gives back the message the bot just sent, which is the one message the bot can
always edit. The other two sources look like this:

```skript
await set {_msg} to message with id "1234567890" in event-channel
await set {_pins::*} to pinned messages of event-channel
```

[`message with id`](syntax:message#message-with-id) fetches one message from a channel,
[`pinned messages of`](syntax:messagechannel#pinned-messages) every pinned message of it; both
fail with a readable error when the id is wrong or the channel is not visible to the bot.

## Editing

[`edit`](syntax:message#edit) replaces what a message shows. It accepts a text, an embed or a
component, and it is not a patch: the new payload replaces the content, the embeds, the
components and the attachments of the message at once. Editing with a text removes the
embeds the message had, editing with an embed empties its text. Only messages sent by the
bot itself can be edited; every other one is refused before the request leaves.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!edit-embed":
        set {_m} to a new message with content "will get an embed" in event-channel
        await set {_sent} to the build result of {_m}
        set {_e} to a new discord embed
        set description of {_e} to "edited into an embed"
        edit {_sent} with {_e}
```

`edit ... with` and `edit ... to show` are the same effect. To keep both a text and an embed
after the edit, pass a message builder that carries both, as described on the
[sending messages](doc:messages/sending-messages) page.

syntax: message#edit compact

## Pinning and publishing

[`pin`](syntax:message#pin) adds a message to its channel's pins and
[`unpin`](syntax:message#unpin) removes it; a channel holds up to 50 pinned messages. Pinning
a message that is not the bot's needs the **Manage Messages** permission.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!pin":
        pin event-message
    if discord content of event-message is "!unpin":
        unpin event-message
```

[`is pinned`](syntax:message#pinned) reads the snapshot you hold, not Discord: right after
`pin event-message`, `event-message is pinned` is still false. Fetch the message again with
`message with id` when you need the fresh flag.

[`publish`](syntax:message#publish) (or `crosspost`) pushes a message to every guild following
its channel. It only works on a message posted in an announcement channel; anywhere else
Discord refuses it with a readable error in the console.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!publish":
        publish event-message
```

## Forwarding and deleting

[`forward`](syntax:message#forward) sends a copy of a message to another channel; the copy
carries Discord's *forwarded* marker and `is forwarded` is true on it.
[`destroy`](syntax:core/effects#destroy) deletes one message, and
[`purge`](syntax:message#purge) deletes a list of them in as few requests as possible.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!forward":
        forward event-message to event-channel
    if discord content of event-message is "!delete":
        destroy event-message
```

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!purge":
        set {_m} to a new message with content "temporary" in event-channel
        await set {_first} to the build result of {_m}
        await set {_second} to the build result of {_m}
        purge {_first} and {_second}
```

`purge` groups the messages per channel and uses Discord's bulk-delete endpoint, which takes
2 to 100 messages at a time and only accepts messages younger than two weeks. Larger lists are
split into batches of 100, a single message falls back to a plain delete, and messages older
than two weeks are deleted one by one; you never have to filter the list yourself. Deleting
messages written by someone else, one at a time or in bulk, needs **Manage Messages**.

!!! danger "Deletion is permanent"
    `destroy` and `purge` do not ask for confirmation and there is no way to restore a deleted
    message. Check `discord author of` before deleting when the list comes from a channel.

syntax: message#purge compact
syntax: core/effects#destroy compact

## Other effects

[`show typing status in`](syntax:messagechannel#send-typing) makes the *bot is typing...*
indicator appear in a channel for 10 seconds, or until the bot posts there; it takes the
channel, not a message. [`suppress the embeds of`](syntax:message#suppress-embeds) hides the
link previews Discord generated for a message. [`end the poll of`](syntax:message#end-poll)
closes the poll a message carries; polls are covered on the [polls](doc:messages/polls) page.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!typing":
        show typing status in event-channel
    if discord content of event-message is "!no-previews":
        suppress the embeds of event-message
```

## Reading a message

A message's properties are read with `<property> of <message>`. The ones that overlap with a
Skript name carry a `discord` prefix: Skript picks the first registered syntax whose pattern
matches, and an untyped variable such as `{_msg}` satisfies any slot, so a same-shaped
Skript or addon syntax would silently win over DiSky's. `discord content`, `discord author`,
`discord attachments` and `discord components` avoid that; write them with the prefix always.

| Property | Returns |
| --- | --- |
| [discord content](syntax:message#discord-content) | the raw text, without formatting |
| [discord author](syntax:message#discord-author) | the author as a user; none for a webhook |
| [member author](syntax:message#member-author) | the author as a member; none outside a guild |
| [guild](syntax:message#guild) | the guild; none in DMs |
| [jump url](syntax:message#jump-url) | the link that opens the message in Discord |
| [referenced message](syntax:message#referenced-message) | the message it replies to, if any |
| [embeds](syntax:message#embeds) | the embeds it shows |
| [discord attachments](syntax:message#discord-attachments) | its files, as [attachments](doc:messages/file-uploads) |
| [discord components](syntax:message#discord-components) | its buttons, dropdowns and other components, flattened |
| [reactions](syntax:message#reactions) | its [reactions](doc:messages/reactions), with their counts |
| [poll](syntax:message#poll) | its [poll](doc:messages/polls), if any |
| [mentioned users](syntax:message#mentioned-users) | every user mentioned in the text |
| [mentioned members](syntax:message#mentioned-members) | the same as members; empty outside a guild |
| [mentioned roles](syntax:message#mentioned-roles) | every role mentioned; empty outside a guild |
| [mentioned channels](syntax:message#mentioned-channels) | every text channel mentioned |
| [mentioned voice channels](syntax:message#mentioned-voice-channels) | every voice channel mentioned |
| [mentioned emotes](syntax:message#mentioned-emotes) | every custom emote used; unicode emojis are not included |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!info":
        reply with "by %discord author of event-message%: %jump url of event-message%"
        reply with "%size of mentioned users of event-message% user(s) mentioned"
```

Ten conditions describe the state of a message. They all read the snapshot you hold, and
Skript negates each of them with `is not` (`if event-message is not pinned:`).

| Condition | True when |
| --- | --- |
| [is edited](syntax:message#edited) | the message has been edited since it was sent |
| [is pinned](syntax:message#pinned) | it is pinned in its channel |
| [is ephemeral](syntax:message#ephemeral) | only one user can see it (an interaction reply) |
| [is tts](syntax:message#tts) | it was sent with text-to-speech |
| [is from a guild](syntax:message#from-a-guild) | it was sent in a guild channel |
| [is from a dm](syntax:message#from-a-dm-private-message-direct-message) | it was sent in a private channel |
| [is a voice message](syntax:message#a-voice-message) | it is a voice message; its attachment has an `attachment duration` |
| [is forwarded](syntax:message#forwarded) | it is a copy made by `forward` |
| [has a poll](syntax:message#a-poll) | a poll is attached to it |
| [is using components v2](syntax:message#using-components-v2) | it is built from containers, sections and text displays |

```skript
on message received seen by "my-bot":
    if event-message is from a dm:
        stop
    if event-message has a poll:
        reply with "%poll question of poll of event-message%"
```

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *[50013] Missing Permissions* on `pin`, `unpin`, `destroy` or `publish` | The message is not the bot's and the bot lacks **Manage Messages** in that channel | Grant the permission to the bot's role, or only act on the bot's own messages |
| *IllegalStateException: Attempted to update message that was not sent by this account. You cannot modify other User's messages!* | `edit` was given a message written by someone else | Edit only messages the bot sent; `destroy` it and post a new one otherwise |
| *InsufficientPermissionException: Cannot delete messages of other users* | `purge` received a message written by someone else and the bot lacks **Manage Messages** | Grant the permission, or filter the list on `discord author of` before purging |
| *[10008] Unknown Message* | The message was deleted before the effect ran, or `message with id` got a wrong id | Check the id, or wrap the line in a `try` and read the [error](doc:concepts/errors) |

entity: message
