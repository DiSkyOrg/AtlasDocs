---
title: Registering commands
icon: cloud-upload
description: Push structure and builder commands to Discord with update, register and unregister, and read back what's already there.
tags: [commands, application-commands, discord]
syntaxes:
  - core/effects#effect-update-discord-commands
  - core/effects#effect-register-discord-command
  - core/effects#effect-unregister-discord-commands
  - core/expressions#expression-registered-discord-commands
order: 5
---

This page covers the three effects that push [slash](doc:interaction-commands/slash-commands),
[context](doc:interaction-commands/context-commands) and [builder](doc:interaction-commands/command-builders) commands to
Discord, and reading back what's already registered. You're assumed to have a bot named
`"my-bot"` logged in and at least one command declared, structure or builder.

## How registration works

Nothing reaches Discord on its own: a `slash command` structure and `a new slash command` builder
are both just models until a script runs one of three effects on them.

| Effect | Does | Use when |
| --- | --- | --- |
| [update](syntax:core/effects#effect-update-discord-commands) | Replaces the whole list (a PUT): anything missing from the given commands is removed | Startup sync, pushing every command at once |
| [register](syntax:core/effects#effect-register-discord-command) | Upserts by name: adds or replaces, leaves the rest of the list alone | Adding or editing one command without touching the others |
| [unregister](syntax:core/effects#effect-unregister-discord-commands) | Removes one command, by object, name or id, or all of them | Retiring a command, or clearing a list |

```skript
on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

[`all structured application commands`](syntax:core/expressions#expression-structured-discord-commands)
collects every `slash command`, `user command` and `message command` structure into one list, so
a builder command joins the same call: `update the discord commands (all structured application
commands) and {_roll} in event-guild`. Every one of the three effects blocks until Discord
answers and never takes `await`; a failure on Discord's side goes through the
[error layer](doc:concepts/errors).

syntax: core/effects#effect-update-discord-commands compact

## Guild or global

`in event-guild` applies immediately and is scoped to that one guild; `globally in event-bot`
applies to every guild the bot is in, but can take up to an hour to show up for users. Guild
registration belongs in `on guild ready`, which fires for every guild the bot is in (including
ones it joins later); global registration belongs in `on ready`, which fires once. See
[Starting a bot](doc:getting-started/starting-a-bot) for how the two lifecycle events differ.

```skript
on ready:
    set {_ping} to a new slash command named "ping" with description "Pong!"
    update the discord commands {_ping} globally in event-bot
```

Pushing the same command both ways makes Discord show it twice: guild-scoped and global commands
are separate lists, not one merged into the other. Discord also limits how often a guild's whole
list can be replaced with `update`: 200 times a day.

## Adding and removing one command

`register` and `unregister` change one command without replacing the whole list.

```skript
on guild ready:
    set {_roll} to a new slash command named "roll" with description "Roll a dice"
    register the discord command {_roll} in event-guild
```

`register` also takes several commands at once: `register the discord commands {_a} and {_b}
globally in event-bot`. `unregister` accepts a command object, a name, or a raw id, and a
shorthand for everything:

```skript
unregister the discord command "ping" from event-guild
unregister the discord command {_roll} from event-guild
unregister all the discord commands from event-guild
```

A command object with a known [`command id`](syntax:applicationcommand#command-id) is deleted
directly; a name is looked up among the registered commands first, so it costs an extra request.

syntax: core/effects#effect-register-discord-command compact

## Reading what Discord has

[`registered commands of`](syntax:core/expressions#expression-registered-discord-commands) asks
Discord for the live list of a guild or a bot's global commands, as regular command objects with
their `command id` already set. It's a retrieve, so it needs
[`await`](doc:concepts/cache-and-await):

```skript
await set {_cmds::*} to registered commands of event-guild
loop {_cmds::*}:
    send "%name of loop-value% (%command id of loop-value%, %command type of loop-value%)" to console
```

A retrieved command can be edited and pushed back with `register`, upserting it by name:

```skript
await set {_cmds::*} to registered commands of event-guild
loop {_cmds::*}:
    if name of loop-value is "roll":
        set disabled of loop-value to true
        register the discord command loop-value in event-guild
```

syntax: core/expressions#expression-registered-discord-commands compact

## Reload and shutdown

A `slash command` or context command structure is a model, not a live registration: reloading a
script swaps the model, and the command already pushed to Discord keeps working, bound to
whichever model matches its full path at the time it's used. `on cooldown` cooldowns are part of
that model, so a reload also resets them.

!!! warning "Nothing is deleted for you"
    Removing a structure from a script, unloading it, or shutting the bot down never deletes the
    matching command from Discord. It stays visible and answerable (through the generic events,
    if nothing else) until the next `update` drops it from the list, or an explicit `unregister`
    removes it.

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *the bot 'x' is not connected, it cannot manage commands yet* | `update`/`register`/`unregister`/`registered commands of` ran globally before `login` finished, or after `shutdown` | wait for `on ready`, or push to a guild instead |
| *no bot or guild to manage commands in (the variable is not set)* | the `%bot%` or `%guild%` given to the effect is an unset variable | check the variable is set before the effect runs |
| *expected a bot (global commands) or a guild, got x* | `registered commands of` was given something other than a bot or a guild | pass `event-bot` or `event-guild`, or a variable holding one |
| *'registered commands of' asks Discord and requires 'await' to be read* | `registered commands of` used outside an `await` block | wrap the read in `await set {_x} to ...`, see [Cache and await](doc:concepts/cache-and-await) |
| A Discord error naming code `50035` (*Invalid Form Body*) | a pushed command breaks one of Discord's own limits (name length, duplicate option names, too many choices...) | check the command against Discord's limits; the error names the exact field |
