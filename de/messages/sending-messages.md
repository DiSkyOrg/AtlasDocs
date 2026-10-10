---
title: Nachrichten senden
description: In einen Kanal senden, auf das aktuelle Event antworten oder eine Nachricht erstellen, die du später bearbeiten und anheften kannst.
source-hash: 096c18e2bd26
---

Diese Seite behandelt die drei Wege, eine Nachricht auf Discord zu bringen: `post`, `reply with` und
den Message-Builder. Du solltest bereits einen Bot namens `"my-bot"` angemeldet haben und den
[Vertrag der Builder](doc:concepts/builders) sowie die [drei `await`-Regeln](doc:concepts/cache-and-await)
kennen.

## So funktioniert das Senden {#how-sending-works}

[`post`](syntax:core/effects#post) sendet einen Text, ein Embed oder eine Komponente an einen Kanal,
den du angibst. [`reply with`](syntax:core/effects#effect-reply-with) sendet dieselben Arten von
Inhalten, wählt den Kanal aber selbst: den, in dem das aktuelle Event stattgefunden hat. Keiner von
beiden gibt dir die gesendete Nachricht zurück; dafür musst du zuerst einen Builder erstellen (siehe
unten).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!post":
        post "plain text from DiSky" to event-channel
```

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!reply":
        reply with "replied in the event channel"
```

In einem Message-Event sendet `reply with` an `event-channel`, genau wie im Beispiel oben. In einem
Interaktions-Event beantwortet es stattdessen die Interaktion, und `hidden` macht diese Antwort flüchtig
(nur für den Benutzer sichtbar, der sie ausgelöst hat; außerhalb von Interaktionen ohne Wirkung).
Mit einer Referenz verknüpfst du die Antwort mit einer Nachricht, so wie es Discords eigene
Antwortfunktion tut:

```skript
reply with "replied with a reference" with reference event-message
```

syntax: core/effects#effect-reply-with compact

## Senden in einen Kanal {#posting-to-a-channel}

`post` und `dispatch` sind derselbe Effekt unter zwei Namen; nimm den, der besser lesbar ist. Er
akzeptiert einen Text, ein [Embed](doc:messages/embeds), eine Komponente oder eine Umfrage und sendet
an jeden [Nachrichtenkanal](entity:messagechannel), den du ihm übergibst, nicht nur an `event-channel`:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!echo":
        set {_target} to event-channel
        post "posted from a variable" to {_target}
        dispatch "same effect, different name" in {_target}
```

!!! info "Umfragen laufen über dieselben Effekte"
    `post` und `reply with` akzeptieren auch eine Umfrage, die mit `a new poll titled ...` erstellt
    wurde, und ein Message-Builder transportiert sie über `attached poll`. Siehe
    [Umfragen erstellen](doc:messages/creating-polls).

syntax: core/effects#post compact

## Eine Nachricht erstellen {#building-a-message}

[`a new message with content %string% in %messagechannel%`](syntax:messageaction#new-message-with-content)
und `a new message with embed %embedbuilder% in %messagechannel%` erstellen einen Message-Builder. Er
folgt demselben Vertrag wie jeder andere Builder: Nichts wird gesendet, bis du `the build result of`
davon liest, was `await` erfordert. Zurück kommt eine echte, bereits gesendete Nachricht, die du
bearbeiten, anheften oder deren Eigenschaften du auslesen kannst.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!edit":
        set {_m} to a new message with content "before" in event-channel
        await set {_sent} to the build result of {_m}
        edit {_sent} to show "after"
```

`reply with {_m}` akzeptiert auch einen Message-Builder als Abkürzung: Er sendet den Inhalt, die
Embeds, Anhänge und die Umfrage des Builders erneut über den Kanal des Events oder über die
Interaktion, ohne ihn jemals über `the build result of` zu erstellen. Du bekommst dadurch nie eine
Nachricht zurück. Der eigene Kanal des Builders wird ignoriert, und `tts`, `suppressed notifications`
sowie die eigene `referenced message` des Builders werden nicht übernommen; dafür verwendest du
`with reference` direkt auf `reply with`.

```skript
set {_m} to a new message with content "reply from a builder" in event-channel
reply with {_m} with reference event-message
```

syntax: messageaction#result compact

## Optionen {#options}

Jede Eigenschaft unten ist am Builder nur schreibbar: Lies sie stattdessen an der gesendeten Nachricht
zurück.

| Eigenschaft | Standard | Zulässige Werte |
| --- | --- | --- |
| [discord content](syntax:messageaction#discord-content) | nicht gesetzt | beliebiger Text |
| [embed](syntax:messageaction#embed) | nicht gesetzt | ein [Embed](doc:messages/embeds) |
| [attached poll](syntax:messageaction#attached-poll) | nicht gesetzt | eine [Umfrage](doc:messages/creating-polls) |
| [tts](syntax:messageaction#tts) | `false` | `true`, `false` |
| [suppressed embeds](syntax:messageaction#suppressed-embeds) | `false` | `true`, `false` |
| [suppressed notifications](syntax:messageaction#suppressed-notifications) | `false` | `true`, `false` |
| [referenced message](syntax:messageaction#referenced-message) | nicht gesetzt | eine Nachricht |
| [mention replied user](syntax:messageaction#mention-replied-user) | `true` | `true`, `false` |
| [fail on invalid reply](syntax:messageaction#fail-on-invalid-reply) | `false` | `true`, `false` |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!new-message":
        set {_m} to a new message with content "built, then sent" in event-channel
        set tts of {_m} to false
        set suppressed embeds of {_m} to false
        set suppressed notifications of {_m} to true
        await set {_sent} to the build result of {_m}
```

## Auf eine Nachricht antworten {#replying-to-a-message}

`referenced message`, `mention replied user` und `fail on invalid reply` sind die eigenen Mittel des
Builders, um zu antworten, neben `content` oder `embed`, statt über `reply with ... with reference`.
`mention replied user` hat nur Wirkung, sobald eine `referenced message` gesetzt ist: Es entscheidet,
ob der Autor der referenzierten Nachricht eine Erwähnung erhält. `fail on invalid reply` legt fest,
was passiert, wenn diese Nachricht beim Senden des Builders nicht mehr existiert: `false` (der
Standard) sendet die Nachricht trotzdem, ohne Antwortverweis; `true` lässt den Build fehlschlagen.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!reply-ref":
        set {_m} to a new message with content "this is a reply" in event-channel
        set referenced message of {_m} to event-message
        set mention replied user of {_m} to false
        set fail on invalid reply of {_m} to false
        await set {_sent} to the build result of {_m}
```

## Fehler, auf die du stoßen kannst {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *IllegalStateException: this message has no content, no embed, no attachment and no component; Discord refuses an empty message* | `the build result of` wurde auf einem Builder gelesen, in dem nichts gesetzt ist | Setze vor dem Erstellen einen `content`, `embed` oder Anhang |
| *IllegalStateException: this message's content is \<n> characters long, the maximum is 2000* | Der `content` des Builders (oder `discord content`) überschreitet das Discord-Limit | Kürze den Text, oder teile ihn auf mehr als eine Nachricht auf |

entity: messageaction
