---
title: Regeln verwalten
description: Die AutoMod-Regeln eines Servers auflisten, live bearbeiten, löschen und reagieren, wenn eine davon auslöst.
source-hash: 16ff0b33d451
---

Dieser Abschnitt behandelt die Regeln, die auf einem Server bereits existieren, egal ob ein Skript oder
ein Moderator sie erstellt hat: sie lesen, ändern und löschen und das Event, das auslöst, wenn eine davon
handelt. Du solltest einen Bot namens `"my-bot"` mit **Manage Server** angemeldet haben und die
[drei `await`-Regeln](doc:concepts/cache-and-await) kennen.

## Die Regeln eines Servers lesen {#reading-a-guilds-rules}

[`automod rules of %guild%`](syntax:guild#automod-rules) listet jede Regel eines Servers auf, und
[`automod rule with id %string% in %guild%`](syntax:automodrule#automod-rule-with-id) holt eine einzelne.
DiSky hält keinen AutoMod-Cache, daher fragen beide bei Discord nach, und beide brauchen `await`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!rules":
        await set {_rules::*} to automod rules of event-guild
        loop {_rules::*}:
            reply with "%name of loop-value%: %automod trigger type of loop-value%, enabled %enabled of loop-value%"
```

Was du bekommst, ist eine Momentaufnahme zu diesem Zeitpunkt. Lies eine Regel nach einer Änderung erneut,
um den neuen Stand zu sehen.

| Eigenschaft | Liefert |
| --- | --- |
| [name](syntax:automodrule#name) | den Namen der Regel |
| [enabled](syntax:automodrule#enabled) | ob die Regel durchgesetzt wird |
| [automod event type](syntax:automodrule#automod-event-type) | `message send` oder `member update` |
| [automod trigger type](syntax:automodrule#automod-trigger-type) | `keyword`, `spam`, `keyword preset`, `mention spam` oder `member profile keyword` |
| [filtered keywords](syntax:automodrule#filtered-keywords), [filtered patterns](syntax:automodrule#filtered-patterns), [allow list](syntax:automodrule#allow-list) | die Listen des Schlüsselwort-Auslösers |
| [presets](syntax:automodrule#presets) | die Listen des Preset-Auslösers |
| [mention limit](syntax:automodrule#mention-limit), [mention raid protection](syntax:automodrule#mention-raid-protection) | die Einstellungen des Erwähnungsspam-Auslösers |
| [exempt roles](syntax:automodrule#exempt-roles), [exempt channels](syntax:automodrule#exempt-channels) | wer und wo die Regel ignoriert |
| [automod responses](syntax:automodrule#automod-responses) | was die Regel tut |
| [creator](syntax:automodrule#creator), [creator id](syntax:automodrule#creator-id) | wer sie erstellt hat |

syntax: guild#automod-rules compact

## Eine Regel bearbeiten {#editing-a-rule}

`name`, `enabled`, `exempt roles`, `exempt channels`, `automod responses` und `trigger config` sind an
einer Regel schreibbar. Jede Änderung wird sofort an Discord gesendet; setze `await` davor, um darauf zu
warten, bevor die nächste Zeile die Regel erneut liest.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!pause-rules":
        await set {_rules::*} to automod rules of event-guild
        loop {_rules::*}:
            await set enabled of loop-value to false
            await add event-channel to exempt channels of loop-value
```

`add` und `remove` gehen von der Regel aus, so wie sie gelesen wurde. Eine Zeile `add a and b to ...`
sendet beide Werte zusammen, aber zwei getrennte `add`-Zeilen auf derselben Momentaufnahme starten jeweils
vom selben Stand, daher bleibt nur die zweite erhalten: Lies die Regel zwischen ihnen erneut.

[`trigger config`](syntax:automodrule#trigger-config) ersetzt, wonach die Regel sucht. Die Eigenschaft ist
nur schreibbar (lies stattdessen die Eigenschaften für Schlüsselwörter, Presets und Erwähnungen), und der
neue Auslöser muss von der Art der Regel sein: Eine Schlüsselwort-Regel nimmt einen Schlüsselwort- oder
Muster-Auslöser an, niemals einen Preset-Auslöser.

```skript
set {_t} to a new automod keyword trigger with the keywords "newword"
await set trigger config of {_rule} to {_t}
```

syntax: automodrule#exempt-roles compact

## Eine Regel löschen {#deleting-a-rule}

[`destroy`](syntax:core/effects#destroy) löscht eine Regel.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!drop-rule":
        await set {_rule} to automod rule with id "000000000000000000" in event-guild
        destroy {_rule}
```

!!! danger "Manche Regeln lassen sich nicht löschen"
    Ein Community-Server muss seine Erwähnungsspam-Regel behalten: Discord lehnt das Löschen ab. Deaktiviere
    sie stattdessen mit `set enabled of {_rule} to false`.

## Wenn eine Regel auslöst {#when-a-rule-fires}

[`on automod execution`](event:events#automod-execution) feuert einmal pro Aktion, die eine Regel ausführt:
Eine Regel, die die Nachricht blockiert und eine Warnung sendet, feuert es zweimal. Dafür braucht der Bot den
[Intent (Event-Abonnement)](doc:getting-started/bot-options) `auto_moderation_execution`.

```skript
on automod execution seen by "my-bot":
    send "%event-user% triggered %automod rule id of event-automod% in %event-channel%" to console
    send "matched '%matched keyword of event-automod%' in: %automod message content of event-automod%" to console
```

`event-automod` enthält, was erkannt wurde. [matched keyword](syntax:automod#matched-keyword) und
[matched content](syntax:automod#matched-content) sagen, was die Regel ausgelöst hat,
[automod message content](syntax:automod#automod-message-content) ist die ganze Nachricht (leer ohne den
Intent `message_content`), und `event-automodresponse` ist die Aktion, die gerade läuft.

event: events#automod-execution compact

## Fehler, die dir begegnen können {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *requires 'await'* (Parse-Fehler) | `automod rules of` oder `automod rule with id` wurde ohne `await` gelesen | Setze `await` vor die Zeile |
| *[50035] Invalid Form Body* mit Nennung des Auslösers | `trigger config` wurde auf einen Auslöser einer anderen Art gesetzt | Verwende einen Auslöser der Art der Regel |
| Ein *Discord error* beim Löschen einer Erwähnungsspam-Regel | Der Server ist ein Community-Server | Deaktiviere die Regel stattdessen |

entity: automodrule
