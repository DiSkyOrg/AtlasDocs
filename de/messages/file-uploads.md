---
title: Datei-Uploads
description: Eine Datei aus einem lokalen Pfad, einer URL oder einem empfangenen Anhang erstellen, an eine Nachricht hängen und Anhänge auslesen.
source-hash: fde9e2c311e4
---

Diese Seite behandelt das Senden von Dateien: das Erstellen eines Datei-Uploads aus einem lokalen Pfad,
einer URL oder einem empfangenen Anhang, das Anhängen an einen Message-Builder (Bauobjekt) und das
Auslesen der Anhänge einer gesendeten Nachricht. Du solltest einen Bot namens `"my-bot"` angemeldet
haben und wissen, wie man [eine Nachricht sendet](doc:messages/sending-messages).

## So funktionieren Uploads {#how-uploads-work}

[A new file upload](syntax:core/expressions#expression-new-file-upload) umschließt eine Quelle in ein
lokales Objekt, das vor dem Senden zu den `attachments` eines [Message-Builders](doc:concepts/builders)
hinzugefügt wird. Vier Quellen erzeugen eines, je nachdem, welches Wort nach `from` steht:

| Quelle | Muster | Hinweise |
| --- | --- | --- |
| Lokale Datei | `from [local] file %string%` | Der Pfad wird relativ zum Arbeitsverzeichnis des Minecraft-Servers aufgelöst; DiSky prüft sofort, ob die Datei existiert. |
| URL | `from ur(l|i) %string%` | Wird erst beim Senden der Nachricht heruntergeladen, nie bei der Erstellung. |
| Anhang | `from attachment %attachment%` | Lädt einen empfangenen Anhang erneut hoch; wird ebenfalls beim Senden heruntergeladen. |
| Bild | `from image %image%` | Nur registriert, wenn das Addon (Skript-Erweiterung) SkImage2 installiert ist; das Bild wird sofort als PNG kodiert, da es nur im Speicher existiert. |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!file-local":
        set {_f} to a new file upload from file "plugins/DiSky/logo.png"
        set {_m} to a new message with content "here's the logo" in event-channel
        add {_f} to attachments of {_m}
        await set {_sent} to the build result of {_m}
```

Vor dem Senden der Nachricht, die den Upload trägt, wird nichts von der Festplatte gelesen und nichts
heruntergeladen. Ausnahmen sind die Prüfung, ob die lokale Datei existiert, und die oben beschriebene
Bildkodierung. Beide müssen jetzt passieren, weil sich dafür nichts aufschieben lässt.

syntax: core/expressions#expression-new-file-upload compact

## Namen und Spoiler {#naming-and-spoilers}

Jeder Konstruktor akzeptiert optional `named` (oder `with the name`) und `with spoiler`. Wird nichts davon
angegeben, übernimmt der Name den der Quelle: den Dateinamen der lokalen Datei oder des Anhangs, das
letzte Pfadsegment der URL (oder `"file"`, falls es keines gibt) oder `image-<hex>.png` für ein Bild.

```skript
set {_f} to a new file upload from url "https://example.com/logo.png" named "banner.png" with spoiler true
```

`with spoiler true` und [`set spoiler of {_f}`](syntax:fileupload#spoiler) funktionieren beide, indem sie
dem Namen das Präfix `SPOILER_` voranstellen; setzt du den Wert zurück auf `false`, entfernt sich das
Präfix wieder. Da die Prüfung den aktuellen Namen verwendet, benenne die Datei vor dem Setzen von
`spoiler` um, nicht danach, sonst überschreibt die Umbenennung das Präfix. [`file description`](syntax:fileupload#file-description)
setzt den Alternativtext, der von Screenreadern und beim Überfahren mit der Maus angezeigt wird; er
lässt sich nicht auslesen, nur setzen.

```skript
set {_f} to a new file upload from file "plugins/DiSky/logo.png"
set file name of {_f} to "company-logo.png"
set spoiler of {_f} to true
set file description of {_f} to "the company logo"
```

## An eine Nachricht anhängen {#attaching-to-a-message}

[`attachments`](syntax:messageaction#attachments) eines [Message-Builders](doc:concepts/builders) akzeptiert
`set`, `add` und `remove`; ausgelesen liefert es die Namen der bisher hinzugefügten Dateien, und `remove`
erwartet einen Namen statt des Uploads selbst.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!file-list":
        set {_a} to a new file upload from file "plugins/DiSky/logo.png" named "a.png"
        set {_b} to a new file upload from file "plugins/DiSky/logo.png" named "b.png"
        set {_m} to a new message with content "one file" in event-channel
        set attachments of {_m} to {_a} and {_b}
        remove "a.png" from attachments of {_m}
        await set {_sent} to the build result of {_m}
```

Eine URL- oder Anhangsquelle wird erst heruntergeladen, wenn `the build result of` läuft. Eine tote URL
schlägt also dort fehl, nicht in der `add`-Zeile. `reply with {_m} with reference event-message` sendet
die Anhänge eines Builders auf dieselbe Weise, wie es `the build result of` tut. Medien-Galerien und
Dateianzeigen (Komponenten v2) nehmen Datei-Uploads ebenso an.

syntax: messageaction#attachments compact

## Anhänge auslesen {#reading-attachments}

[`discord attachments of`](syntax:message#discord-attachments) liefert für eine gesendete Nachricht ihre
Dateien als `attachment` zurück, einen schreibgeschützten Typ mit eigenen Eigenschaften und Bedingungen.

| Eigenschaft | Liefert |
| --- | --- |
| [attachment url](syntax:attachment#attachment-url) | die CDN-URL der Datei |
| [file name](syntax:attachment#file-name) | den Dateinamen, einschließlich des Spoiler-Präfixes |
| [file extension](syntax:attachment#file-extension) | die Dateiendung, oder nichts, falls die Datei keine hat |
| [attachment duration](syntax:attachment#attachment-duration) | die Länge eines Audio-Anhangs (Sprachnachricht), sonst nichts |

Vier Bedingungen beschreiben, um welche Art Datei es sich handelt:

| Bedingung | Wahr, wenn |
| --- | --- |
| [is an image attachment](syntax:attachment#an-image-attachment) | die Datei ein Bild ist |
| [is a video attachment](syntax:attachment#a-video-attachment) | die Datei ein Video ist |
| [is an audio attachment](syntax:attachment#an-audio-attachment) | die Datei eine Sprachnachricht ist; `attachment duration` funktioniert darauf |
| [is a spoiler attachment](syntax:attachment#a-spoiler-attachment) | der Dateiname das Präfix `SPOILER_` trägt |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!file-echo":
        set {_att} to first element of discord attachments of event-message
        if {_att} is set:
            set {_f} to a new file upload from attachment {_att} named "echo-%file name of {_att}%"
            set {_m} to a new message with content "re-uploaded" in event-channel
            add {_f} to attachments of {_m}
            await set {_sent} to the build result of {_m}
```

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *IllegalArgumentException: the file '\<path>' does not exist* | `a new file upload from file` wurde ein Pfad übergeben, unter dem keine Datei liegt | Prüfe, ob der Pfad relativ zum Arbeitsverzeichnis des Minecraft-Servers stimmt und die Datei vorhanden ist |
| *UncheckedIOException: could not download '\<url>'* | Die URL aus `from url` konnte beim Senden der Nachricht nicht heruntergeladen werden | Prüfe, ob die URL erreichbar ist, oder umschließe das Senden mit `try` und lies den [Fehler](doc:concepts/errors) |
| Ein *Discord error*-Block, der die Datei als zu groß nennt | Die Datei überschreitet das Upload-Limit von Discord für den Server (meist 10 MB, mit Server-Boosts mehr) | DiSky prüft die Größe nicht selbst; verkleinere oder komprimiere die Datei, bevor du sie hochlädst |

entity: fileupload
