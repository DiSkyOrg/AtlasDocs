---
title: Befehle einschränken
description: Festlegen, wo ein Befehl läuft und wer ihn ausführen darf, eine Abklingzeit setzen und auf eine abgelehnte Prüfung reagieren.
source-hash: 5a7066979be2
---

Diese Seite behandelt die Einträge, die einen [deklarierten Befehl](doc:chat-commands/declaring-a-command)
einschränken: wo er läuft, wer ihn ausführen darf, seine Abklingzeit und wie du reagierst, wenn eine Prüfung
ihn abweist. Du solltest einen Bot namens `"my-bot"` angemeldet haben.

## Wie Prüfungen funktionieren {#how-checks-work}

[`on discord command used`](doc:chat-commands/listing-and-events) wird als Erstes ausgelöst, vor jeder Prüfung
unten; ein Abbruch dort stoppt den Befehl sofort. Danach laufen die Prüfungen in fester Reihenfolge, und die
erste fehlgeschlagene Prüfung stoppt alle weiteren:

| Schritt | Prüfung | Fehlergrund | Konfigurierte Meldung |
| --- | --- | --- | --- |
| 1 | `bots` | `wrong bot` | keine |
| 2 | `executable in` | `wrong channel` | keine |
| 3 | `roles` | `missing role` | keine |
| 4 | `permissions` | `missing permission` | `permission message` |
| 5 | `cooldown` | `cooldown` | `cooldown message` |
| 6 | Parsen der Argumente | `invalid arguments` | `usage message` |

