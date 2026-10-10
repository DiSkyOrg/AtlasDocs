---
title: Creating a rule
icon: shield-plus
description: Build an AutoMod rule from a trigger and its responses, then create it on Discord.
tags: [automod, builder]
syntaxes:
  - automodrulebuilder#new-message-builder
  - automodrulebuilder#new-profile-builder
  - automodrulebuilder#result
order: 1
---

This page covers the automod rule builder: the two kinds of rule, the properties a rule takes,
and the build. You're assumed to have a bot named `"my-bot"` logged in with **Manage Server**,
and to know the [builder contract](doc:concepts/builders).

## How a rule is created

A rule is created in four steps: make a trigger, make the responses, put both on a builder,
then read [`the build result of`](syntax:automodrulebuilder#result) the builder under `await`.
The builder's constructor takes the name, the guild and the trigger, because Discord freezes
them at creation.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!no-invites":
        set {_t} to a new automod keyword trigger with the keywords "*discord.gg*"
        set {_b} to a new automod rule builder named "No invites" in event-guild for messages using {_t}
        add a new automod response blocking the message to automod responses of {_b}
        await set {_rule} to the build result of {_b}
        reply with "created rule %discord id of {_rule}%"
```

What comes back is a live [automod rule](entity:automodrule): read its properties or
[edit it](doc:automod/managing-rules) like any other entity. Building the same builder twice
creates two rules.

syntax: automodrulebuilder#result compact

## Message rules and profile rules

Discord checks a rule at one moment, chosen at creation and never changed afterwards:

| Constructor | Checked when | Accepted triggers |
| --- | --- | --- |
| [`... for messages using %triggerconfig%`](syntax:automodrulebuilder#new-message-builder) | a member sends a message | every kind |
| [`... for member profiles using %triggerconfig%`](syntax:automodrulebuilder#new-profile-builder) | a member changes their username, nickname or bio | keyword triggers only |

A profile rule gets the *block member interaction* response added for you, which is the only
response Discord allows on it.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!clean-names":
        set {_t} to a new automod keyword trigger with the keywords "*admin*"
        set {_b} to a new automod rule builder named "No fake staff" in event-guild for member profiles using {_t}
        await set {_rule} to the build result of {_b}
```

syntax: automodrulebuilder#new-message-builder compact

## Options

Every property of the builder is write-only; read them back on the built rule.

| Property | Default | Accepted values |
| --- | --- | --- |
| [enabled](syntax:automodrulebuilder#enabled) | `true` | `true`, `false` |
| [automod responses](syntax:automodrulebuilder#automod-responses) | none (profile rules: block interaction) | [responses](doc:automod/triggers-and-responses) |
| [exempt roles](syntax:automodrulebuilder#exempt-roles) | none | up to 20 roles |
| [exempt channels](syntax:automodrulebuilder#exempt-channels) | none | up to 50 channels |
| [trigger config](syntax:automodrulebuilder#trigger-config) | the constructor's trigger | a trigger of the same kind |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!strict-words":
        set {_t} to a new automod keyword trigger with the keywords "badword" and "*worse*"
        set allow list of {_t} to "badwordle"
        set {_b} to a new automod rule builder named "Words" in event-guild for messages using {_t}
        set automod responses of {_b} to (a new automod response blocking the message)
        add (a new automod response sending an alert to the channel event-channel) to automod responses of {_b}
        add (a new automod response timing the member out for 10 minutes) to automod responses of {_b}
        add role with id "000000000000000000" to exempt roles of {_b}
        set enabled of {_b} to true
        await set {_rule} to the build result of {_b}
```

!!! warning "One rule per guild for some triggers"
    Discord allows a single rule per guild for the **preset**, **spam** and **mention spam**
    triggers, and for member profile rules. A second one is refused with
    *[50035] Invalid Form Body*. List the guild's rules first and
    [edit the existing one](doc:automod/managing-rules) instead.

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *[50035] Invalid Form Body* followed by the offending field | A one-per-guild trigger already has a rule, or a value is out of Discord's range | Edit the existing rule; check the field named in the message |
| *[50035] Invalid Form Body* naming `actions` | No response, or a response the trigger does not allow (a timeout on a spam rule) | See the response table in [triggers and responses](doc:automod/triggers-and-responses) |
| *building talks to Discord, so this requires 'await'* (parse error) | `the build result of` was read without `await` | Write `await set {_rule} to the build result of {_b}` |
| A *Discord error* naming **Missing Permissions** | The bot lacks **Manage Server** | Grant it |

entity: automodrulebuilder
