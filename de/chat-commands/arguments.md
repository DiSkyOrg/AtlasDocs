---
title: Argumente
description: Die Argumentgrammatik im Kopf eines Befehls, die Auflösung jedes Typs und das Lesen der Werte im Trigger.
source-hash: a5d6f7564d0e
---

Diese Seite behandelt die Argumentangabe, die du im [Kopf eines Befehls](doc:chat-commands/declaring-a-command)
schreibst, die akzeptierten Typen, wie DiSky jeden davon auflöst, und die Ausdrücke, mit denen die Werte
im Trigger wieder gelesen werden. Du solltest einen deklarierten Befehl haben und einen Bot namens
`"my-bot"` angemeldet haben.

## Wie Argumente funktionieren {#how-arguments-work}

Alles nach dem Befehlsnamen in `discord command <name> <arguments>:` ist eine Liste von `<type>`-Slots.
Discord-Entitäten (ein Benutzer, eine Rolle, ein Kanal ...) werden aus einer Erwähnung, einer ID oder
einem Namen **bevor der Trigger läuft** aufgelöst, auf einem Worker-Thread. Dadurch enthält `arg-1`
bereits einen echten Wert, sobald dein Code startet; nur die Auflösung selbst kann blockieren, nie der
Trigger.

```skript
discord command hello <user> [<n: number = 1>]:
    prefixes: "!"
    usage message: "Usage: %usage of event-discordcommand%"
    trigger:
        reply with "Hello %arg-1% x%{_n}%"
```

| Schreibweise | Bedeutung | Beispiel |
| --- | --- | --- |
| `<type>` | Pflicht, ohne Namen; nur über die Position lesbar | `<user>` |
| `<name: type>` | Pflicht, zusätzlich als `{_name}` lesbar | `<amount: number>` |
| `<name: type = default>` | optional; `{_name}` enthält `default`, wenn es weggelassen wird | `<n: number = 1>` |
| `[<...>]` | optional, ohne Standardwert; liefert `none`, wenn es weggelassen wird | `[<who: member>]` |
| Plural-Typ | passt auf eine Folge von Tokens; `{_name::*}` (oder `arg-N`) enthält alle aufgelösten Werte | `<users>` |
| nachgestelltes `<text>` | gierig: der unveränderte Rest der Zeile, inklusive Anführungszeichen | `<text>` |

