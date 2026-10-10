---
title: Multiple bots
icon: layers
description: Running several bots on one server, filtering events per bot, and reading a bot's state.
tags: [bot, events]
syntaxes:
  - core/expressions#expression-bots
  - bot#gateway-ping
  - bot#guild-count
  - bot#running-shards
order: 4
---

This page covers what changes when more than one bot is logged in on the same server: how
events are filtered per bot, how to find a bot by name, and which properties tell you what
a bot is doing. You already know how to create and log in a bot from
[Starting a bot](doc:getting-started/starting-a-bot).

## How several bots coexist

Every bot is an independent connection identified by the name you give to
[login](syntax:core/effects#effect-login-bot). Names are compared case-insensitively, and
nothing limits how many bots run at once: log in a second bot exactly like the first one,
under another name.

```skript
options:
    token: "YOUR-TOKEN"
    music-token: "YOUR-MUSIC-TOKEN"

on load:
    set {_bot} to a new discord bot
    set token of {_bot} to {@token}
    login {_bot} as "my-bot"
    set {_music} to a new discord bot
    set token of {_music} to {@music-token}
    login {_music} as "music"

on unload:
    shutdown the bot named "my-bot"
    shutdown the bot named "music"
```

In v5 the bot is never an argument of an effect or expression: DiSky derives it from the
entity you act on. When you reply to a message, edit a channel or kick a member, the bot
that received that message, channel or member is the one doing the work, so the same
script works unchanged whether one or ten bots are loaded.

!!! info "One name, one bot"
    Reusing a running bot's name for a new `login` does not stop the old bot; shut it down
    first, as described in [Starting a bot](doc:getting-started/starting-a-bot#shutting-down).

## Filtering events with seen by

Every DiSky event fires once per bot that receives it. With two bots in the same guild,
`on message received:` runs twice for one message, once with each bot. To listen for a
single bot, append `seen by "<name>"` to the event line: the trigger then runs only when the
bot with that name fired the event. Without the filter, the trigger runs for every bot.

```skript
on ready seen by "music":
    send "music is up with %guild count of event-bot% guilds" to console

on message received seen by "my-bot":
    send "my-bot saw a message from %event-user% in %event-channel%" to console
```

Inside any DiSky event, `event-bot` is the bot that fired it, whether you used `seen by` or
not. It is the usual way to tell bots apart in a shared handler, and it works in the
lifecycle events as well: a [ready](event:events#bot-ready-event) or
[guild ready](event:events#guild-ready-event) handler without a filter fires once per bot,
with `event-bot` set accordingly.

`seen by` matches the bot's login name, not its Discord username, and the comparison
ignores case. A filter naming a bot that is never logged in is not an error: the trigger
simply never runs.

event: events#bot-ready-event compact

## Finding a bot

Outside of an event, [the bot named](syntax:core/expressions#expression-bots) returns the
bot logged in under that name, and `all bots` returns every running bot. An unknown name
returns nothing rather than an error, so test the result before using it.

```skript
command /bot-info <text>:
    trigger:
        set {_bot} to the bot named arg-1
        if {_bot} is not set:
            send "No loaded bot named '%arg-1%'."
            stop
        send "%name of {_bot}%: %guild count of {_bot}% guilds, %gateway ping of {_bot}% ms"
```

`all bots` is a list, so it works with `loop` and with `number of`:

```skript
command /bots:
    trigger:
        send "%number of all bots% bot(s) loaded:"
        loop all bots:
            send "- %name of loop-value% (%running shards of loop-value% shard(s))"
```

A bot appears in `all bots` as soon as `login` has built its connection, which happens
before its `ready` event fires. Use the [connected](syntax:bot#connected) condition
(`if {_bot} is connected:`) when the difference matters.

syntax: core/expressions#expression-bots compact

## Reading a bot's state

The following properties are read-only and describe the live connection. All of them
accept a bot from `the bot named`, `loop-value` or `event-bot`.

| Property | Returns | Notes |
| --- | --- | --- |
| [name](syntax:bot#name) | text | The login name, not the Discord username. |
| [gateway ping](syntax:bot#gateway-ping) | number (ms) | Average across shards; `-1` before the bot is running. |
| [guild count](syntax:bot#guild-count) | number | `0` before the bot is running. |
| [guilds](syntax:bot#guilds) | guilds | Empty before the bot is running. |
| [self user](syntax:bot#self-user) | user | The bot's own Discord account; none before the bot is running. |
| [avatar url](syntax:bot#avatar-url) | text | The self user's effective avatar; none before the bot is running. |
| [running shards](syntax:bot#running-shards) | number | Shards currently connected; `0` before the bot is running. |
| [online status](syntax:bot#online-status) | online status | The status you set, or none if you never set one. |

```skript
command /bot-status <text>:
    trigger:
        set {_bot} to the bot named arg-1
        if {_bot} is not set:
            stop
        send "user: %self user of {_bot}% (%avatar url of {_bot}%)"
        send "shards: %running shards of {_bot}%/%shard count of {_bot}%"
        send "status: %online status of {_bot}%"
        loop guilds of {_bot}:
            send "- %name of loop-value%"
```

`shard count of {_bot}` is the total the bot was built with, so `running shards` divided
by `shard count` tells you whether every shard is up. The sharding options themselves are
covered in [Bot options](doc:getting-started/bot-options).

syntax: bot#gateway-ping compact

syntax: bot#guild-count compact

syntax: bot#running-shards compact
