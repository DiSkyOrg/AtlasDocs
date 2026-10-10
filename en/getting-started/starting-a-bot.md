---
title: Starting a bot
icon: play
description: Create a bot, give it a token, log in, and shut it down cleanly.
tags: [bot, getting-started]
syntaxes:
  - core/expressions#expression-new-discord-bot
  - core/effects#effect-login-bot
  - core/effects#effect-shutdown-bot
order: 2
---

This page covers creating a bot, logging it in under a name, the events that fire once it
connects, and shutting it down. You're assumed to have DiSky v5 installed (see the
[installation guide](doc:getting-started/installation)) and a bot token from the Discord
Developer Portal.

## How logging in works

A bot starts as an empty, unconnected object. You configure it, give it a token, then
[log it in](syntax:core/effects#effect-login-bot) under a name; that name is how the rest of
your scripts retrieve it later.

::: steps
1. Create the bot with [a new discord bot](syntax:core/expressions#expression-new-discord-bot)
   and store it in a variable.

2. Set its `token` to your bot's token, read from an `options:` block so it never sits in
   plain code.

3. Call `login`, giving the bot a name. Pair it with a `shutdown` so the bot disconnects
   when the plugin unloads.
:::

```skript
options:
    token: "YOUR-TOKEN"

command /startbot:
    trigger:
        set {_bot} to a new discord bot
        set token of {_bot} to {@token}
        login {_bot} as "my-bot"
        send "&7Logging in 'my-bot'..."

on unload:
    shutdown the bot named "my-bot"
```

Login runs in the background: the command returns immediately, and Discord validation
happens off the main thread. If the token is empty or missing, or the bot fails to connect,
DiSky prints a readable error to the console instead of the raw exception; nothing crashes.
Once the connection succeeds, the bot is registered under its name and `the bot named
"my-bot"` starts resolving to it anywhere in your scripts.

!!! warning "Configure before login"
    `token`, `intents`, `member cache policy`, `cache flags`, `compression` and `shard count`
    can only be set while the bot is still configuring. Changing any of them after `login` is
    a readable error in the console, not a crash. See [bot options](doc:getting-started/bot-options)
    for the full list and their accepted values.

syntax: core/expressions#expression-new-discord-bot compact
syntax: core/effects#effect-login-bot compact

## Lifecycle events

Three global events cover a bot's life. They fire for every bot that logs in, so filter with
`on ready seen by "my-bot":` when you run [more than one bot](doc:getting-started/multiple-bots).

- [`on guild ready`](event:events#guild-ready-event) fires once per guild the bot is connected
  to, as each guild's data finishes loading.
- [`on ready`](event:events#bot-ready-event) fires once, after every guild has fired its own
  `on guild ready`, when the bot is fully connected.
- [`on bot shutdown`](event:events#bot-shutdown-event) fires once the bot's connection to
  Discord closes.

```skript
on guild ready:
    send "[DiSky] guild ready: %name of event-guild% on %event-bot%" to console

on ready:
    send "[DiSky] %event-bot% READY (%guild count of event-bot% guilds)" to console

on bot shutdown:
    send "[DiSky] %event-bot% SHUTDOWN" to console
```

## Shutting down

[`shutdown the bot named "..."`](syntax:core/effects#effect-shutdown-bot) disconnects the bot
and unregisters its name; it can be logged in again afterwards. Always pair a `login` with a
`shutdown`, typically in an `on unload:` block so the bot disconnects cleanly when the plugin
reloads or the server stops.

```skript
on unload:
    shutdown the bot named "my-bot"
```

Logging in a *second, separate* bot under a name that's already running does not raise an
error: the new bot takes over that name in the registry, and the previous one keeps running
in the background, no longer reachable by name. Always shut a bot down before logging in a
replacement under the same name. Calling `login` again on the exact same bot variable while
it's already connected is what actually fails, with a readable error in the console.

syntax: core/effects#effect-shutdown-bot compact

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *IllegalStateException: a bot needs a token before login (set token of %bot% to ...)* | `login` was called before `token` was set | Set `token of {_bot}` before `login` |
| *IllegalStateException: the bot '\<name>' is already connected* | `login` was called again on the same bot variable while it's still running | Only log a given bot variable in once; use a new bot for a new connection |
| No message; the effect does nothing | `shutdown the bot named "..."` was given a name no running bot currently has | Check the name with [`the bot named "..."`](doc:getting-started/multiple-bots) before shutting it down, or make sure it hasn't already been shut down |

Connection options such as intents, member cache policy and sharding are covered on the
[bot options](doc:getting-started/bot-options) page.

entity: bot
