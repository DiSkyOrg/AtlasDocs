---
title: Slash-Optionen
description: Argumenttypen, Beschreibungen und Auswahlmöglichkeiten, Autovervollständigung, typisierte Optionen, Grenzen und das Lesen des Werts einer Option überall.
source-hash: 3fa7a293c0c6
---

Diese Seite behandelt, was in die Plätze `<name: type>` des Kopfes eines
[Slash-Befehls](doc:interaction-commands/slash-commands) gehört: die Typwörter, die Discord versteht,
wie du eine Option beschreibst und ihr Auswahlmöglichkeiten gibst, Autovervollständigung und die
Grenzen, die nur eine Builder-Option setzen kann. Du solltest bereits einen Bot namens `"my-bot"`
angemeldet haben und einen Kopf `slash command` vor dir haben.

## Wie Optionen funktionieren {#how-options-work}

Jedes `<name: type>` in einem Kopf `slash command <path> <arguments>:` ist eine Option. Discord zeigt sie
im Client als typisiertes Feld und prüft sie, bevor die Interaktion den Bot erreicht. `{_name}` enthält
daher bereits einen echten Wert, ein Mitglied, eine Rolle, eine Zahl, nie rohen Text, den man noch
parsen müsste.

```skript
slash command mod ban <target: member> [<reason: string>]:
    description: Ban a member
    trigger:
        reply with hidden "Would ban %{_target}% for %{_reason}%"
```

`<target: member>` ist erforderlich; `[<reason: string>]` ist optional, und `{_reason}` liefert `none`,
wenn der Benutzer es weglässt. Eine Pflichtoption kann nie auf eine optionale folgen, dieselbe Regel, die
der Kopf selbst durchsetzt (siehe [Slash-Befehle](doc:interaction-commands/slash-commands)). Eine Option
nimmt genau einen Wert auf: Es gibt keine Mehrzahlform, und Discord kennt keinen Standardwert. Daher ist
`<name: type = x>` hier nicht gültig, anders als für ein [`discord command`](doc:chat-commands/arguments).

## Optionstypen {#option-types}

Das Typwort bestimmt sowohl die Discord-Option, die Skript sendet, als auch das, was `{_name}` zurückliefert.

