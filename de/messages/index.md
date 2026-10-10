---
title: Nachrichten
description: Nachrichten an Discord senden, erstellen und verwalten, von einer einfachen Nachricht bis zu Dateien, Reaktionen und Umfragen.
source-hash: cf275900196e
---

Dieser Bereich behandelt alles, was ein Bot mit Nachrichten tut: senden, vorab erstellen, Embeds und
Dateien anhängen, bearbeiten und anheften, reagieren sowie Umfragen erstellen und auslesen. Du hast
bereits einen Bot namens `"my-bot"` angemeldet (siehe [Einen Bot starten](doc:getting-started/starting-a-bot))
und den [Konzeptbereich](doc:concepts) gelesen, insbesondere [Cache und await](doc:concepts/cache-and-await)
und [Builder](doc:concepts/builders).

## Drei Wege zu senden {#three-ways-to-send}

`post` schickt einen Text, ein Embed oder eine Komponente an einen beliebigen Kanal und vergisst sie
danach. `reply with` antwortet auf dieselbe Weise auf die aktuelle Nachricht oder Interaktion, ohne
dass du einen Kanal angeben musst. Der Message-Builder (Bauobjekt) konfiguriert vorab alles, und nur
das `the build result of` davon gibt dir die gesendete Nachricht zurück, die du später bearbeiten,
anheften oder referenzieren kannst.

| Bedarf | Verwende |
| --- | --- |
| An einen bereits vorhandenen Kanal senden und dann weitermachen | `post` |
| Auf die Nachricht oder Interaktion antworten, auf die sich das aktuelle Event bezieht | `reply with` |
| Dateien anhängen, Komponenten hinzufügen oder die gesendete Nachricht danach behalten | der Message-Builder |
| Mit etwas antworten, das vorab erstellt wurde, ohne es zu behalten | `reply with {_builder}` |

## Lesereihenfolge {#reading-order}

1. [Nachrichten senden](sending-messages.md): `post`, `reply with`, der Message-Builder und seine
   Optionen.
2. [Embeds](embeds.md): jede Embed-Eigenschaft und ihre Felder.
3. [Datei-Uploads](file-uploads.md): Dateien anhängen und wieder auslesen.
4. [Nachrichten verwalten](managing-messages.md): bearbeiten, anheften, veröffentlichen, weiterleiten,
   massenhaft löschen, Tipp-Anzeige.
5. [Reaktionen](reactions.md): reagieren, Reaktionen unterdrücken, Reaktions-Events.
6. [Umfragen erstellen](creating-polls.md): eine Umfrage erstellen und allein oder an eine Nachricht
   gehängt senden.
7. [Umfragen](polls.md): eine Umfrage auslesen, ihre Abstimmenden auflisten, sie beenden, Stimm-Events.

Um unter einem anderen Namen und Avatar zu senden, siehe den [Webhook-Bereich](doc:webhooks).
