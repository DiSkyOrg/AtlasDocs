---
title: Errors
icon: shield-alert
description: What happens when Discord refuses an action, and how try/catch and the last discord error let a script react to it.
tags: [concepts, errors, try, catch]
syntaxes:
  - core/sections#section-try-catch
  - core/expressions#expression-last-discord-error
order: 5
---

This page covers what DiSky does when an action fails, on Discord's side or in your script,
and the two tools you have to react to it: the `try` / `catch` section and
`the last discord error`. You're assumed to have a bot named `"my-bot"` logged in and a guild
where it can act.

## What happens without a try

Every effect that talks to Discord can be refused: the bot lacks a permission, the target
was deleted, the value is out of range. A required value that resolves to nothing (an unset
variable given to `kick`) fails the same way, before anything is sent. In both cases DiSky
prints a readable *Discord error* block to the console and the trigger keeps running: the
failing line does nothing, the lines after it execute normally, nothing crashes.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-nobody":
        discord kick {_nobody}
        reply with "still running: %the last discord error%"
```

The block in the console has the shape below. Its first line carries the error itself,
`[code] meaning` for an error returned by Discord, `Exception: message` for one raised
before the request left; the `at` line points to the script line that failed, then comes the
stack trace of the underlying exception.

```text
[DiSky] ---------------- Discord error ----------------
[DiSky] IllegalArgumentException: the member of 'kick' is not set
[DiSky] at discord kick {_nobody} (errors.sk, line 3)
[DiSky] -----------------------------------------------
```

The error is also remembered in [the last discord error](syntax:core/expressions#expression-last-discord-error),
so the line after the failure can read it. That expression is global: it holds the most
recent error of any bot, caught or not, and is `<none>` until one has happened.

## Catching errors with try

Wrap the lines that may fail in [`try`](syntax:core/sections#section-try-catch) and follow
it with a `catch` naming a list variable. Once the `try` body is over, the errors it produced
are stored in that variable and the `catch` body runs; when nothing failed, the `catch` is
skipped. The `discord` prefix on `kick` is explained [below](#kick-and-skripts-own-kick).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick":
        try:
            discord kick event-member because of "try/catch demo"
        catch {_errors::*}:
            reply with "Could not kick: %{_errors::*}%"
```

Three rules make the section predictable:

- A failing line does not abort the `try` body. The error is buffered and the next line
  runs, so a variable set by a failed builder or getter simply stays unset; check it before
  using it.
- Several failures in one body arrive together in one `catch`, in order, one element per
  failure: `%number of {_errors::*}%` tells how many.
- The buffer belongs to the event being handled, not to a thread. Effects run on a worker
  thread and the trigger continues on the main one; the `catch` still sees every error, and
  two triggers running at the same time never see each other's.

