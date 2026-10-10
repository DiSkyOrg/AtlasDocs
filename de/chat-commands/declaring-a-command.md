---
title: Einen Befehl deklarieren
description: Die Struktur discord command, ihre Einträge, Präfixe und Aliase sowie was der Trigger lesen kann.
source-hash: 03af4ec23806
---

Diese Seite behandelt die Struktur `discord command` selbst: ihren Kopf, ihre Einträge, wie eine Nachricht
mit ihr abgeglichen wird und was der `trigger` lesen kann. Du solltest einen Bot namens `"my-bot"`
angemeldet haben (siehe [Einen Bot starten](doc:getting-started/starting-a-bot)) und die
[Befehlsübersicht](doc:chat-commands) gelesen haben.

## Wie ein Befehl funktioniert {#how-a-command-works}

Ein `discord command` ist eine Struktur auf oberster Ebene. Du deklarierst sie neben den Blöcken `on ready`
und `options:` deines Bots, nicht innerhalb davon. Ihr Kopf benennt den Befehl; ihr `trigger` läuft, sobald
eine Nachricht passt. Der Bot beobachtet jede Nachricht, die er erhält, und vergleicht sie mit jedem
geladenen Befehl.

```skript
discord command ping:
    prefixes: "!"
    trigger:
        reply with "pong"
```

Wenn du `!ping` sendest, läuft der Trigger oben. Der Abgleich funktioniert so: Der Name des Befehls wird
ohne Beachtung der Groß- und Kleinschreibung verglichen, die Nachricht muss mit `<prefix><name>` beginnen
(in dieser Reihenfolge), und alles danach, durch Leerzeichen getrennt, wird zu den rohen Argumenten. Eine
Nachricht von einem anderen Bot oder von einem Webhook löst nie einen Befehl aus. Ohne Eintrag
`executable in` (siehe [Befehle einschränken](doc:chat-commands/restricting-a-command)) funktioniert ein
Befehl sowohl in Direktnachrichten (DMs) als auch in Kanälen von Servern.

syntax: core/structures#structure-discord-command compact

## Einträge {#entries}

Jeder Eintrag unten außer `trigger` ist optional.

