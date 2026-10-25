---
title: Retrieve and create
icon: refresh-cw
description: How DiSky 4's "retrieve ... and store it in" and "create ... and store it in" lines are written in DiSky 5.
tags: [migration, await, builders]
syntaxes:
  - core/effects#effect-await
  - roleaction#result
order: 1
---

This page covers the one change that touches almost every DiSky 4 script: lines that ended in
`and store it in {_var}` are gone. You're assumed to have a DiSky 4 script to port and to have read
what [await](doc:concepts/cache-and-await) and [builders](doc:concepts/builders) are; this page
only maps the old lines onto them.

## Retrieving becomes await

DiSky 4 had one `retrieve ... and store it in` effect per online read. In DiSky 5 the same data
is a plain expression, and the [await](syntax:core/effects#effect-await) effect in front of the
line fetches it from Discord: `await set {_v} to X`. The `[with bot %bot%]` tail disappears too,
because the bot is resolved from the entity you pass.

DiSky 4:

```skript
retrieve user with id "000000000000000000" and store it in {_user}
retrieve member with id "000000000000000000" from event-guild and store it in {_member}
retrieve all bans from event-guild and store them in {_bans::*}
retrieve the owner of event-guild and store it in {_owner}
```

DiSky 5:

```skript
await set {_user} to user with id "000000000000000000"
await set {_member} to member with id "000000000000000000" in event-guild
await set {_bans::*} to bans of event-guild
await set {_owner} to discord owner of event-guild
```

Some reads have a cache side. [`user with id`](syntax:user#user-with-id) and
[`member with id`](syntax:member#member-with-id) answer from the cache without `await` and ask
Discord with it; `bans`, `invites`, `pinned messages` and the rest of the online-only list have no
cache, so they need `await` to parse. Both cases are covered in
[cache and await](doc:concepts/cache-and-await).

| DiSky 4 | DiSky 5 |
| --- | --- |
| `retrieve user with id %string% and store it in %~objects%` | `await set {_u} to user with id %string%` |
| `retrieve member with id %string% from %guild% and store it in ...` | `await set {_m} to member with id %string% in %guild%` |
| `retrieve message with id %string% from %channel% and store it in ...` | `await set {_m} to message with id %string% in %messagechannel%` |
| `retrieve last %number% messages of %channel% and store them in ...` | `await set {_m::*} to the last %number% messages of %messagechannel%` |
| `retrieve pinned messages of %channel% and store them in ...` | `await set {_p::*} to pinned messages of %messagechannel%` |
| `retrieve bans from %guild% and store them in ...` | `await set {_b::*} to bans of %guild%` |
| `retrieve the owner of %guild% and store it in ...` | `await set {_o} to discord owner of %guild%` |

`owner of` is Skript's own expression, which is why the DiSky 5 name carries the word
`discord`. Retrieving an invite by id and the per-role member counts have no DiSky 5 equivalent:
read `invites of` the guild and filter.

## Creating becomes a builder

A DiSky 4 `create ... and store it in` line, or a `create` section, filled a request and sent it
in one go. In DiSky 5 you make a builder, set its properties one line each, then read
[`the build result of`](syntax:roleaction#result) it with `await`: that last line is the only one
that talks to Discord. Everything Discord freezes at creation (a role's name and guild, a
thread's parent) moves into the constructor.

DiSky 4:

```skript
set {_a} to a new text channel action in event-guild
set channel name of {_a} to "support"
set channel topic of {_a} to "Ask here"
set channel parent of {_a} to {_category}
create the action {_a} and store the channel in {_channel}
```

DiSky 5:

```skript
set {_b} to a new text channel builder named "support" in event-guild
set topic of {_b} to "Ask here"
set category of {_b} to {_category}
await set {_channel} to the build result of {_b}
```

A builder's properties are write-only and it builds once per read, so keep the constructor, the
setters and the `await` line together; the contract is on the [builders](doc:concepts/builders)
page.

| DiSky 4 | DiSky 5 constructor |
| --- | --- |
| `a new role in %guild%` (section) / `a new role action in %guild%` | `a new role builder named %string% in %guild%` |
| `a new text channel action in %guild%` (also voice, category, forum, news, stage) | `a new text channel builder named %string% in %guild%` |
| `create thread named %string% in %channel% and store it in ...` | `a new thread builder named %string% in %threadcontainer%` |
| `create private thread named %string% in %channel% ...` | `a new private thread builder named %string% in %threadcontainer%` |
| `create thread named %string% ... with message %message% ...` | `a new thread builder named %string% from %message%` |
| `create post in %forumchannel% named %string% with message %string% ...` | `a new post builder named %string% with message content %string% in %forumchannel/mediachannel%` |
| `create invite in %guild/channel% with max uses %number% and store it in ...` | `a new invite builder in %guildchannel%`, then `set invite max uses of {_b} to %number%` |
| `create scheduled event named %string% in %guildchannel% at %date% and store it in ...` | `a new scheduled event builder named %string% in %guildchannel% starting at %date%` |
| `create emote named %string% with url %string% in %guild% and store it in ...` | `a new emote builder named %string% with image %string% in %guild%` |

Two cases change shape more than the rest. An invite lives in a channel now, so
`create invite in event-guild` has no direct form; pick a channel. And the emote image is read
when the builder is built, from a URL, a file path or a file upload alike.

```skript
# DiSky 4: create invite in event-channel with max uses 10 and store it in {_inv}
set {_b} to a new invite builder in event-channel
set invite max uses of {_b} to 10
await set {_inv} to the build result of {_b}
```

The section-style creations follow the same rule: the section body becomes one `set` line per
entry, and the closing `and store it in` becomes the `await` line. A DiSky 4 AutoMod rule section
becomes a `new automod rule builder`, a trigger config and response expressions (see
[creating a rule](doc:automod/creating-rules)); the welcome screen section becomes a
`new welcome screen builder` followed by `update the welcome screen using` (see
[the welcome screen](doc:guilds/welcome-screen)). Neither has a `build result of` to store.

## Keeping a sent message

DiSky 4 let `post` and `reply with` hand back the message they sent. DiSky 5 has no
`and store it in` on any effect, and neither does the webhook `post`. To keep the sent message,
build a message yourself: the message builder is the one builder whose build result is the
message that was just sent.

DiSky 4:

```skript
create a new message and store it in {_msg}:
    set the content of the message to "hello world"
    add {_embed} to the embeds of message
post {_msg} to event-channel and store it in {_sent}
```

DiSky 5:

```skript
set {_b} to a new message with content "hello world" in event-channel
add {_embed} to embeds of {_b}
await set {_sent} to the build result of {_b}
```

The channel is part of the constructor, so the message goes out on the `await` line and
`{_sent}` is a regular message you can `edit`, react to or pin. A reply is the same builder with
`set referenced message of {_b} to event-message`. When you do not need the message back, plain
`post "hello" to event-channel` and `reply with "hello"` are unchanged.

| DiSky 4 | DiSky 5 |
| --- | --- |
| `post %string% to %channel% and store it in {_m}` | `await set {_m} to the build result of (a new message with content %string% in %messagechannel%)` |
| `post %embed% to %channel% and store it in {_m}` | `await set {_m} to the build result of (a new message with embed %embedbuilder% in %messagechannel%)` |
| `reply with %string% and store it in {_m}` | the same builder in `event-channel`, plus `referenced message` |
| `reply with hidden ... and store it in {_m}` | no replacement: a hidden reply cannot be captured |

## Retrieving an event value

`retrieve event-value "member" and store it in {_m}` is gone. A value that needs Discord, such as
a member that has to be fetched, is fetched before the event fires and exposed as a plain `event-` value,
so you read `event-member` directly with no `await`. See
[events](doc:migration/events) for the full mapping and
[events](doc:concepts/events) for how values reach a handler.

```skript
on member joined:
    send "Welcome %event-member%" to console
```

## Errors you may see

A DiSky 4 line ported halfway fails at load. These are the messages DiSky 5 prints.

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *the 'bans' property is online-only and requires 'await' to be read* | A retrieve-only property was read without `await` | Write `await set {_b::*} to bans of event-guild` |
| *the 'message with id' getter is online-only and requires 'await'* | `message with id` was used without `await` | Prefix the line with `await` |
| *building talks to Discord, so this requires 'await'* | `the build result of` a builder was read without `await` | Write `await set {_x} to the build result of {_b}` |
| *Can't understand this condition/effect: retrieve ...* | The old `retrieve ... and store it in` effect no longer exists | Rewrite it as `await set` |
| *Can't understand this condition/effect: create ...* | The old `create ... and store it in` effect no longer exists | Use a builder and `the build result of` |
