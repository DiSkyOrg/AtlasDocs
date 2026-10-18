---
title: Events
icon: zap
description: What a DiSky event handler is made of, which values it exposes, and what it cannot do.
tags: [events, concepts]
syntaxes:
  - events#message-receive
  - events#button-click
  - events#member-nickname-event
order: 6
---

This page covers the shape of a DiSky event handler: the `on ...:` line and its `seen by`
filter, the `event-` values and named expressions every handler can read, how values fetched
from Discord reach your code, and why Discord events cannot be cancelled. You're assumed to have
a bot logged in as `"my-bot"` (see [Starting a bot](doc:getting-started/starting-a-bot)).

## How an event handler works

A DiSky event is a regular Skript event: `on <event>:` followed by a trigger. Every event
pattern accepts an optional `seen by "<bot name>"` suffix, so `on message received seen by
"my-bot":` only fires for the bot logged in under that name (see
[multiple bots](doc:getting-started/multiple-bots)); without it, the handler fires for every
bot. Whatever the event, the bot that saw it is `event-bot`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!ping":
        reply with "Pong from %event-bot% in %event-channel%!"
```

DiSky receives the event on Discord's own thread, filters it by bot, builds the event values,
then hands the trigger to the main server thread: your handler runs on the main thread, like
any Bukkit event, so it can touch players, blocks and variables freely. Effects such as
[reply with](syntax:core/effects#effect-reply-with) block the trigger until Discord confirms,
which is covered in [cache and await](doc:concepts/cache-and-await).

syntax: core/effects#effect-reply-with compact
event: events#message-receive compact

## Event values

The entities involved in an event are exposed the Skript way, as `event-<type>`. Which ones
exist depends on the event; the generated [events reference](/events) lists them per event.
A value that does not apply is none, not an error: `event-guild` and `event-member` are none
when a message or reaction comes from a private channel.

| Value | Type | Typical events |
| --- | --- | --- |
| `event-bot` | bot | every event |
| `event-guild` | guild | anything that happens in a guild |
| `event-channel` | channel | messages, reactions, channel updates, voice |
| `event-user` | user | messages, reactions, bans, user updates |
| `event-member` | member | joins, leaves, roles, nicknames, voice |
| `event-message` | message | message received or edited, components, polls |
| `event-role` | role | role created, deleted or updated |
| `event-button` | button | button clicked |
| `event-dropdown` | dropdown | dropdown clicked |

A channel is registered once per channel type, so the same event also answers to
`event-textchannel`, `event-voicechannel`, `event-threadchannel`, `event-forumchannel`,
`event-category` and the other channel types: the typed form is set when the channel really is
of that type and none otherwise. Use `event-channel` when the type does not matter.

```skript
on message received seen by "my-bot":
    if event-threadchannel is set:
        reply with "This message was sent in a thread"
```

## Named event expressions

Some event data has no `event-<type>` form, because it is plain text, a list, or would clash
with another value of the same type. Those are exposed as expressions with their own name,
valid only inside their event: using one anywhere else is a parse error saying the expression
can only be used in that event.

```skript
on button clicked seen by "my-bot":
    if click id is "confirm":
        reply with "Confirmed by %event-user%"
```

| Expression | Event | Returns |
| --- | --- | --- |
| `click id` | `on button clicked` | the custom id of the clicked button |
| `selected values` | `on dropdown clicked` | the chosen options, as a list of texts |
| `execute command` | `on slash command received` | the full name of the command |
| `added roles` | `on role added` | the roles given to `event-member`, as a list |
| `reaction message` | `on reaction add` | the message that received the reaction |

event: events#button-click compact

## Old and new values

Update events fire after the change and expose both sides of it: the current value under a
plain name, the previous one under the same name prefixed with `old` (`past` and `previous`
are accepted too). The entity itself is already updated, so `nickname of event-member` reads
the new value; only the `old` expression still knows the previous one.

```skript
on guild member nickname change seen by "my-bot":
    send "%event-member%: '%old member nickname%' -> '%member nickname%'" to console
