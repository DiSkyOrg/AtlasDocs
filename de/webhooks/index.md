---
title: Webhooks
description: Nachrichten unter eigenem Namen und Avatar senden, über einen Webhook, den der Bot erstellt, oder allein über eine Webhook-URL.
source-hash: 235a155d065d
---

Ein Webhook sendet Nachrichten unter seinem eigenen Namen und Avatar in einen Kanal, ohne Mitglied
des Servers zu sein. Dieser Abschnitt zeigt, wie du an einen Webhook kommst und darüber sendest. Du
solltest einen Bot namens `"my-bot"` angemeldet haben (siehe [Einen Bot starten](doc:getting-started/starting-a-bot))
und wissen, wie [Nachrichten senden](doc:messages/sending-messages) funktioniert.

## Webhooks und Webhook-Clients {#webhooks-and-webhook-clients}

DiSky kennt dafür zwei Entitäten. Ein [Webhook](entity:webhook) ist das Discord-Objekt selbst: Der Bot
hat es erstellt oder von einem Server gelesen, daher hat es einen Namen, einen Kanal und einen
Besitzer, und es kann umbenannt oder gelöscht werden. Ein [Webhook-Client](entity:webhookclient) ist
alles, worüber sich über einen Webhook senden lässt, auch ein Client, der allein aus einer
Webhook-URL gebaut wurde. Jeder Webhook ist auch ein Webhook-Client, daher akzeptiert jeder
Sende-Effekt beides.

| Du hast | Du erhältst | Kann senden | Kann umbenennen, verschieben, löschen |
| --- | --- | --- | --- |
| Einen Kanal, in dem der Bot **Manage Webhooks** hat | einen `webhook` (erstellen oder abrufen) | ja | ja |
| Nur eine Webhook-URL | einen `webhookclient` | ja | nein |

## Lesereihenfolge {#reading-order}

1. [Webhook-Clients](webhook-clients.md): einen Webhook erstellen, vorhandene abrufen, einen Client aus
   einer URL bauen und die Webhook-Eigenschaften.
2. [Über einen Webhook senden](posting-through-webhooks.md): der Effekt `make ... post`, der Builder für
   Webhook-Nachrichten, das Bearbeiten und Löschen von gesendeten Nachrichten und Threads.
