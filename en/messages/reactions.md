---
title: Reactions
icon: smile-plus
description: React to a message, remove a reaction, and read the reactions Discord tracks on it.
tags: [messages, reactions]
syntaxes:
  - message#react
  - emote#suppress-reactions
  - message#reactions
order: 5
---

This page covers adding a reaction to a message, removing one, the events that fire when a
user reacts, and reading the reactions already on a message. You're assumed to have a bot
named `"my-bot"` logged in and to know how to [send a message](doc:messages/sending-messages).

## How reactions work

[`react to`](syntax:message#react) adds one or more reactions to a message, as the bot. It
takes a list of unicode emojis, custom emote values, or both mixed together.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!react":
        react to event-message with "✅"
```

Each entry in the list is either a text or an `emote` value. A text is read as a unicode
emoji character, or as the formatted `<:name:id>` (or `<a:name:id>` for an animated one) form
of a custom emote; an `emote` value reacts with that custom emote directly, and is the safer
choice since it never depends on getting the formatted text right. Get one from `emojis of`
a guild (cached) or `mentioned emotes of` a message; `await set` it from `emotes of` a guild
when you need the fresh list (see [cache and await](doc:concepts/cache-and-await)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!react-emote":
        set {_emote} to first element of (emojis of event-guild)
        react to event-message with {_emote}
        react to event-message with ("👍" and {_emote})
```

syntax: message#react compact

## Removing reactions

[`suppress`](syntax:emote#suppress-reactions) removes a reaction from a message: named alone
it removes the bot's own reaction, named with a user it removes that user's.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!unreact":
        set {_emote} to first element of (emojis of event-guild)
        suppress {_emote} from event-message
        suppress {_emote} of event-user from event-message
```

!!! warning "Only a custom emote value works here"
    `suppress` takes an `emote` value, not a text: there is no way to hand it a raw unicode
    emoji like `"✅"`. Get the emote from `emojis of` the guild or `mentioned emotes of` the
    message, as above. There is also no effect to clear every reaction from a message at once
    in v5; `suppress` always targets one emote (and optionally one user) per line.

syntax: emote#suppress-reactions compact

## Reaction events

[`on reaction add`](event:events#reaction-add) and
[`on reaction remove`](event:events#reaction-remove) fire per reaction; `on reaction remove
all` fires once when every reaction is cleared from a message at once. `reaction message` is
fetched from Discord before the trigger starts, so it never needs `await` (see
[cache and await](doc:concepts/cache-and-await)).

| Event | Values |
| --- | --- |
| `on reaction add` | `event-channel`, `event-guild`, `event-member`, `event-user`, `reaction message` |
| `on reaction remove` | `event-channel`, `event-guild`, `event-member`, `event-user`, `reaction message` |
| `on reaction remove all` | `event-channel`, `event-guild`, `reaction message` |

```skript
on reaction add seen by "my-bot":
    send "%event-user% reacted to '%discord content of reaction message%'" to console
```

v5 has no `Emote` type for the reaction itself yet, so none of the three events tell you
which emoji was added or removed; only who reacted, and on which message.

event: events#reaction-add compact

## Reading reactions

[`reactions of`](syntax:message#reactions) a message returns one element per distinct emoji
reacted with. None of its properties are exposed in v5 (not even the emoji or the count), so
the list is only useful for its size.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!reaction-count":
        reply with "%size of reactions of event-message% distinct reaction(s)"
```

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *[10014] Unknown Emoji* | `react to` was given a custom emote that no longer exists, or an unformatted custom emote id | Use a fresh `emote` value from `emojis of`/`mentioned emotes of`, not a hand-written id |
| *[50013] Missing Permissions* | The bot's role lacks **Add Reactions** in that channel | Grant **Add Reactions** to the bot's role |
