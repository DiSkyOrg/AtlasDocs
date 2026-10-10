---
title: Entitäten per ID abrufen
description: Eine Guild, Rolle, einen Benutzer, ein Mitglied, einen Kanal oder eine Nachricht anhand ihrer Discord-ID nachschlagen, aus dem Cache oder von Discord.
source-hash: 893b6eae5d40
---

Diese Seite behandelt die Ausdrücke `X with id "..."`: welche Entitäten eine haben, welche einen Bereich
brauchen und wann die Suche den Cache liest oder Discord fragt. Vorausgesetzt wird ein Bot, der unter
`"my-bot"` angemeldet ist, und dass du die [await-Regeln](doc:concepts/cache-and-await) kennst, die hier nicht
wiederholt werden.

## So funktioniert ein Getter {#how-a-getter-works}

Jede Entität, die du außerhalb eines Events erreichst, hat einen Getter der Form `X with id %string%`. Die ID ist
der Snowflake (Discord-ID) der Entität, aus dem Client kopiert, wenn der **Entwicklermodus** aktiviert ist
(Rechtsklick, **ID kopieren**). Der Getter liefert die Entität oder nichts, wenn der Bot diese ID nicht kennt.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!role":
        set {_role} to role with id "123456789012345678"
        reply with "role: %name of {_role}%"
```

| Getter | Bereich | Await | Beispiel |
| --- | --- | --- | --- |
| [guild with id](syntax:guild#guild-with-id) | bot | nur Cache | `guild with id "..."` |
| [role with id](syntax:role#role-with-id) | bot | nur Cache | `role with id "..."` |
| [user with id](syntax:user#user-with-id) | bot | optional: Cache, oder Discord mit `await` | `await set {_u} to user with id "..."` |
| [text channel with id](syntax:textchannel#text-channel-with-id) | bot | nur Cache | `text channel with id "..."` |
| [voice channel with id](syntax:voicechannel#voice-channel-with-id) | bot | nur Cache | `voice channel with id "..."` |
| [stage channel with id](syntax:stagechannel#stage-channel-with-id) | bot | nur Cache | `stage channel with id "..."` |
| [news channel with id](syntax:newschannel#news-channel-with-id) | bot | nur Cache | `news channel with id "..."` |
| [forum channel with id](syntax:forumchannel#forum-channel-with-id) | bot | nur Cache | `forum channel with id "..."` |
| [category with id](syntax:category#category-with-id) | bot | nur Cache | `category with id "..."` |
| [thread channel with id](syntax:threadchannel#thread-channel-with-id) | bot | nur Cache | `thread channel with id "..."` |
| [member with id](syntax:member#member-with-id) | `in %guild%` | optional: Cache, oder Discord mit `await` | `await set {_m} to member with id "..." in event-guild` |
| [scheduled event with id](syntax:scheduledevent#scheduled-event-with-id) | `in %guild%` | nur Cache | `scheduled event with id "..." in event-guild` |
| [message with id](syntax:message#message-with-id) | `in %channel%` | erforderlich | `await set {_msg} to message with id "..." in event-channel` |

IDs sind Text, nie Zahlen: Ein Snowflake wie `1234567890123456789` hat mehr Stellen, als Skript-Zahlen genau
halten, sodass `role with id 1234567890123456789` eine gerundete ID nachschlagen würde. Setze die ID immer in
Anführungszeichen oder übergib eine Textvariable, die sie hält.

## Globale Getter und der Bot {#global-getters-and-the-bot}

Server, Rollen, Benutzer und Kanäle gehören nicht zu etwas, das du bereits hältst. Ihre Getter suchen die ID daher
im Cache eines Bots nach und müssen wissen, welcher Bot gemeint ist. Jeder endet mit einem optionalen
`with bot %bot%`: Lass es weg, wenn ein einziger Bot angemeldet ist, und nenne den Bot, wenn mehrere angemeldet sind.

```skript
on ready seen by "my-bot":
    set {_guild} to guild with id "123456789012345678" with bot event-bot
    send "found %name of {_guild}% on %event-bot%" to console
