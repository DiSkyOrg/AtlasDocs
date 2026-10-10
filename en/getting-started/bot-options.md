---
title: Bot options
icon: sliders-horizontal
description: Every connection option you can set on a bot before login, and the two presence options you can change at any time.
tags: [bot, intents, sharding]
syntaxes:
  - bot#intents
  - bot#member-cache-policy
  - bot#cache-flags
  - bot#shard-count
  - bot#compression
order: 3
---

This page lists every option a bot accepts: which gateway intents it subscribes to, what it
keeps in cache, how it compresses traffic, how many shards it runs and what presence it shows.
You already know how to create a bot and log it in (see
[Starting a bot](doc:getting-started/starting-a-bot)) and have a token at hand.

## How options work

A bot goes through two phases. Between `a new discord bot` and `login` it is *configuring*:
every property below can be set, and reading one gives back what you configured. Once
`login` runs, the bot is *running* and its connection is built with the options it had at that
moment. The connection options (`intents`, `member cache policy`, `cache flags`,
`compression`, `shard count`, and the `token`) are **build-time only**: setting one on a
running bot does nothing to the connection and prints a readable error in the console instead.
The two presence options (`activity` and `online status`) are **live**: set them before
`login` to start with them, or on a running bot to change them on the fly.

```skript
options:
    token: "YOUR-TOKEN"

command /startbot <text>:
    trigger:
        shutdown the bot named "my-bot"
        set {_bot} to a new discord bot
        set token of {_bot} to {@token}
        set intents of {_bot} to "default intents"
        set member cache policy of {_bot} to "all"
        set cache flags of {_bot} to "activity, voice_state, online_status"
        set compression of {_bot} to "zlib"
        set activity of {_bot} to "with Skript"
        set online status of {_bot} to dnd
        login {_bot} as "my-bot"
```

The leading `shutdown` makes the command reload-safe: re-running it replaces the bot named
`"my-bot"` instead of logging a second copy. Every `set` line between the creation and the
`login` is optional; a bot with only a token logs in with the defaults from the table below.

## Options

Each property is read with `<property> of {_bot}` and written with
`set <property> of {_bot} to <value>`. Text values are case-insensitive; names that contain a
space can be written with a space or an underscore (`voice state` or `voice_state`).

