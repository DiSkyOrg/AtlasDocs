---
title: Slash options
icon: list-checks
description: Argument types, descriptions and choices, autocomplete, typed options, bounds, and reading an option's value anywhere.
tags: [commands, slash, arguments]
syntaxes:
  - core/expressions#expression-slash-option-value
  - core/effects#effect-return-slash-choices
  - core/expressions#expression-new-typed-slash-option
  - slashoption#new-slash-option
order: 2
---

This page covers what goes inside the `<name: type>` slots of a [slash command](doc:interaction-commands/slash-commands)
header: the type words Discord understands, how to describe an option and give it choices,
autocomplete, and the bounds only a builder option can set. You're assumed to have a bot named
`"my-bot"` logged in and a `slash command` header in front of you.

## How options work

Every `<name: type>` in a `slash command <path> <arguments>:` header is one option. Discord shows
it as a typed field in the client and validates it before the interaction ever reaches the bot, so
`{_name}` already holds a real value, a member, a role, a number, never raw text left to parse.

```skript
slash command mod ban <target: member> [<reason: string>]:
    description: Ban a member
    trigger:
        reply with hidden "Would ban %{_target}% for %{_reason}%"
```

`<target: member>` is required; `[<reason: string>]` is optional and `{_reason}` reads `none` when
the user leaves it out. A required option can never follow an optional one, the same rule the
header itself enforces (see [Slash commands](doc:interaction-commands/slash-commands)). An option takes exactly
one value: there's no plural form, and Discord has no notion of a default, so `<name: type = x>`
isn't valid here the way it is for a [`discord command`](doc:chat-commands/arguments).

## Option types

The type word decides both the Discord option Skript sends and what `{_name}` holds back.

