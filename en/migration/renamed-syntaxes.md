---
title: Renamed syntaxes
icon: replace
description: Syntaxes that still exist in DiSky 5 but are written differently from DiSky 4.
tags: [migration, disky4, renamed]
order: 2
---

This page lists the syntaxes that survived the move from DiSky 4 to DiSky 5 under a new shape: a
DiSky 4 line either fails to parse, or parses and means something else. You're assumed to know
DiSky 4 and to have a bot logged in as `"my-bot"`. Syntaxes that are gone, or that changed
model entirely (retrieving, builders, commands, components, events), have their own pages.

## The discord prefix

Skript registers its own syntaxes before any addon and picks the first pattern that matches.
When the operand is an untyped variable (every `{_x}` satisfies any `%type%` slot at parse
time), a DiSky property whose wording equals a Skript one loses silently: the line parses and
returns nothing. DiSky 5 avoids the clash by putting a literal `discord` in the property name.
Where the prefix used to be optional it is now required, and a few patterns whose optional words
made them ambiguous now require their qualifier.

```skript
# DiSky 4
set {_text} to content of event-message
send "%message author of event-message%" to console
```

```skript
# DiSky 5
set {_text} to discord content of event-message
send "%discord author of event-message%" to console
```

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `[discord] [message] content` | `discord content of %message%` | Same name on message builders, text displays and webhook messages. |
| `[discord] [message] (user\|author\|writer)` | `discord author of %message%` | The `user` and `writer` aliases are gone. |
| `author` of an embed | `discord author of %embedbuilder%` | `author icon` and `author url` are unchanged. |
| `[discord] [message] attachment[s]` | `discord attachments of %message%` | |
| `[member] colo[u]rs` | `discord colors of %member%` | Returns a `rolecolor`. |
| `thread owner` | `discord owner of %threadchannel%` | Guilds use the same name: `discord owner of %guild%`. |
| scheduled event `location` | `discord location of %scheduledevent%` | Settable on a live event. |
| `[discord] permissions of %member/role/player%` | `discord permissions of %member%` | The prefix is mandatory; see [Permissions](#permissions). |
| `%commandsenders/members% has permission %strings%` | `%members% has discord permission %permissions%` | Raw strings and command senders are no longer accepted. |
| `[the] last (disky\|discord) (error\|exception)` | `the last discord error` | |
| `click[ed] (id\|button)` | `click[ed] (id\|component id\|button id)` | `clicked button` is gone. |

Effects keep their own escape hatch instead: `[discord] kick` and `[discord] ban` take
`discord` **before** the verb only. DiSky 4 put it after the verb (`kick the discord member`),
and that no longer parses.

```skript
# DiSky 4
kick the discord member {_m} because of "spam"
```

```skript
# DiSky 5
kick {_m} because of "spam"
discord kick {_m} because of "spam"
```

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `kick [the] discord [member] %member%` | `[discord] kick [the] [member] %member%` | Drop the word after the verb. |
| `ban [the] discord [member] %member%` | `[discord] ban [the] [member] %member%` | Same; see [Ban clause order](#ban-clause-order). |
| `[voice] mute`, `unmute`, `move`, `disconnect` + `discord member` | `[voice] mute [the] [member] %member%`, ... | `discord` after the verb no longer parses. |

## Bots

Bot keywords were tightened so that a bare word cannot be mistaken for something else. The
activity expressions keep their words, but a bot's activity is now one `activity of %bot%`
property instead of a `presence`.

```skript
# DiSky 4
set presence of {_bot} to watching "the server"
stop {_bot}
```

```skript
# DiSky 5
set activity of {_bot} to watching "the server"
stop bot {_bot}
```

A plain string assigned to the activity is a "playing" activity. The other kinds are built with
dedicated expressions:

| Expression | Kind |
| --- | --- |
| `playing [to] %string%` | Playing |
| `watching [to] %string%` | Watching |
| `listening [to] %string%` | Listening |
| `streaming [to] %string% with [the] url %string%` | Streaming |
| `competing [in\|to] %string%` | Competing |
| `custom status [of] %string%` | Custom status |

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `[force] (stop\|shutdown) [the] [bot] %bot%` | `(shut down\|stop\|disconnect) [the] [discord] bot[s] %bots%` | The word `bot` is mandatory (`stop {_bot}` fails), `force` is gone, and a list is accepted. |
| `[get] [the] bot [(named\|with name)] %string%` | `[the] bot[s] named %string%` | `named` is mandatory; the lookup ignores case. |
| `[discord] presence` | `activity of %bot%` | Assign a string or one of the expressions above. |
| `[discord] [online] status of %bot/member%` | `online status of %bot%`, `online status of %member%` | `online` is mandatory. The member form is read-only. |
| `[discord] bot token` | `token of %bot%` | Settable before `login` only. |
| `[discord] bot ping` | `gateway ping of %bot%` | |
| `catch [the] [exception] %~objects%` | `catch [the] [error[s]] %~objects%` | `catch the exception {_e}` no longer parses; write `catch the error {_e}`. |

## Messages and embeds

Embed properties are mostly the same words, with a few renames. They are still write-only on a
builder, and an embed is snapshotted when you attach it.

```skript
# DiSky 4
set time stamp of {_embed} to now
set embed color of {_embed} to red
```

```skript
# DiSky 5
set timestamp of {_embed} to now
set color of {_embed} to red
```

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `time[( \|-)]stamp` of an embed | `timestamp of %embedbuilder%` | |
| `(embed\|discord) colo[u]r` | `color of %embedbuilder%` | On a Skript without the native `color` property it is `discord color`. |
| `[discord] [message] mentioned text channels` | `mentioned channels of %message%` | `mentioned voice channels`, `members`, `roles`, `users` and `emotes` keep their names. |
| `[discord] [message] (emo(te\|ji)\|reaction)[s]` | `reactions of %message%` | The `emote` and `emoji` aliases are gone. |
| `[discord] [message] referenc(ing\|ed) message` | `referenced message of %message%` | |
| `att[achment[s]] %attachment% is [an] (image\|img)` | `%attachments% is [an] image [attachment]` | Subject first; `img` is gone. Same shape for `video`, `audio` and `spoiler`. |
| `[discord] [attachment] ur(l\|i)` | `attachment url of %attachment%` | `file name` and `file extension` are the other two. |
| `(download\|dl) [the] [attachment] %attachment% (in\|to) [the] [(folder\|path)] %string%` | `download [the] [attachment] %attachment% (in\|to) [the] [(folder\|file\|path)] %string%` | `dl` is gone; the target can now be a file. |

## Guilds, members and moderation

### Ban clause order

The two optional clauses of `ban` swapped places: the message-deletion duration now comes
**before** the reason. A DiSky 4 line that puts the reason first stops parsing.

```skript
# DiSky 4
ban the discord member {_m} due to "spam" and delete 1 day worth of messages
```

```skript
# DiSky 5
ban {_m} and delete 1 day worth of messages because of "spam"
```

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `ban [the] discord [member] %member% [reason] [and delete %-timespan% worth of messages]` | `[discord] ban [the] [member] %member% [and (delete\|remove) %-timespan% [worth ]of message[s]] [(due to\|because of\|with [the] reason) %-string%]` | Duration, then reason. |
| `ban [the] discord [member] %string% from %guild% [reason]` | `[discord] ban [the] [user] [with] [id] %string% (from\|of) [the] [guild] %guild% [and delete ...] [reason]` | Ban by id; it gained the delete clause. |
| `unban [the] [discord] [user] %user/string% from %guild%` | `[discord] unban [the] [user] %user% (from\|in) [the] [guild] %guild% [reason]` | Takes a `user`, not a raw id: fetch it with `await` first. |

### Permissions

DiSky 4 had one `permissions of ... in ...` expression with `add`, `remove` and `reset`. DiSky 5
makes the channel level explicit: a channel override has an **allowed** side and a **denied** side,
and you edit each by name. Guild-level permissions of a role are a separate, simpler property.

```skript
add manage messages to allowed discord permissions of {_role} in {_channel}
add send messages to denied discord permissions of {_role} in {_channel}
remove manage messages from allowed discord permissions of {_role} in {_channel}
reset allowed discord permissions of {_role} in {_channel}
```

- `add` to the allowed side grants the permission (and takes it out of the denied side).
- `add` to the denied side denies it.
- `remove` clears the permission from that side only: it becomes inherited again, never an implicit deny.
- `delete` or `reset` removes the whole override.

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `permissions of %role%` | `discord permissions of %role%` | `set`, `add`, `remove` and `delete`; there is no `reset`. |
| `permissions of %member%` | `discord permissions of %member%` | Effective permissions, read-only. |
| `permissions of %member/role% in %channel%` | `discord permissions of %member/role% in %guildchannel%` | Effective permissions, read-only. |
| `add ... to permissions of ... in ...` | `(allowed\|denied) discord permissions of %member/role% in %guildchannel%` | Pick the side explicitly. |

### Members, roles and channels

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `%user% in [the] [guild] %guild%` | `member of %user% in [the] [guild] %guild%` | The V4 shape swallowed every "X in Y". |
| `discord name of %guild%` | `name of %guild%` | Same for every entity: it is Skript's `name`. Settable on guilds, roles, channels and emotes. |
| `[discord] (public\|everyone) role` | `everyone role of %guild%` | |
| `boost[(ing\|er)] (amount\|number\|size)` | `boost count of %guild%` | `boost tier`, `boost role` and `boosters` lose the `ing`/`er` forms. |
| `[discord] boost[ing] date` | `boost date of %member%` | |
| `[channel] parent` | `category of %standardguildchannel%` | |
| `[channel] max[imum] user[s]` | `user limit of %audiochannel%` | |
| `channel name` | `name of %channel%` | Settable on a live channel. |
| `[channel] slow[( \|-)]mode` | `slowmode of %slowmodechannel%` | Settable on a live channel. |
| `[channel] jump url` | `jump url of %guildchannel%` | |
| `move [the] [discord] role %role% above/under/up/down` | same words | Unchanged to write; moving next to the highest or lowest role is now a no-op instead of an error. |

!!! warning "Role moves can still be refused"
    A jump across many positions at once can be refused by Discord with *could not be moved due
    to hierarchical power*. Move the role in smaller steps.