| Typwort(e) | Discord-Typ | Was `{_name}` enthält | Hinweise |
| --- | --- | --- | --- |
| `string`, `text` | STRING | der eingegebene Text | |
| `integer` | INTEGER | eine ganze Zahl | |
| `number` | NUMBER | eine Dezimalzahl | |
| `boolean` | BOOLEAN | `true` oder `false` | |
| `user` | USER | der Discord-Benutzer | |
| `member` | USER | das Servermitglied | dieselbe USER-Option, aufgelöst zu einem Mitglied; außerhalb eines Servers nicht verfügbar |
| `role` | ROLE | die Rolle | |
| `mentionable` | MENTIONABLE | ein Benutzer, ein Mitglied oder eine Rolle | was der Benutzer gewählt hat |
| `attachment` | ATTACHMENT | die hochgeladene Datei | |
| `channel`, oder eine bestimmte Art (`textchannel`, `voicechannel`, `stagechannel`, `newschannel`, `forumchannel`, `mediachannel`, `threadchannel`, `category`, `privatechannel`) | CHANNEL | der Kanal | eine bestimmte Art beschränkt, welche Kanäle Discord dem Benutzer zur Auswahl anbietet; siehe [Grenzen und Kanalarten](#bounds-and-channel-kinds) |
| `color` | STRING | eine Skript-Farbe | eingebaute Autovervollständigung über Farbnamen |
| `player`, `offlineplayer` | STRING | ein Spieler (online oder offline) | eingebaute Autovervollständigung über die Namen online befindlicher Spieler |
| jedes Skript-Enum (`gamemode` und DiSkys eigene) | STRING | die Enum-Konstante | ihre Konstanten werden zu festen Auswahlmöglichkeiten (25 oder weniger) oder zu Autovervollständigung darüber hinaus |

Dieselben Wörter erstellen auch eine
[typisierte Slash-Option](syntax:core/expressions#expression-new-typed-slash-option) auf einem Builder,
außerhalb des Kopfes einer Struktur:

```skript
set {_target} to a new typed member option named "target" with description "Who"
```

syntax: core/expressions#expression-new-typed-slash-option compact

## Optionen beschreiben {#describing-options}

Ein Abschnitt `arguments:` an der Struktur beschreibt jede Option über ihren Namen: als einzeilige
Beschreibung oder als Unterabschnitt, wenn eine Option außerdem Auswahlmöglichkeiten braucht.

```skript
slash command mod ban <target: member> [<reason: string>]:
    description: Ban a member
    arguments:
        target: Who to ban
        reason:
            description: Why
            choices:
                Spam: spam
                Rude: rude
    trigger:
        reply with hidden "Would ban %{_target}% for %{_reason}%"
```

Eine Option, die gar nicht in `arguments:` steht oder keine Zeile `description:` hat, behält den eigenen
Platzhalter von Discord: *No description provided*. `choices:` ist ein Abschnitt mit `Name: value`-Zeilen,
bis zu 25, und nur gültig bei einer Option vom Typ `string`, `integer` oder `number`. Der Wert rechts muss
als Typ dieser Option lesbar sein (eine Zahl für `integer` oder `number`, beliebig für `string`). Sobald
eine Option Auswahlmöglichkeiten hat, lässt Discord den Benutzer nur aus dieser Liste wählen.

## Autovervollständigung {#autocomplete}

Ein Argument mit einem Abschnitt `on completion request:` statt `choices:` wird als Autovervollständigung
markiert. Der Abschnitt läuft bei jedem Tastendruck, und [`return choices`](syntax:core/effects#effect-return-slash-choices)
beantwortet ihn und beendet den Trigger dort, mit bis zu 25 Vorschlägen.

```skript
slash command fruit <name: string>:
    description: Pick a fruit
    arguments:
        name:
            description: The fruit
            on completion request:
                send "[CMD] completion for %current argument%" to console
                return choices "apple", "banana" and "cherry"
    trigger:
        reply with hidden "You picked %{_name}%"
```

`current argument` benennt die Option, nach der Discord fragt (nützlich, sobald ein Befehl mehr als eine
Option mit Autovervollständigung hat). `return choices` nimmt einfache Texte oder Zahlen, die sowohl als
Bezeichnung als auch als Wert dienen, oder `a new choice named "..." with value ...`, wenn beides
verschieden sein muss.

Ohne einen Abschnitt `on completion request:` vervollständigt eine typisierte Option (`color`, `player`,
`offlineplayer` oder ein Enum mit mehr als 25 Konstanten) trotzdem automatisch aus ihrer eingebauten
Liste. Eine Option kann nicht sowohl `choices:` als auch `on completion request:` haben (siehe
[Fehler unten](#errors-you-may-see)).

Eine durch einen Builder deklarierte Option mit gesetztem `auto complete` hat keinen Strukturabschnitt,
der sie beantwortet. Stattdessen übernehmen das generische Event
[`on slash completion`](event:events#slash-command-completion-event) und `return choices` die Aufgabe,
auf dieselbe Weise, wie [Befehls-Builder](doc:interaction-commands/command-builders) ihre Befehle
generisch beantworten.

syntax: core/effects#effect-return-slash-choices compact

## Optionen überall lesen {#reading-options-anywhere}

[`slash option "name"`](syntax:core/expressions#expression-slash-option-value) liest jede Option über ihren
Namen, ob Struktur oder Builder, überall dort, wo eine Slash-Interaktion im Geltungsbereich ist.

| Ausdruck | Liefert |
| --- | --- |
| `{_name}` | den Wert einer benannten Option, nur für einen Befehl, der durch einen Kopf `slash command` deklariert wurde |
| `arg-1` / `member argument` | Lesen nach Position oder nach Typ, dieselben Muster wie bei einem [`discord command`](doc:chat-commands/arguments), nur für einen durch eine Struktur deklarierten Befehl |
| `slash option "name"` | den Wert, so typisiert, wie Discord ihn gesendet hat |
| `slash option "name" as member` | denselben Optionswert, aufgelöst zum Servermitglied |
| `slash option "name" as <optiontype>` | denselben Optionswert, als bestimmten Discord-Typ zurückgelesen (`string`, `integer`, `number`, `boolean`, `user`, `channel`, `role`, `mentionable`, `attachment`) |

```skript
on slash command:
    set {_target} to slash option "target"
    send "%used slash command% option target=%{_target}%" to console
```

`slash option` wird nur innerhalb von [`on slash command`](event:events#slash-command),
[`on slash completion`](event:events#slash-command-completion-event) oder
[`on slash command cooldown`](event:events#application-command-cooldown) aufgelöst. An anderer Stelle ist
es ein Ladefehler. Es funktioniert gleich, ob der Befehl dahinter aus einer Struktur `slash command` oder
einem Builder stammt, weshalb die generischen Events beide sehen.

syntax: core/expressions#expression-slash-option-value compact

## Grenzen und Kanalarten {#bounds-and-channel-kinds}

Das `<name: type>` eines Kopfes `slash command` hat keinen Eintrag für Grenzen: Ein numerischer Bereich,
eine Textlänge oder eine eingeschränkte Menge von Kanalarten gibt es nur bei einer Builder-Option,
`a new <type> slash option` oder `a new typed ... slash option`.

```skript
set {_sides} to a new integer option named "sides" with description "How many sides"
set min value of {_sides} to 2
set max value of {_sides} to 100
```

| Eigenschaft | Standard | Zulässige Werte |
| --- | --- | --- |
| [min value](syntax:slashoption#min-value) | keiner | beliebige Zahl, nur Optionen vom Typ `integer` und `number` |
| [max value](syntax:slashoption#max-value) | keiner | beliebige Zahl, nur Optionen vom Typ `integer` und `number` |
| [min length](syntax:slashoption#min-length) | keine | `0` bis `6000`, nur `string`-Optionen |
| [max length](syntax:slashoption#max-length) | keine | `1` bis `6000`, nur `string`-Optionen |
| [channel types](syntax:slashoption#channel-types) | leer (beliebige Art) | eine oder mehrere Kanalarten, nur `channel`-Optionen |

`set channel types of {_opt} to text and voice` schränkt eine `channel`-Option genauso ein wie die
Deklaration als `textchannel`, lässt aber mehr als eine Art zu. Siehe
[Befehls-Builder](doc:interaction-commands/command-builders) zum Erstellen und Übertragen der Option selbst.

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *Unknown type 'x' for an argument of the slash command* | ein Typwort in `<...>` ist kein bekannter Skript- oder DiSky-Typ | prüfe die Wörter unter [Optionstypen](#option-types) |
| *The argument 'x' has more than 25 choices; use 'on completion request' instead* | ein Unterabschnitt `choices:` enthält mehr als 25 Zeilen | wechsle zur [Autovervollständigung](#autocomplete) |
| *The argument 'x' cannot have both choices and an 'on completion request' section* | der Unterabschnitt eines Arguments hat beides | behalte nur eines |
| *The argument 'x' is a \<type> option, which cannot have choices* | `choices:` ist bei einem Argument vom Typ `boolean`, `user`, `member`, `role`, `mentionable`, `attachment` oder `channel` gesetzt | nur Optionen vom Typ `string`, `integer` und `number` akzeptieren Auswahlmöglichkeiten |
| *'x' is not a valid \<type> for the choice 'y'* | der Wert einer Auswahl lässt sich nicht als Typ ihrer Option lesen | gib einer Auswahl vom Typ `integer` oder `number` eine Zahl, einer `string`-Auswahl beliebigen Text |
| *a \<type> option cannot have choices* / *a \<type> option cannot have autocomplete* | `choices` oder `auto complete` einer Builder-Option ist auf einem Typ gesetzt, der das nicht unterstützt | dieselbe Einschränkung, auf der Builder-Seite |
| *only integer and number options have a minimum value* (gleich für das Maximum) | `min value` oder `max value` ist auf einer nicht numerischen Builder-Option gesetzt | nur Optionen vom Typ `integer` und `number` akzeptieren Grenzen |
| *A slash option can only be read in a slash command, slash completion or slash command cooldown event* | `slash option "..."` wird außerhalb dieser drei Events verwendet | verschiebe das Lesen in eines davon |

entity: slashoption
