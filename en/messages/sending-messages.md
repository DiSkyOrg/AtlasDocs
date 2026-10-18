---
title: Sending messages
icon: send
description: Post to a channel, reply to the current event, or build a message you can edit and pin later.
tags: [messages, send, reply, builder]
syntaxes:
  - core/effects#post
  - core/effects#effect-reply-with
  - messageaction#new-message-with-content
  - messageaction#result
order: 1
---

This page covers the three ways to put a message on Discord: `post`, `reply with`, and the
message builder. You're assumed to have a bot named `"my-bot"` logged in and to know the
[builder contract](doc:concepts/builders) and the [three `await` rules](doc:concepts/cache-and-await).

## How sending works

[`post`](syntax:core/effects#post) sends a text, an embed or a component to a channel you name.
[`reply with`](syntax:core/effects#effect-reply-with) sends the same kinds of content, but picks
its channel for you: the one the current event happened in. Neither hands you back the message
it sent; for that, build one first (see below).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!post":
        post "plain text from DiSky" to event-channel
```

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!reply":
        reply with "replied in the event channel"
```

In a message event, `reply with` posts to `event-channel`, exactly like the example above; in
an interaction event it answers the interaction instead, and `hidden` makes that answer
ephemeral (only the user who triggered it sees it, and it does nothing outside interactions).
Add a reference to link the reply to a message, the way Discord's own reply feature does:

```skript
reply with "replied with a reference" with reference event-message
```

syntax: core/effects#effect-reply-with compact

## Posting to a channel

`post` and `dispatch` are the same effect under two names; pick whichever reads better.
It accepts a text, an [embed](doc:messages/embeds), a component or a poll, and posts to any
[message channel](entity:messagechannel) you hand it, not only `event-channel`:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!echo":
        set {_target} to event-channel
        post "posted from a variable" to {_target}
        dispatch "same effect, different name" in {_target}
```

!!! info "Polls go through the same effects"
    `post` and `reply with` also take a poll built with `a new poll titled ...`, and a message
    builder carries one through `attached poll`. See [creating polls](doc:messages/creating-polls).

syntax: core/effects#post compact

## Building a message

[`a new message with content %string% in %messagechannel%`](syntax:messageaction#new-message-with-content)
and `a new message with embed %embedbuilder% in %messagechannel%` create a message builder: it
follows the same contract as every other builder, so nothing is sent until you read `the build
result of` it, which requires `await`. What comes back is a real, already-sent message: edit
it, pin it, or read any of its properties.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!edit":
        set {_m} to a new message with content "before" in event-channel
        await set {_sent} to the build result of {_m}
        edit {_sent} to show "after"
```

`reply with {_m}` also accepts a message builder, as a shortcut: it resends the builder's
content, embeds, attachments and poll through the event's channel or interaction, without
ever building it through `the build result of`, so you never get a message back. It ignores
the builder's own channel, and it does not carry over `tts`, `suppressed notifications` or the
builder's own `referenced message`; use `with reference` on `reply with` itself for that.

```skript
set {_m} to a new message with content "reply from a builder" in event-channel
reply with {_m} with reference event-message
```

syntax: messageaction#result compact

## Options

Every property below is write-only on the builder: read it back on the sent message instead.

| Property | Default | Accepted values |
| --- | --- | --- |
| [discord content](syntax:messageaction#discord-content) | none set | any text |
| [embed](syntax:messageaction#embed) | none set | an [embed](doc:messages/embeds) |
| [embeds](syntax:messageaction#embeds) | none set | up to 10 [embeds](doc:messages/embeds#several-embeds); `set`, `add`, `delete` |
| [attached poll](syntax:messageaction#attached-poll) | none set | a [poll](doc:messages/creating-polls) |
| [tts](syntax:messageaction#tts) | `false` | `true`, `false` |
| [suppressed embeds](syntax:messageaction#suppressed-embeds) | `false` | `true`, `false` |
| [suppressed notifications](syntax:messageaction#suppressed-notifications) | `false` | `true`, `false` |
| [referenced message](syntax:messageaction#referenced-message) | none set | a message |
| [mention replied user](syntax:messageaction#mention-replied-user) | `true` | `true`, `false` |
| [fail on invalid reply](syntax:messageaction#fail-on-invalid-reply) | `false` | `true`, `false` |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!new-message":
        set {_m} to a new message with content "built, then sent" in event-channel
        set tts of {_m} to false
        set suppressed embeds of {_m} to false
        set suppressed notifications of {_m} to true
        await set {_sent} to the build result of {_m}
```

## Replying to a message

`referenced message`, `mention replied user` and `fail on invalid reply` are the builder's own
way to reply, alongside `content` or `embed`, instead of through `reply with ... with
reference`. `mention replied user` only matters once a `referenced message` is set: it decides
whether the referenced message's author gets pinged. `fail on invalid reply` decides what
happens when that message no longer exists by the time the builder sends: `false` (the
default) sends the message anyway, without the reply link; `true` fails the build instead.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!reply-ref":
        set {_m} to a new message with content "this is a reply" in event-channel
        set referenced message of {_m} to event-message
        set mention replied user of {_m} to false
        set fail on invalid reply of {_m} to false
        await set {_sent} to the build result of {_m}
```

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *IllegalStateException: this message has no content, no embed, no attachment and no component; Discord refuses an empty message* | `the build result of` was read on a builder with nothing set | Set a `content`, `embed` or attachment before building |
| *IllegalStateException: this message's content is \<n> characters long, the maximum is 2000* | The builder's `content` (or `discord content`) is over Discord's limit | Shorten the text, or split it across more than one message |

entity: messageaction
