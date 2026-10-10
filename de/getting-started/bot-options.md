---
title: Bot-Optionen
description: Jede Verbindungsoption, die du vor dem Login an einem Bot setzen kannst, und die zwei Präsenz-Optionen, die du jederzeit ändern kannst.
source-hash: a12943b4f53f
---

Diese Seite listet jede Option auf, die ein Bot akzeptiert: welche Gateway-Intents (Event-Abonnements)
er abonniert, was er im Cache (Kopie im Speicher) behält, wie er den Traffic komprimiert, wie viele
Shards (Gateway-Verbindungen) er betreibt und welche Präsenz er anzeigt. Du weißt bereits, wie du
einen Bot erstellst und anmeldest (siehe [Einen Bot starten](doc:getting-started/starting-a-bot)) und
hast einen Token zur Hand.

## So funktionieren die Optionen {#how-options-work}

Ein Bot durchläuft zwei Phasen. Zwischen `a new discord bot` und `login` befindet er sich in der
*Konfigurationsphase*: Jede der folgenden Eigenschaften kann gesetzt werden, und das Lesen einer
Eigenschaft liefert den konfigurierten Wert zurück. Sobald `login` ausgeführt wird, ist der Bot in
der *Laufphase*, und seine Verbindung wird mit den Optionen aufgebaut, die er in diesem Moment hatte.
Die Verbindungsoptionen (`intents`, `member cache policy`, `cache flags`, `compression`,
`shard count` und der `token`) sind nur beim Aufbau der Verbindung wirksam: Setzt du eine davon auf
einem laufenden Bot, hat das keine Auswirkung auf die Verbindung, sondern es erscheint stattdessen
eine lesbare Fehlermeldung in der Konsole. Die beiden Präsenz-Optionen (`activity` und
`online status`) wirken sofort: Setze sie vor `login`, um mit ihnen zu starten, oder auf einem
laufenden Bot, um sie direkt zu ändern.

```skript
options:
    token: "YOUR-TOKEN"

command /startbot <text>:
    trigger:
        shutdown the bot named "my-bot"
        set {_bot} to a new discord bot
        set token of {_bot} to {@token}
        set intents of {_bot} to "default intents"
        set member cache policy of {_bot} to "all"
        set cache flags of {_bot} to "activity, voice_state, online_status"
        set compression of {_bot} to "zlib"
        set activity of {_bot} to "with Skript"
        set online status of {_bot} to dnd
        login {_bot} as "my-bot"
```

Das führende `shutdown` macht den Befehl neustartsicher: Wird er erneut ausgeführt, ersetzt er den
Bot mit dem Namen `"my-bot"`, statt eine zweite Kopie anzumelden. Jede `set`-Zeile zwischen der
Erstellung und dem `login` ist optional; ein Bot mit nur einem Token meldet sich mit den Standardwerten
aus der Tabelle unten an.

## Optionen {#options}

Jede Eigenschaft wird mit `<property> of {_bot}` gelesen und mit
`set <property> of {_bot} to <value>` geschrieben. Textwerte berücksichtigen Groß- und
Kleinschreibung nicht; Namen mit einem Leerzeichen dürfen mit Leerzeichen oder mit Unterstrich
geschrieben werden (`voice state` oder `voice_state`).

