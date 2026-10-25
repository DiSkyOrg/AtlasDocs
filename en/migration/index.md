---
title: Coming from DiSky 4
icon: arrow-right-left
description: Port working DiSky 4 scripts to DiSky 5: what changed, in which order to fix it, and what no longer exists.
tags: [migration, disky-4, reference]
order: 8
---

This section is for you if you have DiSky 4 scripts that work today and want them running on
DiSky 5. It lists what changed, gives you an order to fix a script in, and says plainly what
was dropped. You're assumed to know the basics of DiSky 5 (see
[Starting a bot](doc:getting-started/starting-a-bot) and [Concepts](doc:concepts)).

## What changed overall

Most breakage comes from six shifts. Each one has a detailed page linked in the next section.

- **Online reads use `await`.** DiSky 4 had a family of `retrieve ... and store it in {_x}`
  effects. In DiSky 5 the same data is an ordinary expression, and you ask for the online
  version by putting `await` in front of the line. See [Cache and await](doc:concepts/cache-and-await).
- **Creation goes through builders.** The `create ... and store it in` effects and the creation
  sections are gone. You build a `new ... builder`, set its properties one line each, then read
  `the build result of` it. See [Builders](doc:concepts/builders).
- **A `discord` prefix where Skript owns the word.** Skript registers its syntaxes before any
  addon, so a DiSky syntax with the same shape would silently lose on an untyped variable.
  Those properties now carry a mandatory `discord`: `discord content`, `discord author`,
  `discord colors`, `discord location`, `discord owner`, `discord attachments`,
  `discord permissions`.
- **Commands are registered to Discord explicitly.** Slash and context command structures are
  models only; nothing reaches Discord until an effect pushes them.
- **Events expose values differently.** Most change events give their old and new values as
  `past event-X` / `event-X`, `event-author` is gone, and a few events were renamed or removed.
- **No config file.** See the last section.

```skript
# DiSky 4
retrieve member with id "123" from event-guild and store it in {_m}

# DiSky 5
await set {_m} to member with id "123" in event-guild
```

The `define bot` structure still loads, but the imperative API (`a new discord bot`, then
`login`) is the reference and the one this documentation uses.

## Porting a script

Work in this order; each step removes a whole class of errors and makes the next one readable.

1. Load the script on a DiSky 5 server and let Skript print every parse error.
2. Read the errors from top to bottom. One mistake often causes several lines of noise below it,
   so fix the first one and reload before chasing the rest.
3. Fix reading and creating first: every `retrieve ... and store it in` and
   `create ... and store it in` line. See [Retrieving and creating](doc:migration/retrieve-and-create).
4. Fix the syntaxes that were renamed or gained a mandatory word. See
   [Renamed syntaxes](doc:migration/renamed-syntaxes).
5. Port commands, buttons, dropdowns and modals. See
   [Commands and components](doc:migration/commands-and-components).
6. Port event handlers last, once everything inside them parses. See
   [Events](doc:migration/events).
7. Run the script against a test guild. Parsing is not proof: check that each syntax does what
   it did before.

## What DiSky 5 does not have

Some DiSky 4 features were removed or replaced rather than renamed. Anything not in this table
either exists under a new name (see the pages above) or was never in DiSky 4.

| DiSky 4 feature | Status | What to do instead |
| --- | --- | --- |
| `find members with roles` / `with nickname`, the `find member` section | Not available | Loop over `members of {_guild}` and filter with an `if` |
| `react to %message% with %emote% to run` (section) | Not available | Use the `react to` effect, and handle the click in `on reaction add` |
| `listen once to event` and the `once` section | Not available | Keep a flag in a variable and check it in a normal event handler |
| `create rich message` section (content, embeds, attachments, rows) | Replaced | A message builder; `embeds of` takes several embeds |
| Embed sections and `register embed template` | Replaced | Embed builders; there are no templates, use a function that returns a builder |
| Embed from and to JSON | Not available | Set the embed's properties one by one |
| `and store it in` on `post`, `reply with` and webhook posts | Replaced | Build the message with a message builder and read `the build result of` it |
| `edit` with a message builder | Not available | `edit` takes text, an embed builder or a component |
| Sending a sticker with `post` | Not available | None; `post` takes text, embeds, components and polls |
| `destroy %guild%` | Not available | None; the guild cannot be deleted from a script |
| `on disky command` | Replaced | `on discord command used` |
| Named registry of webhook clients | Replaced | Store the client in a variable |
| `retrieve event-value` and `apply replacement` | Dropped | Read the value with `await`; rebuild the component instead |
| `config.yml`, the `/disky` command and `plugins/DiSky/modules` | Dropped | See below; third-party modules must be Skript addons that depend on DiSky |
| Advanced voice and audio | Not available | Only `connect` a bot to an audio channel |

!!! info "Things that look missing but are not"
    Renaming and editing live channels, guilds, emotes and scheduled events, slowmode, channel
    position, thread `archived` and `locked`, `channel of %message%`, the `channel with id`
    family, and the activities (`watching`, `listening to`, `streaming ... with the url`,
    `competing in`, `custom status`) all exist. A text `discord command !ping` with no
    `prefixes:` entry still answers to `!ping`. Logging in under a name already in use now shuts
    the previous bot down instead of leaking it.

## No config file

DiSky 5 reads no configuration file and writes only `plugins/DiSky/disky-syntax.json`, a
description of the installed syntaxes that the Atlas reads. The DiSky 4 options map to scripts:
silencing an error code becomes `on disky exception:` with `cancel event`, and handling an
expected failure is a `try` / `catch` block. See [Errors](doc:concepts/errors).

```skript
on disky exception:
    if error code of event-discorderror is 50006:
        cancel event
```
