---
title: Befehls-Builder
description: Slash-, User- und Message-Befehle als einfache Objekte statt als Strukturen aufbauen und beide Wege mischen.
source-hash: 4b7a917b71c3
---

Diese Seite behandelt den Builder-Weg zu einem Anwendungsbefehl: einfache Objekte, die du im Skript
zusammensetzt, als Alternative zu [`slash command`](doc:interaction-commands/slash-commands) und [`user command` / `message command`](doc:interaction-commands/context-commands).
Du solltest bereits einen Bot namens `"my-bot"` angemeldet haben.

## Wie Builder funktionieren {#how-builders-work}

Ein Builder ist ein Befehlsobjekt mit setzbaren Eigenschaften: einem Namen, einer Beschreibung,
Optionen, Unterbefehlen. Er hat keinen `trigger`, und nichts gelangt zu Discord, bis ein Skript ihn
mit `update` oder `register` überträgt, dieselben Effekte, die eine Struktur verwendet.

```skript
on guild ready:
    set {_roll} to a new slash command named "roll" with description "Roll a dice"
    set {_sides} to a new integer option named "sides" with description "How many sides"
    set min value of {_sides} to 2
    set max value of {_sides} to 100
    add {_sides} to options of {_roll}

    register the discord command {_roll} in event-guild
```

Anders als bei den Entity-Buildern von DiSky an anderer Stelle gibt es kein separates
"Build-Ergebnis": Die Effekte oben übertragen das Objekt selbst, und `command id of {_roll}` wird erst
danach gesetzt, sobald Discord antwortet.

syntax: slashcommand#new-slash-command compact

## Einen gebauten Befehl beantworten {#answering-a-built-command}

