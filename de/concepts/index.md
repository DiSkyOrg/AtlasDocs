---
title: Konzepte
description: Die Mechanik, die allen DiSky-Funktionen gemeinsam ist, bevor du Nachrichten, Interaktionen oder Server anfasst.
source-hash: 9a7beeb6cfaa
---

Dieser Abschnitt behandelt die Mechanik, die im gesamten Atlas immer wieder vorkommt: Entitäten und ihre
Eigenschaften, das Warten auf Discord, das Nachschlagen von Entitäten über ihre ID, Builder, Fehler und
Events. Du hast bereits einen Bot namens `"my-bot"` angemeldet (siehe
[Einen Bot starten](doc:getting-started/starting-a-bot)).

## Was eine Konzeptseite abdeckt {#what-a-concept-page-covers}

Eine Funktionsanleitung (Arbeiten mit Nachrichten, Interaktionen, Servern ...) zeigt dir, *was* du bauen
kannst. Eine Konzeptseite zeigt dir das Muster, auf das sich diese Anleitung stützt, ohne es erneut zu
erklären: wie das Lesen einer Eigenschaft sich vom Schreiben unterscheidet, wann eine Zeile `await`
braucht, wie ein Builder zu einem echten Discord-Objekt wird, wie ein Fehler in der Konsole aussieht und
wie ein Event ausgelöst wird. Sobald du ein Muster hier kennst, liest sich jede Funktionsanleitung, die es
verwendet, als einfache Anwendung davon und nicht als etwas Neues.

## Lesereihenfolge {#reading-order}

1. [Entitäten und Eigenschaften](entities-and-properties.md): Jedes Discord-Objekt ist eine Entität;
   Eigenschaften werden als `X of %entity%` gelesen und geschrieben.
2. [Cache und await](cache-and-await.md): Die drei `await`-Regeln und warum manche Lesevorgänge es brauchen.
3. [Entitäten per ID abrufen](getting-by-id.md): Die Familie `X with id "..."`, Cache gegen REST.
4. [Builder](builders.md): Der Builder-Vertrag und `the build result of`.
5. [Fehler](errors.md): `try`/`catch`, `the last discord error` und das Konsolenformat der Fehler.
6. [Events](events.md): Aufbau eines Events, `event-bot`, `seen by` und Event-Werte.
