---
title: Fehler
description: Was passiert, wenn Discord eine Aktion ablehnt, und wie try/catch und the last discord error dem Skript erlauben, darauf zu reagieren.
source-hash: 24cac615bff2
---

Diese Seite behandelt, was DiSky tut, wenn eine Aktion fehlschlägt, bei Discord oder im Skript,
und die beiden Werkzeuge, um darauf zu reagieren: die `try`-/`catch`-Section (eingerückter Block)
und `the last discord error`. Du solltest einen angemeldeten Bot namens `"my-bot"` und einen Server
haben, auf dem er handeln kann.

## Was ohne try passiert {#what-happens-without-a-try}

Jeder Effekt, der mit Discord spricht, kann abgelehnt werden: Dem Bot fehlt eine Berechtigung, das
Ziel wurde gelöscht, der Wert liegt außerhalb des zulässigen Bereichs. Ein Pflichtwert, der auf
nichts aufgelöst wird (eine nicht gesetzte Variable, die `kick` übergeben wird), schlägt genauso
fehl, bevor etwas gesendet wird. In beiden Fällen gibt DiSky einen lesbaren Block *Discord error*
in der Konsole aus, und der Trigger (Codeblock) läuft weiter: Die fehlschlagende Zeile tut nichts,
die Zeilen danach werden normal ausgeführt, nichts stürzt ab.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-nobody":
        discord kick {_nobody}
        reply with "still running: %the last discord error%"
```

Der Block in der Konsole sieht wie folgt aus. Die erste Zeile enthält den Fehler selbst:
`[code] meaning` bei einem Fehler, den Discord zurückgibt, `Exception: message` bei einem Fehler,
der auftritt, bevor die Anfrage abgeschickt wurde. Die Zeile `at` zeigt auf die fehlgeschlagene
Skriptzeile, danach folgt der Stacktrace der zugrunde liegenden Exception.

```text
[DiSky] ---------------- Discord error ----------------
[DiSky] IllegalArgumentException: the member of 'kick' is not set
[DiSky] at discord kick {_nobody} (errors.sk, line 3)
[DiSky] -----------------------------------------------
```

Der Fehler wird außerdem in [the last discord error](syntax:core/expressions#expression-last-discord-error)
gespeichert, damit die Zeile nach dem Fehlschlag ihn auslesen kann. Dieser Ausdruck ist global: Er
enthält den letzten Fehler eines beliebigen Bots, egal ob abgefangen oder nicht, und ist `<none>`,
bis einer aufgetreten ist.

## Fehler mit try abfangen {#catching-errors-with-try}

Umschließe die Zeilen, die fehlschlagen können, mit [`try`](syntax:core/sections#section-try-catch)
und lass ein `catch` folgen, das eine Listenvariable benennt. Ist der `try`-Block durchlaufen,
werden die dabei entstandenen Fehler in dieser Variablen gespeichert und der `catch`-Block läuft;
wenn nichts fehlschlug, wird der `catch` übersprungen. Die Erklärung zum Präfix `discord` bei
`kick` findest du [unten](#kick-and-skripts-own-kick).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick":
        try:
            discord kick event-member because of "try/catch demo"
        catch {_errors::*}:
            reply with "Could not kick: %{_errors::*}%"
```

Drei Regeln machen das Verhalten vorhersehbar:

- Eine fehlschlagende Zeile bricht den `try`-Block nicht ab. Der Fehler wird zwischengespeichert,
  und die nächste Zeile läuft. Eine Variable, die von einem fehlgeschlagenen Builder (Bauobjekt)
  oder Getter gesetzt werden sollte, bleibt also einfach ungesetzt. Prüfe sie, bevor du sie
  verwendest.
- Mehrere Fehler in einem Block landen gemeinsam in einem `catch`, in Reihenfolge, mit einem Element
  pro Fehler: `%number of {_errors::*}%` gibt an, wie viele es sind.
