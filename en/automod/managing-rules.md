---
title: Managing rules
icon: shield-ellipsis
description: List a guild's AutoMod rules, edit them live, delete them, and react when one fires.
tags: [automod, moderation, events]
syntaxes:
  - guild#automod-rules
  - automodrule#automod-rule-with-id
  - automodrule#exempt-roles
order: 3
---

This page covers the rules that already exist on a guild, whether a script or a moderator made
them: reading them, changing them, deleting them, and the event that fires when one acts. You're
assumed to have a bot named `"my-bot"` logged in with **Manage Server**, and to know the
[three `await` rules](doc:concepts/cache-and-await).

## Reading a guild's rules

[`automod rules of %guild%`](syntax:guild#automod-rules) lists every rule of a guild, and
[`automod rule with id %string% in %guild%`](syntax:automodrule#automod-rule-with-id) fetches one.
DiSky keeps no AutoMod cache, so both ask Discord and both require `await`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!rules":
        await set {_rules::*} to automod rules of event-guild
        loop {_rules::*}:
            reply with "%name of loop-value%: %automod trigger type of loop-value%, enabled %enabled of loop-value%"
```

What you get is a snapshot taken at that moment. Read a rule again after editing it to see the
new state.

| Property | Returns |
| --- | --- |
| [name](syntax:automodrule#name) | the rule's name |
| [enabled](syntax:automodrule#enabled) | whether the rule is enforced |
| [automod event type](syntax:automodrule#automod-event-type) | `message send` or `member update` |
| [automod trigger type](syntax:automodrule#automod-trigger-type) | `keyword`, `spam`, `keyword preset`, `mention spam` or `member profile keyword` |
| [filtered keywords](syntax:automodrule#filtered-keywords), [filtered patterns](syntax:automodrule#filtered-patterns), [allow list](syntax:automodrule#allow-list) | the keyword trigger's lists |
| [presets](syntax:automodrule#presets) | the preset trigger's lists |
| [mention limit](syntax:automodrule#mention-limit), [mention raid protection](syntax:automodrule#mention-raid-protection) | the mention spam trigger's settings |
| [exempt roles](syntax:automodrule#exempt-roles), [exempt channels](syntax:automodrule#exempt-channels) | who and where the rule ignores |
| [automod responses](syntax:automodrule#automod-responses) | what the rule does |
| [creator](syntax:automodrule#creator), [creator id](syntax:automodrule#creator-id) | who created it |

syntax: guild#automod-rules compact

## Editing a rule

`name`, `enabled`, `exempt roles`, `exempt channels`, `automod responses` and `trigger config`
are writable on a rule. Every change is sent to Discord at once; put `await` in front to wait for
it before the next line reads the rule again.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!pause-rules":
        await set {_rules::*} to automod rules of event-guild
        loop {_rules::*}:
            await set enabled of loop-value to false
            await add event-channel to exempt channels of loop-value
```

`add` and `remove` start from the rule as it was read. One `add a and b to ...` line sends both
values together, but two separate `add` lines on the same snapshot each start from that snapshot,
so only the second one survives: read the rule again between them.

[`trigger config`](syntax:automodrule#trigger-config) replaces what the rule looks for. It is
write-only (read the keyword, preset and mention properties instead), and the new trigger must be
of the rule's kind: a keyword rule takes a keyword or pattern trigger, never a preset one.

```skript
set {_t} to a new automod keyword trigger with the keywords "newword"
await set trigger config of {_rule} to {_t}
```

syntax: automodrule#exempt-roles compact

## Deleting a rule

[`destroy`](syntax:core/effects#destroy) deletes a rule.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!drop-rule":
        await set {_rule} to automod rule with id "000000000000000000" in event-guild
        destroy {_rule}
```

!!! danger "Some rules cannot be deleted"
    A community guild must keep its mention spam rule: Discord refuses to delete it. Disable it
    with `set enabled of {_rule} to false` instead.

## When a rule fires

[`on automod execution`](event:events#automod-execution) fires once per response a rule takes:
a rule that blocks the message and sends an alert fires it twice. The bot needs the
`auto_moderation_execution` [intent](doc:getting-started/bot-options) for it.

```skript
on automod execution seen by "my-bot":
    send "%event-user% triggered %automod rule id of event-automod% in %event-channel%" to console
    send "matched '%matched keyword of event-automod%' in: %automod message content of event-automod%" to console
```

`event-automod` carries what was matched. [matched keyword](syntax:automod#matched-keyword) and
[matched content](syntax:automod#matched-content) say what set the rule off,
[automod message content](syntax:automod#automod-message-content) is the whole message (empty
without the `message_content` intent), and `event-automodresponse` is the response being run.

event: events#automod-execution compact

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *requires 'await'* (parse error) | `automod rules of` or `automod rule with id` was read without `await` | Put `await` in front of the line |
| *[50035] Invalid Form Body* naming the trigger | `trigger config` was set to a trigger of another kind | Use a trigger of the rule's kind |
| A *Discord error* when deleting a mention spam rule | The guild is a community guild | Disable the rule instead |

entity: automodrule
