---
title: Reaktionen
description: Auf eine Nachricht reagieren, eine Reaktion entfernen und die Reaktionen lesen, die Discord auf ihr erfasst.
source-hash: e5dfb6d479bd
---

Diese Seite behandelt das Hinzufügen einer Reaktion zu einer Nachricht, das Entfernen einer Reaktion,
die Events, die auslösen, wenn ein Benutzer reagiert, und das Auslesen der Reaktionen, die bereits auf
einer Nachricht liegen. Du solltest einen Bot namens `"my-bot"` angemeldet haben und wissen, wie man
[eine Nachricht sendet](doc:messages/sending-messages).

## So funktionieren Reaktionen {#how-reactions-work}

[`react to`](syntax:message#react) fügt einer Nachricht als Bot eine oder mehrere Reaktionen hinzu. Es
nimmt eine Liste aus Unicode-Emojis, Server-Emoji-Werten oder beidem gemischt entgegen.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!react":
        react to event-message with "✅"
```

Jeder Eintrag der Liste ist entweder ein Text oder ein `emote`-Wert. Ein Text wird als Unicode-Emoji-Zeichen
gelesen oder als formatierte Form `<:name:id>` (bzw. `<a:name:id>` für ein animiertes) eines Server-Emojis.
Ein `emote`-Wert reagiert direkt mit diesem Server-Emoji und ist die sicherere Wahl, da er nie davon
abhängt, dass der formatierte Text stimmt. Hol einen über `emojis of` eines Servers (aus dem Cache, der
Kopie im Speicher) oder über `mentioned emotes of` einer Nachricht; verwende `await set` mit `emotes of`
eines Servers, wenn du die aktuelle Liste brauchst (siehe [Cache und await](doc:concepts/cache-and-await)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!react-emote":
        set {_emote} to first element of (emojis of event-guild)
        react to event-message with {_emote}
        react to event-message with ("👍" and {_emote})
```

syntax: message#react compact

## Reaktionen entfernen {#removing-reactions}

[`suppress`](syntax:emote#suppress-reactions) entfernt eine Reaktion von einer Nachricht: Allein angegeben
entfernt es die Reaktion des Bots, zusammen mit einem Benutzer die Reaktion dieses Benutzers.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!unreact":
        set {_emote} to first element of (emojis of event-guild)
        suppress {_emote} from event-message
        suppress {_emote} of event-user from event-message
```

!!! warning "Hier funktioniert nur ein Server-Emoji-Wert"
    `suppress` nimmt einen `emote`-Wert entgegen, keinen Text: Man kann ihm kein rohes Unicode-Emoji wie
    `"✅"` übergeben. Hol das Server-Emoji über `emojis of` des Servers oder über `mentioned emotes of`
    der Nachricht, wie oben. In v5 gibt es außerdem keinen Effekt, der alle Reaktionen einer Nachricht auf
    einmal entfernt; `suppress` betrifft immer genau ein Server-Emoji (und optional einen Benutzer) pro Zeile.

syntax: emote#suppress-reactions compact

## Reaktions-Events {#reaction-events}

[`on reaction add`](event:events#reaction-add) und [`on reaction remove`](event:events#reaction-remove)
lösen pro Reaktion aus; `on reaction remove all` löst einmal aus, wenn alle Reaktionen auf einmal von
einer Nachricht entfernt werden. `reaction message` wird von Discord geholt, bevor der Trigger startet,
daher braucht sie nie `await` (siehe [Cache und await](doc:concepts/cache-and-await)).

| Event | Werte |
| --- | --- |
| `on reaction add` | `event-channel`, `event-guild`, `event-member`, `event-user`, `reaction message` |
| `on reaction remove` | `event-channel`, `event-guild`, `event-member`, `event-user`, `reaction message` |
| `on reaction remove all` | `event-channel`, `event-guild`, `reaction message` |

```skript
on reaction add seen by "my-bot":
    send "%event-user% reacted to '%discord content of reaction message%'" to console
```

v5 hat noch keinen `Emote`-Typ für die Reaktion selbst. Deshalb verrät keines der drei Events, welches
Emoji hinzugefügt oder entfernt wurde, sondern nur, wer reagiert hat und auf welcher Nachricht.

event: events#reaction-add compact

## Reaktionen auslesen {#reading-reactions}

[`reactions of`](syntax:message#reactions) einer Nachricht liefert pro verschiedenem Emoji, mit dem reagiert
wurde, ein Element. In v5 ist keine seiner Eigenschaften verfügbar (nicht einmal das Emoji oder die Anzahl),
daher ist die Liste nur für ihre Größe nützlich.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!reaction-count":
        reply with "%size of reactions of event-message% distinct reaction(s)"
```

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *[10014] Unknown Emoji* | `react to` wurde ein Server-Emoji übergeben, das nicht mehr existiert, oder eine unformatierte ID eines Server-Emojis | Verwende einen frischen `emote`-Wert aus `emojis of`/`mentioned emotes of`, nicht eine handgeschriebene ID |
| *[50013] Missing Permissions* | Der Rolle des Bots fehlt **Add Reactions** in diesem Kanal | Gib der Rolle des Bots **Add Reactions** |
