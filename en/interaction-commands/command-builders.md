---
title: Command builders
icon: puzzle
description: Building slash, user and message commands as plain objects instead of structures, and mixing the two.
tags: [commands, application-commands, builders]
syntaxes:
  - slashcommand#new-slash-command
  - subcommand#new-subcommand
  - subcommandgroup#new-subcommand-group
order: 4
---

This page covers the builder path to an application command: plain objects you assemble in Skript,
as an alternative to [`slash command`](doc:interaction-commands/slash-commands) and [`user command` / `message
command`](doc:interaction-commands/context-commands). You're assumed to have a bot named `"my-bot"` logged in.

## How builders work

A builder is a command object with settable properties: a name, a description, options,
subcommands. It has no `trigger` and nothing reaches Discord until a script pushes it with
`update` or `register`, the same effects a structure uses.

```skript
on guild ready:
    set {_roll} to a new slash command named "roll" with description "Roll a dice"
    set {_sides} to a new integer option named "sides" with description "How many sides"
    set min value of {_sides} to 2
    set max value of {_sides} to 100
    add {_sides} to options of {_roll}

    register the discord command {_roll} in event-guild
```

Unlike DiSky's entity builders elsewhere, there's no separate "build result": the effects above
push the object itself, and `command id of {_roll}` is only set afterwards, once Discord answers.

syntax: slashcommand#new-slash-command compact

## Answering a built command

A builder-declared command has no trigger of its own, so it's answered in the generic
[`on slash command`](event:events#slash-command), matched by name. Read an option with
[`slash option "name"`](doc:interaction-commands/slash-options); an omitted optional option `is not set`.

```skript
on slash command:
    if used slash command is "roll":
        set {_sides} to slash option "sides"
        if {_sides} is not set:
            set {_sides} to 6
        reply with hidden "You rolled %random integer between 1 and {_sides}%"
```

## Properties

Every builder type shares the `applicationcommand` properties below; `slashcommand` and
`slashoption` add their own on top.

| Property | Default | Accepted values |
| --- | --- | --- |
| [name](syntax:applicationcommand#name) | the name given at creation | text, following the same naming rules as the structure it mirrors |
| [command id](syntax:applicationcommand#command-id) | not set | read-only, set once the command is registered |
| [command type](syntax:applicationcommand#command-type) | fixed by how it was created | `"slash"`, `"user"` or `"message"`, read-only |

`enabled for`, `disabled`, `nsfw`, `contexts` and `integration types` also apply to every builder;
see [Command settings](doc:interaction-commands/command-settings).

| Property (slashcommand) | Default | Accepted values |
| --- | --- | --- |
| [description](syntax:slashcommand#description) | the text given at creation | any text |
| [options](syntax:slashcommand#options) | empty | a list of `slashoption` |
| [subcommands](syntax:slashcommand#subcommands) | empty | a list of `subcommand` |
| [subcommand groups](syntax:slashcommand#subcommand-groups) | empty | a list of `subcommandgroup` |

| Property (slashoption) | Default | Accepted values |
| --- | --- | --- |
| [description](syntax:slashoption#description) | the text given at creation | any text |
| [option type](syntax:slashoption#option-type) | fixed by how it was created | read-only |
| [required](syntax:slashoption#required) | `false` | `true` / `false` |
| [auto complete](syntax:slashoption#auto-complete) | `false` | `true` / `false`; string, integer and number options only |
| [choices](syntax:slashoption#choices) | none | up to 25 `slashchoice`; string, integer and number options only |
| [min value](syntax:slashoption#min-value) | none | a number; integer and number options only |
| [max value](syntax:slashoption#max-value) | none | a number; integer and number options only |
| [min length](syntax:slashoption#min-length) | none | `0` to `6000`; string options only |
| [max length](syntax:slashoption#max-length) | none | `1` to `6000`; string options only |
| [channel types](syntax:slashoption#channel-types) | empty (any channel) | a list of channel types; channel options only |

syntax: slashoption#new-slash-option compact

## Subcommands and groups

A `subcommand` is a `/root sub` entry with its own description and options; a `subcommandgroup`
groups several subcommands under `/root group sub`. A slash command has either options or
subcommands (with or without groups), never both.

```skript
on guild ready:
    set {_mod} to a new slash command named "mod" with description "Moderation tools"

    set {_ban} to a new subcommand named "ban" with description "Ban a member"
    add a new user option named "target" with description "Who to ban" to options of {_ban}
    add {_ban} to subcommands of {_mod}

    set {_kick} to a new subcommand named "kick" with description "Kick a member"
    add a new user option named "target" with description "Who to kick" to options of {_kick}
    add {_kick} to subcommands of {_mod}

    register the discord command {_mod} in event-guild
```

`/mod ban` and `/mod kick` above match the same structure-declared shape from [Slash
commands](doc:interaction-commands/slash-commands); a subcommand group adds one more level: build it with `a
new subcommand group named ... with description ...`, add subcommands to it, then add the group to
`subcommand groups of` the command.

syntax: subcommand#new-subcommand compact

## Mixing structures and builders

`structured slash command "mod"` reads a structure-declared command back as the same kind of object
a builder makes: editable, and separate from the `.sk` file that declared it. Localize it, add an
option, then push it like any other object.

```skript
on guild ready:
    set {_mod} to structured slash command "mod"
    localize the description of {_mod} in "fr" to "Outils de modération"
    register the discord command {_mod} in event-guild
```

A structure and a builder can also be pushed side by side, in one call: `update the discord commands
(all structured application commands) and {_roll} in event-guild` replaces every structure-declared
command and adds `{_roll}` in the same PUT. A structure-declared command still runs its own
`trigger`; a builder-declared one only ever answers in the generic event. Both fire the generic
event first, whichever way they were declared.

## Errors you may see

| Message (console) | Cause | Fix |
| --- | --- | --- |
| *'sub_command' is not an option type; use a subcommand or a subcommand group instead* (same wording for `'sub_command_group'`) | a new option was built with a structural type instead of an actual `subcommand` / `subcommand group` | build a `subcommand` or `subcommand group` object, not an option |
| *a \<type\> option cannot have autocomplete* | `auto complete` was set to `true` on a boolean, user, channel, role, mentionable or attachment option | only string, integer and number options support autocomplete |
| *only integer and number options have a minimum value* (same wording for maximum) | `min value` / `max value` was set on a non-numeric option | only integer and number options accept bounds |
| *the choice 'x' has a text value but its option is an integer option* (or *a number option*) | a `slashchoice`'s value doesn't match its option's type | give the choice a numeric value, or switch the option to `string` |
| *a \<type\> option cannot have choices* | `choices` was set on a boolean, user, channel, role, mentionable or attachment option | only string, integer and number options accept choices |

entity: applicationcommand
