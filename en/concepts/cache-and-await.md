---
title: Cache and await
icon: hourglass
description: What the cache holds, the three rules that decide when a line needs await, and the reads that always do.
tags: [concepts, await, cache]
syntaxes:
  - core/effects#effect-await
order: 2
---

This page covers where a property value comes from (the bot's cache or a call to Discord)
and the [`await`](syntax:core/effects#effect-await) effect that decides it. You're assumed to
have a bot logged in under `"my-bot"` and to know how a property is read and written (see
[Entities and properties](doc:concepts/entities-and-properties)).

## How the cache works

When a bot logs in, it keeps a copy of the guilds, channels, roles and members it can see in
memory: that copy is the cache. Reading a property such as `name of event-guild` or
`roles of event-member` answers from it instantly, on the main thread, without contacting
Discord. What the cache contains depends on the bot's intents, member cache policy and cache
flags, which are set before login and described on the
[bot options](doc:getting-started/bot-options) page.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!cached":
        reply with "%name of event-guild% has %size of roles of event-member% roles here"
```

Some values are never cached because Discord does not push them to bots: bans, invites,
audit logs, pinned messages, a user's profile. Reading one means asking Discord over its REST
API, which takes a network round trip and must not block the server's main thread. That is
what `await` is for.

## The three rules of await

`await` is written in front of a whole line. It runs that line on a background thread, waits
for Discord to answer, then resumes the trigger with the result. Which lines accept it, and
which need it, depends on the kind of syntax on the line.

| Kind of syntax | Without await | With await | Example |
| --- | --- | --- | --- |
| An effect (`post`, `kick`, `destroy`, `edit`...) | Already waits for Discord before the next line runs | Accepted, with a parse warning that it is redundant | `post "hello" to event-channel` |
| A retrieve-only read (see the table below) | Parse error: the script does not load | Fetches the value from Discord | `await set {_bans::*} to bans of event-guild` |
| An awaitable read (cache and REST both exist) | Cache: instant, may be empty | Fetches the fresh value from Discord | `await set {_owner} to discord owner of event-guild` |

Effects are asynchronous on their own: `post` sends the message off the main thread and the
trigger continues once Discord confirmed it, so `await` has nothing to add. Reads are where
the choice matters:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!owner":
        set {_cached} to discord owner of event-guild
        await set {_fresh} to discord owner of event-guild
        reply with "cached: %{_cached}%, fresh: %{_fresh}%"
```

The first `discord owner` line reads the cache and returns nothing if the owner is not
cached (an offline owner under the `"online"` member cache policy, for instance). The second
one asks Discord and always returns the member. Both are valid; pick the cache when you read
often and can live with a miss, `await` when you need the value to be there.

An awaitable property is one the atlas marks as such: the [members](syntax:guild#members) of
a guild, its [discord owner](syntax:guild#discord-owner), [user with id](syntax:user#user-with-id)
and [member with id](syntax:member#member-with-id) are the ones you meet first; the
[getting by id](doc:concepts/getting-by-id) page covers the last two.

syntax: core/effects#effect-await compact

## Retrieve-only reads

These properties have no cache at all. Discord serves them on request only, so reading one
without `await` is a parse error naming the property, and the script does not load until the
line is fixed. Every one returns a fresh value each time it runs.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!audit":
        await set {_bans::*} to bans of event-guild
        await set {_pins::*} to pinned messages of event-channel
        reply with "%size of {_bans::*}% bans, %size of {_pins::*}% pinned messages"
```

| Property | Entity | Returns |
| --- | --- | --- |
| [application info](syntax:bot#application-info) | bot | the application behind the bot |
| [invites](syntax:guild#invites) | guild | every invite of the guild |
| [webhooks](syntax:guild#webhooks) | guild | every webhook of the guild |
| [emotes](syntax:guild#emotes) | guild | the guild's custom emojis |
| [bans](syntax:guild#bans) | guild | the first 1,000 bans |
| [active threads](syntax:guild#active-threads) | guild | threads not yet archived |
| [audit logs](syntax:guild#audit-logs) | guild | audit log entries |
| [profile](syntax:user#profile) | user | banner and profile colour |
| [private channel](syntax:user#private-channel) | user | the DM channel with the user, opened if needed |
| [interested members](syntax:scheduledevent#interested-members) | scheduled event | members who clicked *Interested* |
| [pinned messages](syntax:messagechannel#pinned-messages) | any message channel | the pinned messages |
| [channel webhooks](syntax:standardguildmessagechannel#channel-webhooks) | text or news channel | the channel's own webhooks |
| [thread members](syntax:threadchannel#thread-members) | thread channel | members who joined the thread |
| [start message](syntax:threadchannel#start-message) | thread channel | the message the thread started from |
| [archived threads](syntax:threadcontainer#archived-threads) | text, news or forum channel | archived public threads |
| [archived private threads](syntax:threadcontainer#archived-private-threads) | text, news or forum channel | archived private threads |
| [the build result of](syntax:roleaction#result) | any builder | the entity the builder creates |
| [message with id](syntax:message#message-with-id) | message channel | one message by id |

`the build result of` is the line where a [builder](doc:concepts/builders) actually creates
its object on Discord, which is why it belongs to this list.

## Awaiting a change

`await` also applies to a property write. Without it, a change that goes through Discord
(`set nickname of`, `add ... to roles of`, `add ... to flags of`) is sent and the trigger
moves on before Discord confirms it; a read on the very next line can still see the old
value. With `await`, the line blocks until Discord has applied the change, so the next read
sees the new state.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!verify":
        await add bypasses verification to flags of event-member
        reply with "flags now: %flags of (member with id (discord id of event-member) in event-guild)%"
```

The same applies to every property the atlas marks as REST-backed: roles, flags, nickname,
a channel's topic or a guild's AFK channel. Plain `set` is fine when nothing reads the value
back in the same trigger.

## Threads and timing

The line after `await` runs on a background thread, where blocking on Discord is safe; once
it finishes, the trigger resumes on the main thread with its local variables intact, so
nothing you write after `await` runs off-thread. Skript treats everything after an `await`
as delayed, exactly like the code after a `wait` effect. A DiSky error raised inside the
awaited line (an unknown id, a missing permission) is a readable error in the console, not a
crash, and can be caught with `try` (see [Errors](doc:concepts/errors)).

!!! info "Coming from v4"
    The `retrieve X and store it in {_var}` effects are gone: every one of them is now a
    property read written as `await set {_var} to X`.

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *the 'bans' property is online-only and requires 'await' to be read* (same wording for every property in the table above) | A retrieve-only property was read on a line without `await` | Prefix the line: `await set {_bans::*} to bans of event-guild` |
| *building talks to Discord, so this requires 'await'* | `the build result of` a builder was read without `await` | Write `await set {_role} to the build result of {_builder}` |
| *the 'message with id' getter is online-only and requires 'await'* | `message with id` was used without `await` | Prefix the line with `await` |
| *This effect is already async; 'await' is redundant here.* (warning, the script still loads) | `await` was put in front of an effect | Remove the `await`; the effect waits on its own |
