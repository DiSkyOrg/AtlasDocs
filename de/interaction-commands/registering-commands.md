---
title: Befehle registrieren
description: Struktur- und Builder-Befehle mit update, register und unregister an Discord übertragen und lesen, was dort bereits registriert ist.
source-hash: 143b97c889fc
---

Diese Seite behandelt die drei Effekte, die [Slash-Befehle](doc:interaction-commands/slash-commands),
[Kontextbefehle](doc:interaction-commands/context-commands) und [Befehls-Builder](doc:interaction-commands/command-builders)
an Discord übertragen, sowie das Auslesen dessen, was bereits registriert ist. Du solltest bereits einen
Bot namens `"my-bot"` angemeldet haben und mindestens einen Befehl deklariert haben, als Struktur oder Builder.

## Wie die Registrierung funktioniert {#how-registration-works}

Nichts gelangt von selbst zu Discord: Eine `slash command`-Struktur und ein
`a new slash command`-Builder sind beide nur Modelle, bis ein Skript einen von drei Effekten darauf ausführt.

| Effekt | Wirkung | Verwenden, wenn |
| --- | --- | --- |
| [update](syntax:core/effects#effect-update-discord-commands) | Ersetzt die ganze Liste (ein PUT): alles, was in den angegebenen Befehlen fehlt, wird entfernt | Synchronisierung beim Start, wenn alle Befehle auf einmal übertragen werden |
| [register](syntax:core/effects#effect-register-discord-command) | Upsert nach Name: fügt hinzu oder ersetzt, lässt den Rest der Liste unberührt | Einen Befehl hinzufügen oder bearbeiten, ohne die anderen anzufassen |
| [unregister](syntax:core/effects#effect-unregister-discord-commands) | Entfernt einen Befehl, per Objekt, Name oder ID, oder alle | Einen Befehl abschaffen oder eine Liste leeren |

```skript
on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

[`all structured application commands`](syntax:core/expressions#expression-structured-discord-commands)
sammelt jede `slash command`-, `user command`- und `message command`-Struktur in eine einzige Liste,
sodass ein Builder-Befehl sich demselben Aufruf anschließt:
`update the discord commands (all structured application commands) and {_roll} in event-guild`.
Jeder der drei Effekte blockiert, bis Discord antwortet, und nimmt nie `await`; ein Fehler auf Discords
Seite läuft über die [Fehlerebene](doc:concepts/errors).

syntax: core/effects#effect-update-discord-commands compact

## Server oder global {#guild-or-global}

`in event-guild` wirkt sofort und gilt nur für diesen einen Server. `globally in event-bot` gilt für
jeden Server, in dem der Bot ist, kann aber bis zu einer Stunde brauchen, bis Benutzer ihn sehen. Die
Registrierung pro Server gehört in `on guild ready`, das für jeden Server feuert, in dem der Bot ist
(auch für solche, denen er später beitritt); die globale Registrierung gehört in `on ready`, das einmal
feuert. Siehe [Einen Bot starten](doc:getting-started/starting-a-bot) dazu, wie sich die beiden
Lebenszyklus-Events unterscheiden.

```skript
on ready:
    set {_ping} to a new slash command named "ping" with description "Pong!"
    update the discord commands {_ping} globally in event-bot
```

Denselben Befehl auf beiden Wegen zu übertragen lässt Discord ihn zweimal anzeigen: Befehle pro Server
und globale Befehle sind getrennte Listen, nicht eine in die andere zusammengeführte. Discord begrenzt
außerdem, wie oft die gesamte Liste eines Servers mit `update` ersetzt werden kann: 200 Mal pro Tag.

## Einen Befehl hinzufügen und entfernen {#adding-and-removing-one-command}

`register` und `unregister` ändern einen einzelnen Befehl, ohne die ganze Liste zu ersetzen.

```skript
on guild ready:
    set {_roll} to a new slash command named "roll" with description "Roll a dice"
    register the discord command {_roll} in event-guild
```

`register` nimmt auch mehrere Befehle auf einmal entgegen: `register the discord commands {_a} and {_b}
globally in event-bot`. `unregister` akzeptiert ein Befehlsobjekt, einen Namen oder eine rohe ID, dazu
eine Kurzform für alles:

```skript
unregister the discord command "ping" from event-guild
unregister the discord command {_roll} from event-guild
unregister all the discord commands from event-guild
```

Ein Befehlsobjekt mit bekannter [`command id`](syntax:applicationcommand#command-id) wird direkt gelöscht.
Ein Name wird zuerst unter den registrierten Befehlen nachgeschlagen, was eine zusätzliche Anfrage kostet.

syntax: core/effects#effect-register-discord-command compact

## Auslesen, was bei Discord steht {#reading-what-discord-has}

[`registered commands of`](syntax:core/expressions#expression-registered-discord-commands) fragt Discord
nach der aktuellen Live-Liste eines Servers oder der globalen Befehle eines Bots, als reguläre
Befehlsobjekte mit bereits gesetzter `command id`. Es ist ein Abruf und braucht daher
[`await`](doc:concepts/cache-and-await):

```skript
await set {_cmds::*} to registered commands of event-guild
loop {_cmds::*}:
    send "%name of loop-value% (%command id of loop-value%, %command type of loop-value%)" to console
```

Ein abgerufener Befehl kann bearbeitet und mit `register` zurückübertragen werden, wobei er nach Name per
Upsert ersetzt wird:

```skript
await set {_cmds::*} to registered commands of event-guild
loop {_cmds::*}:
    if name of loop-value is "roll":
        set disabled of loop-value to true
        register the discord command loop-value in event-guild
```

syntax: core/expressions#expression-registered-discord-commands compact

## Neuladen und Herunterfahren {#reload-and-shutdown}

Eine Struktur `slash command` oder Kontextbefehl ist ein Modell, keine lebende Registrierung: Ein
Neuladen eines Skripts tauscht das Modell aus. Der bereits an Discord übertragene Befehl funktioniert
weiter und ist an das Modell gebunden, das zum Zeitpunkt der Verwendung zu seinem vollständigen Pfad
passt. Cooldowns aus `on cooldown` sind Teil dieses Modells, daher setzt ein Neuladen sie ebenfalls zurück.

!!! warning "Nichts wird für dich gelöscht"
    Das Entfernen einer Struktur aus einem Skript, ihr Entladen oder das Herunterfahren des Bots löscht
    den passenden Befehl nie bei Discord. Er bleibt sichtbar und beantwortbar (über die generischen
    Events, falls nichts anderes greift), bis das nächste `update` ihn aus der Liste nimmt oder ein
    explizites `unregister` ihn entfernt.

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *the bot 'x' is not connected, it cannot manage commands yet* | `update`/`register`/`unregister`/`registered commands of` lief global, bevor `login` abgeschlossen war, oder nach `shutdown` | warte auf `on ready` oder übertrage stattdessen an einen Server |
| *no bot or guild to manage commands in (the variable is not set)* | der `%bot%` oder `%guild%`, den der Effekt erhält, ist eine nicht gesetzte Variable | prüfe, dass die Variable gesetzt ist, bevor der Effekt läuft |
| *expected a bot (global commands) or a guild, got x* | `registered commands of` bekam etwas anderes als einen Bot oder einen Server | übergib `event-bot` oder `event-guild` oder eine Variable mit einem davon |
| *'registered commands of' asks Discord and requires 'await' to be read* | `registered commands of` wurde außerhalb eines `await`-Blocks verwendet | umschließe das Lesen mit `await set {_x} to ...`, siehe [Cache und await](doc:concepts/cache-and-await) |
| Ein Discord-Fehler mit dem Code `50035` (*Invalid Form Body*) | ein übertragener Befehl verletzt eines von Discords eigenen Limits (Namenslänge, doppelte Optionsnamen, zu viele Auswahlmöglichkeiten ...) | prüfe den Befehl gegen Discords Limits; der Fehler nennt das genaue Feld |
