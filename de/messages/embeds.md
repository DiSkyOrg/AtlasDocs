---
title: Embeds
description: Ein Discord-Embed lokal erstellen, jede Eigenschaft und ihre Felder setzen und es dann mit post, reply with oder einem Message-Builder senden.
source-hash: ccb478d348a6
---

Diese Seite behandelt das Erstellen eines Discord-Embeds: jede Eigenschaft, die du darauf setzen kannst,
seine Felder und was du zurückbekommst, wenn du die Embeds einer bereits gesendeten Nachricht liest. Du
solltest bereits einen Bot namens `"my-bot"` angemeldet haben und wissen, wie man
[eine Nachricht sendet](doc:messages/sending-messages).

## So funktionieren Embeds {#how-embeds-work}

[A new discord embed](syntax:core/expressions#expression-new-embed) erstellt ein leeres Embed, vollständig
im Speicher; jede Zeile `set <property> of {_e}` füllt es nur weiter, ohne Aufruf bei Discord. Gesendet
wird nichts, bis du es an etwas übergibst, das mit einem Kanal spricht: `post` damit, `reply with` damit,
oder setze es als `embed` eines [Message-Builders](doc:concepts/builders) und lies `the build result of`
dieses Builders. Ein Embed ist einfacher als der vollständige Builder-Vertrag auf dieser Seite: Es hat
kein `await` und kein eigenes `build result`, weil es für sich nie mit Discord spricht.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!embed":
        set {_e} to a new discord embed
        set title of {_e} to "DiSky V5"
        set description of {_e} to "An embed built entirely in Skript."
        set color of {_e} to orange
        post {_e} to event-channel
```

syntax: core/expressions#expression-new-embed compact

## Optionen {#options}

Jede Eigenschaft wird mit `set <property> of {_e} to <value>` gesetzt. DiSky prüft die Längen- und
URL-Grenzen aus JDAs `EmbedBuilder` sofort, direkt in der `set`-Zeile. Die Grenzen für Anzahl der Felder
und Gesamtlänge gelten erst, wenn das Embed irgendwo angehängt wird (siehe
[Fehler, auf die du stoßen kannst](#errors-you-may-see)).

| Eigenschaft | Standard | Zulässige Werte |
| --- | --- | --- |
| [title](syntax:embedbuilder#title) | nicht gesetzt | Text, bis zu 256 Zeichen |
| [title url](syntax:embedbuilder#title-url) | nicht gesetzt | eine URL mit `http(s)://` oder `attachment://` |
| [description](syntax:embedbuilder#description) | nicht gesetzt | Text, bis zu 4096 Zeichen |
| [color](syntax:embedbuilder#color) | nicht gesetzt | eine Farbe |
| [discord author](syntax:embedbuilder#discord-author) | nicht gesetzt | Text, bis zu 256 Zeichen |
| [author icon](syntax:embedbuilder#author-icon) | nicht gesetzt | eine URL mit `http(s)://` oder `attachment://` |
| [author url](syntax:embedbuilder#author-url) | nicht gesetzt | eine URL mit `http(s)://` oder `attachment://` |
| [footer](syntax:embedbuilder#footer) | nicht gesetzt | Text, bis zu 2048 Zeichen |
| [footer icon](syntax:embedbuilder#footer-icon) | nicht gesetzt | eine URL mit `http(s)://` oder `attachment://` |
| [image](syntax:embedbuilder#image) | nicht gesetzt | eine URL mit `http(s)://` oder `attachment://` |
| [thumbnail](syntax:embedbuilder#thumbnail) | nicht gesetzt | eine URL mit `http(s)://` oder `attachment://` |
| [timestamp](syntax:embedbuilder#timestamp) | nicht gesetzt | ein Datum |
| [fields](syntax:embedbuilder#fields) | nicht gesetzt | nur Hinzufügen, siehe [Felder](#fields) unten; höchstens 25 |

Zurücklesen funktioniert nur bei zwei davon: `description of {_e}` liefert, was du gesetzt hast, und
`fields of {_e}` liefert die Liste, zu der du hinzugefügt hast. Jede andere Eigenschaft, auch `title`
und `color`, liest direkt nach dem Setzen nichts zurück: JDAs `EmbedBuilder` hat dafür keinen Getter,
also hat DiSky nichts, was es zurückgeben könnte.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!embed-full":
        set {_e} to a new discord embed
        set title of {_e} to "DiSky V5"
        set title url of {_e} to "https://disky.me"
        set description of {_e} to "An embed built entirely in Skript."
        set color of {_e} to orange
        set discord author of {_e} to "DiSky"
        set author icon of {_e} to "https://disky.me/icon.png"
        set footer of {_e} to "Powered by DiSky"
        set image of {_e} to "https://disky.me/banner.png"
        set thumbnail of {_e} to "https://disky.me/thumb.png"
        set timestamp of {_e} to now
        post {_e} to event-channel
```

## Felder {#fields}

Ein Feld ist ein eigenes Objekt, das getrennt erstellt und zu den `fields` des Embeds hinzugefügt wird.
Drei Schreibweisen erstellen eines: einfach (`inline` ist standardmäßig `false`), mit einem expliziten
`inline`-Wert oder mit einem `inline`, das durch die Form `new inline field` erzwungen wird.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!embed-fields":
        set {_e} to a new discord embed
        set title of {_e} to "Ping results"
        add (a new embed field named "Region" with value "eu-west") to fields of {_e}
        add (a new embed field named "Status" with value "OK" inline true) to fields of {_e}
        loop fields of {_e}:
            send "%name of loop-value% = %value of loop-value% (inline: %inline of loop-value%)" to console
        post {_e} to event-channel
```

Die drei gültigen Schreibweisen:

```skript
set {_f1} to a new embed field named "Region" with value "eu-west"
set {_f2} to a new embed field named "Status" with value "OK" inline true
set {_f3} to a new inline embed field named "Latency" with value "42ms"
```

`add {_f1} to fields of {_e}` hängt ein Feld an ein Embed. Ein Feld selbst liest du nur über `name of`,
`value of` und `inline of` zurück (wie oben bei `loop-value` verwendet). Ein Feldname mit über 256
Zeichen oder ein Wert mit über 1024 Zeichen schlägt sofort fehl, wenn das Feld erstellt wird, nicht erst
beim Hinzufügen.

syntax: core/expressions#expression-new-embed-field compact

## Embeds auslesen {#reading-embeds}

[`embeds of`](syntax:message#embeds) einer gesendeten Nachricht liefert ihre Embeds; eine mit DiSky
erstellte Nachricht trägt ein einziges Embed, die Liste enthält also meist ein Element. Jedes davon kommt
als JDAs eigener `MessageEmbed` zurück, ein schreibgeschützter Typ ohne eigenen Skript-Typ. DiSky wandelt
ihn aber überall dort in ein `embedbuilder` um, wo einer erwartet wird: Du speicherst ihn in einer
Variable, setzt weitere Eigenschaften darauf und sendest ihn erneut als neues Embed.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!requote":
        set {_e} to first element of embeds of event-message
        set footer of {_e} to "requoted by DiSky"
        post {_e} to event-channel
```

Das verändert nie die ursprüngliche Nachricht: Der Konverter kopiert den Inhalt des gesendeten Embeds in
einen neuen `EmbedBuilder`, also bringen weiterhin `post`, `reply with` oder ein Message-Builder das
Ergebnis auf Discord. Um das Embed einer bestehenden Nachricht an Ort und Stelle zu ändern, bearbeite
diese Nachricht stattdessen mit `edit` und dem neuen Embed (siehe [Nachrichten verwalten](doc:messages/managing-messages)).

## Fehler, auf die du stoßen kannst {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *IllegalArgumentException: Title cannot be longer than 256 characters.* | `title` wurde auf mehr als 256 Zeichen gesetzt | Kürze den Titel, oder verschiebe den Rest in `description` |
| *IllegalArgumentException: URL must be a valid http(s) or attachment url.* | `title url`, `author icon`, `author url`, `footer icon`, `image` oder `thumbnail` wurde auf etwas gesetzt, das kein gültiger Link mit `http://`, `https://` oder `attachment://` ist | Korrigiere die URL, oder lass die Eigenschaft ungesetzt |
| *IllegalArgumentException: Name cannot be longer than 256 characters* (oder *Value cannot be longer than 1024 characters*) | Der Name oder Wert eines Feldes ist zu lang | Kürze ihn, bevor du das Feld erstellst |
| *IllegalStateException: Cannot build an empty embed!* | Das Embed hatte nichts gesetzt (weder Titel, Beschreibung, Felder, Autor, Footer, Bild noch Thumbnail), als es an eine Nachricht angehängt wurde | Setze mindestens eine Eigenschaft, bevor du `set embed of` oder `a new message with embed` verwendest |
| *IllegalStateException: Cannot build an embed with more than 25 embed fields set!* | Es wurden mehr als 25 Felder hinzugefügt | Halte die Anzahl der Felder bei höchstens 25, oder verteile den Inhalt auf mehrere Embeds |

entity: embedbuilder
