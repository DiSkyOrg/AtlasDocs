---
title: Commands and components
icon: square-slash
description: What changes for slash, context and text commands, buttons, dropdowns, modals and Components V2 when you port a DiSky 4 script.
tags: [migration, commands, components]
order: 3
---

This page lists what to change in a DiSky 4 script that declares commands or sends components. You're assumed to have a bot named `"my-bot"` logged in and to know the DiSky 4 syntax you're porting from.

## Slash and context commands

This is the biggest change. In DiSky 4 a `slash command`, `user command` or `message command` structure registered itself on Discord when the bot connected. In DiSky 5 these structures are **models only**: loading, reloading or unloading one never touches Discord. Nothing appears until a script runs [update the discord commands](syntax:core/effects#effect-update-discord-commands) (full replace) or [register the discord command](syntax:core/effects#effect-register-discord-command) (upsert), typically from `on guild ready` or `on ready`. See [Registering commands](doc:interaction-commands/registering-commands).

The `bot:` and `guilds:` entries no longer exist: they are load errors, so delete them. The target bot and guild come from the registration call. Arguments change from `<type="name">` to `<name: type>`, and the value is also readable as `{_name}`.

DiSky 4:

```skript
slash command ban <member="target"> [<string="reason">]:
    bot: "my-bot"
    guilds: 123456789012345678
    description: Ban a member
    enabled for: ban members
    arguments:
        target: Who to ban
        reason: Why
    trigger:
        defer the interaction
        reply with "Banned %arg-1% (%arg-2%)"
```

DiSky 5 (the bot is already logged in; see [Starting a bot](doc:getting-started/starting-a-bot)):

```skript
slash command ban <target: member> [<reason: string>]:
    description: Ban a member
    enabled for: ban members
    arguments:
        target: Who to ban
        reason: Why
    trigger:
        defer the interaction
        reply with "Banned %{_target}% (%{_reason}%)"

on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

`update` replaces the whole list of that guild or bot, so one call must carry every structure: `all structured application commands` collects every slash, user and message command. Use `globally in event-bot` from `on ready` for global commands. Context commands follow the same rule; only their entries differ:

```skript
user command Report user:
    trigger:
        reply with hidden "Reported %target user%"
```

Commands built at runtime keep working with new spellings: the word `new` is now required (`a new slash command named "greet" with description "..."`), the `required` and `autocomplete` flags become `set required of {_opt} to true`, and locale data objects are replaced by the [localize](syntax:core/effects#effect-localize-command) effect. See [Command builders](doc:interaction-commands/command-builders) and [Slash options](doc:interaction-commands/slash-options).

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `bot:` and `guilds:` entries | removed | Load error; pass the bot or guild to the registration effect |
| `<user="target">` | `<target: user>` | Name first, Skript type second; no default values on slash arguments |
| `arguments:` mandatory | optional | Omit it when no argument needs a description |
| `update commands {_c} globally in event-bot` | `update the discord commands {_c} globally in event-bot` | `update` is a full replace, `register` adds or replaces only the listed commands |
| `unregister ... globally from %bot%` | `unregister the discord command "x" globally from event-bot` | Also accepts `all` |
| `remaining time` | `remaining cooldown` | Same meaning |
| `return %slashchoices%` | `return choices %slashchoices%` | The word `choices` (or `completions`) is required |
| `a new choice "x" with value "y"` | `a new choice named "x" with the value "y"` | `named` or `with the name` is required |
| `new locale data for "fr" as "x"` | `localize the name of {_c} in "fr" to "x"` | Locale data objects are gone |
| `disable %slashcommand%` | `set disabled of {_c} to true` | Property on the command |
| `slashcommandgroup`, `subslashcommand` types | `subcommandgroup`, `subcommand` | Matters for `x is a ...` checks |

## Text commands

The `discord command` structure keeps its header and its entries (`aliases`, `roles`, `permissions`, `bots`, `executable in`, `prefixes`, `usage`, `description`, `category`, `permission message`, `trigger`). Arguments keep the same positional form (`<member>`, `arg-1`); a named form `<who: member>` now also fills `{_who}`.

One thing reads differently. DiSky 4 split the first character of the name off as the prefix when no `prefixes:` entry was given. DiSky 5 gives the command an empty prefix and matches the whole name, so `discord command !ping` still answers to `!ping`. Nothing breaks, but the command's name is now `!ping` and `used prefix` is empty. Declare `prefixes: "!"` on `discord command ping` if a script reads the name or the prefix separately.

DiSky 4:

```skript
discord command slow:
    prefixes: !
    guild cooldown: 10 seconds
    cooldown message: You must wait
    trigger:
        reply with "ok"

on disky command:
    cancel event
```

DiSky 5:

```skript
discord command slow:
    prefixes: "!"
    cooldown: 10 seconds
    cooldown scope: guild
    cooldown message: "Wait %remaining cooldown% before using this again."
    trigger:
        reply with "ok"

on discord command used:
    cancel event
```

`prefixes` is now an expression evaluated per message, so quote text values. See [Declaring a command](doc:chat-commands/declaring-a-command), [Restricting a command](doc:chat-commands/restricting-a-command) and [Listing and events](doc:chat-commands/listing-and-events).

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `discord command !ping` (no `prefixes:`) | same line | Still answers to `!ping`; the name now includes `!` and the prefix is empty |
| `prefixes: !, ?` | `prefixes: "!", "?"` | Quote the values |
| `cooldown message: text` | `cooldown message: "text"` | May use `%remaining cooldown%` |
| `guild cooldown: 10 seconds` | `cooldown: 10 seconds` and `cooldown scope: guild` | The scope is `user` (default), `guild` or `channel` |
| (none) | `usage message: "..."` | Sent on invalid arguments |
| `on disky command` | `on discord command used` | Cancellable; `on discord command failed` fires when a check refuses |
| `event-string` (the prefix) | `used prefix` | No text event value |
| `used-prefix`, `used-alias`, `used-args` | `used prefix`, `used alias`, `used arguments` | Hyphen forms no longer parse |

## Components and interactions

Buttons, dropdowns, rows, containers and modals are now editable holders: `event-button` and `event-dropdown` can be changed and handed back, and the built component is a snapshot. A row is optional; a button added to the components of a message joins the last row that has room, and a dropdown gets its own. Any Components V2 component switches the message to V2 on its own. See [Sending messages](doc:messages/sending-messages).

Several optional words became required, and the `label` type is gone: every modal input takes its label in its constructor (`labeled "..."`) and has a `description`. The `apply component replacement` section has no equivalent; replace components one at a time.

DiSky 4:

```skript
on button clicked:
    if clicked button is "yes":
        edit button of the event to show new success button with id "yes" named "Done"

set {_modal} to a new modal with id "form" named "Feedback"
set {_input} to a new short text input with id "title"
set {_label} to new label "Feedback Title" with {_input}
add {_label} to rows of {_modal}
show {_modal}
```

DiSky 5:

```skript
on button clicked:
    if clicked id is "yes":
        set label of event-button to "Done"
        replace the component with id "yes" of event-message with event-button
    else if clicked id is "open":
        set {_modal} to a new modal with id "form" titled "Feedback"
        set {_input} to a new short text input with id "title" labeled "Feedback Title"
        add {_input} to components of {_modal}
        show {_modal}
```

`replace the component with id ...` swaps one component. [edit interaction components](syntax:core/effects#effect-edit-interaction-components) replaces every component of the message, and needs `defer the interaction and edit` first. `reply with` no longer stores the message and has no `content:` entry: build a message with `a new message with content "..." in %channel%`, attach components with `add ... to components of {_m}`, then `reply with {_m}`; a bare component can be replied directly.

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `clicked button` (the id text) | `clicked id` or `clicked button id` | `event-button` is now the button itself |
| `edit button of the event to show %b%` | `replace the component with id "x" of event-message with %b%` | Swaps one component |
| `edit message component with the id %s% of %message% to show %b%` | `replace the component with id %s% of %message% with %b%` | Works on any component; `unique id` also accepted |
| `apply component replacement ...` | removed | Replace components one by one |
| `defer the interaction and wait silently` | `defer the interaction hidden` | `and wait` is gone; `and edit` is new for clicks |
| `new primary button "x"` | `new primary button with id "x"` | The word `id` is required; link buttons use `with url` |
| `new entities dropdown ... targeting "users"` | `new entity dropdown ... targeting users and roles` | Takes the `selecttarget` enum, not text |
| `new modal ... named "x"`, `new label ...` | `new modal ... titled "x"`; `labeled` on the input | The `label` type is removed |
| `rows of %message%` | `components of %messageaction%` | Also works on rows, containers and modals |
| `make a new container ...:` section | `a new container` | An expression; `content of` is now `components of` |
| `spoiler state` | `spoiler` | Property name shortened |

syntax: core/effects#effect-edit-interaction-components compact
