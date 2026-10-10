---
title: Slash-Befehle
description: Die Struktur eines Slash-Befehls, sein Pfad, seine Beschreibung und sein Trigger sowie das Übertragen an Discord.
source-hash: 83dbe60b030a
---

Diese Seite behandelt die Struktur `slash command`: ihren Kopf, ihre Einträge, ihren Trigger und
wie ein Skript sie an Discord überträgt. Du solltest einen Bot namens `"my-bot"` angemeldet haben
und die [Befehlsübersicht](doc:interaction-commands) gelesen haben.

## So funktioniert ein Slash-Befehl {#how-a-slash-command-works}

Eine Struktur `slash command` ist ein **Modell**, das neben deinem `on ready`-Block deklariert wird,
nicht darin. Ihr Kopf benennt den Befehl und seine Argumente. Ihr `trigger` (Codeblock) läuft,
sobald ein Benutzer `/name` auf Discord tatsächlich verwendet. Beim Laden, Neuladen oder Entladen
gelangt nichts zu Discord: Ein Skript überträgt das Ergebnis ausdrücklich, typischerweise aus
`on guild ready`.

```skript
slash command ping:
    description: Pong!
    trigger:
        reply with hidden "Pong! (%used slash command%)"
```

```skript
on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

`/ping` führt jetzt den Trigger oben aus und antwortet mit einer flüchtigen (nur für dich
sichtbaren) Nachricht `Pong! (ping)`.

syntax: core/structures#structure-slash-command-structure compact

!!! warning "Umstieg von v4"
    In v4 hat sich die Struktur selbst bei Discord registriert, mit den Einträgen `bot:` und
    `guilds:`. In v5 registriert die Struktur nichts. Ein Skript ruft stattdessen
    `update the discord commands ...` aus `on guild ready` (oder `on ready` für globale Befehle)
    auf. Beim Entladen oder Herunterfahren wird ebenfalls nichts aus Discord gelöscht: Erst ein
    erneutes Übertragen entfernt einen Befehl. Argumente werden im Kopf als `<name: type>`
    deklariert statt in einer `arguments:`-Liste, und sie können keinen Standardwert haben, da
    Discord keinen kennt. Ein Abbruch in `on cooldown` lässt den Befehl trotzdem laufen.

## Einträge {#entries}

Jeder Eintrag unten ist optional. Der Standardwert von `description` ist "No description provided".

| Eintrag | Standard | Zulässige Werte |
| --- | --- | --- |
| [description](syntax:slashcommand#description) | "No description provided" | Text, oder eine Section (eingerückter Block) aus `locale: text`-Zeilen, bei der die Zeile `en-US` Pflicht ist |
| [name](syntax:applicationcommand#name-localizations) | der Name aus dem Kopf | eine Section mit übersetzten Namen als `locale: text`-Zeilen |
| arguments | keiner | eine Section: pro Argument `name: description` oder ein Unterabschnitt (`description`, `choices`, `on completion request`) |
| `trigger` | keiner bei Wurzel oder Gruppe | eine Section mit Skript-Code |

`enabled for`, `disabled`, `nsfw`, `contexts`, `integration types`, `cooldown`, `cooldown scope` und
`on cooldown` schränken den Befehl ein und lokalisieren ihn. Siehe
[Befehlseinstellungen](doc:interaction-commands/command-settings).

## Unterbefehle und Gruppen {#subcommands-and-groups}

Ein Pfad besteht aus einem bis drei Wörtern in Kleinbuchstaben: einem Befehl, optional einer Gruppe
und optional einem Unterbefehl. Zwei Strukturen, die dasselbe erste Wort teilen, werden zu einem
einzigen Discord-Befehl zusammengeführt:

```skript
slash command mod ban <target: member> [<reason: string>]:
    description: Ban a member
    trigger:
        reply with hidden "Would ban %{_target}%"

slash command mod kick <target: member>:
    description: Kick a member
    trigger:
        reply with hidden "Would kick %{_target}%"
```

`mod ban` und `mod kick` werden zu einem einzigen `/mod` mit zwei Unterbefehlen. Ein Pfad ohne
`trigger` beschreibt die Wurzel oder eine Gruppe statt eines Endbefehls:

```skript
slash command mod:
    description: Moderation tools
    enabled for: manage server

slash command settings color:
    description: Colour settings

slash command settings color set <color: color>:
    description: Set the colour
    trigger:
        reply with hidden "Colour %{_color}%"
```

`settings color` gruppiert `settings color set` unter `/settings color`. Ohne Beschreibung der
Wurzel erbt die Wurzel ihre Berechtigungen aus der Schnittmenge ihrer Unterbefehle. Dieselbe Wurzel
in zwei verschiedenen Skripten zu deklarieren führt ebenfalls zu einer Zusammenführung, erzeugt aber
eine Warnung. Behalte pro Wurzel ein einziges Skript bei.

## Im Trigger {#inside-the-trigger}

| Wert | Enthält |
| --- | --- |
| `{_name}` | den Wert eines benannten Arguments, wie im Kopf deklariert |
| `arg-1` | dasselbe Argument, über seine Position |
| `member argument` | das erste Argument, dessen Typ `member` ist |
| `used slash command` | den vollständigen Pfad, der ausgeführt wurde, z. B. `mod ban` |
| `event-user`, `event-member`, `event-guild`, `event-channel`, `event-bot` | den Kontext des Aufrufs |

[`reply with hidden`](doc:messages/sending-messages) antwortet nur dem Benutzer, der den Befehl
ausgeführt hat. `defer the interaction` bestätigt die Interaktion früh, wenn der Trigger langsam
ist, noch bevor Discords eigenes Zeitlimit von 3 Sekunden greift. Siehe
[Slash-Optionen](doc:interaction-commands/slash-options) für Argumenttypen, Auswahlmöglichkeiten und
Autovervollständigung.

## An Discord übertragen {#pushing-to-discord}

`update the discord commands (all structured application commands) in event-guild` aus
`on guild ready` überträgt jeden strukturdeklarierten Befehl auf diesen Server. Die globale Variante
liest `update the discord commands {_ping} globally in event-bot` aus `on ready`. Ein Neuladen
berührt Discord nie von selbst. Siehe [Befehle registrieren](doc:interaction-commands/registering-commands)
für `register`, `unregister` und das Timing für global und pro Server.

syntax: core/expressions#expression-structured-discord-commands compact

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *'x' is not a valid slash command name (lowercase, 1 to 32 letters, digits, - or _)* | ein Wort im Pfad verletzt Discords Namensregeln | verwende nur Kleinbuchstaben, Ziffern, `-` oder `_` |
| *A slash command argument needs a name: \<user\> should be \<name: user\>* | ein Argument im Kopf hat keinen `name:` | schreibe `<name: type>` statt eines nackten `<type>` |
| *A slash command argument cannot have a default value* | `<name: type = default>` wurde verwendet | mache das Argument optional (`[<name: type>]`) und prüfe `{_name}` im Trigger |
| *A required argument cannot follow an optional one in a slash command* | ein Pflichtargument `<...>` steht nach `[<...>]` | verschiebe Pflichtargumente nach vorn |
| *The slash command has arguments but no trigger* | Argumente sind deklariert, aber `trigger:` fehlt | füge einen `trigger:`-Abschnitt hinzu, oder entferne die Argumente, um eine Wurzel oder Gruppe zu beschreiben |

entity: slashcommand
