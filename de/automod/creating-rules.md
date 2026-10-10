---
title: Eine Regel erstellen
description: Eine AutoMod-Regel aus einem Auslöser und seinen Aktionen bauen und dann auf Discord erstellen.
source-hash: ffe6c5764397
---

Dieser Abschnitt behandelt den Builder für AutoMod-Regeln: die zwei Arten von Regeln, die Eigenschaften,
die eine Regel annimmt, und den Build. Du solltest einen Bot namens `"my-bot"` mit **Manage Server**
angemeldet haben und den [Builder-Vertrag](doc:concepts/builders) kennen.

## So wird eine Regel erstellt {#how-a-rule-is-created}

Eine Regel entsteht in vier Schritten: einen Auslöser erstellen, die Aktionen erstellen, beides einem
Builder (Bauobjekt) übergeben und dann [`the build result of`](syntax:automodrulebuilder#result) des
Builders unter `await` lesen. Der Konstruktor des Builders nimmt Namen, Server und Auslöser entgegen,
weil Discord sie bei der Erstellung festlegt.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!no-invites":
        set {_t} to a new automod keyword trigger with the keywords "*discord.gg*"
        set {_b} to a new automod rule builder named "No invites" in event-guild for messages using {_t}
        add a new automod response blocking the message to automod responses of {_b}
        await set {_rule} to the build result of {_b}
        reply with "created rule %discord id of {_rule}%"
```

Zurück kommt eine lebende [AutoMod-Regel](entity:automodrule): Du liest ihre Eigenschaften oder
[bearbeitest sie](doc:automod/managing-rules) wie jede andere Entität. Wenn du denselben Builder zweimal
baust, entstehen zwei Regeln.

syntax: automodrulebuilder#result compact

## Nachrichtenregeln und Profilregeln {#message-rules-and-profile-rules}

Discord prüft eine Regel zu einem einzigen Zeitpunkt, der bei der Erstellung gewählt und danach nie
geändert wird:

| Konstruktor | Geprüft, wenn | Zulässige Auslöser |
| --- | --- | --- |
| [`... for messages using %triggerconfig%`](syntax:automodrulebuilder#new-message-builder) | ein Mitglied eine Nachricht sendet | alle Arten |
| [`... for member profiles using %triggerconfig%`](syntax:automodrulebuilder#new-profile-builder) | ein Mitglied seinen Benutzernamen, Nickname oder seine Bio ändert | nur Schlüsselwort-Auslöser |

Eine Profilregel bekommt automatisch die Aktion *Mitgliederinteraktion blockieren* hinzugefügt; das ist
die einzige Aktion, die Discord bei ihr erlaubt.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!clean-names":
        set {_t} to a new automod keyword trigger with the keywords "*admin*"
        set {_b} to a new automod rule builder named "No fake staff" in event-guild for member profiles using {_t}
        await set {_rule} to the build result of {_b}
```

syntax: automodrulebuilder#new-message-builder compact

## Optionen {#options}

Jede Eigenschaft des Builders ist nur schreibbar; lies sie auf der erstellten Regel zurück.

| Eigenschaft | Standard | Zulässige Werte |
| --- | --- | --- |
| [enabled](syntax:automodrulebuilder#enabled) | `true` | `true`, `false` |
| [automod responses](syntax:automodrulebuilder#automod-responses) | keine (Profilregeln: Interaktion blockieren) | [Aktionen](doc:automod/triggers-and-responses) |
| [exempt roles](syntax:automodrulebuilder#exempt-roles) | keine | bis zu 20 Rollen |
| [exempt channels](syntax:automodrulebuilder#exempt-channels) | keine | bis zu 50 Kanäle |
| [trigger config](syntax:automodrulebuilder#trigger-config) | der Auslöser des Konstruktors | ein Auslöser derselben Art |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!strict-words":
        set {_t} to a new automod keyword trigger with the keywords "badword" and "*worse*"
        set allow list of {_t} to "badwordle"
        set {_b} to a new automod rule builder named "Words" in event-guild for messages using {_t}
        set automod responses of {_b} to (a new automod response blocking the message)
        add (a new automod response sending an alert to the channel event-channel) to automod responses of {_b}
        add (a new automod response timing the member out for 10 minutes) to automod responses of {_b}
        add role with id "000000000000000000" to exempt roles of {_b}
        set enabled of {_b} to true
        await set {_rule} to the build result of {_b}
```

!!! warning "Eine Regel pro Server für manche Auslöser"
    Discord erlaubt nur eine Regel pro Server für die **Preset**-, **Spam**- und **Erwähnungsspam**-Auslöser
    sowie für Profilregeln. Eine zweite wird mit *[50035] Invalid Form Body* abgelehnt. Liste zuerst die
    Regeln des Servers auf und [bearbeite die vorhandene](doc:automod/managing-rules).

## Fehler, die dir begegnen können {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *[50035] Invalid Form Body* gefolgt vom betroffenen Feld | Ein Auslöser, der pro Server nur einmal vorkommt, hat schon eine Regel, oder ein Wert liegt außerhalb von Discords Grenzen | Bearbeite die vorhandene Regel; prüfe das Feld, das in der Meldung genannt wird |
| *[50035] Invalid Form Body* mit dem Namen `actions` | Keine Aktion, oder eine Aktion, die der Auslöser nicht erlaubt (ein Timeout bei einer Spam-Regel) | Siehe die Tabelle der Aktionen unter [Auslöser und Aktionen](doc:automod/triggers-and-responses) |
| *building talks to Discord, so this requires 'await'* (Parse-Fehler) | `the build result of` wurde ohne `await` gelesen | Schreibe `await set {_rule} to the build result of {_b}` |
| Ein *Discord error* mit **Missing Permissions** | Dem Bot fehlt **Manage Server** | Gewähre sie |

entity: automodrulebuilder