Ein Pflichtargument kann nie nach einem optionalen stehen: DiSky lehnt den gesamten Befehl beim Laden ab
(siehe [Mögliche Fehler](#errors-you-may-see)).

## Argumenttypen {#argument-types}

Discord-Entitäten werden über DiSkys eigene Suche aufgelöst; alles andere greift auf Skripts Parser für
diesen Typ zurück. Ein Plural-Argument löst jedes Token einzeln auf. Ein Token, das sich nicht auflösen
lässt, wird aus der Liste entfernt, statt den ganzen Befehl scheitern zu lassen.

| Typwort | Aufgelöst aus | Hinweise |
| --- | --- | --- |
| `user` | Erwähnung, ID oder Name | eine ID fragt Discord (REST) ab, wenn der Benutzer nicht im Cache (Kopie im Speicher) liegt; ein Name wird unter den Mitgliedern des Servers gesucht |
| `member` | Erwähnung, ID oder Name | nur auf Servern; liefert `none` in einer Direktnachricht (DM) |
| `role` | Erwähnung, ID oder Name | nur auf Servern, nur aus dem Cache |
| `guild` | ID oder Name | durchsucht alle Server, in denen der Bot ist, nicht nur den aktuellen |
| `message` | eine ID (im aktuellen Kanal gesucht) oder ein Sprunglink | fragt immer Discord (REST) ab |
| `emote` | ein eigenes Emoji wie `<:name:id>` | ein Standard-Unicode-Emoji wird nicht aufgelöst |
| `bot` | der Name, der bei `login ... as` vergeben wurde | DiSkys eigene Bot-Registrierung, kein Discord-Konto |
| `channel` | `<#id>`, eine ID oder ein Name | nur auf Servern, nur aus dem Cache; passt auf jede Kanalart |
| `textchannel`, `voicechannel`, `stagechannel`, `newschannel`, `forumchannel`, `mediachannel`, `threadchannel`, `category`, `privatechannel` | wie `channel` | werden auf die gleiche Weise aufgelöst und nur behalten, wenn das Ergebnis genau diese Art ist |

Alles andere, das Skript selbst im Befehlskontext parst (`number`, `text`, `timespan`, `boolean` und die
übrigen), funktioniert genauso, über Skripts eigenen Parser für diesen Typ.

## Argumente lesen {#reading-arguments}

Im Trigger sowie in `on discord command used` und `on discord command failed` liest du ein Argument nach
Position, nach Typ oder nach Name, falls es einen hat.

| Ausdruck | Liefert |
| --- | --- |
| [`arg-1`](syntax:core/expressions#expression-discord-command-argument) | den bzw. die Werte des ersten Arguments |
| `the 2nd argument` | dasselbe, über die Ordnungszahl |
| `last argument` | das zuletzt deklarierte Argument |
| `arguments` | die Werte aller Argumente, in eine Liste zusammengeführt |
| `user argument` | das erste Argument vom Typ `user` |
| `text argument-2` | das zweite Argument vom Typ `text` |
| `{_name}` / `{_name::*}` | die lokale Variable eines benannten Arguments: ein einzelner Wert oder bei einem Plural-Typ eine Liste |
| `used arguments` | den rohen, ungeparsten Text nach dem Befehlsnamen |

```skript
discord command entities <role> <textchannel> [<who: member>]:
    prefixes: "!"
    trigger:
        reply with "role=%arg-1% channel=%arg-2% member=%{_who}%"
```

```skript
discord command many <users>:
    prefixes: "!"
    trigger:
        reply with "%size of arguments% users: %arg-1%"
```

syntax: core/expressions#expression-discord-command-argument compact

## Optionale Argumente und Standardwerte {#optional-arguments-and-defaults}

Ein Standardwert nach `=` kann ein Literal (`= 1`) oder ein vollständiger Ausdruck sein; er wird jedes Mal
neu ausgewertet, wenn das Argument weggelassen wird. Ein optionales Argument ohne Standardwert liefert
stattdessen einfach `none`.

`!entities @role #general` (ohne drittes Wort) antwortet mit `role=... channel=... member=<none>`, da
`{_who}` nie gesetzt wurde.

## Anführungszeichen und gieriger Text {#quoting-and-greedy-text}

Alles nach dem Befehlsnamen wird an Leerzeichen in Tokens aufgeteilt. Eine Gruppe in doppelten
Anführungszeichen (`"two words"`) wird zu einem einzigen Token, ohne die Anführungszeichen. Eine Ausnahme
ist ein einzelnes, nachgestelltes `<text>`-Argument: Da es gierig ist, nimmt es stattdessen den
unveränderten Rest der Zeile, inklusive Anführungszeichen und zusätzlicher Leerzeichen.

```skript
discord command echo <text>:
    prefixes: "!"
    trigger:
        reply with "you said: %arg-1%"
```

`!echo a b  "c"` antwortet mit `you said: a b  "c"`: Das doppelte Leerzeichen und die Anführungszeichen
bleiben erhalten.

## Wenn Argumente ungültig sind {#when-arguments-are-invalid}

Das Parsen läuft zuletzt, nach allen Prüfungen, wer und wo (die vollständige Reihenfolge steht unter
[Befehle einschränken](doc:chat-commands/restricting-a-command)). Ein fehlendes Pflichtargument oder eines,
dessen Tokens alle nicht aufgelöst werden können, schlägt mit `invalid
arguments` fehl. Setze eine
[`usage message`](syntax:discordcommand#usage), damit der Bot automatisch antwortet; ohne sie sendet DiSky
nichts, und nur `on discord command failed` bekommt es mit.

```skript
discord command hello <user> [<n: number = 1>]:
    prefixes: "!"
    usage message: "Usage: %usage of event-discordcommand%"
    trigger:
        reply with "Hello %arg-1% x%{_n}%"
```

`!hello` allein antwortet mit `Usage: hello <user> [<n: number>]` (der Standardwert fehlt in der
generierten Form) und löst `on discord command failed` aus, mit `failure reason` auf `invalid arguments`
gesetzt.

syntax: discordcommand#usage compact

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *Unknown type 'x' for an argument of the discord command* | ein Typwort in `<...>` ist kein bekannter Skript- oder DiSky-Typ | prüfe die Wörter unter [Argumenttypen](#argument-types) |
| *A required argument cannot follow an optional one in a discord command* | ein Pflicht-`<...>` steht nach `[<...>]` oder `<... = default>` | Pflichtargumente nach vorne verschieben oder auch sie optional machen |
| *'x' is not a valid argument name (it becomes the local variable {_x})* | der `name:` vor dem Typ ist leer oder enthält `{`, `}` oder `::` | verwende ein einfaches Wort als Namen |
| *'x' is not a valid default value for a Y argument* | der Text nach `=` lässt sich nicht als Typ dieses Arguments parsen | gib einen Wert an, den der Typ akzeptiert, oder entferne den Standardwert |

!!! info "Ungültige Indizes zeigen Skripts eigene Meldung"
    Ein Index, den der Befehl nicht hat (`arg-3` bei einem Befehl mit zwei Argumenten), oder ein Typ, den
    er nicht besitzt (`text argument` ohne Text-Argument), schlägt beim Parsen fehl. Skripts eigenes
    `arg-1` passt zuerst auf dasselbe Muster und lehnt es mit *"only in the on command event"* ab, nicht
    mit DiSkys eigenem, präziserem Fehler.
