---
title: Kontextbefehle
description: Die Strukturen und Builder für Kontextmenübefehle von Usern und Nachrichten sowie was ihr Trigger lesen kann.
source-hash: dfc6f4ec35c2
---

Diese Seite behandelt `user command` und `message command`: die Strukturen hinter dem
Rechtsklick-Menü **Apps** in Discord und ihre Builder-Entsprechungen. Du solltest bereits einen Bot
namens `"my-bot"` angemeldet haben und [Slash-Befehle](doc:interaction-commands/slash-commands) gelesen haben.

## Wie Kontextbefehle funktionieren {#how-context-commands-work}

Ein Rechtsklick auf einen Benutzer oder eine Nachricht in Discord öffnet ein Untermenü **Apps**; jeder
Eintrag dort ist ein Kontextbefehl. Eine `user command`-Struktur beantwortet einen Klick auf einen
Benutzer, eine `message command`-Struktur einen Klick auf eine Nachricht. Beide sind Modelle, genau wie
`slash command`, mit einem `trigger`, der läuft, sobald jemand den Eintrag wählt.

```skript
user command Report user:
    trigger:
        reply with hidden "Reported %target user%"

message command Quote this:
    trigger:
        reply with hidden "> %discord content of target message%"
```

Ein Name hat 1 bis 32 Zeichen und darf, anders als bei einem Slash-Befehl, Leerzeichen und
Großbuchstaben enthalten: "Report user" und "Quote this" sind gültige Einträge im Discord-Menü.
`trigger` ist der einzige Pflichteintrag.

Nichts gelangt zu Discord, bis ein Skript es überträgt, genau wie bei einem Slash-Befehl:
`update the discord commands (all structured application commands) in event-guild` aus
`on guild ready` sendet jede Struktur, Kontextbefehle eingeschlossen. Siehe
[Befehle registrieren](doc:interaction-commands/registering-commands) für `register`, `unregister` und
die Aufteilung in Server und global. Kontextbefehle haben sich von v4 zu v5 auf dieselbe Weise geändert
wie Slash-Befehle; siehe die Hinweisbox zu [Slash-Befehle](doc:interaction-commands/slash-commands).

syntax: core/structures#structure-context-command-structure compact

## Einträge {#entries}

| Eintrag | Standard | Zulässige Werte |
| --- | --- | --- |
| [name](syntax:applicationcommand#name-localizations) | der eigene Name aus dem Kopf | ein Abschnitt mit übersetzten Namen als `locale: text`-Zeilen |
| `trigger` | *(erforderlich)* | ein Abschnitt mit Skript-Code |

`enabled for`, `disabled`, `nsfw`, `contexts`, `integration types`, `cooldown`, `cooldown scope` und
`on cooldown` funktionieren wie bei einem Slash-Befehl; siehe [Befehlseinstellungen](doc:interaction-commands/command-settings).

## Im Trigger {#inside-the-trigger}

| Wert | Enthält |
| --- | --- |
| `target user` | den angeklickten Benutzer, im `user command`-Trigger |
| `target message` | die angeklickte Nachricht, im `message command`-Trigger |
| `used user command` / `used message command` | den Namen des Befehls |
| `event-user`, `event-member`, `event-guild`, `event-channel`, `event-bot` | den Kontext des Aufrufs |
| `event-message` | die angeklickte Nachricht, derselbe Wert wie `target message` (nur Message-Befehle) |

event: events#user-command compact

event: events#message-command compact

## Stattdessen einen Builder bauen {#building-one-instead}

Ein Kontextbefehl-Builder ist ein einfaches Objekt mit einem Namen und sonst nichts: kein Pfad, kein
`trigger`. Nichts gelangt zu Discord, bis er übertragen wird, und ein durch einen Builder deklarierter
Befehl wird im generischen Event beantwortet statt über einen eigenen Trigger.

```skript
on guild ready:
    set {_report} to a new user command named "Report user"
    register the discord command {_report} in event-guild

on user command:
    if used user command is "Report user":
        reply with hidden "Reported %target user%"
```

```skript
on guild ready:
    set {_quote} to a new message command named "Quote this"
    register the discord command {_quote} in event-guild

on message command:
    if used message command is "Quote this":
        reply with hidden "> %discord content of target message%"
```

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *A context command name is 1 to 32 characters long* | der Name aus dem Kopf ist leer oder zu lang | kürze oder verlängere ihn, bis er passt |
| *Unexpected entry 'x' in a context command. Known entries: name, enabled for, disabled, nsfw, contexts, integration types, cooldown, cooldown scope, on cooldown, trigger.* | ein Eintragsname ist falsch geschrieben oder gehört nur zu `slash command` | verwende einen der aufgelisteten Einträge |

entity: usercommand