```

| Event | New value | Old value |
| --- | --- | --- |
| `on guild member nickname change` | `member nickname` | `old member nickname` |
| `on discord user name change` | `name` | `old name` |
| `on discord user online status change` | `online status` | `old online status` |
| `on discord scheduled event name change` | `scheduled event name` | `old scheduled event name` |

event: events#member-nickname-event compact

## Values fetched from Discord

A few values are not part of what Discord sends with the event: the message behind a
reaction, or the user and member behind a poll vote. DiSky fetches them from Discord on a
background thread before the trigger starts and stores them on the event, so inside the
handler they are ordinary values.

```skript
on reaction add seen by "my-bot":
    send "%event-user% reacted to '%discord content of reaction message%'" to console
```

The [await rules](doc:concepts/cache-and-await) apply to what you do inside the handler,
never to the event's own values: an event value never needs `await`.

## Events are not cancellable

An event that comes from Discord cannot be cancelled: Discord has already applied the change
by the time your handler runs. Writing `cancel event` in such a handler does not load; Skript
reports at parse time that the event cannot be cancelled. React instead of cancelling: delete
the message, remove the role, kick the member.

```skript
on message received seen by "my-bot":
    if discord content of event-message contains "spam":
        destroy event-message
```

The exceptions are the events DiSky fires itself, before running a command it declared:
[`on discord command used`](event:events#discord-command-used), where cancelling stops the
command (see [listing and events](doc:chat-commands/listing-and-events)), and
[`on slash command cooldown`](event:events#application-command-cooldown), where cancelling
lets the command run despite its cooldown (see [command settings](doc:interaction-commands/command-settings)).
[`on disky exception`](event:events#disky-error-event) is cancellable too: cancelling it keeps
an uncaught error out of the console (see [errors](doc:concepts/errors#handling-every-uncaught-error)).

## Event families

DiSky fires 123 events, generated from the same descriptors as the
[events reference](/events), which stays the complete list. They fall into a dozen families;
the values named below are the ones most of the family shares.

| Family | Examples | Typical values |
| --- | --- | --- |
| Bot lifecycle | `on ready`, `on guild ready`, `on bot shutdown` | `event-bot`, `event-guild` |
| Messages | `on message received`, `on message edited`, `on message deleted` | `event-message`, `event-channel`, `event-user` |
| Reactions and polls | `on reaction add`, `on message poll vote added` | `reaction message`, `event-user`, `event-member` |
| Commands | `on slash command received`, `on user command received` | `execute command`, `event-user`, `event-channel` |
| Components | `on button clicked`, `on dropdown clicked`, `on modal clicked` | `click id`, `selected values`, `event-message` |
| Members | `on member joined guild`, `on role added`, `on member timeout` | `event-member`, `event-guild` |
| Users | `on discord user name change`, `on discord user typing` | `event-user`, `old name` |
| Guild | `on discord guild ban`, `on discord guild name update` | `event-guild`, `event-user` |
| Channels and threads | `on discord channel create`, `on discord thread join` | `event-channel`, `event-guild` |
| Roles | `on discord guild role created`, `on discord guild role permissions update` | `event-role`, `event-guild` |
| Voice | `on member voice join`, `on discord guild voice muted` | `event-member`, `event-guild` |
| Guild assets | `on discord emoji added`, `on discord guild sticker added`, `on discord scheduled event create` | `event-guild` |
| Errors | `on disky exception` | `event-discorderror`, `error location`, `event-bot` |

!!! tip "Logging while you explore"
    A plain Skript function makes it cheap to check which events fire and what their values
    hold; it is nothing DiSky-specific, and you can drop it once the script is done.

```skript
function writeDebug(event: text, data: text):
    send "[DiSky-evt] %{_event}% -> %{_data}%" to console

on member joined guild seen by "my-bot":
    writeDebug("member join", "member=%event-member% guild=%event-guild%")
```