| Eintrag | Standard | Zulässige Werte |
| --- | --- | --- |
| [prefixes](syntax:discordcommand#prefixes) | keiner: der blanke Name passt | ein Textausdruck, ein oder mehrere Werte |
| [aliases](syntax:discordcommand#aliases) | keiner | durch Kommas getrennte Namen |
| [description](syntax:discordcommand#description) | keiner | beliebiger Text |
| [usage](syntax:discordcommand#usage) | aus Name und Argumenten generiert | beliebiger Text |
| [category](syntax:discordcommand#category) | keiner | beliebiger Text |
| `trigger` | *(Pflicht)* | eine Section (eingerückter Block) mit Skript-Code |

`roles`, `permissions`, `bots`, `executable in`, `cooldown` und `cooldown scope` legen fest, wer den Befehl
ausführen darf; siehe [Befehle einschränken](doc:chat-commands/restricting-a-command). `usage
message` wird zusammen mit der übrigen Argumentgrammatik unter [Argumente](doc:chat-commands/arguments) behandelt.

## Präfixe und Aliase {#prefixes-and-aliases}

Ein Befehl ohne `prefixes:` reagiert auf seinen blanken Namen, ohne etwas davor:

```skript
discord command hello <user>:
    trigger:
        reply with "Hello %arg-1%!"
```

`prefixes` akzeptiert mehr als einen Wert, sodass ein Befehl auf mehrere reagieren kann:

```skript
discord command ping:
    prefixes: "!", "?"
    trigger:
        reply with "pong"
```

`prefixes` ist ein Ausdruck, der für jede eingehende Nachricht neu ausgewertet wird, und keine feste Liste,
die einmal beim Laden gelesen wird. Ein in einer Variablen gespeicherter Präfix kann sich daher ändern,
während das Skript läuft:

```skript
discord command ping:
    prefixes: "%{prefix}%"
    trigger:
        reply with "pong"
```

Der Eintrag wird geparst, bevor das Event des Befehls existiert. Deshalb können Event-Werte wie
`event-guild` darin nicht verwendet werden; ein Präfix pro Server ist über `prefixes` allein nicht möglich.

Sobald eine Nachricht passt, melden `used prefix` und `used alias` genau, was gepasst hat, Name oder Alias:

```skript
discord command ping:
    prefixes: "!"
    aliases: p, pong
    trigger:
        reply with "matched with '%used prefix%%used alias%'"
```

!!! tip "Befehle ohne Präfix reagieren oft"
    Ein Befehl ohne `prefixes:` reagiert auf jede Nachricht, die mit seinem Namen beginnt, ohne etwas davor.
    Reserviere die blanke Form für ein oder zwei Befehle, die sich wie ein Gespräch anfühlen sollen; versieh
    alle anderen mit einem Präfix.

## Im Trigger {#inside-the-trigger}

Der Trigger eines `discord command` ist selbst ein Event: Alles Folgende ist dort lesbar, ebenso in
[`on discord command used`](doc:chat-commands/listing-and-events) und in
[`on discord command failed`](doc:chat-commands/restricting-a-command).

| Wert | Enthält |
| --- | --- |
| `event-discordcommand` | den Befehl, der gepasst hat |
| `event-message` | die Discord-Nachricht, die ihn ausgelöst hat |
| `event-user` | den Autor der Nachricht |
| `event-member` | den Autor als Mitglied des Servers; in einer DM nicht gesetzt |
| `event-guild` | den Server, auf dem die Nachricht gesendet wurde; in einer DM nicht gesetzt |
| `event-channel` | den Kanal, in dem die Nachricht gesendet wurde |
| `event-bot` | den Bot, der die Nachricht erhalten hat |
| `used prefix` | den Präfix, der gepasst hat |
| `used alias` | den Namen oder Alias, der gepasst hat |
| `used arguments` | den rohen Text nach dem Namen, vor dem Parsen |

Deklarierte Argumente liest du mit `arg-1` und Co.; siehe [Argumente](doc:chat-commands/arguments).
[`reply with`](doc:messages/sending-messages) sendet in `event-channel`, den eigenen Kanal des Befehls, und
jeder gewöhnliche DiSky-Effekt funktioniert im Trigger genau so wie in `on message received`.

## Neuladen und Konflikte {#reloading-and-clashes}

Befehle werden über ihre Identität registriert, nicht über ihren Namen: Ein Neuladen eines Skripts entfernt
nur die Befehle, die es deklariert hat, und fasst nie die eines anderen Skripts an. Zwei Befehle mit demselben
Namen (oder Alias) und überlappenden Präfixen werden trotzdem beide geladen, mit einer Warnung:

*The discord command '\<name>' is already declared in \<file>; both will run on the same
message.*

!!! warning "Ein Konflikt ist kein Ladefehler"
    Beide Befehle bleiben registriert, und beide laufen für eine Nachricht, die auf einen von beiden passt;
    DiSky wählt keinen Gewinner aus. Benenne einen davon um oder trenne ihre Präfixe voneinander, um es zu
    beheben.

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *Unexpected entry '\<key>' in a discord command. Known entries: prefixes, aliases, description, usage, category, roles, permissions, bots, executable in, cooldown, cooldown scope, permission message, cooldown message, usage message, trigger.* | Ein Eintragsname ist falsch geschrieben oder existiert nicht | Verwende einen der aufgelisteten Einträge |
| *Required entry 'trigger' is missing* | Die Struktur hat keine Section `trigger:` | Füge eine Section `trigger:` hinzu |

Das Deklarieren eines Befehls kommuniziert nie mit Discord, daher hat es keine eigenen Fehler auf
Discord-Seite; diese beginnen, sobald eine Nachricht tatsächlich den Trigger erreicht (siehe
[Fehler](doc:concepts/errors)).

entity: discordcommand
