---
title: Events
description: Woraus ein DiSky-Event-Handler besteht, welche Werte er bereitstellt und was er nicht kann.
source-hash: b72eacb81599
---

Diese Seite behandelt den Aufbau eines DiSky-Event-Handlers: die Zeile `on ...:` mit ihrem `seen by`-Filter, die
`event-`-Werte und benannten Ausdrücke, die jeder Handler lesen kann, wie von Discord geholte Werte in deinen
Code gelangen und warum Discord-Events nicht abgebrochen werden können. Vorausgesetzt wird ein Bot, der als
`"my-bot"` angemeldet ist (siehe [Einen Bot starten](doc:getting-started/starting-a-bot)).

## So funktioniert ein Event-Handler {#how-an-event-handler-works}

Ein DiSky-Event ist ein gewöhnliches Skript-Event: `on <event>:`, gefolgt von einem Trigger (Codeblock). Jedes
Event-Muster akzeptiert ein optionales Suffix `seen by "<bot name>"`, sodass `on message received seen by
"my-bot":` nur für den Bot ausgelöst wird, der unter diesem Namen angemeldet ist (siehe
[mehrere Bots](doc:getting-started/multiple-bots)). Ohne das Suffix wird der Handler für jeden Bot ausgelöst.
Welches Event auch immer es ist: Der Bot, der es gesehen hat, ist `event-bot`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!ping":
        reply with "Pong from %event-bot% in %event-channel%!"
```

DiSky empfängt das Event auf Discords eigenem Thread, filtert es nach Bot, baut die Event-Werte und übergibt den
Trigger dann an den Haupt-Thread des Minecraft-Servers. Dein Handler läuft auf dem Haupt-Thread wie jedes
Bukkit-Event, sodass er Spieler, Blöcke und Variablen frei verändern kann. Effekte wie [reply with](syntax:core/effects#effect-reply-with)
blockieren den Trigger, bis Discord bestätigt; das behandelt [Cache und await](doc:concepts/cache-and-await).

syntax: core/effects#effect-reply-with compact
event: events#message-receive compact

## Event-Werte {#event-values}

Die Entitäten, die an einem Event beteiligt sind, werden auf Skript-Art als `event-<type>` bereitgestellt. Welche
existieren, hängt vom Event ab; die generierte [Event-Referenz](/events) listet sie pro Event. Ein Wert, der nicht
zutrifft, ist none und kein Fehler: `event-guild` und `event-member` sind none, wenn eine Nachricht oder Reaktion
aus einem privaten Kanal stammt.

| Wert | Typ | Typische Events |
| --- | --- | --- |
| `event-bot` | bot | jedes Event |
| `event-guild` | guild | alles, was auf einem Server passiert |
| `event-channel` | channel | Nachrichten, Reaktionen, Kanal-Updates, Voice |
| `event-user` | user | Nachrichten, Reaktionen, Banns, Benutzer-Updates |
| `event-member` | member | Beitritte, Austritte, Rollen, Nicknames, Voice |
| `event-message` | message | Nachricht empfangen oder bearbeitet, Komponenten, Umfragen |
| `event-role` | role | Rolle erstellt, gelöscht oder aktualisiert |
| `event-button` | button | Button geklickt |
| `event-dropdown` | dropdown | Auswahlmenü geklickt |

Ein Kanal wird pro Kanaltyp einmal registriert, daher antwortet dasselbe Event auch auf `event-textchannel`,
`event-voicechannel`, `event-threadchannel`, `event-forumchannel`, `event-category` und die übrigen Kanaltypen.
Die typisierte Form ist gesetzt, wenn der Kanal tatsächlich diesen Typ hat, und sonst none. Verwende
`event-channel`, wenn der Typ keine Rolle spielt.

```skript
on message received seen by "my-bot":
    if event-threadchannel is set:
        reply with "This message was sent in a thread"
```

## Benannte Event-Ausdrücke {#named-event-expressions}

Manche Event-Daten haben keine `event-<type>`-Form, weil sie einfacher Text oder eine Liste sind oder mit einem
anderen Wert desselben Typs kollidieren würden. Sie werden als Ausdrücke mit eigenem Namen bereitgestellt, die nur
innerhalb ihres Events gültig sind: Wer einen davon anderswo verwendet, erhält einen Parse-Fehler, der sagt, dass
der Ausdruck nur in diesem Event verwendet werden kann.

```skript
on button clicked seen by "my-bot":
    if click id is "confirm":
        reply with "Confirmed by %event-user%"
```

| Ausdruck | Event | Liefert |
| --- | --- | --- |
| `click id` | `on button clicked` | die benutzerdefinierte ID des angeklickten Buttons |
| `selected values` | `on dropdown clicked` | die gewählten Optionen als Textliste |
| `execute command` | `on slash command received` | der vollständige Name des Befehls |
| `added roles` | `on role added` | die `event-member` zugewiesenen Rollen, als Liste |
| `reaction message` | `on reaction add` | die Nachricht, die die Reaktion erhalten hat |

event: events#button-click compact

## Alte und neue Werte {#old-and-new-values}

Update-Events werden nach der Änderung ausgelöst und zeigen beide Seiten: den aktuellen Wert unter einem einfachen
Namen, den vorherigen unter demselben Namen mit dem Präfix `old` (`past` und `previous` werden ebenfalls
akzeptiert). Die Entität selbst ist bereits aktualisiert, daher liefert `nickname of event-member` den neuen Wert;
nur der Ausdruck `old` kennt noch den vorherigen.

```skript
on guild member nickname change seen by "my-bot":
    send "%event-member%: '%old member nickname%' -> '%member nickname%'" to console
