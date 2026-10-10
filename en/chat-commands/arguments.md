---
title: Arguments
icon: list-ordered
description: The argument grammar in a command's header, how each type resolves, and how to read the values in the trigger.
tags: [commands, arguments, types]
syntaxes:
  - core/expressions#expression-discord-command-argument
  - discordcommand#usage
order: 2
---

This page covers the argument spec you write in a [command's](doc:chat-commands/declaring-a-command)
header, the types it accepts, how DiSky resolves each one, and the expressions that read the
values back in the trigger. You're assumed to have a declared command and a bot named `"my-bot"`
logged in.

## How arguments work

Everything after the command name in `discord command <name> <arguments>:` is a list of
`<type>` slots. Discord entities (a user, a role, a channel...) are resolved from a mention, an
id or a name **before the trigger runs**, on a worker thread, so `arg-1` already holds a real
value once your code starts; only the resolution itself can block, never the trigger.

```skript
discord command hello <user> [<n: number = 1>]:
    prefixes: "!"
    usage message: "Usage: %usage of event-discordcommand%"
    trigger:
        reply with "Hello %arg-1% x%{_n}%"
```

| Form | Meaning | Example |
| --- | --- | --- |
| `<type>` | required, unnamed; only readable by position | `<user>` |
| `<name: type>` | required, also readable as `{_name}` | `<amount: number>` |
| `<name: type = default>` | optional; `{_name}` holds `default` when omitted | `<n: number = 1>` |
| `[<...>]` | optional, no default; reads `none` when omitted | `[<who: member>]` |
| plural type | matches a run of tokens; `{_name::*}` (or `arg-N`) holds every resolved value | `<users>` |
| trailing `<text>` | greedy: the raw rest of the line, quotes included | `<text>` |

A required argument can never come after an optional one: DiSky rejects the whole command at
load time (see [Errors you may see](#errors-you-may-see)).

## Argument types

Discord entities resolve through DiSky's own lookup; everything else falls back to Skript's
parser for that type. A plural argument resolves each token on its own, and a token that fails
to resolve is dropped from the list rather than failing the whole command.

| Type word | Resolved from | Notes |
| --- | --- | --- |
| `user` | mention, id or name | an id hits Discord (REST) if the user isn't cached; a name is looked up among the guild's members |
| `member` | mention, id or name | guild only; reads `none` in a DM |
| `role` | mention, id or name | guild only, cache only |
| `guild` | id or name | searched across every guild the bot is in, not only the current one |
| `message` | an id (looked up in the current channel) or a jump link | always hits Discord (REST) |
| `emote` | a custom emoji like `<:name:id>` | a standard Unicode emoji does not resolve |
| `bot` | the name given to `login ... as` | DiSky's own bot registry, not a Discord account |
| `channel` | `<#id>`, an id or a name | guild only, cache only; matches any channel kind |
| `textchannel`, `voicechannel`, `stagechannel`, `newschannel`, `forumchannel`, `mediachannel`, `threadchannel`, `category`, `privatechannel` | same as `channel` | resolved the same way, kept only if the result is that specific kind |

Anything else Skript itself parses in command context (`number`, `text`, `timespan`, `boolean`
and the rest) works the same way, through Skript's own parser for that type.

## Reading arguments

Inside the trigger, and inside `on discord command used` / `on discord command failed`, read an
argument by position, by type, or by name if it has one.

| Expression | Returns |
| --- | --- |
| [`arg-1`](syntax:core/expressions#expression-discord-command-argument) | the first argument's value(s) |
| `the 2nd argument` | the same, by ordinal |
| `last argument` | the last declared argument |
| `arguments` | every argument's value(s), flattened into one list |
| `user argument` | the first argument whose type is `user` |
| `text argument-2` | the second argument whose type is `text` |
| `{_name}` / `{_name::*}` | a named argument's local: a single value, or a list for a plural type |
| `used arguments` | the raw text typed after the command name, unparsed |

```skript
discord command entities <role> <textchannel> [<who: member>]:
    prefixes: "!"
    trigger:
        reply with "role=%arg-1% channel=%arg-2% member=%{_who}%"
```

```skript
discord command many <users>:
    prefixes: "!"
    trigger:
        reply with "%size of arguments% users: %arg-1%"
```

syntax: core/expressions#expression-discord-command-argument compact

## Optional arguments and defaults

A default after `=` can be a literal (`= 1`) or a full expression; it's evaluated fresh each
time the argument is left out. An optional argument without a default simply reads `none`
instead.

`!entities @role #general` (no third word) replies with `role=... channel=... member=<none>`,
since `{_who}` was never set.

## Quoting and greedy text

Everything after the command name is split on whitespace into tokens; a double-quoted group
(`"two words"`) becomes one token, quotes stripped. A trailing single `<text>` argument is the
exception: being greedy, it takes the untouched rest of the line instead, quotes and extra
spaces included.

```skript
discord command echo <text>:
    prefixes: "!"
    trigger:
        reply with "you said: %arg-1%"
```

`!echo a b  "c"` replies `you said: a b  "c"`: the double space and the quote marks survive.

## When arguments are invalid

Parsing runs last, after every check on who and where (see
[restricting a command](doc:chat-commands/restricting-a-command) for the full order): a required
argument that's missing, or one whose every token fails to resolve, fails with `invalid
arguments`. Set a [`usage message`](syntax:discordcommand#usage) to reply automatically;
without one, DiSky sends nothing and only `on discord command failed` sees it.

```skript
discord command hello <user> [<n: number = 1>]:
    prefixes: "!"
    usage message: "Usage: %usage of event-discordcommand%"
    trigger:
        reply with "Hello %arg-1% x%{_n}%"
```

`!hello` alone replies `Usage: hello <user> [<n: number>]` (the default is left out of the
generated form) and fires `on discord command failed` with `failure reason` set to `invalid
arguments`.

syntax: discordcommand#usage compact

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *Unknown type 'x' for an argument of the discord command* | a type word in `<...>` isn't a known Skript or DiSky type | check the words in [Argument types](#argument-types) |
| *A required argument cannot follow an optional one in a discord command* | a required `<...>` sits after `[<...>]` or `<... = default>` | move required arguments first, or make them optional too |
| *'x' is not a valid argument name (it becomes the local variable {_x})* | the `name:` before the type is empty, or contains `{`, `}` or `::` | use a plain word for the name |
| *'x' is not a valid default value for a Y argument* | the text after `=` doesn't parse as that argument's type | give a value the type accepts, or drop the default |

!!! info "Out-of-range arguments show Skript's own message"
    Asking for an index the command doesn't have (`arg-3` on a two-argument command), or a type
    it has none of (`text argument` with no text argument), fails to parse: Skript's own
    `arg-1` matches the same pattern first and rejects it with *"only in the on command
    event"*, not DiSky's own, more precise error.
