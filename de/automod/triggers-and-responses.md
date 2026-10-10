---
title: Auslöser und Aktionen
description: Jede AutoMod-Auslöserart mit ihren Optionen und jede Aktion, die eine Regel ausführen kann.
source-hash: 9bf6605fab0f
---

Diese Seite listet auf, wonach eine AutoMod-Regel suchen kann und was sie dagegen tun kann. Beides sind
einfache Werte: Du baust sie, passt sie an und übergibst sie dann einem [Regel-Builder](doc:automod/creating-rules)
oder einer [bestehenden Regel](doc:automod/managing-rules). Du solltest einen Bot namens `"my-bot"` angemeldet haben.

## So funktionieren Auslöser {#how-triggers-work}

Ein Auslöser entsteht über einen von fünf Ausdrücken, einen pro Art. Seine Optionen sind nur schreibbare
Eigenschaften, und jede gilt nur für die Arten, die daneben stehen: `filtered keywords` auf einem
Erwähnungsspam-Auslöser zu setzen ist ein lesbarer Fehler und kein stiller Leerlauf.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!words":
        set {_t} to a new automod keyword trigger with the keywords "badword"
        add "*worse*" to filtered keywords of {_t}
        set allow list of {_t} to "badwordle"
        set {_b} to a new automod rule builder named "Words" in event-guild for messages using {_t}
        add a new automod response blocking the message to automod responses of {_b}
        await set {_rule} to the build result of {_b}
```

syntax: triggerconfig#new-keyword-trigger compact

## Auslöser-Arten {#trigger-kinds}

| Art | Erstellt mit | Einer pro Server |
| --- | --- | --- |
| Schlüsselwort | [`a new automod keyword trigger [with the keywords %strings%]`](syntax:triggerconfig#new-keyword-trigger) | nein |
| Muster | [`a new automod pattern trigger with the regex patterns %strings%`](syntax:triggerconfig#new-pattern-trigger) | nein |
| Preset | [`a new automod preset trigger with the presets %keywordpresets%`](syntax:triggerconfig#new-preset-trigger) | ja |
| Erwähnungsspam | [`a new automod mention spam trigger with a limit of %number%`](syntax:triggerconfig#new-mention-spam-trigger) | ja |
| Spam | [`a new automod spam trigger`](syntax:triggerconfig#new-spam-trigger) | ja |

Schlüsselwörter akzeptieren einen `*`-Platzhalter am Anfang, am Ende oder an beiden Enden (`"*bad*"` trifft
auch innerhalb eines Wortes). Muster sind reguläre Ausdrücke in Rust-Syntax, höchstens 10 Muster mit jeweils
höchstens 260 Zeichen. Ein Schlüsselwort- und ein Muster-Auslöser gehören zur selben Discord-Art: Ein
Schlüsselwort-Auslöser kann auch Muster enthalten und umgekehrt; beim Erstellen der Regel braucht er mindestens
eines von beidem.

Die Presets sind die von Discord gepflegten Wortlisten: `profanity`, `sexual content` und `slurs`.

## Auslöser-Optionen {#trigger-options}

| Eigenschaft | Gilt für | Zulässige Werte |
| --- | --- | --- |
| [filtered keywords](syntax:triggerconfig#filtered-keywords) | Schlüsselwort, Muster | Texte, `set` oder `add` |
| [filtered patterns](syntax:triggerconfig#filtered-patterns) | Schlüsselwort, Muster | Regex-Texte, `set` oder `add` |
| [allow list](syntax:triggerconfig#allow-list) | Schlüsselwort, Muster, Preset | Texte, die die Regel nie auslösen |
| [presets](syntax:triggerconfig#presets) | Preset | `profanity`, `sexual content`, `slurs`; `set`, `add` oder `remove` |
| [mention limit](syntax:triggerconfig#mention-limit) | Erwähnungsspam | 1 bis 50 eindeutige Erwähnungen |
| [mention raid protection](syntax:triggerconfig#mention-raid-protection) | Erwähnungsspam | `true`, `false` |

```skript
set {_presets} to a new automod preset trigger with the presets profanity and slurs
add sexual content to presets of {_presets}
set allow list of {_presets} to "scunthorpe"

set {_mentions} to a new automod mention spam trigger with a limit of 5
set mention raid protection of {_mentions} to true
```

syntax: triggerconfig#new-preset-trigger compact
syntax: triggerconfig#new-mention-spam-trigger compact

## Aktionen {#responses}

Eine Aktion entsteht über einen von vier Ausdrücken und ändert sich danach nie. Eine Regel hält höchstens
eine Aktion jeder Art: Wenn du eine zweite derselben Art hinzufügst, ersetzt sie die erste.

| Aktion | Erstellt mit | Erlaubt bei |
| --- | --- | --- |
| Nachricht blockieren | [`a new automod response blocking the message [with the custom message %string%]`](syntax:automodresponse#new-block-message) | Nachrichtenregeln |
| Warnung senden | [`a new automod response sending an alert to the channel %standardguildmessagechannel%`](syntax:automodresponse#new-send-alert) | Nachrichtenregeln |
| Mitglied in den Timeout schicken | [`a new automod response timing the member out for %timespan%`](syntax:automodresponse#new-timeout) | Schlüsselwort- und Erwähnungsspam-Regeln |
| Mitgliederinteraktionen blockieren | [`a new automod response blocking the member interactions`](syntax:automodresponse#new-block-interaction) | Profilregeln (automatisch hinzugefügt) |

Die individuelle Nachricht einer blockierten Nachricht wird deren Autor angezeigt, höchstens 150 Zeichen lang.
Ein Timeout dauert bis zu 28 Tage.

```skript
set {_block} to a new automod response blocking the message with the custom message "Keep it clean"
set {_alert} to a new automod response sending an alert to the channel event-channel
set {_mute} to a new automod response timing the member out for 5 minutes
set automod responses of {_b} to {_block}, {_alert} and {_mute}
```

Eine Aktion lässt sich über [response type](syntax:automodresponse#response-type),
[response message](syntax:automodresponse#response-message),
[response channel](syntax:automodresponse#response-channel) und
[response timeout](syntax:automodresponse#response-timeout) zurücklesen; für eine Art, auf die die
Eigenschaft nicht zutrifft, ist sie leer. `response type` vergleicht mit `block message`,
`send alert message`, `timeout` und `block member interaction`.

syntax: automodresponse#new-block-message compact

## Fehler, die dir begegnen können {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *this property only applies to a mention spam trigger, not a keyword one* (und die anderen Arten) | Eine Option wurde auf einer Auslöserart gesetzt, die sie nicht hat | Prüfe die Spalte *Gilt für* oben |
| *the timeout duration must be greater than 0* | Eine Timeout-Aktion wurde mit einer Dauer von 0 erstellt | Gib ihr eine echte Dauer |
| *[50035] Invalid Form Body* mit Nennung des Auslösers | Ein Schlüsselwort-Auslöser ohne Schlüsselwort und ohne Muster, ein Regex, den Discord ablehnt, oder ein Limit über 50 | Korrigiere das Feld, das in der Meldung genannt wird |

entity: triggerconfig