```

Wenn `with bot` fehlt und ein einziger Bot läuft, wird dieser Bot verwendet. Laufen mehrere, wählt DiSky einen
davon aus und gibt in der Konsole eine Warnung aus, die dich auffordert, den Bot anzugeben. Die Suche läuft
trotzdem, aber gegen einen Bot, der möglicherweise nicht auf dem Server ist, den du erwartest. Skripte, die
[mehr als einen Bot](doc:getting-started/multiple-bots) betreiben, sollten immer `with bot` angeben.

syntax: member#member-with-id compact

## Getter mit Bereichsangabe {#scoped-getters}

Ein Mitglied, ein geplantes Event und eine Nachricht existieren nur innerhalb von etwas anderem. Ihre Getter nehmen
daher diesen Container statt eines Bots: `member with id "..." in event-guild`,
`scheduled event with id "..." in event-guild`, `message with id "..." in event-channel`. Der Bot ist derjenige,
der den Container hält, daher gibt es kein `with bot` hinzuzufügen. `from` funktioniert anstelle von `in`, und das
Typwort ist optional (`in guild {_g}`, `in channel {_c}`).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!fetch":
        await set {_msg} to message with id "123456789012345678" in event-channel
        reply with "that message says: %discord content of {_msg}%"
```

`message with id` ist nur zum Abrufen gedacht: Nachrichten werden nicht gecacht, daher fragt der Getter immer
Discord, und die Zeile muss `await` tragen. Ohne es lädt das Skript nicht.

syntax: message#message-with-id compact

## Cache oder Discord {#cache-or-discord}

`user with id` und `member with id` antworten aus dem Cache, wenn sie einfach geschrieben werden, und fragen
Discord, wenn die Zeile mit `await` beginnt. Die Cache-Form ist sofort, kennt aber nur die Benutzer und Mitglieder,
denen der Bot bereits begegnet ist (das hängt von der Cache-Richtlinie für Mitglieder ab). Die Form mit `await`
findet jeden, den der Bot sehen darf.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!whois":
        set {_cached} to member with id "123456789012345678" in event-guild
        await set {_fresh} to member with id "123456789012345678" in event-guild
        reply with "cached: %{_cached}%, fetched: %{_fresh}%"
```

Mit `await` wird der Cache trotzdem zuerst geprüft, und Discord wird nur bei einem Fehlgriff gefragt. Daher kostet
es nichts, jede Suche mit `await` zu versehen, wenn die Entität bereits bekannt ist. Die übrigen Getter arbeiten nur
mit dem Cache: Ein Kanal oder eine Rolle, die der Bot in seinem Cache nicht sieht, wird nicht gefunden, egal was
du der Zeile voranstellst.

## Wenn die ID unbekannt ist {#when-the-id-is-unknown}

Eine gecachte Suche, die nichts findet, liefert nichts: Die Variable bleibt ungesetzt, und es wird kein Fehler
ausgegeben. Eine Suche mit `await`, die Discord nicht auflösen kann, ist ein Discord-Fehler (*Unknown User*,
*Unknown Member*, *Unknown Message*), der als lesbarer Fehler in der Konsole gemeldet wird; auch dann bleibt die
Variable ungesetzt. Prüfe die Variable, bevor du sie verwendest, oder umschließe die Suche mit `try` (siehe
[Fehler](doc:concepts/errors)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!check":
        await set {_user} to user with id "000000000000000000"
        if {_user} is not set:
            reply with "no user with that id"
            stop
        reply with "found %name of {_user}%"
```

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *the 'message with id' getter is online-only and requires 'await'* | `message with id` wurde auf einer Zeile ohne `await` verwendet. | Stelle der Zeile `await` voran. |
| *Several bots are loaded but none was specified; using '\<name>'. Specify the bot explicitly to remove this ambiguity.* | Ein globaler Getter lief ohne `with bot`, während mehr als ein Bot angemeldet war. | Füge `with bot event-bot` (oder `with the bot named "my-bot"`) zum Getter hinzu. |
