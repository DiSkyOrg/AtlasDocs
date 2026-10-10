---
title: Posting through a webhook
icon: send
description: Post, edit and delete messages as a webhook, with a per-message name and avatar, in a channel or a thread.
tags: [webhooks, messages, builder]
syntaxes:
  - webhookclient#webhook-post
  - webhookmessageaction#new-webhook-message-with-content
  - core/effects#webhook-edit
  - core/effects#webhook-delete
order: 2
---

This page covers what a webhook client does once you have one: post a message, override its
name and avatar for that message, keep the sent message to edit or delete it later, and post
in a thread. You're assumed to have a [webhook client](doc:webhooks/webhook-clients) in
`{_hook}` and a bot named `"my-bot"` logged in.

## How posting works

[`make %webhookclient% post %content%`](syntax:webhookclient#webhook-post) sends a text, an
[embed](doc:messages/embeds), a component or a [message builder](doc:messages/sending-messages)
through the webhook. `send` and `speak` are the same effect under other names. Like `post`, it
forgets the message it sent.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!announce":
        set {_b} to a new webhook builder named "Announcer" in event-channel
        await set {_hook} to the build result of {_b}
        make {_hook} post "Server restart in 5 minutes"
        make {_hook} post "Restarted" with username "Status" and avatar "https://example.com/up.png"
```

`with username` and `and avatar` change how the webhook appears for this message only; its own
name and avatar stay as they are. A message builder given as content is used as a template: its
content, embeds, attachments and components are sent, the rest of the builder is ignored.

syntax: webhookclient#webhook-post compact

## Keeping the sent message

[`a new webhook message with content %string% through %webhookclient%`](syntax:webhookmessageaction#new-webhook-message-with-content)
and `a new webhook message with embed %embedbuilder% through %webhookclient%` create a webhook
message builder. It follows the [builder contract](doc:concepts/builders): nothing is sent until
`the build result of` it is read under `await`, and that read returns the sent message.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!status":
        set {_m} to a new webhook message with content "Checking..." through {_hook}
        set webhook username of {_m} to "Status"
        await set {_sent} to the build result of {_m}
        edit webhook message {_sent} of {_hook} to show "All systems up"
```

syntax: webhookmessageaction#result compact

## Options

Every property below is write-only on the builder.

| Property | Default | Accepted values |
| --- | --- | --- |
| [webhook username](syntax:webhookmessageaction#webhook-username) | the webhook's name | any text |
| [webhook avatar url](syntax:webhookmessageaction#webhook-avatar-url) | the webhook's avatar | an image URL |
| [webhook thread](syntax:webhookmessageaction#webhook-thread) | none, the webhook's channel | a thread of the webhook's channel |
| [webhook thread id](syntax:webhookmessageaction#webhook-thread-id) | none | a thread id |
| [discord content](syntax:webhookmessageaction#discord-content) | the constructor's text | any text |
| [embed](syntax:webhookmessageaction#embed) | the constructor's embed | an embed |
| [attachments](syntax:webhookmessageaction#attachments) | none | [file uploads](doc:messages/file-uploads) |
| [components](syntax:webhookmessageaction#components) | none | components |
| [tts](syntax:webhookmessageaction#tts) | `false` | `true`, `false` |
| [suppressed embeds](syntax:webhookmessageaction#suppressed-embeds) | `false` | `true`, `false` |
| [suppressed notifications](syntax:webhookmessageaction#suppressed-notifications) | `false` | `true`, `false` |

```skript
set {_m} to a new webhook message with content "Patch notes" through {_hook}
set webhook username of {_m} to "Changelog"
set webhook avatar url of {_m} to "https://example.com/log.png"
add (a new file upload from file "plugins/notes.txt") to attachments of {_m}
set suppressed notifications of {_m} to true
await set {_sent} to the build result of {_m}
```

## Editing and deleting

[`edit webhook message %string/message% of %webhookclient% to show %content%`](syntax:core/effects#webhook-edit)
and [`delete webhook message %string/message% of %webhookclient%`](syntax:core/effects#webhook-delete)
take the sent message or its id. A webhook can only edit and delete its own messages, and a
client built from a URL works the same way as the webhook it points to.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!cleanup":
        set {_m} to a new webhook message with content "temporary" through {_hook}
        await set {_sent} to the build result of {_m}
        delete webhook message (discord id of {_sent}) of {_hook}
```

syntax: core/effects#webhook-edit compact

## Threads

A webhook posts in its own channel, or in a thread of that channel. Add `in thread %threadchannel%`
to any of the three effects, or set `webhook thread` on the builder. A message sent in a thread
must be edited and deleted with the same `in thread`, or Discord answers that the message does
not exist.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!thread-post":
        set {_tb} to a new thread builder named "Logs" from event-message
        await set {_thread} to the build result of {_tb}
        make {_hook} post "first entry" in thread {_thread}
```

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *this message has no content, no embed, no attachment and no component; Discord refuses an empty message* | A webhook message builder was built with nothing to send | Set a content, an embed, an attachment or a component |
| *[10008] Unknown Message* | The message was not sent by this webhook, or it lives in a thread and `in thread` is missing | Edit through the webhook that sent it, naming the thread |
| *[10015] Unknown Webhook* | The webhook was deleted | Create or retrieve a new one |

entity: webhookmessageaction
