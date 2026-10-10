---
title: Builder
description: Eine Rolle, einen Kanal, eine Nachricht oder eine Einladung lokal konfigurieren und sie dann mit einer Zeile auf Discord erstellen.
source-hash: 364a92d0c720
---

Diese Seite behandelt den vertraglichen Rahmen, den jeder DiSky-Builder einhält: wie ein Builder erstellt
wird, warum seine Eigenschaften nur schreibbar sind und was `the build result of` tut. Funktionsseiten
listen nur die Setter ihres eigenen Builders auf und verweisen für den Rest auf diese Seite. Vorausgesetzt
wird ein Bot namens `"my-bot"`, der angemeldet ist und läuft.

## So funktioniert ein Builder {#how-a-builder-works}

Ein Builder ist eine ausstehende Anfrage an Discord. Einen Builder mit
[`a new role builder`](syntax:roleaction#new-role-builder) zu erstellen kostet nichts und spricht mit
niemandem; seine Eigenschaften zu setzen füllt die Anfrage nur lokal aus. Die Zeile mit
[`the build result of`](syntax:roleaction#result) auf den Builder ist die einzige Zeile, die die Anfrage an
Discord sendet und die erstellte Entität zurückgibt. Da diese Zeile auf das Netzwerk wartet, braucht sie
`await` (siehe [Cache und await](doc:concepts/cache-and-await)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!make-role":
        set {_b} to a new role builder named "Moderator" in event-guild
        set color of {_b} to orange
        set hoisted of {_b} to true
        set mentionable of {_b} to false
        await set {_role} to the build result of {_b}
        reply with "created %name of {_role}%"
```

Nichts existiert auf Discord, bis die `await`-Zeile läuft; die vier Zeilen davor verlassen den
Minecraft-Server nie. Sobald sie zurückkehrt, ist `{_role}` eine normale Rolle: Jede Eigenschaft und jeder
Effekt einer Rolle funktioniert damit. `the built role from {_b}` ist derselbe Ausdruck wie
`the build result of {_b}`, nur mit dem Namen der Entität geschrieben, die er erzeugt; jeder Builder hat
diesen Alias (`the built guildchannel from`, `the built message from` und so weiter).

In den Konstruktor gehört nur, was Discord bei der Erstellung festlegt: Eine Rolle braucht einen Namen und
einen Server, ein Thread einen Namen und einen übergeordneten Kanal oder eine Nachricht, eine Nachricht
braucht ihren Inhalt oder ihr Embed und einen Kanal. Alles Übrige ist eine Eigenschaft, die du danach setzt,
oder die du weglässt.

syntax: roleaction#new-role-builder compact
syntax: roleaction#result compact

## Was ein Builder nicht tut {#what-a-builder-does-not-do}

Die Eigenschaften eines Builders sind **nur schreibbar**. `color of {_b}` zu lesen liefert nichts: Eine
ausstehende Anfrage hat keinen lesbaren Zustand, daher ist die lesbare Seite jeder Eigenschaft die Entität,
die du nach dem Build zurückerhältst. Lies stattdessen `color of {_role}` nach dem Build.

Ein Builder ist eine **Vorlage, kein zwischengespeichertes Ergebnis**. `the build result of` denselben
Builder zweimal zu lesen sendet zwei Anfragen und erstellt zwei Entitäten:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!twice":
        set {_b} to a new role builder named "Temp" in event-guild
        await set {_first} to the build result of {_b}
        await set {_second} to the build result of {_b}
        reply with "%discord id of {_first}% and %discord id of {_second}%"
```

Die Validierung findet zur **Build-Zeit** statt, nicht beim Setzen einer Eigenschaft. Ein Topic auf einem
Sprachkanal-Builder oder eine Auto-Archiv-Dauer, die Discord nicht akzeptiert, wird ohne Meldung gespeichert;
die Anfrage schlägt erst fehl, wenn `the build result of` läuft, und der Fehler erreicht dich über DiSkys
[Fehlerschicht](doc:concepts/errors) wie jede andere Ablehnung durch Discord. Einige Prüfungen, die DiSky
lokal durchführen kann (ein Server, der bereits Discords Rollen- oder Kanallimit erreicht hat, eine Nachricht
ohne Inhalt), schlagen an derselben Zeile fehl, bevor eine Anfrage hinausgeht.

!!! info "Builder und Bots"
    Der Bot, der die Anfrage sendet, ist derjenige, zu dem der Gültigkeitsbereich des Konstruktors gehört:
    `event-guild` oder `event-channel` in einem Handler, der von `"my-bot"` gesehen wird, baut mit
    `"my-bot"`. Builder nehmen kein Bot-Argument entgegen.

## Die Builder-Arten {#the-builder-kinds}

Jeder Builder unten folgt dem obigen Vertrag; nur Konstruktor und Setter unterscheiden sich. Die Muster sind
die minimale Schreibweise: `named` akzeptiert auch `with the name`, und `in` akzeptiert überall
`in the guild` oder `in the channel`.

| Builder | Erstellt | Konstruktor-Muster | Anleitung |
| --- | --- | --- | --- |
| [Rolle](entity:roleaction) | eine Rolle | `a new role builder named %string% in %guild%` | diese Seite |
| [Textkanal](entity:channelaction) | einen Textkanal | `a new text channel builder named %string% in %guild%` | später |
| [Sprachkanal](entity:channelaction) | einen Sprachkanal | `a new voice channel builder named %string% in %guild%` | später |
| [Stage-Kanal](entity:channelaction) | einen Stage-Kanal | `a new stage channel builder named %string% in %guild%` | später |
| [Ankündigungskanal](entity:channelaction) | einen Ankündigungskanal | `a new news channel builder named %string% in %guild%` | später |
| [Forumkanal](entity:channelaction) | einen Forumkanal | `a new forum channel builder named %string% in %guild%` | später |
| [Medienkanal](entity:channelaction) | einen Medienkanal | `a new media channel builder named %string% in %guild%` | später |
| [Kategorie](entity:channelaction) | eine Kategorie | `a new category builder named %string% in %guild%` | später |
| [Öffentlicher Thread](entity:threadaction) | einen öffentlichen Thread | `a new thread builder named %string% in %threadcontainer%` | später |
| [Privater Thread](entity:threadaction) | einen privaten Thread | `a new private thread builder named %string% in %threadcontainer%` | später |
| [Thread aus Nachricht](entity:threadaction) | einen Thread, der an einer Nachricht hängt | `a new thread builder named %string% from %message%` | später |
| [Forenbeitrag](entity:forumpostaction) | einen Beitrag (Thread) in einem Forum- oder Medienkanal | `a new post builder named %string% with message content %string% in %forumchannel/mediachannel%` | später |
| [Einladung](entity:inviteaction) | eine Einladung | `a new invite builder in %guildchannel%` | später |
| [Webhook](entity:webhookaction) | einen Webhook | `a new webhook builder named %string% in %guildchannel%` | [Webhook-Clients](doc:webhooks/webhook-clients) |
| [Webhook-Nachricht](entity:webhookmessageaction) | eine Nachricht, die von einem Webhook gesendet wird | `a new webhook message with content %string% through %webhookclient%` | [Über einen Webhook senden](doc:webhooks/posting-through-webhooks) |
| [AutoMod-Regel](entity:automodrulebuilder) | eine AutoMod-Regel | `a new automod rule builder named %string% in %guild% for messages using %triggerconfig%` | [Eine Regel erstellen](doc:automod/creating-rules) |
| [Geplantes Event (Kanal)](entity:scheduledeventaction) | ein geplantes Event in einem Sprach- oder Stage-Kanal | `a new scheduled event builder named %string% in %guildchannel% starting at %date%` | später |
| [Geplantes Event (extern)](entity:scheduledeventaction) | ein geplantes Event an einem Ort | `a new scheduled event builder named %string% at %string% starting at %date% ending at %date% in %guild%` | später |
| [Nachricht](entity:messageaction) | eine gesendete Nachricht | `a new message with content %string% in %messagechannel%` oder `a new message with embed %embedbuilder% in %messagechannel%` | [Nachrichten senden](doc:messages/sending-messages) |

Zwei Objekte sehen aus wie Builder, folgen diesem Vertrag aber nicht. Eine [Umfrage](doc:messages/creating-polls)
wird mit `post` oder `reply with` gesendet und hat kein `build result of`; ein
[Builder für den Willkommensbildschirm](doc:guilds/welcome-screen) bearbeitet einen Bildschirm, der bereits
existiert, daher wird er mit dem Effekt `update the welcome screen using` angewendet, der nichts zurückgibt.
Die Eigenschaften einer Umfrage lassen sich im Gegensatz zu allen oben genannten Buildern auch zurücklesen.

Jede Art stellt denselben Ausdruck `the build result of %builder%` bereit; eine nicht typisierte Variable, die
einen davon hält, wird anhand ihres Laufzeittyps aufgelöst, daher braucht die folgende Kette keinen Cast. Die
Kategorie kommt als echte Kategorie zurück, was die Eigenschaft `category` des Textkanal-Builders erwartet:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!staff-area":
        set {_cat} to a new category builder named "Staff" in event-guild
        await set {_category} to the build result of {_cat}
        set {_b} to a new text channel builder named "staff-chat" in event-guild
        set category of {_b} to {_category}
        await set {_channel} to the build result of {_b}
        reply with "created %name of {_channel}% under %name of {_category}%"
```

!!! tip "Einen Build in einem Block halten"
    Halte Konstruktor, Setter und die `await`-Zeile zusammen. Ein Builder, der in einer Variablen aufbewahrt
    wird, lässt sich leicht versehentlich zweimal bauen, und jeder Build erstellt eine neue Entität.

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Lösung |
| --- | --- | --- |
| *building talks to Discord, so this requires 'await'* (Parse-Fehler, das Skript lädt nicht) | `the build result of` wurde gelesen, ohne dass `await` vor der Zeile steht. | Schreibe `await set {_x} to the build result of {_b}`. |
| *IllegalStateException: this guild already has the maximum of 250 roles* (gleiche Form mit *500 channels*) | Der Server hat Discords Obergrenze erreicht; DiSky lehnt ab, bevor die Anfrage gesendet wird. | Lösche zuerst ungenutzte Rollen oder Kanäle. |
| *IllegalStateException: this message has no content, no embed, no attachment and no component; Discord refuses an empty message* | Ein Nachrichten-Builder wurde ohne etwas zum Senden gebaut. | Gib ihm vor dem Build einen Inhalt, ein Embed, einen Anhang oder eine Komponente. |
| Ein *Discord error*-Block, der eine fehlende Berechtigung oder ein ungültiges Feld nennt | Discord hat die Anfrage beim Build abgelehnt (fehlende **Manage Roles**, ein Topic auf einem Sprachkanal, ein ungültiger Wert). | Korrigiere die betroffene Eigenschaft; umschließe den Build mit `try` / `catch`, um ihn im Skript abzufangen, siehe [Fehler](doc:concepts/errors). |
| Keine Meldung; `color of {_b}` ist leer | Eigenschaften von Buildern sind nur schreibbar. | Lies die Eigenschaft an der erstellten Entität, nicht am Builder. |
