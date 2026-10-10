---
title: Befehlseinstellungen
description: Berechtigungen, Kontexte, lokalisierte Namen und Beschreibungen sowie Cooldowns, die alle Slash-, User- und Message-Befehle teilen.
source-hash: 4cae79bb39b7
---

Diese Seite behandelt die Einstellungen, die alle [Slash-Befehle](doc:interaction-commands/slash-commands),
[Kontextbefehle](doc:interaction-commands/context-commands) und [Builder](doc:interaction-commands/command-builders)
gemeinsam haben: wer sie sieht, wo sie funktionieren, ihre übersetzten Namen und Beschreibungen sowie
ihr Cooldown. Du solltest bereits einen Bot namens `"my-bot"` angemeldet haben und einen Befehl, eine
Struktur oder einen Builder haben, an dem du sie setzt.

## Wie Einstellungen funktionieren {#how-settings-work}

Jede dieser Einstellungen existiert zweimal: als Eintrag einer Struktur neben `description` und
`trigger` sowie als Eigenschaft des Builder-Objekts. Beide landen auf demselben Befehl; verwende die
Form, die zu der Art passt, wie der Befehl deklariert wurde.

| Einstellung | Eintrag der Struktur | Eigenschaft des Builders | Standard | Zulässige Werte |
| --- | --- | --- | --- | --- |
| Benötigte Berechtigungen | `enabled for` | [enabled for](syntax:applicationcommand#enabled-for) | keine: alle | durch Kommas getrennte Berechtigungsnamen |
| Standardmäßig versteckt | `disabled` | `disabled` | `false` | `true`, `false` |
| Altersbeschränkt | `nsfw` | `nsfw` | `false` | `true`, `false` |
| Wo er funktioniert | `contexts` | [contexts](syntax:applicationcommand#contexts) | nur Server | `guild`/`server`, `bot dm`/`dm`/`private message`, `group dm` |
| Wie er installiert wird | `integration types` | `integration types` | `guild install` | `guild install`/`server install`, `user install` |
| Wartezeit zwischen Aufrufen | `cooldown` | nicht auf einem Builder verfügbar | keine | eine Zeitspanne, z. B. `10 seconds` |
| Wer sich den Cooldown teilt | `cooldown scope` | nicht auf einem Builder verfügbar | `user` | `user`, `guild`, `channel` |
| Übersetzter Name | Abschnitt `name:` | `localize the name of ...` | Name aus dem Kopf bzw. Builder | `locale: text`-Zeilen |
| Übersetzte Beschreibung | Abschnitt `description:` | `localize the description of ...` | keine | `locale: text`-Zeilen |

```skript
slash command roll <sides: integer>:
    description: Roll a dice
    enabled for: manage server
    contexts: guild, bot dm
    cooldown: 5 seconds
    trigger:
        reply with hidden "You rolled between 1 and %{_sides}%"
```

## Wer einen Befehl sieht {#who-sees-a-command}

`enabled for` listet die Berechtigungen, die ein Mitglied standardmäßig braucht, um den Befehl zu
sehen und zu verwenden. Administratoren können ihn immer verwenden; eine leere Liste bedeutet, dass
alle ihn verwenden können. `disabled` versteckt den Befehl vor allen außer Administratoren, unabhängig
von `enabled for`. Beides gilt nur als Standard: Die Integrationseinstellungen des Servers, die ein
Mitglied mit **Manage Server** ändert, können auf Discords Seite trotzdem überschrieben werden.

```skript
set {_ban} to a new slash command named "ban" with description "Ban a member"
set enabled for of {_ban} to ban members
```

Eine aus Unterbefehlen zusammengeführte `slash command mod`-Wurzel (siehe [Slash-Befehle](doc:interaction-commands/slash-commands))
ohne eigenen Deskriptor erbt `enabled for` als Schnittmenge dessen, was ihre Unterbefehle erlauben:
Eine Berechtigung muss bei jedem Unterbefehl vorhanden sein, damit sie auf der Wurzel landet.

## Wo ein Befehl verfügbar ist {#where-a-command-is-available}

`contexts` schränkt ein, von welchen Oberflächen aus der Befehl verwendet werden kann: `guild`
(Discords Standard; der einzige gesetzte Wert, wenn du dies weglässt), `bot dm` und `group dm`.
`integration types` schränkt ein, wie er installiert wurde: `guild install`, der Standard, oder
`user install`, der den Befehl in die eigene Befehlsliste eines Benutzers legt, nutzbar auf Servern,
auf denen der Bot nie installiert wurde.

```skript
set {_roll} to a new slash command named "roll" with description "Roll a dice"
set contexts of {_roll} to guild and bot dm
```

## Übersetzungen {#translations}

Die Abschnitte `name:` und `description:` einer Struktur enthalten je eine `locale: text`-Zeile pro
Sprache. Ein Abschnitt `description:` braucht eine `en-US`-Zeile (oder `en`) als Standard, der überall
sonst angezeigt wird. `name:` braucht nie eine, da der Kopf bereits den Standardnamen liefert.

```skript
slash command greet <who: user>:
    description:
        en-US: Greet someone
        fr: Saluer quelqu'un
    name:
        fr: saluer
    arguments:
        who: Who to greet
    trigger:
        reply with hidden "Hello %{_who}%!"
```

Ein Builder, seine Optionen, Unterbefehle, Gruppen und Auswahlmöglichkeiten (nur der Name) verwenden
stattdessen [`localize the name/description of`](syntax:core/effects#effect-localize-command), jeweils
ein Aufruf pro Locale:

```skript
set {_cmd} to a new slash command named "ban" with description "Ban a member"
localize the name of {_cmd} in "fr" to "bannir"
localize the description of {_cmd} in "fr" to "Bannir un membre"
```

Lies die Übersetzungen mit `name localizations of {_cmd}` und `description localizations of {_cmd}` zurück,
beide eine Liste von `"locale: text"`-Zeilen. Locales sind Discords eigene Codes (`fr`, `en-GB`,
`pt-BR`...); ein einfacher Sprachname (`"french"`) funktioniert ebenfalls.

syntax: core/effects#effect-localize-command compact

## Cooldowns {#cooldowns}

`cooldown` sperrt die erneute Verwendung für eine Zeitspanne; `cooldown scope` legt fest, wer sich
diesen Timer teilt.

| Bereich | Geteilt zwischen |
| --- | --- |
| `user` (Standard) | demselben Benutzer, über jeden Server und jeden Kanal hinweg |
| `guild` | allen Mitgliedern dieses Servers |
| `channel` | allen im Kanal |

Ein Abschnitt `on cooldown:` reagiert auf einen blockierten Aufruf, mit gesetztem `remaining cooldown`:

```skript
slash command slow:
    description: 10 seconds cooldown
    cooldown: 10 seconds
    cooldown scope: user
    on cooldown:
        reply with hidden "Wait %remaining cooldown%"
    trigger:
        reply with hidden "Not on cooldown!"
```

Ohne einen Abschnitt `on cooldown:` antwortet DiSky selbst mit einer flüchtigen Meldung
*"You can use this command again in \<time\>."*, damit die Interaktion nie unbestätigt
bleibt. Das generische Event [`on slash command cooldown`](event:events#application-command-cooldown)
(ebenso `on user command cooldown`, `on message command cooldown`, `on application command cooldown`)
wird ebenfalls ausgelöst und ist abbrechbar: [Abbrechen](doc:concepts/events) lässt den Befehl trotzdem
laufen; die Antwort auf die Interaktion übernimmt dann der Trigger. Ein Neuladen setzt jeden Cooldown
zurück, da es mit einem frischen Modell beginnt; siehe [Befehle registrieren](doc:interaction-commands/registering-commands).

event: events#application-command-cooldown compact

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *Unknown permission 'x' in the slash command 'name'* | ein Wort in `enabled for` ist keine Berechtigung, die Discord kennt | verwende einen Berechtigungsnamen, den Discord kennt, kanonisch oder als Alias |
| *'x' is not an interaction context (expected guild, bot dm or group dm)* | ein Wort in `contexts` ist falsch geschrieben | verwende eines der Wörter aus [Wo ein Befehl verfügbar ist](#where-a-command-is-available) |
| *'x' is not an integration type (expected guild install or user install)* | ein Wort in `integration types` ist falsch geschrieben | verwende `guild install` (oder `server install`) / `user install` |
| *'x' is not a Discord locale (available: ...)* | ein Locale-Code vor `localize` oder in einem Abschnitt `name:`/`description:` wird nicht erkannt | verwende einen Discord-Locale-Code oder einen Sprachnamen |
| *A localized description needs a default 'en-US' (or 'en') line* | ein Abschnitt `description:` hat keine `en-US`- oder `en`-Zeile | füge eine hinzu; sie wird zum Fallback für jede andere Locale |
| *The slash command 'name' has an 'on cooldown' section but no 'cooldown' entry* | `on cooldown:` wurde ohne `cooldown` gesetzt | füge einen Eintrag `cooldown` hinzu oder entferne den Abschnitt |
| *'x' is not a valid cooldown scope (expected user, guild or channel)* | `cooldown scope` ist keines der drei Wörter | verwende `user`, `guild` oder `channel` |