Ein über einen Builder deklarierter Befehl hat keinen eigenen Trigger. Er wird daher im generischen
[`on slash command`](event:events#slash-command) beantwortet, zugeordnet über den Namen. Eine Option
liest du mit [`slash option "name"`](doc:interaction-commands/slash-options); eine ausgelassene
optionale Option `is not set`.

```skript
on slash command:
    if used slash command is "roll":
        set {_sides} to slash option "sides"
        if {_sides} is not set:
            set {_sides} to 6
        reply with hidden "You rolled %random integer between 1 and {_sides}%"
```

## Eigenschaften {#properties}

Jeder Builder-Typ teilt die `applicationcommand`-Eigenschaften unten; `slashcommand` und
`slashoption` fügen eigene hinzu.

| Eigenschaft | Standard | Zulässige Werte |
| --- | --- | --- |
| [name](syntax:applicationcommand#name) | der beim Erstellen angegebene Name | Text, nach denselben Benennungsregeln wie die Struktur, die er spiegelt |
| [command id](syntax:applicationcommand#command-id) | nicht gesetzt | nur lesbar, gesetzt, sobald der Befehl registriert ist |
| [command type](syntax:applicationcommand#command-type) | durch die Art der Erstellung festgelegt | `"slash"`, `"user"` oder `"message"`, nur lesbar |

`enabled for`, `disabled`, `nsfw`, `contexts` und `integration types` gelten ebenfalls für jeden
Builder; siehe [Befehlseinstellungen](doc:interaction-commands/command-settings).

| Eigenschaft (slashcommand) | Standard | Zulässige Werte |
| --- | --- | --- |
| [description](syntax:slashcommand#description) | der beim Erstellen angegebene Text | beliebiger Text |
| [options](syntax:slashcommand#options) | leer | eine Liste von `slashoption` |
| [subcommands](syntax:slashcommand#subcommands) | leer | eine Liste von `subcommand` |
| [subcommand groups](syntax:slashcommand#subcommand-groups) | leer | eine Liste von `subcommandgroup` |

| Eigenschaft (slashoption) | Standard | Zulässige Werte |
| --- | --- | --- |
| [description](syntax:slashoption#description) | der beim Erstellen angegebene Text | beliebiger Text |
| [option type](syntax:slashoption#option-type) | durch die Erstellung festgelegt | nur lesbar |
| [required](syntax:slashoption#required) | `false` | `true` / `false` |
| [auto complete](syntax:slashoption#auto-complete) | `false` | `true` / `false`; nur Zeichenketten-, Ganzzahl- und Zahloptionen |
| [choices](syntax:slashoption#choices) | keine | bis zu 25 `slashchoice`; nur Zeichenketten-, Ganzzahl- und Zahloptionen |
| [min value](syntax:slashoption#min-value) | keiner | eine Zahl; nur Ganzzahl- und Zahloptionen |
| [max value](syntax:slashoption#max-value) | keiner | eine Zahl; nur Ganzzahl- und Zahloptionen |
| [min length](syntax:slashoption#min-length) | keine | `0` bis `6000`; nur Zeichenkettenoptionen |
| [max length](syntax:slashoption#max-length) | keine | `1` bis `6000`; nur Zeichenkettenoptionen |
| [channel types](syntax:slashoption#channel-types) | leer (beliebige Art) | eine Liste von Kanalarten; nur Kanaloptionen |

syntax: slashoption#new-slash-option compact

## Unterbefehle und Gruppen {#subcommands-and-groups}

Ein `subcommand` ist ein Eintrag `/root sub` mit eigener Beschreibung und eigenen Optionen; eine
`subcommandgroup` fasst mehrere Unterbefehle unter `/root group sub` zusammen. Ein Slash-Befehl hat
entweder Optionen oder Unterbefehle (mit oder ohne Gruppen), nie beides.

```skript
on guild ready:
    set {_mod} to a new slash command named "mod" with description "Moderation tools"

    set {_ban} to a new subcommand named "ban" with description "Ban a member"
    add a new user option named "target" with description "Who to ban" to options of {_ban}
    add {_ban} to subcommands of {_mod}

    set {_kick} to a new subcommand named "kick" with description "Kick a member"
    add a new user option named "target" with description "Who to kick" to options of {_kick}
    add {_kick} to subcommands of {_mod}

    register the discord command {_mod} in event-guild
```

`/mod ban` und `/mod kick` oben entsprechen derselben, durch eine Struktur deklarierten Form aus
[Slash-Befehle](doc:interaction-commands/slash-commands). Eine Unterbefehlsgruppe fügt eine weitere
Ebene hinzu: Erstelle sie mit `a new subcommand group named ... with description ...`, füge ihr
Unterbefehle hinzu und hänge die Gruppe dann an `subcommand groups of` des Befehls an.

syntax: subcommand#new-subcommand compact

## Strukturen und Builder mischen {#mixing-structures-and-builders}

`structured slash command "mod"` liest einen durch eine Struktur deklarierten Befehl als dieselbe Art
Objekt zurück, die ein Builder erzeugt: bearbeitbar und getrennt von der `.sk`-Datei, die ihn
deklariert hat. Lokalisiere ihn, füge eine Option hinzu und übertrage ihn anschließend wie jedes andere
Objekt.

```skript
on guild ready:
    set {_mod} to structured slash command "mod"
    localize the description of {_mod} in "fr" to "Outils de modération"
    register the discord command {_mod} in event-guild
```

Eine Struktur und ein Builder können auch nebeneinander in einem Aufruf übertragen werden:
`update the discord commands (all structured application commands) and {_roll} in event-guild`
ersetzt jeden durch eine Struktur deklarierten Befehl und fügt `{_roll}` im selben PUT hinzu. Ein durch
eine Struktur deklarierter Befehl führt weiterhin seinen eigenen `trigger` aus; ein durch einen Builder
deklarierter wird nur im generischen Event beantwortet. Beide lösen zuerst das generische Event aus,
unabhängig davon, wie sie deklariert wurden.

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *'sub_command' is not an option type; use a subcommand or a subcommand group instead* (gleicher Wortlaut für `'sub_command_group'`) | eine neue Option wurde mit einem strukturellen Typ statt mit einem echten `subcommand` / `subcommand group` gebaut | baue ein `subcommand`- oder `subcommand group`-Objekt, keine Option |
| *a \<type\> option cannot have autocomplete* | `auto complete` wurde bei einer Boolean-, User-, Kanal-, Rollen-, Mentionable- oder Anhangoption auf `true` gesetzt | nur Zeichenketten-, Ganzzahl- und Zahloptionen unterstützen Autovervollständigung |
| *only integer and number options have a minimum value* (gleicher Wortlaut für Maximum) | `min value` / `max value` wurde auf einer nicht numerischen Option gesetzt | nur Ganzzahl- und Zahloptionen akzeptieren Grenzen |
| *the choice 'x' has a text value but its option is an integer option* (oder *a number option*) | der Wert einer `slashchoice` stimmt nicht mit dem Typ ihrer Option überein | gib der Auswahl einen numerischen Wert oder wechsle die Option zu `string` |
| *a \<type\> option cannot have choices* | `choices` wurde bei einer Boolean-, User-, Kanal-, Rollen-, Mentionable- oder Anhangoption gesetzt | nur Zeichenketten-, Ganzzahl- und Zahloptionen akzeptieren Auswahlmöglichkeiten |

entity: applicationcommand
