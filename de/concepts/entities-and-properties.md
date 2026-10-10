---
title: Entitäten und Eigenschaften
description: Jedes Discord-Objekt ist eine Entität; seine Daten werden als Eigenschaft gelesen und geschrieben.
source-hash: 1cd0f4533c71
---

Diese Seite behandelt das Muster hinter fast jeder Syntax im Atlas: Ein Discord-Objekt ist eine Entität, und
seine Daten sind eine Eigenschaft, die du mit einer festen Grammatik liest und schreibst. Vorausgesetzt wird
ein Bot, der als `"my-bot"` angemeldet ist, und dass in Skript `use type properties: true` aktiviert ist (siehe
[Was du brauchst](doc:getting-started)).

## So funktionieren Eigenschaften {#how-properties-work}

Ein Server, ein Mitglied, eine Rolle, eine Nachricht, ein Kanal: Jedes davon ist eine *Entität*, ein
Skript-Typ, der von einem echten Discord-Objekt getragen wird. Die Daten einer Entität sind eine *Eigenschaft*,
die in einer von zwei gleichwertigen Formen gelesen wird:

```skript
on ready seen by "my-bot":
    send "[DiSky] %name of event-bot% (%discord id of event-bot%)" to console
    send "[DiSky] %event-bot's name%" to console
```

`name of event-bot` und `event-bot's name` lesen denselben Wert; nimm die Form, die im Satz besser passt. Beide
Formen werden für jede Eigenschaft im Atlas akzeptiert, bei jeder Entität, die sie besitzt.

Entitäten bilden außerdem eine Hierarchie: Eine spezifischere Entität wird überall in eine allgemeinere
umgewandelt, wo dieser allgemeinere Typ erwartet wird. Ein Textkanal ist auch ein Server-Kanal, ein
Nachrichtenkanal und ein Kanal, daher wird `name of event-channel` akzeptiert, auch wenn `event-channel`
tatsächlich ein Textkanal ist. Ein Mitglied wird auf dieselbe Weise in seinen Benutzer umgewandelt, sodass eine
Eigenschaft, die nur auf `user` existiert, auch aus einer `member`-Variablen gelesen werden kann.

## Gemeinsame Eigenschaften {#shared-properties}

Manche Eigenschaften werden einmal registriert und über jede Entität geteilt, die sie besitzt, statt pro
Entität neu implementiert zu werden. Das Lesen oder Schreiben einer davon erfordert
[`use type properties: true`](doc:getting-started) in der Konfiguration von Skript; neuere Skript-Versionen
aktivieren das standardmäßig.

| Eigenschaft | Getragen von |
| --- | --- |
| `name` | applicationinfo, bot, embedfield, emote, forumtag, guild, member, role, scheduledevent, sticker, user, channel, webhook |
| `avatar url` | applicationinfo, bot, guild, member, sticker, user |
| `guild` | logentry, member, message, role, scheduledevent, webhook, guildchannel, guildsticker |
| `online status` | bot, member |
| `color` | embedbuilder, role, roleaction |
| `jump url` | message, guildchannel |
| `value` | embedfield |
| `title` | embedbuilder, modal |
| `style` | button, textinput |

```skript
on ready seen by "my-bot":
    set {_g} to first element of (guilds of event-bot)
    send "[DiSky] guild %name of {_g}%, avatar %avatar url of {_g}%" to console
```

## IDs und Erwähnungen {#ids-and-mentions}

Zwei Eigenschaften stammen von Entitäten auf Schnittstellenebene statt von einer bestimmten Entität, daher lesen
sie sich gleich bei allem, dem Discord eine ID oder eine Erwähnung zuweist. [`discord id`](syntax:snowflake#discord-id)
und [`creation date`](syntax:snowflake#creation-date) funktionieren bei jedem *Snowflake* (Discord-ID): einem
Mitglied, einem Benutzer, einem Server, einer Rolle, einem Kanal, einer Nachricht ... Die
[`mention tag`](syntax:mentionable#mention-tag)-Eigenschaft funktioniert bei jeder *erwähnbaren* Entität (einem
Benutzer, einem Mitglied, einer Rolle, einem Kanal, einem Emoji) und wird als anklickbare Erwähnung dargestellt,
wenn sie in einer Nachricht gesendet wird.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!id":
        reply with "Your id is %discord id of event-member%, your account dates from %creation date of event-member%"
        reply with "Hey %mention tag of event-member%!"
```

syntax: snowflake#discord-id compact
syntax: mentionable#mention-tag compact

## Eine Eigenschaft ändern {#changing-a-property}

Eine änderbare Eigenschaft wird mit `set <property> of <entity> to <value>` geschrieben; eine Eigenschaft, die
eine Liste hält, akzeptiert zusätzlich `add ... to` und `remove ... from`.

```skript
on ready seen by "my-bot":
    set {_g} to first element of (guilds of event-bot)
    set {_m} to first element of (members of {_g})
    set {_r} to first element of (roles of {_g})
    set nickname of {_m} to "new nick"
    add {_r} to roles of {_m}
    remove {_r} from roles of {_m}
```

Ein Setter ist keine einfache Zuweisung: Die meisten senden eine Anfrage an Discord, und der Trigger geht weiter,
ohne auf die Antwort zu warten. Stelle der Zeile `await` voran, wenn die nächste Zeile den Wert zurückliest;
siehe [Cache und await](doc:concepts/cache-and-await) dazu und zu den Eigenschaften, die auf der *Lese*-Seite
`await` brauchen.

!!! info "Manche Eigenschaften lassen sich nie zurücklesen"
    Builder und Embeds sind nur schreibbar: Du setzt ihre Eigenschaften, um zu formen, was erstellt wird. Sie
    zurückzulesen liefert aber nichts, weil es bis zum Lauf des Builders kein lebendiges Discord-Objekt gibt, aus
    dem man lesen könnte. Siehe [Builder](doc:concepts/builders).

## Enum-Werte {#enum-values}

Manche Eigenschaften halten einen Wert aus einer festen Menge, der als Literal und nicht als Text geparst wird.
Vergleiche oder setze sie ohne Anführungszeichen, und setze die linke Seite eines Vergleichs in Klammern, damit
Skript nicht versucht, die ganze Bedingung als einen einzigen Ausdruck zu parsen.

| Enum | Beispiel-Literal |
| --- | --- |
| `onlinestatus` | `idle` |
| `channeltype` | `text` |
| `memberflag` | `did rejoin` |
| `activitytype` | `playing` |
| `permission` | `manage channel` |
| `buttonstyle` | `primary` |
| `selecttarget` | `role` |
| `separatorspacing` | `small` |
| `textinputstyle` | `short` |

```skript
on ready seen by "my-bot":
    set online status of event-bot to dnd
    if (online status of event-bot) is dnd:
        send "[DiSky] my-bot is set to do not disturb" to console
```

`online status` wird als *do not disturb* ausgegeben, aber das Wort "not" bricht ein nacktes Literal; das Literal,
das du schreibst, ist daher `dnd` und nicht `do not disturb`.