- Der Puffer gehört zum Event, das gerade behandelt wird, nicht zu einem Thread. Effekte laufen in
  einem Worker-Thread, und der Trigger läuft im Hauptthread weiter. Das `catch` sieht trotzdem jeden
  Fehler, und zwei gleichzeitig laufende Trigger sehen nie die Fehler des anderen.

`await` funktioniert innerhalb eines `try` wie gewohnt: Ein reiner Abruf oder ein Ergebnis des
Builders, das Discord ablehnt, landet im `catch`, genau wie bei einem Effekt (siehe
[Cache (Kopie im Speicher) und await](doc:concepts/cache-and-await)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-many":
        try:
            discord kick {_nobody}
            unmute {_nobody2}
        catch {_errors::*}:
            reply with "%number of {_errors::*}% error(s): %{_errors::*}%"
```

Ein `try` in einem anderen zu verschachteln wird nicht unterstützt: Die innere Section ersetzt den
Puffer des Events. Fehler im äußeren Block, die vor oder nach der inneren Section auftreten, werden
deshalb in der Konsole ausgegeben, statt das äußere `catch` zu erreichen. Verwende pro Gruppe
zusammengehöriger Zeilen ein einziges `try`.

!!! warning "Ein catch muss direkt auf sein try folgen"
    `catch` muss die unmittelbar nächste Section nach dem `try` sein, zu dem es gehört. Jede Zeile
    dazwischen ist ein Parse-Fehler (*A 'catch' section must directly follow a 'try' section.*).
    Ein `catch` ohne `try` wird akzeptiert und läuft nie.

### Trigger anhalten {#stopping-the-trigger}

Füge `and stop` an die `catch`-Zeile an, um den Trigger zu beenden, sobald sein Block gelaufen
ist. Ohne das läuft der Trigger nach dem `catch` weiter, als wäre das `try` erfolgreich
gewesen.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-or-stop":
        try:
            discord kick event-member
        catch {_errors::*} and stop:
            reply with "Could not kick, giving up."
        reply with "Kicked %event-member%."
```

syntax: core/sections#section-try-catch compact

## Einen Fehler auslesen {#reading-an-error}

Egal ob er aus einer `catch`-Variablen oder aus `the last discord error` stammt: Ein Fehler ist ein
`discorderror` mit drei Eigenschaften.

| Eigenschaft | Bei einer Ablehnung durch Discord | Bei einem Fehler im Skript |
| --- | --- | --- |
| [`error code`](syntax:discorderror#error-code) | Discords numerischer Code (`50013`) | `-1` |
| [`error meaning`](syntax:discorderror#error-meaning) | Discords kurze Bezeichnung (`Missing Permissions`) | der Name der Exception (`IllegalArgumentException`) |
| [`error message`](syntax:discorderror#error-message) | dieselbe Bezeichnung wie bei `error meaning`; bei einem `50035` die Felder, die Discord abgelehnt hat | die vollständige Nachricht (`the member of 'kick' is not set`) |

Als Text ausgegeben (`%{_errors::*}%`, `%loop-value%`, `%the last discord error%`) erscheint ein
Fehler als `[50013] Missing Permissions`, wenn Discord ihn abgelehnt hat, und als
`IllegalArgumentException: the member of 'kick' is not set`, wenn das Skript ihn ausgelöst hat.
Verzweige anhand des Codes, um präzise zu antworten:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick":
        try:
            discord kick event-member
        catch {_errors::*}:
            if error code of {_errors::1} is 50013:
                reply with "I'm missing the Kick Members permission."
            else:
                reply with "Kick failed: %error meaning of {_errors::1}%"
```

Außerhalb eines `try` liefert [the last discord error](syntax:core/expressions#expression-last-discord-error)
dasselbe Objekt für den letzten Fehler. Da er global ist und nie zurückgesetzt wird, vergleiche ihn
mit dem, was du erwartest, statt zu prüfen, ob er gesetzt ist.

```skript
on ready seen by "my-bot":
    discord kick {_nobody}
    send "code %error code of the last discord error%: %the last discord error%" to console
```

syntax: core/expressions#expression-last-discord-error compact

## Häufige Discord-Fehlercodes {#common-discord-error-codes}

Die folgenden Codes begegnen einem Moderations- oder Nachrichtenskript am häufigsten. Die Spalte
Meaning enthält den genauen Text, den error meaning für sie zurückgibt.

| Code | Bedeutung | Typische Ursache |
| --- | --- | --- |
| `10003` | Unknown Channel | Der Kanal wurde gelöscht, oder die ID ist falsch |
| `10007` | Unknown Member | Der Benutzer hat den Server verlassen, bevor die Aktion ausgeführt wurde |
| `10008` | Unknown Message | Die Nachricht wurde gelöscht, oder die ID ist falsch |
| `10011` | Unknown Role | Die Rolle wurde gelöscht, oder die ID ist falsch |
| `10013` | Unknown User | Kein Discord-Account hat diese ID |
| `10026` | Unknown Ban | `unban` bei einem Benutzer, der nicht gebannt ist |
| `10062` | Unknown Interaction | Die Interaktion ist abgelaufen (3 Sekunden zum Bestätigen, 15 Minuten für Folgeantworten) |
| `40060` | Interaction has already been acknowledged | Eine zweite Antwort oder ein zweites Verzögern derselben Interaktion |
| `50001` | Missing Access | Der Bot kann den Kanal oder den Server nicht sehen |
| `50006` | Cannot send an empty message | Eine Nachricht ohne Inhalt, Embed, Komponente oder Datei |
| `50007` | Cannot send messages to this user | Der Benutzer hat DMs von diesem Server deaktiviert oder den Bot blockiert |
| `50013` | Missing Permissions | Der Rolle des Bots fehlt die Berechtigung, oder sie liegt unter der höchsten Rolle des Ziels |
| `50034` | A Message provided to bulk_delete was older than 2 weeks | Massenlöschen von Nachrichten, die älter als 14 Tage sind |
| `50035` | Invalid Form Body | Ein Wert überschreitet Discords Grenzen (Text zu lang, falsches ID-Format, eine zweite Regel einer AutoMod-Art, die pro Server nur einmal erlaubt ist); die Fehlermeldung nennt jedes abgelehnte Feld als `field: reason` |

Discord dokumentiert die vollständige Liste unter
[Opcodes and Status Codes](https://discord.com/developers/docs/topics/opcodes-and-status-codes#json).

## `kick` und das eigene `kick` von Skript {#kick-and-skripts-own-kick}

Skript bringt den Effekt `kick %players%` mit, der vor DiSkys `kick %member%` registriert wird. Ist
der Operand eine nicht typisierte Variable wie `{_target}`, setzt sich der Effekt von Skript beim
Parsen durch und tut zur Laufzeit stillschweigend nichts: keine Konsolenzeile, kein Fehler zum
Abfangen. Schreibe [`discord kick`](syntax:member#kick), wenn das Mitglied aus einer Variablen
stammt. Bei einem typisierten Wert wie `event-member` erreichen beide Schreibweisen DiSky.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-var":
        set {_target} to event-member
        try:
            discord kick {_target} because of "spam"
        catch {_errors::*}:
            reply with "%{_errors::*}%"
```

!!! tip "Moderationseffekte aus Gewohnheit mit Präfix schreiben"
    `discord kick` wird immer akzeptiert. Das Präfix überall zu verwenden kostet also nichts und
    beseitigt den einen Fall, in dem ein Fehlschlagen keine Spur hinterlässt. Andere
    Moderationseffekte (`ban`, `unban`, `mute`, `time out`) haben kein Gegenstück in Skript und
    brauchen kein Präfix.

entity: discorderror
