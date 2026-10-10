---
title: Interaktionsbefehle
description: Slash-Befehle und Kontextbefehle aus dem Rechtsklick-Menü, deklariert durch eine Struktur oder einen Builder und vom Skript an Discord übertragen.
source-hash: 5e0612dbf4f7
---

Ein *Interaktionsbefehl* wird bei Discord registriert und vom Client selbst angezeigt: ein
`/command` im Auswahlmenü oder ein Eintrag im Rechtsklick-Menü **Apps** auf einem Benutzer oder
einer Nachricht. Discord typisiert und prüft seine Argumente, bevor der Bot sie sieht. Du solltest
bereits einen Bot namens `"my-bot"` angemeldet haben (siehe [Einen Bot starten](doc:getting-started/starting-a-bot)).

```skript
slash command ping:
    description: Pong!
    trigger:
        reply with hidden "Pong! (%used slash command%)"

on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

Die Struktur deklariert den Befehl und seinen Trigger; der Block `on guild ready` bringt ihn auf
Discord. Beim Laden, Neuladen oder Entladen gelangt von selbst nichts zu Discord.

## Struktur oder Builder {#structure-or-builder}

| Bedarf | Verwendung |
| --- | --- |
| Ein `/command` mit eigenem Trigger, der beim Laden des Skripts bekannt ist | eine [Slash-Struktur](slash-commands.md) |
| Ein `/command`, das zur Laufzeit aus Daten oder pro Server zusammengesetzt wird | ein [Befehls-Builder](command-builders.md) |
| Ein Eintrag im Rechtsklick-Menü **Apps** | ein [Kontextbefehl](context-commands.md), als Struktur oder Builder |
| Ein Befehl, der auf getippten Text reagiert, ohne Registrierung bei Discord | ein [Chat-Befehl](doc:chat-commands) |

Beide Formen erzeugen dieselben Befehlsobjekte und können im selben Aufruf übertragen werden. Eine
Struktur behält ihren eigenen `trigger`; ein Builder wird im generischen Event `on slash command`
beantwortet.

## Lesereihenfolge {#reading-order}

1. [Slash-Befehle](slash-commands.md): die Struktur, ihr Pfad, ihre Beschreibung, ihr Trigger und was
   sich gegenüber v4 geändert hat.
2. [Slash-Optionen](slash-options.md): Argumenttypen, Auswahlmöglichkeiten, Autovervollständigung,
   typisierte Optionen.
3. [Kontextbefehle](context-commands.md): `user command` und `message command`, ihre Ziele.
4. [Befehls-Builder](command-builders.md): einen Befehl als Objekt aufbauen und mit Strukturen mischen.
5. [Befehle registrieren](registering-commands.md): `update`, `register`, `unregister`, Neuladen.
6. [Befehlseinstellungen](command-settings.md): Berechtigungen, Kontexte, Lokalisierung, Cooldowns.
