---
title: Umfragen erstellen
description: Eine Umfrage mit Frage, Antworten und Dauer erstellen, dann allein oder an einer Nachricht hängend senden.
source-hash: 14d873b48b97
---

Diese Seite behandelt das Erstellen einer Umfrage und ihr Senden: allein mit `post` oder `reply with` oder
angehängt an einen Message-Builder (Bauobjekt). Eine Umfrage auszulesen, sie zu beenden und ihre
Stimm-Events stehen auf der Seite [Umfragen](doc:messages/polls). Du solltest einen Bot namens `"my-bot"`
angemeldet haben und wissen, wie [das Senden von Nachrichten](doc:messages/sending-messages) funktioniert.

## So wird eine Umfrage erstellt {#how-a-poll-is-built}

[`a new poll titled %string%`](syntax:pollbuilder#new-poll) erstellt eine Umfrage aus ihrer Frage. Füge ihre
Antworten zu [`poll answer drafts`](syntax:pollbuilder#poll-answer-drafts) hinzu und übergib die Umfrage dann
wie jeden anderen Inhalt an [`post`](syntax:core/effects#post) oder [`reply with`](syntax:core/effects#effect-reply-with).
`with` und `asking` funktionieren statt `titled`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!lunch":
        set {_poll} to a new poll titled "Where do we eat?"
        add "Pizza", "Burgers" and "Sushi" to poll answer drafts of {_poll}
        post {_poll} to event-channel
```

Eine Umfrage ist kein Builder im Sinne des [Builder-Konzepts](doc:concepts/builders): Sie hat kein
`build result of`, und ihr Senden braucht nie `await`. Sie wird beim Senden oder Anhängen geprüft, daher
schlägt eine Umfrage ohne Antwort in dieser Zeile fehl, nicht in der Zeile, die sie erstellt hat. Die
Umfrage, die gesendet wird, ist eine Kopie: Wenn du `{_poll}` danach änderst, ändert sich auf Discord
nichts, und dieselbe Umfrage lässt sich zweimal senden.

syntax: pollbuilder#new-poll compact

## Optionen {#options}

| Eigenschaft | Standard | Zulässige Werte |
| --- | --- | --- |
| [poll question](syntax:pollbuilder#poll-question) | die Frage des Konstruktors | bis zu 300 Zeichen |
| [poll answer drafts](syntax:pollbuilder#poll-answer-drafts) | keine | 1 bis 10 Antworten; `set`, `add`, `remove` |
| [poll duration](syntax:pollbuilder#poll-duration) | `24 hours` | von `1 hour` bis `7 days` |
| [multi answer](syntax:pollbuilder#multi-answer) | `false` | `true`: Wähler dürfen mehrere Antworten wählen |

Anders als die meisten Builder lassen sich diese Eigenschaften auslesen, sodass ein Skript die Umfrage vor
dem Senden prüfen kann.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!vote":
        set {_poll} to a new poll asking "Which features next?"
        add "Music" and "Levels" to poll answer drafts of {_poll}
        set poll duration of {_poll} to 3 days
        set multi answer of {_poll} to true
        reply with "%size of poll answer drafts of {_poll}% options, open for %poll duration of {_poll}%"
        reply with {_poll}
```

## Antworten mit Emoji {#answers-with-an-emoji}

Ein einfacher Text, der zu `poll answer drafts` hinzugefügt wird, wird zu einer Antwort ohne Emoji. Für ein
Emoji füge stattdessen [`a new poll answer with text %string% with emoji %emote/string%`](syntax:pollanswerdata#new-answer)
hinzu: Das Emoji ist ein Unicode-Emoji, ein Emote-Wert oder die Form `<:name:id>` eines Server-Emojis.

```skript
set {_poll} to a new poll titled "Favorite food?"
add (a new poll answer with text "Pizza" with emoji "🍕") to poll answer drafts of {_poll}
add (a new poll answer with text "Sushi" with emoji "🍣") to poll answer drafts of {_poll}
remove "Pizza" from poll answer drafts of {_poll}
```

`remove` findet Antworten über ihren Text, unabhängig davon, ob sie als Text oder als Antwort-Objekt
hinzugefügt wurden. Ein Antwort-Objekt lässt sich vor dem Hinzufügen noch über
[draft answer text](syntax:pollanswerdata#draft-answer-text) und [draft answer emoji](syntax:pollanswerdata#draft-answer-emoji)
ändern; einmal hinzugefügt, hält die Umfrage eine eigene Kopie.

syntax: pollanswerdata#new-answer compact

## Umfragen auf einem Message-Builder {#polls-on-a-message-builder}

`post` und `reply with` vergessen die Nachricht, die sie senden. Um sie zu behalten, etwa um die Umfrage
später zu beenden oder ihre Wähler auszulesen, setze [`attached poll`](syntax:messageaction#attached-poll)
auf einem [Message-Builder](sending-messages.md#building-a-message) und baue ihn: Die Umfrage wird zusammen
mit dem Inhalt der Nachricht gesendet.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!poll-kept":
        set {_poll} to a new poll titled "Ship it?"
        add "Yes" and "No" to poll answer drafts of {_poll}
        set {_m} to a new message with content "Release vote" in event-channel
        set attached poll of {_m} to {_poll}
        await set {_sent} to the build result of {_m}
        set {poll::release} to {_sent}
```

Eine Nachricht trägt höchstens eine Umfrage: Wird `attached poll` erneut gesetzt, ersetzt es die vorherige.
Eine Umfrage kann sich keine Nachricht mit Komponenten v2 teilen (Container, Abschnitte, Textanzeigen).

syntax: messageaction#attached-poll compact

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *a poll needs at least one answer* | Die Umfrage wurde mit einer leeren `poll answer drafts` gesendet | Füge Antworten hinzu, bevor du sendest |
| *a poll holds at most 10 answers, this one has \<n>* | Zu viele Antworten | Entferne einige, oder teile sie in zwei Umfragen auf |
| *a poll lasts between 1 hour and 168 hours (7 days), this one lasts \<n> hours* | `poll duration` liegt außerhalb des Bereichs | Wähle eine Dauer von 1 Stunde bis 7 Tagen |
| *the poll question is \<n> characters long, the maximum is 300* | Die Frage ist zu lang | Kürze sie |
| *the poll answer "..." is \<n> characters long, the maximum is 55* | Eine Antwort ist zu lang | Kürze sie |

entity: pollbuilder