`await` works as usual inside a `try`: a retrieve-only read or a builder result that Discord
refuses lands in the `catch` like an effect would (see
[cache and await](doc:concepts/cache-and-await)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-many":
        try:
            discord kick {_nobody}
            unmute {_nobody2}
        catch {_errors::*}:
            reply with "%number of {_errors::*}% error(s): %{_errors::*}%"
```

Nesting a `try` inside another is not supported: the inner section replaces the buffer of
the event, so errors raised in the outer body before or after the inner one are printed to
the console instead of reaching the outer `catch`. Keep one `try` per block of related lines.

!!! warning "A catch must directly follow its try"
    `catch` has to be the very next section after the `try` it belongs to; any line in
    between is a parse error (*A 'catch' section must directly follow a 'try' section.*). A
    `catch` written without a `try` is accepted and never runs.

### Stopping the trigger

Add `and stop` to the `catch` line to end the trigger once its body has run. Without it, the
trigger continues after the `catch` as if the `try` had succeeded.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-or-stop":
        try:
            discord kick event-member
        catch {_errors::*} and stop:
            reply with "Could not kick, giving up."
        reply with "Kicked %event-member%."
```

syntax: core/sections#section-try-catch compact

## Reading an error

Whether it comes from a `catch` variable or from `the last discord error`, an error is a
`discorderror` with three properties.

| Property | For a Discord refusal | For a script-side failure |
| --- | --- | --- |
| [`error code`](syntax:discorderror#error-code) | Discord's numeric code (`50013`) | `-1` |
| [`error meaning`](syntax:discorderror#error-meaning) | Discord's short label (`Missing Permissions`) | the exception's name (`IllegalArgumentException`) |
| [`error message`](syntax:discorderror#error-message) | the same label as the meaning; for a `50035`, the fields Discord rejected | the full message (`the member of 'kick' is not set`) |

Displayed as text (`%{_errors::*}%`, `%loop-value%`, `%the last discord error%`), an error
prints as `[50013] Missing Permissions` when Discord refused it and as
`IllegalArgumentException: the member of 'kick' is not set` when the script did. Branch on
the code to give a precise answer:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick":
        try:
            discord kick event-member
        catch {_errors::*}:
            if error code of {_errors::1} is 50013:
                reply with "I'm missing the Kick Members permission."
            else:
                reply with "Kick failed: %error meaning of {_errors::1}%"
```

Outside a `try`, [the last discord error](syntax:core/expressions#expression-last-discord-error)
gives the same object for the most recent failure. Since it is global and never cleared,
compare it against what you expect rather than testing whether it is set.

```skript
on ready seen by "my-bot":
    discord kick {_nobody}
    send "code %error code of the last discord error%: %the last discord error%" to console
```

syntax: core/expressions#expression-last-discord-error compact

## Common Discord error codes

The codes below are the ones a moderation or messaging script meets most often; the meaning
column is the exact text `error meaning` returns for them.

| Code | Meaning | Typical cause |
| --- | --- | --- |
| `10003` | Unknown Channel | The channel was deleted, or the id is wrong |
| `10007` | Unknown Member | The user left the guild before the action ran |
| `10008` | Unknown Message | The message was deleted, or the id is wrong |
| `10011` | Unknown Role | The role was deleted, or the id is wrong |
| `10013` | Unknown User | No Discord account has this id |
| `10026` | Unknown Ban | `unban` on a user who is not banned |
| `10062` | Unknown Interaction | The interaction expired (3 seconds to acknowledge, 15 minutes to follow up) |
| `40060` | Interaction has already been acknowledged | A second reply or defer on the same interaction |
| `50001` | Missing Access | The bot cannot see the channel or guild |
| `50006` | Cannot send an empty message | A message with no content, embed, component or file |
| `50007` | Cannot send messages to this user | The user has DMs from this server disabled, or blocked the bot |
| `50013` | Missing Permissions | The bot's role lacks the permission, or sits below the target's highest role |
| `50034` | A Message provided to bulk_delete was older than 2 weeks | Bulk deletion of messages older than 14 days |
| `50035` | Invalid Form Body | A value is out of Discord's limits (text too long, bad id format, a second rule of a one-per-guild AutoMod kind); the error message names each rejected field as `field: reason` |

Discord documents the full list under
[Opcodes and Status Codes](https://discord.com/developers/docs/topics/opcodes-and-status-codes#json).

## `kick` and Skript's own `kick`

Skript ships a `kick %players%` effect, registered before DiSky's `kick %member%`. When the
operand is an untyped variable such as `{_target}`, Skript's effect wins the parse and does
nothing at runtime, silently: no console line, no error to catch. Write
[`discord kick`](syntax:member#kick) when the member comes from a variable; with a typed
value such as `event-member`, both spellings reach DiSky.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-var":
        set {_target} to event-member
        try:
            discord kick {_target} because of "spam"
        catch {_errors::*}:
            reply with "%{_errors::*}%"
```

!!! tip "Prefix moderation effects by habit"
    `discord kick` is always accepted, so using the prefix everywhere costs nothing and
    removes the one case where a failure leaves no trace. Other moderation effects (`ban`,
    `unban`, `mute`, `time out`) have no Skript counterpart and need no prefix.

entity: discorderror
