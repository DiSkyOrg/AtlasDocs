---
title: Chat-Befehle
description: Befehle, die auf den getippten Text in einem Kanal reagieren, komplett in Skript deklariert und nie bei Discord registriert.
source-hash: 54267789640b
---

Ein *Chat-Befehl* wird am Nachrichtentext erkannt: Der Bot beobachtet jede Nachricht, die er erhält,
und führt bei einer Übereinstimmung mit `<prefix><name> <arguments>` den `trigger` (Codeblock) des
Befehls aus. Nichts wird bei Discord registriert. Du solltest bereits einen Bot namens `"my-bot"`
angemeldet haben (siehe [Einen Bot starten](doc:getting-started/starting-a-bot)).

```skript
discord command ping:
    prefixes: "!"
    trigger:
        reply with "pong"
```

Wenn du `!ping` in einem Kanal sendest, den der Bot sehen kann, führt er den Trigger aus und antwortet
mit `pong`.

## Chat- oder Interaktionsbefehle {#chat-or-interaction-commands}

| Bedarf | Verwendung |
| --- | --- |
| Antwort auf getippten Text, keine Registrierung bei Discord, funktioniert in jedem Client | ein Chat-Befehl, dieser Abschnitt |
| Ein `/command`, das Discord im eigenen Auswahlmenü anbietet, oder ein Eintrag im Rechtsklick-Menü **Apps** | ein [Interaktionsbefehl](doc:interaction-commands) |

Beide Familien können im selben Skript stehen: Ein Chat-Befehl liest seine Argumente aus dem
Nachrichtentext, ein Interaktionsbefehl erhält sie von Discord typisiert und validiert, bevor der Bot
sie sieht.

## Lesereihenfolge {#reading-order}

1. [Einen Befehl deklarieren](declaring-a-command.md): die Struktur, Präfixe, Aliase und was der Trigger
   lesen kann.
2. [Argumente](arguments.md): die Argumentgrammatik, Typen, Auflösung und benannte lokale Variablen.
3. [Befehle einschränken](restricting-a-command.md): Kanäle, Rollen, Berechtigungen, Bots und
   Abklingzeiten.
4. [Auflisten und Events](listing-and-events.md): `on discord command used`, alle geladenen Befehle und
   ein Hilfebefehl.
