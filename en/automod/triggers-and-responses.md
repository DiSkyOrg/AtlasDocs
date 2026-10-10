---
title: Triggers and responses
icon: list-filter
description: Every AutoMod trigger kind with its options, and every response a rule can take.
tags: [automod, triggers, responses]
syntaxes:
  - triggerconfig#new-keyword-trigger
  - triggerconfig#new-preset-trigger
  - triggerconfig#new-mention-spam-trigger
  - automodresponse#new-block-message
order: 2
---

This page lists what an AutoMod rule can look for and what it can do about it. Both are plain
values: build them, tune them, then give them to a [rule builder](doc:automod/creating-rules) or
to an [existing rule](doc:automod/managing-rules). You're assumed to have a bot named `"my-bot"`
logged in.

## How triggers work

A trigger is created by one of five expressions, one per kind. Its options are write-only
properties, and each one only applies to the kinds listed next to it: setting
`filtered keywords` on a mention spam trigger is a readable error, not a silent no-op.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!words":
        set {_t} to a new automod keyword trigger with the keywords "badword"
        add "*worse*" to filtered keywords of {_t}
        set allow list of {_t} to "badwordle"
        set {_b} to a new automod rule builder named "Words" in event-guild for messages using {_t}
        add a new automod response blocking the message to automod responses of {_b}
        await set {_rule} to the build result of {_b}
```

syntax: triggerconfig#new-keyword-trigger compact

## Trigger kinds

| Kind | Created with | One per guild |
| --- | --- | --- |
| Keyword | [`a new automod keyword trigger [with the keywords %strings%]`](syntax:triggerconfig#new-keyword-trigger) | no |
| Pattern | [`a new automod pattern trigger with the regex patterns %strings%`](syntax:triggerconfig#new-pattern-trigger) | no |
| Preset | [`a new automod preset trigger with the presets %keywordpresets%`](syntax:triggerconfig#new-preset-trigger) | yes |
| Mention spam | [`a new automod mention spam trigger with a limit of %number%`](syntax:triggerconfig#new-mention-spam-trigger) | yes |
| Spam | [`a new automod spam trigger`](syntax:triggerconfig#new-spam-trigger) | yes |

Keywords accept a `*` wildcard at the start, the end or both (`"*bad*"` matches inside a word).
Patterns are regular expressions in Rust syntax, 10 patterns of 260 characters at most. A keyword
and a pattern trigger are the same Discord kind: a keyword trigger can also hold patterns, and the
reverse; it needs at least one of either when the rule is built.

The presets are Discord's maintained word lists: `profanity`, `sexual content` and `slurs`.

## Trigger options

| Property | Applies to | Accepted values |
| --- | --- | --- |
| [filtered keywords](syntax:triggerconfig#filtered-keywords) | keyword, pattern | texts, `set` or `add` |
| [filtered patterns](syntax:triggerconfig#filtered-patterns) | keyword, pattern | regex texts, `set` or `add` |
| [allow list](syntax:triggerconfig#allow-list) | keyword, pattern, preset | texts that never trigger the rule |
| [presets](syntax:triggerconfig#presets) | preset | `profanity`, `sexual content`, `slurs`; `set`, `add` or `remove` |
| [mention limit](syntax:triggerconfig#mention-limit) | mention spam | 1 to 50 unique mentions |
| [mention raid protection](syntax:triggerconfig#mention-raid-protection) | mention spam | `true`, `false` |

```skript
set {_presets} to a new automod preset trigger with the presets profanity and slurs
add sexual content to presets of {_presets}
set allow list of {_presets} to "scunthorpe"

set {_mentions} to a new automod mention spam trigger with a limit of 5
set mention raid protection of {_mentions} to true
```

syntax: triggerconfig#new-preset-trigger compact
syntax: triggerconfig#new-mention-spam-trigger compact

## Responses

A response is created by one of four expressions and never changes afterwards. A rule holds at
most one response of each type: adding a second one of the same type replaces the first.

| Response | Created with | Allowed on |
| --- | --- | --- |
| Block the message | [`a new automod response blocking the message [with the custom message %string%]`](syntax:automodresponse#new-block-message) | message rules |
| Send an alert | [`a new automod response sending an alert to the channel %standardguildmessagechannel%`](syntax:automodresponse#new-send-alert) | message rules |
| Time the member out | [`a new automod response timing the member out for %timespan%`](syntax:automodresponse#new-timeout) | keyword and mention spam rules |
| Block member interactions | [`a new automod response blocking the member interactions`](syntax:automodresponse#new-block-interaction) | member profile rules (added for you) |

The custom message of a blocked message is shown to its author, 150 characters at most. A
timeout lasts up to 28 days.

```skript
set {_block} to a new automod response blocking the message with the custom message "Keep it clean"
set {_alert} to a new automod response sending an alert to the channel event-channel
set {_mute} to a new automod response timing the member out for 5 minutes
set automod responses of {_b} to {_block}, {_alert} and {_mute}
```

A response reads back through [response type](syntax:automodresponse#response-type),
[response message](syntax:automodresponse#response-message),
[response channel](syntax:automodresponse#response-channel) and
[response timeout](syntax:automodresponse#response-timeout); each is none when it does not apply
to the response's type. `response type` compares against `block message`, `send alert message`,
`timeout` and `block member interaction`.

syntax: automodresponse#new-block-message compact

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *this property only applies to a mention spam trigger, not a keyword one* (and the other kinds) | An option was set on a trigger kind that does not have it | Check the *Applies to* column above |
| *the timeout duration must be greater than 0* | A timeout response was created with a zero duration | Give it a real duration |
| *[50035] Invalid Form Body* naming the trigger | A keyword trigger with no keyword and no pattern, a regex Discord rejects, a limit above 50 | Fix the field named in the message |

entity: triggerconfig
