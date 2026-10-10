---
title: Mehrere Bots
description: Mehrere Bots auf einem Server betreiben, Events pro Bot filtern und den Zustand eines Bots auslesen.
source-hash: 254c79bb8d32
---

Diese Seite behandelt, was sich ändert, wenn mehr als ein Bot auf demselben Server angemeldet ist: wie
Events pro Bot gefiltert werden, wie du einen Bot über seinen Namen findest und welche Eigenschaften dir
sagen, was ein Bot gerade tut. Du weißt bereits, wie du einen Bot erstellst und anmeldest (siehe
[Einen Bot starten](doc:getting-started/starting-a-bot)).

## Wie mehrere Bots nebeneinander laufen {#how-several-bots-coexist}

Jeder Bot ist eine unabhängige Verbindung, die durch den Namen identifiziert wird, unter dem du ihn mit
[login](syntax:core/effects#effect-login-bot) anmeldest. Namen werden ohne Berücksichtigung der
Groß- und Kleinschreibung verglichen, und es gibt keine Obergrenze für die Anzahl gleichzeitig laufender
Bots: Melde einen zweiten Bot genauso an wie den ersten, nur unter einem anderen Namen.

```skript
options:
    token: "YOUR-TOKEN"
    music-token: "YOUR-MUSIC-TOKEN"

on load:
    set {_bot} to a new discord bot
    set token of {_bot} to {@token}
    login {_bot} as "my-bot"
    set {_music} to a new discord bot
    set token of {_music} to {@music-token}
    login {_music} as "music"

on unload:
    shutdown the bot named "my-bot"
    shutdown the bot named "music"
```

In v5 ist der Bot nie ein Argument eines Effekts oder Ausdrucks: DiSky leitet ihn aus der Entität ab,
auf die du wirkst. Wenn du auf eine Nachricht antwortest, einen Kanal bearbeitest oder ein Mitglied
kickst, ist der Bot, der diese Nachricht, diesen Kanal oder dieses Mitglied empfangen hat, derjenige,
der die Arbeit erledigt. Dasselbe Skript funktioniert daher unverändert, ob ein oder zehn Bots geladen
sind.

!!! info "Ein Name, ein Bot"
    Wenn du den Namen eines laufenden Bots für ein neues `login` wiederverwendest, wird der alte Bot
    nicht gestoppt. Fahre ihn zuerst herunter, wie in
    [Einen Bot starten](doc:getting-started/starting-a-bot#shutting-down) beschrieben.

## Events mit seen by filtern {#filtering-events-with-seen-by}

Jedes DiSky-Event wird einmal pro Bot ausgelöst, der es empfängt. Befinden sich zwei Bots im selben
Server, läuft `on message received:` für eine einzige Nachricht zweimal, je einmal mit jedem Bot. Um nur
auf einen einzelnen Bot zu hören, hänge `seen by "<name>"` an die Event-Zeile an: Der Trigger (Codeblock)
läuft dann nur, wenn der Bot mit diesem Namen das Event ausgelöst hat. Ohne den Filter läuft der Trigger
für jeden Bot.

```skript
on ready seen by "music":
    send "music is up with %guild count of event-bot% guilds" to console

on message received seen by "my-bot":
    send "my-bot saw a message from %event-user% in %event-channel%" to console
```

Innerhalb jedes DiSky-Events ist `event-bot` der Bot, der es ausgelöst hat, unabhängig davon, ob du
`seen by` verwendet hast. Das ist die übliche Art, Bots in einem gemeinsamen Handler zu unterscheiden,
und es funktioniert auch bei den Lebenszyklus-Events: Ein Handler für [ready](event:events#bot-ready-event)
oder [guild ready](event:events#guild-ready-event) ohne Filter läuft einmal pro Bot, wobei `event-bot`
entsprechend gesetzt ist.

`seen by` vergleicht den Login-Namen des Bots, nicht seinen Discord-Benutzernamen, und die Groß- und
Kleinschreibung spielt dabei keine Rolle. Ein Filter mit dem Namen eines Bots, der nie angemeldet wird,
ist kein Fehler: Der Trigger läuft einfach nie.

event: events#bot-ready-event compact

## Einen Bot finden {#finding-a-bot}

Außerhalb eines Events gibt [the bot named](syntax:core/expressions#expression-bots) den Bot zurück, der
unter diesem Namen angemeldet ist, und `all bots` gibt jeden laufenden Bot zurück. Ein unbekannter Name
liefert nichts statt eines Fehlers; prüfe das Ergebnis deshalb, bevor du es verwendest.

```skript
command /bot-info <text>:
    trigger:
        set {_bot} to the bot named arg-1
        if {_bot} is not set:
            send "No loaded bot named '%arg-1%'."
            stop
        send "%name of {_bot}%: %guild count of {_bot}% guilds, %gateway ping of {_bot}% ms"
```

`all bots` ist eine Liste, funktioniert also mit `loop` und mit `number of`:

```skript
command /bots:
    trigger:
        send "%number of all bots% bot(s) loaded:"
        loop all bots:
            send "- %name of loop-value% (%running shards of loop-value% shard(s))"
```

Ein Bot taucht in `all bots` auf, sobald `login` seine Verbindung aufgebaut hat, und das passiert bevor
sein `ready`-Event ausgelöst wird. Verwende die [connected](syntax:bot#connected)-Bedingung
(`if {_bot} is connected:`), wenn der Unterschied wichtig ist.

syntax: core/expressions#expression-bots compact

## Den Zustand eines Bots auslesen {#reading-a-bots-state}

Die folgenden Eigenschaften sind schreibgeschützt und beschreiben die laufende Verbindung. Alle akzeptieren
einen Bot aus `the bot named`, `loop-value` oder `event-bot`.

| Eigenschaft | Liefert | Hinweise |
| --- | --- | --- |
| [name](syntax:bot#name) | Text | Der Login-Name, nicht der Discord-Benutzername. |
| [gateway ping](syntax:bot#gateway-ping) | Zahl (ms) | Mittelwert über alle Shards; `-1`, bevor der Bot läuft. |
| [guild count](syntax:bot#guild-count) | Zahl | `0`, bevor der Bot läuft. |
| [guilds](syntax:bot#guilds) | Server | Leer, bevor der Bot läuft. |
| [self user](syntax:bot#self-user) | Benutzer | Das eigene Discord-Konto des Bots; keines, bevor der Bot läuft. |
| [avatar url](syntax:bot#avatar-url) | Text | Das effektive Avatar des self user; keines, bevor der Bot läuft. |
| [running shards](syntax:bot#running-shards) | Zahl | Aktuell verbundene Shards; `0`, bevor der Bot läuft. |
| [online status](syntax:bot#online-status) | Online-Status | Der gesetzte Status oder keiner, falls du nie einen gesetzt hast. |

```skript
command /bot-status <text>:
    trigger:
        set {_bot} to the bot named arg-1
        if {_bot} is not set:
            stop
        send "user: %self user of {_bot}% (%avatar url of {_bot}%)"
        send "shards: %running shards of {_bot}%/%shard count of {_bot}%"
        send "status: %online status of {_bot}%"
        loop guilds of {_bot}:
            send "- %name of loop-value%"
```

`shard count of {_bot}` ist die Gesamtzahl, mit der der Bot erstellt wurde; `running shards` geteilt durch
`shard count` zeigt also, ob alle Shards hochgefahren sind. Die Sharding-Optionen selbst werden unter
[Bot-Optionen](doc:getting-started/bot-options) behandelt.

syntax: bot#gateway-ping compact

syntax: bot#guild-count compact

syntax: bot#running-shards compact
