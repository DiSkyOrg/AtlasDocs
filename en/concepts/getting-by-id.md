---
title: Getting entities by id
icon: fingerprint
description: Look a guild, role, user, member, channel or message up from its Discord id, from the cache or from Discord.
tags: [concepts, getters, id]
syntaxes:
  - member#member-with-id
  - user#user-with-id
  - message#message-with-id
  - role#role-with-id
order: 3
---

This page covers the `X with id "..."` expressions: which entities have one, which need a
scope, and when the lookup reads the cache or asks Discord. You're assumed to have a bot
logged in under `"my-bot"` and to know the [await rules](doc:concepts/cache-and-await),
which are not repeated here.

## How a getter works

Every entity you can reach from outside an event has a getter of the form `X with id %string%`.
The id is Discord's snowflake for the entity, copied from the client with **Developer Mode**
enabled (right-click, **Copy ID**). The getter returns the entity, or nothing when the bot
does not know that id.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!role":
        set {_role} to role with id "123456789012345678"
        reply with "role: %name of {_role}%"
```

| Getter | Scope | Await | Example |
| --- | --- | --- | --- |
| [guild with id](syntax:guild#guild-with-id) | bot | cache only | `guild with id "..."` |
| [role with id](syntax:role#role-with-id) | bot | cache only | `role with id "..."` |
| [user with id](syntax:user#user-with-id) | bot | optional: cache, or Discord with `await` | `await set {_u} to user with id "..."` |
| [text channel with id](syntax:textchannel#text-channel-with-id) | bot | cache only | `text channel with id "..."` |
| [voice channel with id](syntax:voicechannel#voice-channel-with-id) | bot | cache only | `voice channel with id "..."` |
| [stage channel with id](syntax:stagechannel#stage-channel-with-id) | bot | cache only | `stage channel with id "..."` |
| [news channel with id](syntax:newschannel#news-channel-with-id) | bot | cache only | `news channel with id "..."` |
| [forum channel with id](syntax:forumchannel#forum-channel-with-id) | bot | cache only | `forum channel with id "..."` |
| [category with id](syntax:category#category-with-id) | bot | cache only | `category with id "..."` |
| [thread channel with id](syntax:threadchannel#thread-channel-with-id) | bot | cache only | `thread channel with id "..."` |
| [member with id](syntax:member#member-with-id) | `in %guild%` | optional: cache, or Discord with `await` | `await set {_m} to member with id "..." in event-guild` |
| [scheduled event with id](syntax:scheduledevent#scheduled-event-with-id) | `in %guild%` | cache only | `scheduled event with id "..." in event-guild` |
| [message with id](syntax:message#message-with-id) | `in %channel%` | required | `await set {_msg} to message with id "..." in event-channel` |

Ids are text, never numbers: a snowflake such as `1234567890123456789` has more digits than
Skript's numbers keep precisely, so `role with id 1234567890123456789` would look up a
rounded id. Always quote the id, or pass a text variable holding it.

## Global getters and the bot

Guilds, roles, users and channels are not owned by anything you already hold, so their
getters look the id up in a bot's cache and need to know which bot. Each one ends with an
optional `with bot %bot%`: leave it out when a single bot is logged in, and name the bot
when several are.

```skript
on ready seen by "my-bot":
    set {_guild} to guild with id "123456789012345678" with bot event-bot
    send "found %name of {_guild}% on %event-bot%" to console
```

When `with bot` is omitted and one bot is running, that bot is used. When several are
running, DiSky picks one of them and prints a warning in the console asking you to specify
the bot; the lookup still runs, but against a bot that may not be in the guild you expect.
Scripts that run [more than one bot](doc:getting-started/multiple-bots) should always pass
`with bot`.

syntax: member#member-with-id compact

## Scoped getters

A member, a scheduled event and a message only exist inside something else, so their getters
take that container instead of a bot: `member with id "..." in event-guild`,
`scheduled event with id "..." in event-guild`, `message with id "..." in event-channel`.
The bot is the one that holds the container, so there is no `with bot` to add. `from` works
in place of `in`, and the type word is optional (`in guild {_g}`, `in channel {_c}`).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!fetch":
        await set {_msg} to message with id "123456789012345678" in event-channel
        reply with "that message says: %discord content of {_msg}%"
```

`message with id` is retrieve-only: messages are not cached, so the getter always asks
Discord and the line must carry `await`. Without it the script does not load.

syntax: message#message-with-id compact

## Cache or Discord

`user with id` and `member with id` answer from the cache when written plainly, and ask
Discord when the line starts with `await`. The cached form is instant but only knows the
users and members the bot has already met (which depends on the member cache policy); the
awaited form finds anyone the bot is allowed to see.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!whois":
        set {_cached} to member with id "123456789012345678" in event-guild
        await set {_fresh} to member with id "123456789012345678" in event-guild
        reply with "cached: %{_cached}%, fetched: %{_fresh}%"
```

With `await`, the cache is still checked first and Discord is only asked on a miss, so
prefixing every lookup with `await` costs nothing when the entity is already known. The
other getters are cache only: a channel or a role the bot cannot see in its cache is not
found, whatever you prefix the line with.

## When the id is unknown

A cached lookup that finds nothing returns nothing: the variable stays unset, no error is
printed. An awaited lookup that Discord cannot resolve is a Discord error (*Unknown User*,
*Unknown Member*, *Unknown Message*) reported as a readable error in the console, and the
variable stays unset too. Check the variable before using it, or wrap the lookup in `try`
(see [Errors](doc:concepts/errors)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!check":
        await set {_user} to user with id "000000000000000000"
        if {_user} is not set:
            reply with "no user with that id"
            stop
        reply with "found %name of {_user}%"
```

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *the 'message with id' getter is online-only and requires 'await'* | `message with id` was used on a line without `await` | Prefix the line with `await` |
| *Several bots are loaded but none was specified; using '\<name>'. Specify the bot explicitly to remove this ambiguity.* | A global getter ran without `with bot` while more than one bot was logged in | Add `with bot event-bot` (or `with the bot named "my-bot"`) to the getter |
