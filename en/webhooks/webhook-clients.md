---
title: Webhook clients
icon: link-2
description: Create a webhook in a channel, retrieve the existing ones, or build a client from a webhook URL.
tags: [webhooks, builder]
syntaxes:
  - webhookaction#new-webhook-builder
  - webhookclient#new-webhook-client
  - guild#webhooks
order: 1
---

This page covers the three ways to get something you can post through: creating a webhook,
retrieving the webhooks a guild or channel already has, and building a client from a webhook
URL. You're assumed to have a bot named `"my-bot"` logged in and to know the
[builder contract](doc:concepts/builders).

## Creating a webhook

[`a new webhook builder named %string% in %guildchannel%`](syntax:webhookaction#new-webhook-builder)
prepares a webhook in a channel; like every builder, nothing exists on Discord until you read
`the build result of` it under `await`. The bot needs **Manage Webhooks** in that channel.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!hook":
        set {_b} to a new webhook builder named "Announcer" in event-channel
        set webhook avatar of {_b} to "https://example.com/avatar.png"
        await set {_hook} to the build result of {_b}
        make {_hook} post "Hello from a fresh webhook"
```

`webhook avatar` is the only setter of the builder (an image URL or a local file path): the name
and the channel are given to the constructor. A channel holds at most 15 webhooks; Discord
refuses the build beyond that.

syntax: webhookaction#new-webhook-builder compact

## Retrieving existing webhooks

[`webhooks of %guild%`](syntax:guild#webhooks) lists every webhook of a guild, and
[`channel webhooks of %standardguildmessagechannel%`](syntax:standardguildmessagechannel#channel-webhooks)
the ones of a single channel. Both ask Discord, so both require `await` (see
[cache and await](doc:concepts/cache-and-await)), and both need **Manage Webhooks**.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!hooks":
        await set {_hooks::*} to channel webhooks of event-channel
        loop {_hooks::*}:
            reply with "%name of loop-value% (%webhook type of loop-value%)"
```

syntax: guild#webhooks compact

## Building a client from a URL

[`a new webhook client from url %string%`](syntax:webhookclient#new-webhook-client) turns a
webhook URL (the one Discord shows under **Integrations → Webhooks → Copy Webhook URL**) into a
client. It needs no permission in the guild and the bot does not have to be in it: the bot only
carries the HTTP requests. Without `using bot`, the only loaded bot is used.

```skript
options:
    hook-url: "https://discord.com/api/webhooks/123/abc"

on message received seen by "my-bot":
    if discord content of event-message is "!url-hook":
        set {_client} to a new webhook client from url {@hook-url} using bot "my-bot"
        make {_client} post "Posted through a URL"
```

A client built this way can post, edit and delete its own messages, nothing else: it has no
name, channel or owner to read, and `destroy` does not accept it.

!!! danger "The URL is a secret"
    Anyone holding a webhook URL, or its [webhook token](syntax:webhookclient#webhook-token),
    can post through it. Keep it in an `options:` block or a file outside the scripts you share.

syntax: webhookclient#new-webhook-client compact

## Webhook properties

A retrieved or created webhook exposes its Discord state. `name`, `webhook avatar` and
`webhook channel` are writable and change the webhook on Discord; put `await` in front to wait
for the change before the next line.

| Property | Returns | Writable |
| --- | --- | --- |
| [name](syntax:webhook#name) | its display name | yes |
| [webhook avatar](syntax:webhook#webhook-avatar) | its avatar URL | yes, from an image URL or a local file path |
| [webhook channel](syntax:webhook#webhook-channel) | the channel it posts in | yes, to a text channel (moves it) |
| [webhook url](syntax:webhook#webhook-url) | the URL a client can be built from | no |
| [webhook token](syntax:webhookclient#webhook-token) | its secret token, none for a follower webhook | no |
| [webhook owner](syntax:webhook#webhook-owner) | the member who created it, none if unknown | no |
| [webhook type](syntax:webhook#webhook-type) | `INCOMING`, or `CHANNEL_FOLLOWER` for a webhook relaying an announcement channel | no |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!rename-hooks":
        await set {_hooks::*} to channel webhooks of event-channel
        loop {_hooks::*}:
            await set name of loop-value to "Renamed"
```

## Deleting a webhook

[`destroy`](syntax:core/effects#destroy) deletes a webhook; every client built from its URL
stops working at the same time.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!clear-hooks":
        await set {_hooks::*} to channel webhooks of event-channel
        loop {_hooks::*}:
            destroy loop-value
```

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *a webhook client needs a running bot to carry its requests* | `a new webhook client from url` ran with no bot logged in, or with several and none named | Log a bot in first, or add `using bot "my-bot"` |
| A *Discord error* naming **Missing Permissions** | The bot lacks **Manage Webhooks** in the channel | Grant it on the channel or the guild |
| *[10015] Unknown Webhook* | The webhook was deleted, or the URL is wrong | Create a new webhook, or check the URL |

entity: webhook