```

| Event | Neuer Wert | Alter Wert |
| --- | --- | --- |
| `on guild member nickname change` | `member nickname` | `old member nickname` |
| `on discord user name change` | `name` | `old name` |
| `on discord user online status change` | `online status` | `old online status` |
| `on discord scheduled event name change` | `scheduled event name` | `old scheduled event name` |

event: events#member-nickname-event compact

## Von Discord abgerufene Werte {#values-fetched-from-discord}

Einige Werte sind nicht Teil dessen, was Discord mit dem Event sendet: die Nachricht hinter einer Reaktion oder
der Benutzer und das Mitglied hinter einer Umfrage-Stimme. DiSky holt sie vor dem Start des Triggers auf einem
Hintergrund-Thread von Discord und speichert sie am Event, sodass sie innerhalb des Handlers gewöhnliche Werte sind.

```skript
on reaction add seen by "my-bot":
    send "%event-user% reacted to '%discord content of reaction message%'" to console
```

Die [await-Regeln](doc:concepts/cache-and-await) gelten für das, was du innerhalb des Handlers tust, niemals für
die eigenen Werte des Events: Ein Event-Wert braucht nie `await`.

## Events können nicht abgebrochen werden {#events-are-not-cancellable}

Ein Event, das von Discord kommt, kann nicht abgebrochen werden: Discord hat die Änderung bereits angewendet, bis
dein Handler läuft. `cancel event` in einem solchen Handler lädt nicht; Skript meldet zur Parse-Zeit, dass das
Event nicht abbrechbar ist. Reagiere stattdessen: lösche die Nachricht, entferne die Rolle, kicke das Mitglied.

```skript
on message received seen by "my-bot":
    if discord content of event-message contains "spam":
        destroy event-message
```

Die Ausnahmen sind die Events, die DiSky selbst auslöst, bevor es einen selbst deklarierten Befehl ausführt:
[`on discord command used`](event:events#discord-command-used), wo Abbrechen den Befehl stoppt (siehe
[Auflisten und Events](doc:chat-commands/listing-and-events)), und
[`on slash command cooldown`](event:events#application-command-cooldown), wo Abbrechen den Befehl trotz seiner
Abklingzeit ausführen lässt (siehe [Befehlseinstellungen](doc:interaction-commands/command-settings)).

## Event-Familien {#event-families}

DiSky löst 123 Events aus, generiert aus denselben Deskriptoren wie die [Event-Referenz](/events), die weiterhin die
vollständige Liste bleibt. Sie fallen in ein Dutzend Familien; die unten genannten Werte teilt der Großteil der
jeweiligen Familie.

| Familie | Beispiele | Typische Werte |
| --- | --- | --- |
| Lebenszyklus des Bots | `on ready`, `on guild ready`, `on bot shutdown` | `event-bot`, `event-guild` |
| Nachrichten | `on message received`, `on message edited`, `on message deleted` | `event-message`, `event-channel`, `event-user` |
| Reaktionen und Umfragen | `on reaction add`, `on message poll vote added` | `reaction message`, `event-user`, `event-member` |
| Befehle | `on slash command received`, `on user command received` | `execute command`, `event-user`, `event-channel` |
| Komponenten | `on button clicked`, `on dropdown clicked`, `on modal clicked` | `click id`, `selected values`, `event-message` |
| Mitglieder | `on member joined guild`, `on role added`, `on member timeout` | `event-member`, `event-guild` |
| Benutzer | `on discord user name change`, `on discord user typing` | `event-user`, `old name` |
| Server | `on discord guild ban`, `on discord guild name update` | `event-guild`, `event-user` |
| Kanäle und Threads | `on discord channel create`, `on discord thread join` | `event-channel`, `event-guild` |
| Rollen | `on discord guild role created`, `on discord guild role permissions update` | `event-role`, `event-guild` |
| Voice | `on member voice join`, `on discord guild voice muted` | `event-member`, `event-guild` |
| Server-Ressourcen | `on discord emoji added`, `on discord guild sticker added`, `on discord scheduled event create` | `event-guild` |

!!! tip "Beim Erkunden mitloggen"
    Eine einfache Skript-Funktion macht es günstig zu prüfen, welche Events auslösen und was ihre Werte enthalten.
    Das ist nichts DiSky-Spezifisches, und du kannst sie entfernen, sobald das Skript fertig ist.

```skript
function writeDebug(event: text, data: text):
    send "[DiSky-evt] %{_event}% -> %{_data}%" to console

on member joined guild seen by "my-bot":
    writeDebug("member join", "member=%event-member% guild=%event-guild%")
```
