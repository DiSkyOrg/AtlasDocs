---
title: Messages
icon: message-square
description: Sending, building and managing Discord messages, from a plain post to files, reactions and polls.
tags: [messages, discord]
order: 2
---

This section covers everything a bot does with messages: sending them, building them ahead of
time, attaching embeds and files, editing and pinning, reacting, and creating and reading polls. You already
have a bot named `"my-bot"` logged in (see [Starting a bot](doc:getting-started/starting-a-bot))
and have read the [concepts section](doc:concepts), in particular
[cache and await](doc:concepts/cache-and-await) and [builders](doc:concepts/builders).

## Three ways to send

`post` fires text, an embed or a component at any channel and forgets it. `reply with` answers
the current message or interaction the same way, without you naming a channel. The message
builder configures everything first, and `the build result of` it is the only one that hands
you back the sent message to edit, pin or reference later.

| Need | Use |
| --- | --- |
| Send to a channel you already have, and move on | `post` |
| Answer the message or interaction the current event is about | `reply with` |
| Attach files, add components, or keep the sent message afterward | the message builder |
| Reply with something built ahead of time, still without keeping it | `reply with {_builder}` |

## Reading order

1. [Sending messages](sending-messages.md): `post`, `reply with`, the message builder and its
   options.
2. [Embeds](embeds.md): every embed property and its fields.
3. [File uploads](file-uploads.md): attaching files and reading them back.
4. [Managing messages](managing-messages.md): edit, pin, publish, forward, purge, typing.
5. [Reactions](reactions.md): reacting, suppressing reactions, reaction events.
6. [Creating polls](creating-polls.md): building a poll and sending it alone or on a message.
7. [Polls](polls.md): reading a poll, listing its voters, ending it, vote events.

To post under another name and avatar, see the [webhooks section](doc:webhooks).