| Type word(s) | Discord type | What `{_name}` holds | Notes |
| --- | --- | --- | --- |
| `string`, `text` | STRING | the text typed | |
| `integer` | INTEGER | a whole number | |
| `number` | NUMBER | a decimal number | |
| `boolean` | BOOLEAN | `true` or `false` | |
| `user` | USER | the Discord user | |
| `member` | USER | the guild member | same USER option, resolved to a member; unavailable outside a guild |
| `role` | ROLE | the role | |
| `mentionable` | MENTIONABLE | a user, member or role | whichever the user picked |
| `attachment` | ATTACHMENT | the uploaded file | |
| `channel`, or a specific kind (`textchannel`, `voicechannel`, `stagechannel`, `newschannel`, `forumchannel`, `mediachannel`, `threadchannel`, `category`, `privatechannel`) | CHANNEL | the channel | a specific kind restricts which channels Discord lets the user pick; see [Bounds and channel kinds](#bounds-and-channel-kinds) |
| `color` | STRING | a Skript colour | built-in autocomplete over colour names |
| `player`, `offlineplayer` | STRING | an online (or offline) player | built-in autocomplete over online player names |
| any Skript enum (`gamemode`, and DiSky's own) | STRING | the enum constant | its constants become fixed choices (25 or fewer), or an autocomplete past that |

The same words also build a
[typed slash option](syntax:core/expressions#expression-new-typed-slash-option) on a builder,
outside a structure's header:

```skript
set {_target} to a new typed member option named "target" with description "Who"
```

syntax: core/expressions#expression-new-typed-slash-option compact

## Describing options

An `arguments:` section on the structure describes each option by name: a plain line for a
one-line description, or a sub-section when an option also needs choices.

```skript
slash command mod ban <target: member> [<reason: string>]:
    description: Ban a member
    arguments:
        target: Who to ban
        reason:
            description: Why
            choices:
                Spam: spam
                Rude: rude
    trigger:
        reply with hidden "Would ban %{_target}% for %{_reason}%"
```

An option left out of `arguments:` entirely, or without a `description:` line, keeps Discord's own
placeholder: *No description provided*. `choices:` is a section of `Name: value` lines, up to 25,
and only valid on a `string`, `integer` or `number` option; the value on the right must parse as
that option's type (a number for `integer` or `number`, anything for `string`). Once an option has
choices, Discord only lets the user pick from that list.

## Autocomplete

An argument with an `on completion request:` section instead of `choices:` is flagged
auto-complete: the section runs on every keystroke, and
[`return choices`](syntax:core/effects#effect-return-slash-choices) answers it and stops the
trigger there, up to 25 suggestions.

```skript
slash command fruit <name: string>:
    description: Pick a fruit
    arguments:
        name:
            description: The fruit
            on completion request:
                send "[CMD] completion for %current argument%" to console
                return choices "apple", "banana" and "cherry"
    trigger:
        reply with hidden "You picked %{_name}%"
```

`current argument` names the option Discord is asking about (useful once a command has more than
one auto-complete option); `return choices` takes plain texts or numbers, used as both the label
and the value, or `a new choice named "..." with value ...` when they need to differ.

Without an `on completion request:` section, a typed option (`color`, `player`, `offlineplayer`,
or an enum past 25 constants) still autocompletes on its own, from its built-in list. An option
can't have both `choices:` and `on completion request:` (see [Errors below](#errors-you-may-see)).

A builder-declared option with `auto complete` set has no structure section to answer it in: the
generic [`on slash completion`](event:events#slash-command-completion-event) event plus
`return choices` handles it instead, the same way [command builders](doc:interaction-commands/command-builders)
answer their commands generically.

syntax: core/effects#effect-return-slash-choices compact

## Reading options anywhere

[`slash option "name"`](syntax:core/expressions#expression-slash-option-value) reads any option by
name, structure or builder, wherever a slash interaction is in scope.

| Expression | Returns |
| --- | --- |
| `{_name}` | a named option's value, only for a command declared by a `slash command` header |
| `arg-1` / `member argument` | positional or by-type reads, the same idioms as a [`discord command`](doc:chat-commands/arguments), only for a structure-declared command |
| `slash option "name"` | the value, typed as Discord sent it |
| `slash option "name" as member` | the same option's value, resolved to the guild member |
| `slash option "name" as <optiontype>` | the same option's value, read back as a specific Discord type (`string`, `integer`, `number`, `boolean`, `user`, `channel`, `role`, `mentionable`, `attachment`) |

```skript
on slash command:
    set {_target} to slash option "target"
    send "%used slash command% option target=%{_target}%" to console
```

`slash option` only resolves inside [`on slash command`](event:events#slash-command),
[`on slash completion`](event:events#slash-command-completion-event) or
[`on slash command cooldown`](event:events#application-command-cooldown); used elsewhere it's a
load error. It works the same whether the command behind it came from a `slash command` structure
or a builder, which is why the generic events see both.

syntax: core/expressions#expression-slash-option-value compact

## Bounds and channel kinds

A `slash command` header's `<name: type>` has no entry for bounds: a numeric range, a text length
or a restricted set of channel kinds only exist on a builder option, `a new <type> slash option`
or `a new typed ... slash option`.

```skript
set {_sides} to a new integer option named "sides" with description "How many sides"
set min value of {_sides} to 2
set max value of {_sides} to 100
```

| Property | Default | Accepted values |
| --- | --- | --- |
| [min value](syntax:slashoption#min-value) | none | any number, `integer` and `number` options only |
| [max value](syntax:slashoption#max-value) | none | any number, `integer` and `number` options only |
| [min length](syntax:slashoption#min-length) | none | `0` to `6000`, `string` options only |
| [max length](syntax:slashoption#max-length) | none | `1` to `6000`, `string` options only |
| [channel types](syntax:slashoption#channel-types) | empty (any kind) | one or more channel kinds, `channel` options only |

`set channel types of {_opt} to text and voice` narrows a `channel` option the same way declaring
it as `textchannel` does, but lets it accept more than one kind. See
[Command builders](doc:interaction-commands/command-builders) for building and pushing the option itself.

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *Unknown type 'x' for an argument of the slash command* | a type word in `<...>` isn't a known Skript or DiSky type | check the words in [Option types](#option-types) |
| *The argument 'x' has more than 25 choices; use 'on completion request' instead* | a `choices:` sub-section lists more than 25 lines | switch to [autocomplete](#autocomplete) |
| *The argument 'x' cannot have both choices and an 'on completion request' section* | an argument's sub-section has both | keep only one |
| *The argument 'x' is a \<type> option, which cannot have choices* | `choices:` is set on a `boolean`, `user`, `member`, `role`, `mentionable`, `attachment` or `channel` argument | only `string`, `integer` and `number` options take choices |
| *'x' is not a valid \<type> for the choice 'y'* | a choice's value doesn't parse as its option's type | give an `integer`/`number` choice a number, a `string` choice any text |
| *a \<type> option cannot have choices* / *a \<type> option cannot have autocomplete* | a builder option's `choices` or `auto complete` is set on a type that doesn't support it | same restriction, on the builder side |
| *only integer and number options have a minimum value* (same for maximum) | `min value` or `max value` is set on a non-numeric builder option | only `integer` and `number` options accept bounds |
| *A slash option can only be read in a slash command, slash completion or slash command cooldown event* | `slash option "..."` is used outside those three events | move the read into one of them |

entity: slashoption
