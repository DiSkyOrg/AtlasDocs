---
title: Über einen Webhook senden
description: Nachrichten als Webhook senden, bearbeiten und löschen, mit Name und Avatar pro Nachricht, in einem Kanal oder einem Thread.
source-hash: 881cb4db772a
---

Dieser Abschnitt behandelt, was ein Webhook-Client tut, wenn du einen hast: eine Nachricht senden,
Name und Avatar für diese Nachricht überschreiben, die gesendete Nachricht behalten, um sie später zu
bearbeiten oder zu löschen, und in einem Thread senden. Du solltest einen [Webhook-Client](doc:webhooks/webhook-clients)
in `{_hook}` haben und einen Bot namens `"my-bot"` angemeldet haben.

## Wie das Senden funktioniert {#how-posting-works}

[`make %webhookclient% post %content%`](syntax:webhookclient#webhook-post) sendet einen Text, ein
[Embed](doc:messages/embeds), eine Komponente oder einen [Nachrichten-Builder](doc:messages/sending-messages)
über den Webhook. `send` und `speak` sind derselbe Effekt unter anderen Namen. Wie `post` vergisst er
die Nachricht, die er gesendet hat.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!announce":
        set {_b} to a new webhook builder named "Announcer" in event-channel
        await set {_hook} to the build result of {_b}
        make {_hook} post "Server restart in 5 minutes"
        make {_hook} post "Restarted" with username "Status" and avatar "https://example.com/up.png"
```

`with username` und `and avatar` ändern, wie der Webhook für diese eine Nachricht erscheint; sein
eigener Name und Avatar bleiben unverändert. Ein Nachrichten-Builder als Inhalt dient als Vorlage: Sein
Inhalt, seine Embeds, Anhänge und Komponenten werden gesendet, der Rest des Builders wird ignoriert.

syntax: webhookclient#webhook-post compact

## Die gesendete Nachricht behalten {#keeping-the-sent-message}

[`a new webhook message with content %string% through %webhookclient%`](syntax:webhookmessageaction#new-webhook-message-with-content)
und `a new webhook message with embed %embedbuilder% through %webhookclient%` erstellen einen Builder für
Webhook-Nachrichten. Er folgt dem [Builder-Vertrag](doc:concepts/builders): Nichts wird gesendet, bis
`the build result of` darauf unter `await` gelesen wird, und dieses Lesen gibt die gesendete Nachricht zurück.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!status":
        set {_m} to a new webhook message with content "Checking..." through {_hook}
        set webhook username of {_m} to "Status"
        await set {_sent} to the build result of {_m}
        edit webhook message {_sent} of {_hook} to show "All systems up"
```

syntax: webhookmessageaction#result compact

## Optionen {#options}

Jede Eigenschaft unten ist auf dem Builder nur schreibbar.

| Eigenschaft | Standard | Zulässige Werte |
| --- | --- | --- |
| [webhook username](syntax:webhookmessageaction#webhook-username) | der Name des Webhooks | beliebiger Text |
| [webhook avatar url](syntax:webhookmessageaction#webhook-avatar-url) | der Avatar des Webhooks | eine Bild-URL |
| [webhook thread](syntax:webhookmessageaction#webhook-thread) | keiner, der Kanal des Webhooks | ein Thread des Kanals des Webhooks |
| [webhook thread id](syntax:webhookmessageaction#webhook-thread-id) | keine | eine Thread-ID |
| [discord content](syntax:webhookmessageaction#discord-content) | der Text des Konstruktors | beliebiger Text |
| [embed](syntax:webhookmessageaction#embed) | das Embed des Konstruktors | ein Embed |
| [attachments](syntax:webhookmessageaction#attachments) | keine | [Datei-Uploads](doc:messages/file-uploads) |
| [components](syntax:webhookmessageaction#components) | keine | Komponenten |
| [tts](syntax:webhookmessageaction#tts) | `false` | `true`, `false` |
| [suppressed embeds](syntax:webhookmessageaction#suppressed-embeds) | `false` | `true`, `false` |
| [suppressed notifications](syntax:webhookmessageaction#suppressed-notifications) | `false` | `true`, `false` |

```skript
set {_m} to a new webhook message with content "Patch notes" through {_hook}
set webhook username of {_m} to "Changelog"
set webhook avatar url of {_m} to "https://example.com/log.png"
add (a new file upload from file "plugins/notes.txt") to attachments of {_m}
set suppressed notifications of {_m} to true
await set {_sent} to the build result of {_m}
```

## Bearbeiten und Löschen {#editing-and-deleting}

[`edit webhook message %string/message% of %webhookclient% to show %content%`](syntax:core/effects#webhook-edit)
und [`delete webhook message %string/message% of %webhookclient%`](syntax:core/effects#webhook-delete)
nehmen die gesendete Nachricht oder deren ID. Ein Webhook kann nur seine eigenen Nachrichten bearbeiten
und löschen, und ein Client, der aus einer URL gebaut wurde, funktioniert genauso wie der Webhook, auf den
die URL zeigt.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!cleanup":
        set {_m} to a new webhook message with content "temporary" through {_hook}
        await set {_sent} to the build result of {_m}
        delete webhook message (discord id of {_sent}) of {_hook}
```

syntax: core/effects#webhook-edit compact

## Threads {#threads}

Ein Webhook sendet in seinen eigenen Kanal oder in einen Thread dieses Kanals. Füge `in thread %threadchannel%`
zu einem der drei Effekte hinzu oder setze `webhook thread` auf dem Builder. Eine in einem Thread gesendete
Nachricht muss mit demselben `in thread` bearbeitet und gelöscht werden, sonst antwortet Discord, dass die
Nachricht nicht existiert.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!thread-post":
        set {_tb} to a new thread builder named "Logs" from event-message
        await set {_thread} to the build result of {_tb}
        make {_hook} post "first entry" in thread {_thread}
```

## Fehler, die dir begegnen können {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *this message has no content, no embed, no attachment and no component; Discord refuses an empty message* | Ein Builder für Webhook-Nachrichten wurde ohne etwas zum Senden gebaut | Setze einen Inhalt, ein Embed, einen Anhang oder eine Komponente |
| *[10008] Unknown Message* | Die Nachricht wurde nicht von diesem Webhook gesendet, oder sie liegt in einem Thread und `in thread` fehlt | Bearbeite über den Webhook, der sie gesendet hat, und nenne den Thread |
| *[10015] Unknown Webhook* | Der Webhook wurde gelöscht | Erstelle oder hole einen neuen |

entity: webhookmessageaction
