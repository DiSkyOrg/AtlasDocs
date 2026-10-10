---
title: AutoMod
icon: shield-check
description: Create, edit and watch Discord's AutoMod rules from a script.
tags: [automod, moderation, discord]
order: 6
---

AutoMod is Discord's built-in filter: a rule looks for something in messages or member profiles
and responds on its own, even when the bot is offline. This section covers creating rules,
editing the ones a guild already has, and reacting when one fires. You're assumed to have a bot
named `"my-bot"` logged in (see [Starting a bot](doc:getting-started/starting-a-bot)) with
**Manage Server** in the guild, and to know the [builder contract](doc:concepts/builders).

## What a rule is made of

A rule has three parts, each an entity of its own:

| Part | Entity | Answers |
| --- | --- | --- |
| Trigger | [triggerconfig](entity:triggerconfig) | what the rule looks for: keywords, regex patterns, a preset list, mention spam, spam |
| Responses | [automodresponse](entity:automodresponse) | what it does: block the message, send an alert, time the member out, block interactions |
| Rule | [automodrule](entity:automodrule) | its name, when it is checked, who and where it ignores |

You build the trigger and the responses first, hand them to an
[automod rule builder](entity:automodrulebuilder), and read `the build result of` it to create
the rule.

## Reading order

1. [Creating a rule](creating-rules.md): the rule builder, from the minimal rule to a fully
   configured one.
2. [Triggers and responses](triggers-and-responses.md): every trigger kind and its options,
   every response.
3. [Managing rules](managing-rules.md): listing a guild's rules, editing them live, deleting
   them, and the execution event.