| Eigenschaft | Standard | Zulässige Werte |
| --- | --- | --- |
| [intents](syntax:bot#intents) | `"default intents"` | `"default intents"`, `"all"` oder durch Kommas getrennte Intent-Namen |
| [member cache policy](syntax:bot#member-cache-policy) | `"default"` | `"all"`, `"default"`, `"none"`, `"online"`, `"owner"`, `"voice"` |
| [cache flags](syntax:bot#cache-flags) | nicht gesetzt (die Standardwerte von JDA gelten) | `"default"`, `"all"`, `"none"` oder durch Kommas getrennte Flag-Namen |
| [compression](syntax:bot#compression) | `"zlib"` | `"zlib"`, `"none"` |
| [shard count](syntax:bot#shard-count) | `-1` (von Discord empfohlene Anzahl) | `-1`, `1` oder eine beliebige Zahl ab 2 |
| [activity](syntax:bot#activity) | keine | beliebiger Text, angezeigt als *Spielt <text>* |
| [online status](syntax:bot#online-status) | Discords Standard (online) | `online`, `idle`, `dnd`, `invisible` |

## Intents {#intents}

Gateway-Intents teilen Discord mit, welche Gruppen von Events dein Bot empfangen möchte. Ein Bot ohne
den Intent `guild_messages` sieht nie eine Nachricht, die in einem Server gesendet wird, egal worauf
dein Skript hört. Der Wert ist eine durch Kommas getrennte Liste von Intent-Namen oder eine
Abkürzung; beim Setzen wird die gesamte Menge ersetzt.

```skript
set intents of {_bot} to "guild_messages, message_content, guild_members"
```

Es gibt zwei Abkürzungen, und beide lassen sich mit Namen kombinieren, um oben auf die Menge einige
Intents hinzuzufügen:

- `"default intents"` (oder `"default"`): die Menge, die ein neuer Bot verwendet, in der Tabelle
  unten markiert.
- `"all"`: jeder Intent, den JDA kennt.

```skript
set intents of {_bot} to "default intents, guild_message_polls"
```

| Intent | Standard | Privilegiert | Benötigt für |
| --- | :---: | :---: | --- |
| `guild_messages` | ja | | Nachrichten in Server-Kanälen |
| `message_content` | ja | ja | Text und Anhänge von Nachrichten lesen |
| `guild_members` | ja | ja | Ereignisse bei Beitritt, Verlassen und Aktualisierung von Mitgliedern, vollständiger Mitglieder-Cache |
| `guild_presences` | ja | ja | Online-Status und Aktivitäten von Mitgliedern |
| `guild_moderation` | ja | | Bannungen, Entbannungen, Einträge im Audit-Log |
| `guild_expressions` | ja | | Emoji-, Sticker- und Soundboard-Ereignisse |
| `guild_webhooks` | ja | | Ereignisse bei Webhook-Aktualisierungen |
| `guild_invites` | ja | | Ereignisse beim Erstellen und Löschen von Einladungen |
| `guild_voice_states` | ja | | Ereignisse beim Betreten und Verlassen von Sprachkanälen sowie bei Statusänderungen |
| `guild_message_reactions` | ja | | Reaktionen in Server-Kanälen |
| `guild_message_typing` | ja | | Tipp-Ereignisse in Server-Kanälen |
| `direct_messages` | ja | | Nachrichten, die dem Bot per DM gesendet werden |
| `scheduled_events` | ja | | Änderungen an geplanten Events |
| `guild_message_polls` | | | Umfragestimmen in Server-Kanälen |
| `direct_message_polls` | | | Umfragestimmen in DMs |
| `direct_message_reactions` | | | Reaktionen in DMs |
| `direct_message_typing` | | | Tipp-Ereignisse in DMs |
| `auto_moderation_configuration` | | | Änderungen an AutoMod-Regeln |
| `auto_moderation_execution` | | | AutoMod-Aktionen |

Privilegierte Intents werden nur zugestellt, wenn sie für deine Anwendung unter
**Bot → Privileged Gateway Intents** im Developer Portal aktiviert sind. Das Lesen von
`intents of {_bot}` liefert die aktivierten Namen in Großbuchstaben, durch Kommas getrennt, zurück.

!!! warning "Die Standardmenge enthält die drei privilegierten Intents"
    Ein Bot, der auf `"default intents"` belassen wird, braucht **alle drei** privilegierten
    Schalter im Developer Portal, sonst trennt Discord die Verbindung direkt nach dem Login. Aktiviere
    sie entweder, oder setze eine explizite Liste ohne die, die du nicht brauchst.

syntax: bot#intents compact

## Caching {#caching}

Zwei Eigenschaften bestimmen, was der Bot im Speicher behält, und beide gehören vor `login`. Die
`member cache policy` legt fest, welche Mitglieder im Cache bleiben, nachdem Discord sie gesendet hat.
Die `cache flags` legen fest, welche zusätzlichen Daten neben den Entitäten selbst im Cache gehalten
werden. Beim Setzen einer der beiden Eigenschaften wird ihr bisheriger Wert ersetzt.

```skript
set member cache policy of {_bot} to "online"
set cache flags of {_bot} to "default, emoji"
```

| Member-Cache-Richtlinie | Im Cache gehaltene Mitglieder |
| --- | --- |
| `"default"` | Mitglieder in einem Sprachkanal und Server-Besitzer (JDA-Standard) |
| `"all"` | jedes Mitglied jedes Servers; braucht den Intent `guild_members`, um sich zu füllen |
| `"online"` | Mitglieder, deren Status nicht offline ist; braucht `guild_presences` |
| `"voice"` | Mitglieder in einem Sprachkanal |
| `"owner"` | Server-Besitzer |
| `"none"` | niemand außer dem Bot selbst |

Cache-Flags akzeptieren die unten stehenden Namen oder eine von drei Abkürzungen: `"default"` steht für
`activity`, `voice_state` und `online_status`; `"all"` aktiviert jedes Flag; `"none"` leert die Liste.
Ein Flag füllt sich nur, wenn sein Intent aktiviert ist.

| Cache-Flag | Speichert | Benötigter Intent |
| --- | --- | --- |
| `activity` | Aktivitäten der Mitglieder | `guild_presences` |
| `online_status` | Online-Status der Mitglieder | `guild_presences` |
| `client_status` | welchen Client (Desktop, Mobil, Web) ein Mitglied verwendet | `guild_presences` |
| `voice_state` | wer in welchem Sprachkanal ist | `guild_voice_states` |
| `emoji` | Server-Emojis | `guild_expressions` |
| `sticker` | Server-Sticker | `guild_expressions` |
| `soundboard_sounds` | Soundboard-Sounds | `guild_expressions` |
| `scheduled_events` | geplante Events | `scheduled_events` |
| `member_overrides` | mitgliederspezifische Berechtigungs-Überschreibungen in Kanälen | |
| `role_tags` | Rollen-Tags (Bot-, Integrations- und Booster-Rollen) | |
| `forum_tags` | verfügbare Tags von Forenkanälen | |

Beim Lesen einer der beiden Eigenschaften werden die konfigurierten Namen in Großbuchstaben
zurückgegeben. Ein nie konfigurierter Bot liefert deshalb für seine Richtlinie `"DEFAULT"` und für
seine Flags einen leeren Text.

Die Eigenschaft `compression` gehört zur gleichen Gruppe: `"zlib"` (der Standard) komprimiert den
Gateway-Traffic, `"none"` deaktiviert die Komprimierung. Lass sie in Ruhe, außer du debuggst die
rohe Verbindung.

syntax: bot#cache-flags compact

## Sharding {#sharding}

Ein Shard ist eine Gateway-Verbindung; Discord verlangt, dass Bots in 2.500 Servern oder mehr ihre
Server auf mehrere Verbindungen verteilen. Die Eigenschaft `shard count` bestimmt, wie viele
Verbindungen der Bot öffnet: `-1` (der Standard) fragt Discord nach der empfohlenen Anzahl, `1`
erzwingt eine einzige Verbindung, und jede Zahl ab 2 erzwingt genau so viele. Der Ausdruck
[recommended shard count](syntax:core/expressions#expression-recommended-shard-count) ist ein lesbarer
Name für `-1`.

```skript
set shard count of {_bot} to recommended shard count
```

Sharding ist für deine Skripte unsichtbar. Lebenszyklus-Events wie `on ready` und `on bot shutdown`
werden pro Bot einmal ausgelöst, wenn sein letzter Shard hochfährt oder herunterfährt, nicht einmal
pro Shard; `seen by`-Filter und die Eigenschaften des Bots funktionieren unabhängig von der Anzahl
gleich. Sobald der Bot läuft, liefert `shard count of {_bot}` die echte Gesamtzahl der Shards, und
[running shards](syntax:bot#running-shards) gibt an, wie viele davon gerade verbunden sind:

```skript
on ready seen by "my-bot":
    send "%running shards of event-bot%/%shard count of event-bot% shards up" to console
```

Behalte `-1` bei, außer du kennst die Zahl, die du brauchst: Discord entscheidet, wie viele Shards ein
Bot öffnen darf, und eine erzwungene Anzahl, die Discord nicht akzeptiert, schlägt beim Login fehl.

syntax: bot#shard-count compact

## Präsenz {#presence}

Die `activity` legt den Text fest, der unter dem Namen des Bots als *Spielt <text>* angezeigt wird;
ein leerer Text entfernt ihn. Der `online status` wählt den Statuspunkt: `online`, `idle`, `dnd`
(nicht stören) oder `invisible`. Anders als die Verbindungsoptionen wirken beide sofort: Setzt du sie
vor `login`, erhält der Bot seine Startpräsenz, und setzt du sie auf einem laufenden Bot, aktualisieren
sich alle Shards sofort.

```skript
on ready seen by "my-bot":
    set activity of event-bot to "in %guild count of event-bot% guilds"
    set online status of event-bot to idle
```

Der Wert von `online status` ist ein DiSky-Typ und kein Text: Schreibe `dnd`, nicht `"dnd"`. Dieselbe
Eigenschaft liest die Präsenz eines Mitglieds, ist aber nur auf einem Bot schreibbar.

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *shard count can't be changed on a running bot; set it before login* (gleicher Wortlaut bei `intents`, `cache flags`, `member cache policy`, `compression` und `token`) | Eine Eigenschaft zur Erstellungszeit wurde nach `login` gesetzt. | Fahre den Bot herunter, setze die Eigenschaft auf einem neuen Bot und melde dich erneut an. |
| *unknown member cache policy 'x' (try: all, default, none, online, owner, voice)* | Der Name der Richtlinie ist falsch geschrieben. | Verwende einen der aufgelisteten Namen. |
| Ein *Discord error*-Block mit einer unbekannten `GatewayIntent`- oder `CacheFlag`-Konstante | Ein Intent- oder Cache-Flag-Name in der Liste ist falsch geschrieben. | Prüfe die Namen in den Abschnitten [Intents](#intents) und [Caching](#caching). |
| Der Bot meldet sich an und trennt dann die Verbindung mit dem Discord-Close-Code 4014 (*Disallowed intent(s)*) | Ein privilegierter Intent ist auf dem Bot aktiviert, aber nicht im Developer Portal. | Aktiviere ihn unter **Bot → Privileged Gateway Intents** oder entferne ihn aus `intents`. |
