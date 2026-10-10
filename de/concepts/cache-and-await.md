---
title: Cache und await
description: Was der Cache enthält, die drei Regeln, die bestimmen, wann eine Zeile await braucht, und die Lesevorgänge, die immer warten.
source-hash: 84dcd78f3c1d
---

Diese Seite behandelt, woher ein Eigenschaftswert stammt (aus dem Cache des Bots oder aus einem Aufruf bei
Discord) und den [`await`](syntax:core/effects#effect-await)-Effekt, der darüber entscheidet. Vorausgesetzt
wird ein Bot, der unter `"my-bot"` angemeldet ist, und dass du weißt, wie eine Eigenschaft gelesen und
geschrieben wird (siehe [Entitäten und Eigenschaften](doc:concepts/entities-and-properties)).

## So funktioniert der Cache {#how-the-cache-works}

Wenn sich ein Bot anmeldet, behält er eine Kopie der Server, Kanäle, Rollen und Mitglieder, die er sehen
kann, im Speicher: Diese Kopie ist der Cache (Kopie im Speicher). Eine Eigenschaft wie `name of event-guild`
oder `roles of event-member` zu lesen antwortet aus dieser Kopie sofort, im Haupt-Thread, ohne Discord zu
kontaktieren. Was der Cache enthält, hängt von den Intents (Event-Abonnements) des Bots, der Cache-Richtlinie
für Mitglieder und den Cache-Flags ab; diese werden vor dem Anmelden gesetzt und auf der Seite
[Bot-Optionen](doc:getting-started/bot-options) beschrieben.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!cached":
        reply with "%name of event-guild% has %size of roles of event-member% roles here"
```

Einige Werte werden nie im Cache gehalten, weil Discord sie Bots nicht übermittelt: Bann-Einträge,
Einladungen, Audit-Logs, angeheftete Nachrichten und das Profil eines Benutzers. Einen davon zu lesen bedeutet,
Discord über seine REST-API zu fragen; das braucht einen Netzwerk-Roundtrip und darf den Haupt-Thread des
Servers nicht blockieren. Dafür ist `await` da.

## Die drei Regeln von await {#the-three-rules-of-await}

`await` steht vor einer ganzen Zeile. Es führt diese Zeile auf einem Hintergrund-Thread aus, wartet auf
Discords Antwort und setzt dann den Trigger mit dem Ergebnis fort. Welche Zeilen es akzeptieren und welche es
brauchen, hängt von der Art der Syntax auf dieser Zeile ab.

| Art der Syntax | Ohne await | Mit await | Beispiel |
| --- | --- | --- | --- |
| Ein Effekt (`post`, `kick`, `destroy`, `edit` ...) | Wartet bereits auf Discord, bevor die nächste Zeile läuft | Wird akzeptiert, mit einer Parse-Warnung, dass es überflüssig ist | `post "hello" to event-channel` |
| Ein reiner Abruf (siehe Tabelle unten) | Parse-Fehler: das Skript lädt nicht | Holt den Wert von Discord | `await set {_bans::*} to bans of event-guild` |
| Ein Lesevorgang, der warten kann (Cache und REST existieren beide) | Cache: sofort, kann leer sein | Holt den aktuellen Wert von Discord | `await set {_owner} to discord owner of event-guild` |

Effekte sind von sich aus asynchron: `post` sendet die Nachricht außerhalb des Haupt-Threads, und der Trigger
läuft weiter, sobald Discord bestätigt hat, daher hat `await` dort nichts hinzuzufügen. Bei Lesevorgängen
kommt es auf die Wahl an:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!owner":
        set {_cached} to discord owner of event-guild
        await set {_fresh} to discord owner of event-guild
        reply with "cached: %{_cached}%, fresh: %{_fresh}%"
```

Die erste `discord owner`-Zeile liest den Cache und liefert nichts, wenn der Besitzer nicht gecacht ist (etwa
ein offline Besitzer bei der Cache-Richtlinie `"online"` für Mitglieder). Die zweite fragt Discord und liefert
immer das Mitglied. Beide sind gültig: Wähle den Cache, wenn du oft liest und einen Fehlgriff verkraften
kannst, und `await`, wenn der Wert unbedingt vorhanden sein muss.

Eine Eigenschaft, die warten kann, ist eine, die der Atlas so kennzeichnet: die [members](syntax:guild#members)
eines Servers, sein [discord owner](syntax:guild#discord-owner), [user with id](syntax:user#user-with-id) und
[member with id](syntax:member#member-with-id) sind die, denen du zuerst begegnest; die Seite
[Entitäten per ID abrufen](doc:concepts/getting-by-id) behandelt die letzten beiden.

syntax: core/effects#effect-await compact

## Eigenschaften nur zum Abrufen {#retrieve-only-reads}

Diese Eigenschaften haben überhaupt keinen Cache. Discord liefert sie nur auf Anfrage, daher ist ein Lesen ohne
`await` ein Parse-Fehler, der die Eigenschaft nennt, und das Skript lädt erst, wenn die Zeile korrigiert ist.
Jede liefert bei jedem Lauf einen frischen Wert.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!audit":
        await set {_bans::*} to bans of event-guild
        await set {_pins::*} to pinned messages of event-channel
        reply with "%size of {_bans::*}% bans, %size of {_pins::*}% pinned messages"
```

| Eigenschaft | Entität | Liefert |
| --- | --- | --- |
| [application info](syntax:bot#application-info) | bot | die Anwendung hinter dem Bot |
| [invites](syntax:guild#invites) | guild | jede Einladung des Servers |
| [webhooks](syntax:guild#webhooks) | guild | jeder Webhook des Servers |
| [emotes](syntax:guild#emotes) | guild | die eigenen Emojis des Servers |
| [bans](syntax:guild#bans) | guild | die ersten 1.000 Bann-Einträge |
| [active threads](syntax:guild#active-threads) | guild | Threads, die noch nicht archiviert sind |
| [audit logs](syntax:guild#audit-logs) | guild | Einträge des Audit-Logs |
| [profile](syntax:user#profile) | user | Banner und Profilfarbe |
| [private channel](syntax:user#private-channel) | user | der Direktnachrichten-Kanal (DM) mit dem Benutzer, bei Bedarf geöffnet |
| [interested members](syntax:scheduledevent#interested-members) | scheduled event | Mitglieder, die auf *Interessiert* geklickt haben |
| [pinned messages](syntax:messagechannel#pinned-messages) | jeder Nachrichtenkanal | die angehefteten Nachrichten |
| [channel webhooks](syntax:standardguildmessagechannel#channel-webhooks) | Text- oder Ankündigungskanal | die eigenen Webhooks des Kanals |
| [thread members](syntax:threadchannel#thread-members) | thread channel | Mitglieder, die dem Thread beigetreten sind |
| [start message](syntax:threadchannel#start-message) | thread channel | die Nachricht, aus der der Thread gestartet wurde |
| [archived threads](syntax:threadcontainer#archived-threads) | Text-, Ankündigungs- oder Forumkanal | archivierte öffentliche Threads |
| [archived private threads](syntax:threadcontainer#archived-private-threads) | Text-, Ankündigungs- oder Forumkanal | archivierte private Threads |
| [the build result of](syntax:roleaction#result) | jeder Builder | die Entität, die der Builder erstellt |
| [message with id](syntax:message#message-with-id) | message channel | eine Nachricht anhand ihrer ID |

`the build result of` ist die Zeile, in der ein [Builder](doc:concepts/builders) sein Objekt tatsächlich auf
Discord erstellt; deshalb gehört sie in diese Liste.

## Eine Änderung abwarten {#awaiting-a-change}

`await` gilt auch für das Schreiben einer Eigenschaft. Ohne es wird eine Änderung, die über Discord läuft
(`set nickname of`, `add ... to roles of`, `add ... to flags of`), gesendet, und der Trigger geht weiter, bevor
Discord sie bestätigt; ein Lesevorgang auf der nächsten Zeile kann noch den alten Wert sehen. Mit `await`
blockiert die Zeile, bis Discord die Änderung übernommen hat, sodass die nächste Lesung den neuen Zustand sieht.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!verify":
        await add bypasses verification to flags of event-member
        reply with "flags now: %flags of (member with id (discord id of event-member) in event-guild)%"
```

Dasselbe gilt für jede Eigenschaft, die der Atlas als REST-gestützt kennzeichnet: Rollen, Flags, Nickname,
das Topic eines Kanals oder der AFK-Kanal eines Servers. Ein einfaches `set` reicht, wenn im selben Trigger
niemand den Wert zurückliest.

## Threads und Timing {#threads-and-timing}

Die Zeile nach `await` läuft auf einem Hintergrund-Thread, auf dem das Blockieren für Discord sicher ist. Sobald
sie fertig ist, setzt der Trigger auf dem Haupt-Thread fort, mit seinen lokalen Variablen intakt, sodass nichts,
was du nach `await` schreibst, außerhalb des Haupt-Threads läuft. Skript behandelt alles nach einem `await` als
verzögert, genau wie den Code nach einem `wait`-Effekt. Ein DiSky-Fehler innerhalb der gewarteten Zeile (eine
unbekannte ID, eine fehlende Berechtigung) ist eine lesbare Meldung in der Konsole und kein Absturz; er kann mit
`try` abgefangen werden (siehe [Fehler](doc:concepts/errors)).

!!! info "Von v4 kommend"
    Die Effekte `retrieve X and store it in {_var}` gibt es nicht mehr: Jeder davon ist jetzt eine
    Eigenschaft, die als `await set {_var} to X` geschrieben wird.

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *the 'bans' property is online-only and requires 'await' to be read* (gleicher Wortlaut für jede Eigenschaft der Tabelle oben) | Eine Eigenschaft nur zum Abrufen wurde auf einer Zeile ohne `await` gelesen. | Stelle der Zeile `await` voran: `await set {_bans::*} to bans of event-guild`. |
| *building talks to Discord, so this requires 'await'* | `the build result of` eines Builders wurde ohne `await` gelesen. | Schreibe `await set {_role} to the build result of {_builder}`. |
| *the 'message with id' getter is online-only and requires 'await'* | `message with id` wurde ohne `await` verwendet. | Stelle der Zeile `await` voran. |
| *This effect is already async; 'await' is redundant here.* (Warnung, das Skript lädt trotzdem) | `await` wurde vor einen Effekt gesetzt. | Entferne das `await`; der Effekt wartet von selbst. |
