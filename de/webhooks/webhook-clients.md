---
title: Webhook-Clients
description: Einen Webhook in einem Kanal erstellen, die vorhandenen abrufen oder einen Client aus einer Webhook-URL bauen.
source-hash: 0e65abfff670
---

Dieser Abschnitt behandelt die drei Wege, etwas zu bekommen, worüber sich senden lässt: einen Webhook
erstellen, die Webhooks abrufen, die ein Server oder ein Kanal bereits hat, und einen Client aus einer
Webhook-URL bauen. Du solltest einen Bot namens `"my-bot"` angemeldet haben und den
[Builder-Vertrag](doc:concepts/builders) kennen.

## Einen Webhook erstellen {#creating-a-webhook}

[`a new webhook builder named %string% in %guildchannel%`](syntax:webhookaction#new-webhook-builder)
bereitet einen Webhook in einem Kanal vor. Wie jeder Builder (Bauobjekt) existiert nichts auf Discord,
bis du `the build result of` unter `await` liest. Der Bot braucht **Webhooks verwalten** in diesem Kanal.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!hook":
        set {_b} to a new webhook builder named "Announcer" in event-channel
        set webhook avatar of {_b} to "https://example.com/avatar.png"
        await set {_hook} to the build result of {_b}
        make {_hook} post "Hello from a fresh webhook"
```

`webhook avatar` ist der einzige Setter des Builders (eine Bild-URL oder ein lokaler Dateipfad): Name
und Kanal werden dem Konstruktor übergeben. Ein Kanal hält höchstens 15 Webhooks; Discord lehnt den
Build darüber hinaus ab.

syntax: webhookaction#new-webhook-builder compact

## Vorhandene Webhooks abrufen {#retrieving-existing-webhooks}

[`webhooks of %guild%`](syntax:guild#webhooks) listet jeden Webhook eines Servers auf, und
[`channel webhooks of %standardguildmessagechannel%`](syntax:standardguildmessagechannel#channel-webhooks)
die eines einzelnen Kanals. Beide fragen bei Discord nach, daher brauchen beide `await` (siehe
[Cache (Kopie im Speicher) und await](doc:concepts/cache-and-await)), und beide benötigen **Webhooks verwalten**.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!hooks":
        await set {_hooks::*} to channel webhooks of event-channel
        loop {_hooks::*}:
            reply with "%name of loop-value% (%webhook type of loop-value%)"
```

syntax: guild#webhooks compact

## Einen Client aus einer URL bauen {#building-a-client-from-a-url}

[`a new webhook client from url %string%`](syntax:webhookclient#new-webhook-client) macht aus einer
Webhook-URL (die Discord unter **Integrationen → Webhooks → Webhook-URL kopieren** anzeigt) einen Client.
Dafür braucht es keine Berechtigung auf dem Server, und der Bot muss nicht darauf sein: Der Bot trägt nur
die HTTP-Anfragen. Ohne `using bot` wird der einzige geladene Bot verwendet.

```skript
options:
    hook-url: "https://discord.com/api/webhooks/123/abc"

on message received seen by "my-bot":
    if discord content of event-message is "!url-hook":
        set {_client} to a new webhook client from url {@hook-url} using bot "my-bot"
        make {_client} post "Posted through a URL"
```

Ein so gebauter Client kann nur seine eigenen Nachrichten senden, bearbeiten und löschen, nichts
anderes: Er hat keinen Namen, Kanal oder Besitzer, die man lesen könnte, und `destroy` akzeptiert ihn nicht.

!!! danger "Die URL ist ein Geheimnis"
    Wer eine Webhook-URL oder ihren [webhook token](syntax:webhookclient#webhook-token) hat, kann
    darüber senden. Bewahre sie in einem `options:`-Block oder in einer Datei auf, die nicht zu den
    Skripten gehört, die du teilst.

syntax: webhookclient#new-webhook-client compact

## Webhook-Eigenschaften {#webhook-properties}

Ein abgerufener oder erstellter Webhook zeigt seinen Zustand auf Discord. `name`, `webhook avatar` und
`webhook channel` sind schreibbar und ändern den Webhook auf Discord; setze `await` davor, um vor der
nächsten Zeile auf die Änderung zu warten.

| Eigenschaft | Liefert | Schreibbar |
| --- | --- | --- |
| [name](syntax:webhook#name) | seinen Anzeigenamen | ja |
| [webhook avatar](syntax:webhook#webhook-avatar) | seine Avatar-URL | ja, aus einer Bild-URL oder einem lokalen Dateipfad |
| [webhook channel](syntax:webhook#webhook-channel) | den Kanal, in dem er sendet | ja, auf einen Textkanal (verschiebt ihn) |
| [webhook url](syntax:webhook#webhook-url) | die URL, aus der sich ein Client bauen lässt | nein |
| [webhook token](syntax:webhookclient#webhook-token) | sein geheimes Token, keins bei einem Follower-Webhook | nein |
| [webhook owner](syntax:webhook#webhook-owner) | das Mitglied, das ihn erstellt hat, keins wenn unbekannt | nein |
| [webhook type](syntax:webhook#webhook-type) | `INCOMING`, oder `CHANNEL_FOLLOWER` für einen Webhook, der einen Ankündigungskanal weiterleitet | nein |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!rename-hooks":
        await set {_hooks::*} to channel webhooks of event-channel
        loop {_hooks::*}:
            await set name of loop-value to "Renamed"
```

## Einen Webhook löschen {#deleting-a-webhook}

[`destroy`](syntax:core/effects#destroy) löscht einen Webhook; jeder Client, der aus seiner URL gebaut
wurde, funktioniert im selben Moment nicht mehr.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!clear-hooks":
        await set {_hooks::*} to channel webhooks of event-channel
        loop {_hooks::*}:
            destroy loop-value
```

## Fehler, die dir begegnen können {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *a webhook client needs a running bot to carry its requests* | `a new webhook client from url` lief, ohne dass ein Bot angemeldet war, oder mit mehreren Bots und keinem davon benannt | Melde zuerst einen Bot an, oder füge `using bot "my-bot"` hinzu |
| Ein *Discord error* mit **Missing Permissions** | Dem Bot fehlt **Webhooks verwalten** im Kanal | Gewähre sie im Kanal oder auf dem Server |
| *[10015] Unknown Webhook* | Der Webhook wurde gelöscht, oder die URL ist falsch | Erstelle einen neuen Webhook oder prüfe die URL |

entity: webhook
