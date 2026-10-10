---
title: Auflisten und Events
description: Jeden Befehl abfangen, bevor seine Prüfungen laufen, alle geladenen Befehle auflisten und jede Verwendung protokollieren.
source-hash: 149c117bc14d
---

Diese Seite behandelt `on discord command used`, das Event, das jeder Befehl vor seinen Prüfungen durchläuft,
und das Auflisten der aktuell geladenen [Befehle](doc:chat-commands/declaring-a-command). Du solltest einen Bot
namens `"my-bot"` angemeldet haben.

## Einen Befehl abfangen {#intercepting-a-command}

[`on discord command used`](event:events#discord-command-used) wird für jeden Befehl ausgelöst, bevor
`executable in`, `roles`, `permissions` und `cooldown` überhaupt [geprüft](doc:chat-commands/restricting-a-command)
werden. `cancel event` darin stoppt den Befehl sofort, bevor sein Trigger überhaupt läuft; es ist eines der
beiden [abbrechbaren DiSky-Events](doc:concepts/events).

```skript
discord command blocked:
    prefixes: "!"
    trigger:
        reply with "this should never run"

on discord command used:
    if name of event-discordcommand is "blocked":
        cancel event
        reply with "blocked by 'on discord command used'"
```

`event-discordcommand` ist der Befehl, und `used prefix`, `used alias` und `used arguments` sagen genau, wie
er eingegeben wurde; dieselben drei Ausdrücke funktionieren im eigenen `trigger` des Befehls. Filtere auf
einen Bot auf die übliche Weise, mit `on discord command used seen by "my-bot":`.

Protokolliere jede Verwendung auf die gleiche Weise, bevor eine Prüfung sie ablehnen kann:

```skript
on discord command used:
    send "%event-user% ran %name of event-discordcommand% (prefix=%used prefix%, alias=%used alias%, args='%used arguments%')" to console
```

event: events#discord-command-used compact

## Befehle auflisten {#listing-commands}

[`all discord commands`](syntax:core/expressions#expression-all-discord-commands) liefert jeden Befehl, der aus
jedem Skript geladen wurde, als Liste von [`discordcommand`](entity:discordcommand)-Werten. Jeder davon stellt
seine deklarierten Einträge schreibgeschützt bereit:

| Eigenschaft | Liefert |
| --- | --- |
| [name](syntax:discordcommand#name) | den Namen des Befehls |
| [description](syntax:discordcommand#description) | den Eintrag `description`, falls gesetzt |
| [usage](syntax:discordcommand#usage) | den Eintrag `usage` oder einen aus Name und Argumenten generierten |
| [category](syntax:discordcommand#category) | den Eintrag `category`, falls gesetzt |
| [aliases](syntax:discordcommand#aliases) | die Aliase des Befehls, ohne seinen Hauptnamen |
| [prefixes](syntax:discordcommand#prefixes) | die Präfixe des Befehls; leer, wenn er auf seinen blanken Namen reagiert |
| [cooldown](syntax:discordcommand#cooldown) | den Eintrag `cooldown`, falls gesetzt |

```skript
discord command help:
    prefixes: "!"
    trigger:
        set {_lines::*} to ""
        loop all discord commands:
            add "%name of loop-value%: %usage of loop-value%" to {_lines::*}
        reply with join {_lines::*} with nl
```

Gruppiere die Antwort nach `category of loop-value`, sobald du mehr als eine Handvoll Befehle hast. Die Liste
entspricht immer dem, was gerade geladen ist: Ein Neuladen eines Skripts fügt seine Befehle sofort hinzu oder
entfernt sie, ohne dass der Bot neu gestartet werden muss.

syntax: core/expressions#expression-all-discord-commands compact

entity: discordcommand
