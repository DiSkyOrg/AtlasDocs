---
title: Webhooks
icon: webhook
description: Post messages under a custom name and avatar, from a webhook the bot creates or from a webhook URL alone.
tags: [webhooks, messages, discord]
order: 5
---

A webhook posts messages into one channel under its own name and avatar, without being a member
of the guild. This section covers getting hold of a webhook and posting through it. You're
assumed to have a bot named `"my-bot"` logged in (see
[Starting a bot](doc:getting-started/starting-a-bot)) and to know how
[sending messages](doc:messages/sending-messages) works.

## Webhooks and webhook clients

DiSky has two entities for this. A [webhook](entity:webhook) is the Discord object itself: the
bot created it or read it from a guild, so it carries a name, a channel, an owner, and can be
renamed or deleted. A [webhook client](entity:webhookclient) is anything that can post through a
webhook, including a client built from a webhook URL alone. Every webhook is also a webhook
client, so every posting effect accepts both.

| You have | You get | Can post | Can rename, move, delete |
| --- | --- | --- | --- |
| A channel where the bot has **Manage Webhooks** | a `webhook` (create or retrieve it) | yes | yes |
| Only a webhook URL | a `webhookclient` | yes | no |

## Reading order

1. [Webhook clients](webhook-clients.md): creating a webhook, retrieving existing ones, building
   a client from a URL, and the webhook properties.
2. [Posting through a webhook](posting-through-webhooks.md): the `make ... post` effect, the
   webhook message builder, editing and deleting what a webhook sent, threads.
