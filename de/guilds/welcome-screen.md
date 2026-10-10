---
title: Willkommensbildschirm
description: Den Willkommensbildschirm eines Community-Servers lesen sowie seine Beschreibung und Kanäle ersetzen.
source-hash: 2dcafa1de6ee
---

Diese Seite behandelt den Willkommensbildschirm: die Karte, die ein Community-Server neuen Mitgliedern
zeigt, mit einer Beschreibung und bis zu fünf empfohlenen Kanälen. Du wirst als jemand vorausgesetzt, der
einen Bot namens `"my-bot"` angemeldet hat, einen Server mit aktivierter **Community** und für den Bot die
Berechtigung **Manage Server**, wenn er den Bildschirm bearbeitet.

## Den Willkommensbildschirm lesen {#reading-the-welcome-screen}

[`welcome screen of %guild%`](syntax:guild#welcome-screen) fragt Discord nach dem aktuellen Bildschirm,
daher braucht es `await`. Das Ergebnis ist ein Schnappschuss: Es ändert sich nicht, wenn der Bildschirm
bearbeitet wird; lies ihn dafür erneut ein.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!welcome":
        await set {_screen} to the welcome screen of event-guild
        reply with "%description of {_screen}%"
        loop welcome channels of {_screen}:
            reply with "%welcome channel of loop-value%: %description of loop-value% %emoji of loop-value%"
```

Jeder Eintrag von `welcome channels` ist ein `welcomechannel` mit drei Eigenschaften:
[welcome channel](syntax:welcomechannel#welcome-channel) (der Kanal selbst, keiner, falls der Bot ihn nicht
sehen kann), [description](syntax:welcomechannel#description) und
[emoji](syntax:welcomechannel#emoji), das Emoji so, wie es in einer Nachricht dargestellt wird.

syntax: guild#welcome-screen compact

## Den Willkommensbildschirm bearbeiten {#editing-the-welcome-screen}

Die Bearbeitung läuft über einen Builder (Bauobjekt), aber nicht über den üblichen: Der Willkommensbildschirm
existiert bereits, es gibt also nichts zu erstellen. Erzeuge ihn mit
[`a new welcome screen builder for %guild%`](syntax:welcomescreenbuilder#new-welcome-screen-builder), setze,
was du ändern willst, und sende ihn dann mit
[`update the welcome screen using %welcomescreenbuilder%`](syntax:welcomescreenbuilder#update-welcome-screen).
Dieser Effekt wartet auf Discord, sodass die nächste Zeile bereits den neuen Bildschirm sieht.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!set-welcome":
        set {_rules} to a new welcome channel for event-channel with description "Read the rules" with emoji "📜"
        set {_b} to a new welcome screen builder for event-guild
        set welcome screen enabled of {_b} to true
        set description of {_b} to "Welcome to the guild!"
        set welcome channels of {_b} to {_rules}
        update the welcome screen using {_b}
```

Nur die Eigenschaften, die du setzt, werden gesendet; die anderen behalten ihren Wert auf Discord.

syntax: welcomescreenbuilder#update-welcome-screen compact

## Optionen {#options}

| Eigenschaft | Standard | Zulässige Werte |
| --- | --- | --- |
| [welcome screen enabled](syntax:welcomescreenbuilder#welcome-screen-enabled) | unverändert | `true`, `false` |
| [description](syntax:welcomescreenbuilder#description) | unverändert | ein Text |
| [welcome channels](syntax:welcomescreenbuilder#welcome-channels) | unverändert | bis zu 5 Willkommenskanäle; `set`, `add`, `remove`, `delete` |

[`a new welcome channel for %guildchannel% with description %string% [with emoji %emote/string%]`](syntax:welcomechannel#new-welcome-channel)
erzeugt einen Eintrag. Die Beschreibung darf höchstens 42 Zeichen lang sein, das Emoji ist optional (ein
Unicode-Emoji, ein Server-Emoji oder die Form `<:name:id>` für ein eigenes), und der Kanal muss ein Text-,
Sprach-, Stage-, Ankündigungs- oder Forenkanal sein: Eine Kategorie oder ein Thread wird abgelehnt. Ein
Eintrag ändert sich nach seiner Erstellung nie; erstelle einen neuen, um ihn zu ändern.

!!! warning "Ein neuer Builder beginnt leer"
    `welcome channels` auf einem Builder ersetzt die **gesamte** Liste auf Discord, und ein neuer Builder
    beginnt nicht mit dem aktuellen Bildschirm. Um einen Kanal zur bestehenden Liste hinzuzufügen, lies
    zuerst den Bildschirm und kopiere seine Kanäle auf den Builder, wie unten gezeigt.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!add-welcome":
        await set {_screen} to the welcome screen of event-guild
        set {_b} to a new welcome screen builder for event-guild
        set welcome channels of {_b} to welcome channels of {_screen}
        add (a new welcome channel for event-channel with description "Say hi") to welcome channels of {_b}
        update the welcome screen using {_b}
```

`remove` nimmt einen Eintrag und entfernt jeden Eintrag, der auf denselben Kanal zeigt, unabhängig von
seiner Beschreibung. `delete welcome channels of {_b}` leert die Liste, was sie auf Discord löscht, sobald
der Builder gesendet wird.

syntax: welcomechannel#new-welcome-channel compact

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| Ein *Discord error* beim Lesen des Bildschirms | Der Server ist kein Community-Server oder hat nie einen Willkommensbildschirm eingerichtet | Aktiviere **Community** in den Servereinstellungen |
| *the channel '...' cannot be put on a welcome screen* | Der Eintrag zeigt auf eine Kategorie oder einen Thread | Verwende einen Text-, Sprach-, Stage-, Ankündigungs- oder Forenkanal |
| *[50035] Invalid Form Body* mit dem Namen `welcome_channels` | Mehr als 5 Einträge oder eine Beschreibung mit mehr als 42 Zeichen | Kürze die Liste oder die Beschreibung |
| Ein *Discord error* mit dem Namen **Missing Permissions** | Dem Bot fehlt **Manage Server** | Gewähre sie ihm |

entity: welcomescreenbuilder
