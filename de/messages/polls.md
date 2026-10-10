---
title: Umfragen
description: Eine Umfrage aus einer Nachricht auslesen, ihre Wähler auflisten, sie vorzeitig beenden und auf Stimmen reagieren, sobald sie eintreffen.
source-hash: 1290991b6d6f
---

Diese Seite behandelt eine Umfrage, die bereits auf Discord liegt: Frage und Antworten auslesen, auflisten,
wer abgestimmt hat, sie vor ihrer Frist beenden und auf Stimmen reagieren, sobald sie eintreffen. Das
Senden einer Umfrage behandelt [Umfragen erstellen](doc:messages/creating-polls). Du solltest einen Bot
namens `"my-bot"` angemeldet haben und wissen, wie man [eine Nachricht ausliest](doc:messages/managing-messages).

## So funktionieren Umfragen {#how-polls-work}

[`has a poll`](syntax:message#a-poll) sagt dir, ob eine Nachricht eine Umfrage trägt; ist das der Fall,
liefert [`poll of`](syntax:message#poll) der Nachricht ein `messagepoll` mit einer `poll question` und einer
Liste von `poll answers`, dazu [multi answer](syntax:messagepoll#multi-answer),
[poll layout](syntax:messagepoll#poll-layout) und [poll expiration date](syntax:messagepoll#poll-expiration-date).

```skript
on message received seen by "my-bot":
    if event-message has a poll:
        set {_poll} to poll of event-message
        reply with "%poll question of {_poll}%"
        loop poll answers of {_poll}:
            reply with "%answer text of loop-value%: %answer votes of loop-value% votes"
```

## Antworten {#answers}

Jedes Element von `poll answers` ist ein `pollanswer`.

| Eigenschaft | Liefert |
| --- | --- |
| [answer text](syntax:pollanswer#answer-text) | den Text der Option |
| [answer votes](syntax:pollanswer#answer-votes) | die Anzahl ihrer Stimmen als einfache Zahl |
| [answer emote](syntax:pollanswer#answer-emote) | das Emoji, das daneben angezeigt wird, falls die Umfrage eines hat; sonst nichts |
| [answer id](syntax:pollanswer#answer-id) | ihre Nummer, ab 1 in der Reihenfolge, in der die Antworten deklariert wurden |
| [answer self voted](syntax:pollanswer#answer-self-voted) | ob der Bot selbst für sie gestimmt hat |

`answer votes` braucht nie `await`: Die Anzahl kommt mit der Nachricht selbst, nicht über einen separaten
Abruf. `answer emote` gibt das Emoji selbst aus und lässt sich daher direkt in eine Nachricht einfügen.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!poll-winner":
        set {_poll} to poll of event-message
        set {_best} to first element of (poll answers of {_poll})
        loop poll answers of {_poll}:
            if answer votes of loop-value > answer votes of {_best}:
                set {_best} to loop-value
        reply with "leading: %answer text of {_best}% (%answer votes of {_best}%)"
```

## Wähler auflisten {#listing-voters}

[`voters of poll answer %number/pollanswer% of %message%`](syntax:core/expressions#expression-poll-voters)
listet die Benutzer auf, die eine Antwort gewählt haben. Die Antwort ist ein `pollanswer` oder dessen
`answer id`; die Nachricht ist die, die die Umfrage trägt, nicht die Umfrage selbst. Die Liste wird von
Discord geholt, und zwar alle Seiten davon, daher braucht die Zeile `await`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!voters":
        set {_m} to {poll::release}
        loop poll answers of (poll of {_m}):
            await set {_voters::*} to the voters of poll answer loop-value of {_m}
            reply with "%answer text of loop-value%: %{_voters::*}%"
            delete {_voters::*}
```

`{poll::release}` hält eine Nachricht, die von einem [Message-Builder (Bauobjekt)](doc:messages/creating-polls)
gesendet wurde; das ist der einzige Weg, die Nachricht der Umfrage zu behalten. Eine Antwortnummer, die die
Umfrage nicht hat, ergibt einen lesbaren Fehler (*this poll has no answer numbered \<n>*).

syntax: core/expressions#expression-poll-voters compact

## Umfrage beenden {#ending-a-poll}

[`end the poll of`](syntax:message#end-poll) schließt eine Umfrage vor ihrer Frist; danach kann niemand mehr
darüber abstimmen.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!end-poll":
        end the poll of event-message
```

[`is expired`](syntax:messagepoll#expired) ist wahr, sobald die Frist der Umfrage abgelaufen ist und keine
Stimmen mehr angenommen werden; [`is finalized`](syntax:messagepoll#finalized) ist wahr, sobald Discord die
Stimmenzahlen als endgültig festgelegt hat, was `end the poll of` ebenfalls sofort bewirkt. `end the poll of`
lehnt eine Nachricht ohne Umfrage ab sowie eine Umfrage, die bereits abgelaufen oder finalisiert ist.

syntax: message#end-poll compact

## Stimm-Events {#vote-events}

[`on message poll vote added`](event:events#poll-vote-add) und
[`on message poll vote removed`](event:events#poll-vote-remove) lösen pro Stimme aus. `event-message`,
`event-member` und `event-user` werden von Discord geholt, bevor der Trigger startet, daher braucht keiner
davon `await` (siehe [Cache und await](doc:concepts/cache-and-await)); `event-member` bleibt bei einer
Stimme in einer Direktnachricht leer.

| Event | Werte |
| --- | --- |
| `on message poll vote added` | `event-channel`, `event-guild`, `event-member`, `event-user`, `event-message` |
| `on message poll vote removed` | `event-channel`, `event-guild`, `event-member`, `event-user`, `event-message` |

```skript
on message poll vote added seen by "my-bot":
    send "%event-user% voted on a poll in %event-channel%" to console
```

Keines der beiden Events sagt, für welche Antwort gestimmt wurde: nur, wer abgestimmt hat und auf welcher
Nachricht. Lies die [Wähler](#listing-voters) jeder Antwort aus, wenn du wissen musst, welche Option sich
geändert hat.

event: events#poll-vote-add compact

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *IllegalStateException: this message carries no poll* | `end the poll of` wurde auf einer Nachricht ohne angehängte Umfrage aufgerufen | Prüfe zuerst [`has a poll`](syntax:message#a-poll) |
| *IllegalStateException: this poll is already over* | `end the poll of` wurde auf einer Umfrage aufgerufen, die bereits abgelaufen oder finalisiert ist | Prüfe `is expired`/`is finalized`, bevor du sie aufrufst, oder rufe sie nur einmal auf |

entity: messagepoll
