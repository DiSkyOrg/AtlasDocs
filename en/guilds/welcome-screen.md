---
title: Welcome screen
icon: door-open
description: Read the welcome screen of a community guild and replace its description and channels.
tags: [guild, welcome-screen, builder]
syntaxes:
  - guild#welcome-screen
  - welcomescreenbuilder#new-welcome-screen-builder
  - welcomescreenbuilder#update-welcome-screen
  - welcomechannel#new-welcome-channel
order: 1
---

This page covers the welcome screen: the card a community guild shows to new members, with a
description and up to five recommended channels. You're assumed to have a bot named `"my-bot"`
logged in, a guild with **Community** enabled, and **Manage Server** for the bot if it edits the
screen.

## Reading the welcome screen

[`welcome screen of %guild%`](syntax:guild#welcome-screen) asks Discord for the current screen,
so it requires `await`. What comes back is a snapshot: it does not change when the screen is
edited, read it again for that.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!welcome":
        await set {_screen} to the welcome screen of event-guild
        reply with "%description of {_screen}%"
        loop welcome channels of {_screen}:
            reply with "%welcome channel of loop-value%: %description of loop-value% %emoji of loop-value%"
```

Each entry of `welcome channels` is a `welcomechannel` with three properties:
[welcome channel](syntax:welcomechannel#welcome-channel) (the channel itself, none if the bot
cannot see it), [description](syntax:welcomechannel#description) and
[emoji](syntax:welcomechannel#emoji), the emoji as it renders in a message.

syntax: guild#welcome-screen compact

## Editing the welcome screen

Editing goes through a builder, but not the usual one: the welcome screen already exists, so
there is nothing to build. Create it with
[`a new welcome screen builder for %guild%`](syntax:welcomescreenbuilder#new-welcome-screen-builder),
set what you want to change, then send it with
[`update the welcome screen using %welcomescreenbuilder%`](syntax:welcomescreenbuilder#update-welcome-screen).
That effect waits for Discord, so the next line already sees the new screen.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!set-welcome":
        set {_rules} to a new welcome channel for event-channel with description "Read the rules" with emoji "📜"
        set {_b} to a new welcome screen builder for event-guild
        set welcome screen enabled of {_b} to true
        set description of {_b} to "Welcome to the guild!"
        set welcome channels of {_b} to {_rules}
        update the welcome screen using {_b}
```

Only the properties you set are sent; the others keep their value on Discord.

syntax: welcomescreenbuilder#update-welcome-screen compact

## Options

| Property | Default | Accepted values |
| --- | --- | --- |
| [welcome screen enabled](syntax:welcomescreenbuilder#welcome-screen-enabled) | unchanged | `true`, `false` |
| [description](syntax:welcomescreenbuilder#description) | unchanged | a text |
| [welcome channels](syntax:welcomescreenbuilder#welcome-channels) | unchanged | up to 5 welcome channels; `set`, `add`, `remove`, `delete` |

[`a new welcome channel for %guildchannel% with description %string% [with emoji %emote/string%]`](syntax:welcomechannel#new-welcome-channel)
creates one entry. The description is 42 characters at most, the emoji is optional (a unicode
emoji, an emote, or the `<:name:id>` form of a custom one), and the channel must be a text,
voice, stage, news or forum channel: a category or a thread is refused. An entry never changes
once created; make a new one to change it.

!!! warning "A fresh builder starts empty"
    `welcome channels` on a builder replaces the **whole** list on Discord, and a new builder
    does not start from the current screen. To add one channel to the existing list, read the
    screen first and copy its channels onto the builder, as below.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!add-welcome":
        await set {_screen} to the welcome screen of event-guild
        set {_b} to a new welcome screen builder for event-guild
        set welcome channels of {_b} to welcome channels of {_screen}
        add (a new welcome channel for event-channel with description "Say hi") to welcome channels of {_b}
        update the welcome screen using {_b}
```

`remove` takes an entry and drops every entry pointing to the same channel, whatever its
description. `delete welcome channels of {_b}` empties the list, which clears it on Discord once
the builder is sent.

syntax: welcomechannel#new-welcome-channel compact

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| A *Discord error* when reading the screen | The guild is not a community guild, or has never set up a welcome screen | Enable **Community** in the guild settings |
| *the channel '...' cannot be put on a welcome screen* | The entry points to a category or a thread | Use a text, voice, stage, news or forum channel |
| *[50035] Invalid Form Body* naming `welcome_channels` | More than 5 entries, or a description over 42 characters | Trim the list or the description |
| A *Discord error* naming **Missing Permissions** | The bot lacks **Manage Server** | Grant it |

entity: welcomescreenbuilder
