---
title: Einen Bot starten
description: Einen Bot erstellen, ihm einen Bot-Token geben, ihn anmelden und danach sauber herunterfahren.
source-hash: dfb59241dc30
---

Diese Seite behandelt das Erstellen eines Bots, das Anmelden unter einem Namen, die Events, die
nach der Verbindung ausgelöst werden, und das Herunterfahren. Du solltest DiSky v5 bereits
installiert haben (siehe die [Installationsanleitung](doc:getting-started/installation)) und einen
Bot-Token aus dem Discord Developer Portal besitzen.

## So funktioniert das Anmelden {#how-logging-in-works}

Ein Bot beginnt als leeres, nicht verbundenes Objekt. Du konfigurierst ihn, gibst ihm einen Token
und [meldest ihn](syntax:core/effects#effect-login-bot) anschließend unter einem Namen an; über
diesen Namen holen sich deine Skripte ihn später wieder ab.

::: steps
1. Erstelle den Bot mit [a new discord bot](syntax:core/expressions#expression-new-discord-bot)
   und speichere ihn in einer Variablen.

2. Setze seinen `token` auf den Token deines Bots, den du aus einem `options:`-Block liest, damit
   er nie im Klartext im Code steht.

3. Rufe `login` auf und gib dem Bot einen Namen. Kombiniere ihn mit einem `shutdown`, damit sich
   der Bot beim Entladen des Plugins trennt.
:::

```skript
options:
    token: "YOUR-TOKEN"

command /startbot:
    trigger:
        set {_bot} to a new discord bot
        set token of {_bot} to {@token}
        login {_bot} as "my-bot"
        send "&7Logging in 'my-bot'..."

on unload:
    shutdown the bot named "my-bot"
```

Das Login läuft im Hintergrund: Der Befehl kehrt sofort zurück, und die Prüfung bei Discord
findet abseits des Hauptthreads statt. Ist der Token leer oder fehlt er, oder kann sich der Bot
nicht verbinden, gibt DiSky eine lesbare Fehlermeldung in der Konsole aus statt der rohen
Exception; nichts stürzt ab. Sobald die Verbindung steht, ist der Bot unter seinem Namen
registriert, und `the bot named
"my-bot"` liefert ihn überall in deinen Skripten.

!!! warning "Vor dem Login konfigurieren"
    `token`, `intents`, `member cache policy`, `cache flags`, `compression` und `shard count`
    können nur gesetzt werden, solange der Bot noch in der Konfiguration ist. Änderst du einen
    davon nach `login`, erscheint in der Konsole eine lesbare Fehlermeldung statt eines
    Absturzes. Die vollständige Liste und die zulässigen Werte findest du auf der Seite
    [Bot-Optionen](doc:getting-started/bot-options).

syntax: core/expressions#expression-new-discord-bot compact
syntax: core/effects#effect-login-bot compact

## Lebenszyklus-Events {#lifecycle-events}

Drei globale Events decken das Leben eines Bots ab. Sie werden für jeden Bot ausgelöst, der sich
anmeldet. Filtere deshalb mit `on ready seen by "my-bot":`, wenn du [mehrere Bots](doc:getting-started/multiple-bots)
betreibst.

- [`on guild ready`](event:events#guild-ready-event) wird einmal für jeden Server ausgelöst, mit
  dem der Bot verbunden ist, sobald die Daten dieses Servers vollständig geladen sind.
- [`on ready`](event:events#bot-ready-event) wird einmal ausgelöst, nachdem jeder Server sein
  eigenes `on guild ready` ausgelöst hat, wenn der Bot vollständig verbunden ist.
- [`on bot shutdown`](event:events#bot-shutdown-event) wird ausgelöst, sobald die Verbindung des
  Bots zu Discord geschlossen ist.

```skript
on guild ready:
    send "[DiSky] guild ready: %name of event-guild% on %event-bot%" to console

on ready:
    send "[DiSky] %event-bot% READY (%guild count of event-bot% guilds)" to console

on bot shutdown:
    send "[DiSky] %event-bot% SHUTDOWN" to console
```

## Herunterfahren {#shutting-down}

[`shutdown the bot named "..."`](syntax:core/effects#effect-shutdown-bot) trennt den Bot und hebt
die Registrierung seines Namens auf; danach kann er erneut angemeldet werden. Kombiniere jedes
`login` immer mit einem `shutdown`, typischerweise in einem `on unload:`-Block, damit der Bot sich
sauber trennt, wenn das Plugin neu geladen wird oder der Minecraft-Server stoppt.

```skript
on unload:
    shutdown the bot named "my-bot"
```

Das Anmelden eines *zweiten, eigenständigen* Bots unter einem Namen, der bereits läuft, löst keinen
Fehler aus: Der neue Bot übernimmt diesen Namen in der Registrierung, und der vorherige läuft im
Hintergrund weiter, ist aber nicht mehr über seinen Namen erreichbar. Fahre einen Bot deshalb immer
herunter, bevor du einen Ersatz unter demselben Namen anmeldest. Ein erneutes `login` auf genau
derselben Bot-Variable, während sie bereits verbunden ist, schlägt dagegen tatsächlich fehl, mit
einer lesbaren Fehlermeldung in der Konsole.

syntax: core/effects#effect-shutdown-bot compact

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *IllegalStateException: a bot needs a token before login (set token of %bot% to ...)* | `login` wurde aufgerufen, bevor `token` gesetzt wurde | Setze `token of {_bot}` vor `login` |
| *IllegalStateException: the bot '\<name>' is already connected* | `login` wurde erneut auf dieselbe Bot-Variable aufgerufen, während sie noch läuft | Melde jede Bot-Variable nur einmal an; für eine neue Verbindung verwende einen neuen Bot |
| Keine Meldung; der Effekt tut nichts | `shutdown the bot named "..."` wurde mit einem Namen aufgerufen, zu dem gerade kein laufender Bot gehört | Prüfe den Namen mit [`the bot named "..."`](doc:getting-started/multiple-bots), bevor du herunterfährst, oder stelle sicher, dass der Bot nicht bereits heruntergefahren wurde |

Verbindungsoptionen wie Intents (Event-Abonnements), Member-Cache-Richtlinie und Sharding werden
auf der Seite [Bot-Optionen](doc:getting-started/bot-options) behandelt.

entity: bot
