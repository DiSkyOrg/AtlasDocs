---
title: AutoMod
description: AutoMod-Regeln von Discord aus einem Skript erstellen, bearbeiten und überwachen.
source-hash: c6d3e1a63126
---

AutoMod ist der integrierte Filter von Discord: Eine Regel sucht in Nachrichten oder Mitgliedsprofilen
nach etwas und reagiert von selbst, auch wenn der Bot offline ist. Dieser Abschnitt behandelt das
Erstellen von Regeln, das Bearbeiten der Regeln, die ein Server bereits hat, und die Reaktion, wenn eine
davon auslöst. Du solltest einen Bot namens `"my-bot"` angemeldet haben (siehe
[Einen Bot starten](doc:getting-started/starting-a-bot)), mit **Server verwalten** auf dem Server, und
den [Builder-Vertrag](doc:concepts/builders) kennen.

## Woraus eine Regel besteht {#what-a-rule-is-made-of}

Eine Regel hat drei Teile, jeder davon eine eigene Entität:

| Teil | Entität | Beantwortet |
| --- | --- | --- |
| Auslöser | [triggerconfig](entity:triggerconfig) | wonach die Regel sucht: Schlüsselwörter, Regex-Muster, eine Preset-Liste, Erwähnungsspam, Spam |
| Aktionen | [automodresponse](entity:automodresponse) | was sie tut: die Nachricht blockieren, eine Warnung senden, das Mitglied in den Timeout schicken, Interaktionen blockieren |
| Regel | [automodrule](entity:automodrule) | ihren Namen, wann sie geprüft wird, wer und wo sie ignoriert wird |

Du baust zuerst den Auslöser und die Aktionen, übergibst sie einem
[AutoMod-Regel-Builder](entity:automodrulebuilder) und liest dann `the build result of` darauf, um die
Regel zu erstellen.

## Lesereihenfolge {#reading-order}

1. [Eine Regel erstellen](creating-rules.md): der Builder für AutoMod-Regeln, von der minimalen bis zur
   vollständig konfigurierten Regel.
2. [Auslöser und Aktionen](triggers-and-responses.md): jede Art von Auslöser mit ihren Optionen und jede
   Aktion.
3. [Regeln verwalten](managing-rules.md): die Regeln eines Servers auflisten, live bearbeiten, löschen
   und das Ausführungs-Event.