Ein Eintrag, den du nicht setzt, wird übersprungen und nicht als "keine erlaubt" durchgesetzt: Ohne `roles`
ist jede Rolle erlaubt, ohne `executable in` jeder Kanaltyp. `permission message`, `cooldown message` und
`usage message` sind die einzigen Einträge, die selbst eine Antwort senden; die anderen drei Gründe senden
nichts, außer wenn auch [`on discord command failed`](#reacting-to-a-refusal) antwortet.

```skript
discord command admin:
    prefixes: "!"
    permissions: administrator
    permission message: "You need to be an administrator, %event-user%."
    trigger:
        reply with "you are an admin"
```

## Wo ein Befehl läuft {#where-a-command-runs}

`executable in` nimmt eine Liste von Wörtern und schränkt die Kanaltypen ein, in denen der Befehl antwortet.
Wenn du es weglässt, ist das dasselbe, wie alle Wörter unten aufzulisten.

| Wort | Kanäle |
| --- | --- |
| `guild`, `server` | jeder Kanaltyp eines Servers: Text-, Ankündigungs-, Sprach-, Stage-Kanal und die drei Thread-Arten |
| `dm`, `pm`, `private message`, `direct message`, `private` | Direktnachrichten (DMs) |
| `thread`, `threads` | öffentliche, private und Ankündigungs-Threads |
| `voice` | Sprach- und Stage-Kanäle |
| `text` | Text- und Ankündigungskanäle |

```skript
discord command dmonly:
    prefixes: "!"
    executable in: dm
    trigger:
        reply with "this only works in DMs"
```

## Wer ihn ausführen darf {#who-can-run-it}

`roles`, `permissions` und `bots` schränken jeweils ein, wer den Befehl ausführen darf; setze so viele, wie du
brauchst, sie müssen alle bestanden werden. `roles` nimmt eine durch Kommas getrennte Liste von Rollennamen
oder IDs:

```skript
discord command vip:
    prefixes: "!"
    roles: VIP, 1335575588307734528
    trigger:
        reply with "you have the role"
```

`permissions` nimmt die Berechtigungsliterale von Skript, dasselbe `administrator` wie oben; mehrere listest du
mit Komma auf: `permissions: kick members, ban members`. Ein unbekannter Berechtigungsname ist ein Ladefehler
und kein Laufzeitfehler (siehe [unten](#errors-you-may-see)).

`bots` begrenzt den Befehl über den Namen auf einen oder mehrere [Bots](doc:getting-started/multiple-bots);
auf jedem anderen Bot wird der Befehl mit `wrong bot` abgelehnt, statt zu laufen:

```skript
discord command onlyminimal:
    prefixes: "!"
    bots: my-bot
    trigger:
        reply with "handled by %event-bot%"
```

## Abklingzeiten {#cooldowns}

`cooldown` nimmt eine Zeitspanne und blockiert die erneute Verwendung, bis sie abgelaufen ist; `cooldown scope`
legt fest, wer sich diesen Timer teilt, und ist standardmäßig `user`.

| Scope | Geteilt zwischen |
| --- | --- |
| `user`, `member` | demselben Benutzer, in jedem Server und Kanal |
| `guild`, `server` | jedem Mitglied dieses Servers |
| `channel` | allen in diesem Kanal |

Eine Verwendung wird erst markiert, wenn alle obigen Prüfungen bestanden sind, einschließlich des Parsens der
Argumente: Ein mit `invalid arguments` abgelehnter Aufruf startet nie die Abklingzeit.

```skript
discord command slow:
    prefixes: "!"
    cooldown: 10 seconds
    cooldown message: "Wait %remaining cooldown% before using %name of event-discordcommand% again."
    trigger:
        reply with "slow command used"
```

```skript
discord command guildslow:
    prefixes: "!"
    cooldown: 10 seconds
    cooldown scope: guild
    trigger:
        reply with "guild-wide cooldown started"
```

syntax: discordcommand#cooldown compact

## Auf eine Ablehnung reagieren {#reacting-to-a-refusal}

[`on discord command failed`](event:events#discord-command-failed) wird für jeden abgelehnten Aufruf ausgelöst,
egal welche Prüfung ihn gestoppt hat. `failure reason` sagt, welche es war:

| Grund | Wann | Hat eine konfigurierte Meldung |
| --- | --- | --- |
| `invalid arguments` | ein Argument fehlt oder lässt sich nicht parsen | `usage message` |
| `wrong channel` | `executable in` hat den Kanal abgelehnt | keine |
| `missing role` | `roles` hat das Mitglied abgelehnt | keine |
| `missing permission` | `permissions` hat das Mitglied abgelehnt | `permission message` |
| `cooldown` | die Abklingzeit ist noch nicht abgelaufen | `cooldown message` |
| `wrong bot` | `bots` führt diesen Bot nicht auf | keine |

`remaining cooldown` wird nur bei einem `cooldown`-Fehler gesetzt; es ist eine Zeitspanne, bereit für
`%remaining cooldown%`. Verwende dieses Event, um auf die drei Gründe zu antworten, die keine konfigurierte
Meldung haben:

```skript
on discord command failed:
    send "[CMD] failed %name of event-discordcommand%: %failure reason% (remaining %remaining cooldown%)" to console
    if failure reason is "wrong channel":
        reply with "wrong channel for %name of event-discordcommand%"
    if failure reason is "missing role":
        reply with "you lack the role for %name of event-discordcommand%"
    if failure reason is "wrong bot":
        reply with "not for %event-bot%"
```

event: events#discord-command-failed compact

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *Unknown permission 'x' in the discord command 'name'* | Ein Eintrag `permissions` ist kein gültiges Berechtigungsliteral | Verwende einen Berechtigungsnamen, den Discord kennt, kanonisch (`kick members`) oder als Alias (`manage messages`) |
| *'x' is not a valid place for 'executable in' (expected guild, dm, threads, voice or text)* | Ein Wort von `executable in` ist falsch geschrieben | Verwende eines der Wörter aus der [Tabelle oben](#where-a-command-runs) |
| *'x' is not a valid cooldown scope (expected user, guild or channel)* | `cooldown scope` ist keiner der Werte `user`, `guild` oder `channel` | Verwende einen der drei Scopes |