| Property | Default | Accepted values |
| --- | --- | --- |
| [intents](syntax:bot#intents) | `"default intents"` | `"default intents"`, `"all"`, or comma-separated intent names |
| [member cache policy](syntax:bot#member-cache-policy) | `"default"` | `"all"`, `"default"`, `"none"`, `"online"`, `"owner"`, `"voice"` |
| [cache flags](syntax:bot#cache-flags) | none set (JDA's own defaults apply) | `"default"`, `"all"`, `"none"`, or comma-separated flag names |
| [compression](syntax:bot#compression) | `"zlib"` | `"zlib"`, `"none"` |
| [shard count](syntax:bot#shard-count) | `-1` (Discord's recommended count) | `-1`, `1`, or any number of 2 or more |
| [activity](syntax:bot#activity) | none | any text, shown as *Playing <text>* |
| [online status](syntax:bot#online-status) | Discord's default (online) | `online`, `idle`, `dnd`, `invisible` |

## Intents

Gateway intents tell Discord which groups of events your bot wants to receive. A bot without
the `guild_messages` intent never sees a message sent in a guild, whatever your script listens
to. The value is a list of intent names separated by commas, or a shortcut; setting it
replaces the whole set.

```skript
set intents of {_bot} to "guild_messages, message_content, guild_members"
```

Two shortcuts exist, and both can be mixed with names to add a few intents on top:

- `"default intents"` (or `"default"`): the set a fresh bot uses, marked in the table below.
- `"all"`: every intent JDA knows.

```skript
set intents of {_bot} to "default intents, guild_message_polls"
```

| Intent | Default | Privileged | Needed for |
| --- | :---: | :---: | --- |
| `guild_messages` | yes | | messages sent in guild channels |
| `message_content` | yes | yes | reading the text and attachments of messages |
| `guild_members` | yes | yes | member join, leave and update events, full member cache |
| `guild_presences` | yes | yes | online status and activities of members |
| `guild_moderation` | yes | | bans, unbans, audit log entries |
| `guild_expressions` | yes | | emoji, sticker and soundboard events |
| `guild_webhooks` | yes | | webhook update events |
| `guild_invites` | yes | | invite create and delete events |
| `guild_voice_states` | yes | | voice join, leave and state changes |
| `guild_message_reactions` | yes | | reactions in guild channels |
| `guild_message_typing` | yes | | typing events in guild channels |
| `direct_messages` | yes | | messages sent to the bot in DMs |
| `scheduled_events` | yes | | scheduled event changes |
| `guild_message_polls` | | | poll votes in guild channels |
| `direct_message_polls` | | | poll votes in DMs |
| `direct_message_reactions` | | | reactions in DMs |
| `direct_message_typing` | | | typing events in DMs |
| `auto_moderation_configuration` | | | auto-moderation rule changes |
| `auto_moderation_execution` | | | auto-moderation actions |

Privileged intents are only delivered if they are switched on for your application under
**Bot → Privileged Gateway Intents** on the Developer Portal. Reading `intents of {_bot}`
returns the enabled names in upper case, separated by commas.

!!! warning "The default set includes the three privileged intents"
    A bot left on `"default intents"` needs **all three** privileged toggles enabled on the
    Developer Portal, or Discord closes the connection right after login. Either enable them,
    or set an explicit list without the ones you don't need.

syntax: bot#intents compact

## Caching

Two properties decide what the bot keeps in memory, and both go before `login`. The
`member cache policy` says which members stay cached once Discord has sent them. The
`cache flags` list which extra pieces of data are cached on top of the entities themselves.
Setting either property replaces its previous value.

```skript
set member cache policy of {_bot} to "online"
set cache flags of {_bot} to "default, emoji"
```

| Member cache policy | Members kept in cache |
| --- | --- |
| `"default"` | members in a voice channel and guild owners (JDA's default) |
| `"all"` | every member of every guild; needs the `guild_members` intent to fill up |
| `"online"` | members whose status is not offline; needs `guild_presences` |
| `"voice"` | members in a voice channel |
| `"owner"` | guild owners |
| `"none"` | nobody beyond the bot itself |

Cache flags accept the names below, or one of three shortcuts: `"default"` stands for
`activity`, `voice_state` and `online_status`; `"all"` enables every flag; `"none"` clears
the list. A flag only fills up when its intent is enabled.

| Cache flag | Caches | Needs intent |
| --- | --- | --- |
| `activity` | members' activities | `guild_presences` |
| `online_status` | members' online status | `guild_presences` |
| `client_status` | which client (desktop, mobile, web) a member is on | `guild_presences` |
| `voice_state` | who is in which voice channel | `guild_voice_states` |
| `emoji` | custom emojis | `guild_expressions` |
| `sticker` | custom stickers | `guild_expressions` |
| `soundboard_sounds` | soundboard sounds | `guild_expressions` |
| `scheduled_events` | scheduled events | `scheduled_events` |
| `member_overrides` | per-member permission overrides on channels | |
| `role_tags` | role tags (bot, integration, booster roles) | |
| `forum_tags` | available tags of forum channels | |

Reading either property returns the configured names in upper case, so a bot you never
configured reads back `"DEFAULT"` for its policy and an empty text for its flags.

The `compression` property belongs to the same group: `"zlib"` (the default) compresses the
gateway traffic, `"none"` disables it. Leave it alone unless you are debugging the raw
connection.

syntax: bot#cache-flags compact

## Sharding

A shard is one gateway connection; Discord requires bots in 2,500 guilds or more to split
their guilds across several. The `shard count` property picks how many connections the bot
opens: `-1` (the default) asks Discord for its recommended count, `1` forces a single
connection and any number of 2 or more forces that many. The
[recommended shard count](syntax:core/expressions#expression-recommended-shard-count)
expression is a readable name for `-1`.

```skript
set shard count of {_bot} to recommended shard count
```

Sharding is invisible to your scripts. Lifecycle events such as `on ready` and
`on bot shutdown` fire once per bot, when its last shard comes up or goes down, not once per
shard; `seen by` filters and the properties of the bot work the same whatever the count. Once
the bot runs, `shard count of {_bot}` returns the real shard total and
[running shards](syntax:bot#running-shards) tells how many of them are currently connected:

```skript
on ready seen by "my-bot":
    send "%running shards of event-bot%/%shard count of event-bot% shards up" to console
```

Keep `-1` unless you know the number you need: Discord decides how many shards a bot may
open, and a forced count it does not accept fails at login.

syntax: bot#shard-count compact

## Presence

The `activity` sets the text shown under the bot's name as *Playing <text>*; an empty text
removes it. The `online status` picks the presence dot: `online`, `idle`, `dnd` (do not
disturb) or `invisible`. Unlike the connection options, both are live: setting them before
`login` gives the bot its starting presence, and setting them on a running bot updates every
shard immediately.

```skript
on ready seen by "my-bot":
    set activity of event-bot to "in %guild count of event-bot% guilds"
    set online status of event-bot to idle
```

The value of `online status` is a DiSky type, not a text: write `dnd`, not `"dnd"`. The
same property reads the presence of a member, but is only writable on a bot.

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *shard count can't be changed on a running bot; set it before login* (same wording for `intents`, `cache flags`, `member cache policy`, `compression` and `token`) | A build-time property was set after `login`. | Shut the bot down, set the property on a new bot, log in again. |
| *unknown member cache policy 'x' (try: all, default, none, online, owner, voice)* | The policy name is misspelled. | Use one of the listed names. |
| A *Discord error* block naming an unknown `GatewayIntent` or `CacheFlag` constant | An intent or cache flag name in the list is misspelled. | Check the names in the [Intents](#intents) and [Caching](#caching) sections. |
| The bot logs in, then disconnects with Discord's close code 4014 (*Disallowed intent(s)*) | A privileged intent is enabled on the bot but not on the Developer Portal. | Enable it under **Bot → Privileged Gateway Intents**, or remove it from `intents`. |
