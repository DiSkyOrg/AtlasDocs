---
title: Webhooks
description: Publier des messages sous un nom et un avatar personnalisés, depuis un webhook créé par le bot ou depuis une simple URL de webhook.
source-hash: 235a155d065d
---

Un webhook publie des messages dans un salon, sous son propre nom et son propre avatar, sans être
membre du serveur. Cette section explique comment obtenir un webhook et publier à travers lui.
Vous devez déjà avoir un bot nommé `"my-bot"` connecté (voir
[Démarrer un bot](doc:getting-started/starting-a-bot)) et savoir comment fonctionne
[l'envoi de messages](doc:messages/sending-messages).

## Webhooks et clients de webhook {#webhooks-and-webhook-clients}

DiSky expose deux entités pour cela. Un [webhook](entity:webhook) est l'objet Discord lui-même : le
bot l'a créé ou l'a lu depuis un serveur, il possède donc un nom, un salon et un propriétaire, et il
peut être renommé ou supprimé. Un [client de webhook](entity:webhookclient) est tout ce qui peut
publier à travers un webhook, y compris un client construit à partir de la seule URL d'un webhook.
Tout webhook est aussi un client de webhook : chaque effet de publication accepte donc les deux.

| Vous disposez de | Vous obtenez | Peut publier | Peut renommer, déplacer, supprimer |
| --- | --- | --- | --- |
| Un salon où le bot a **Manage Webhooks** | un `webhook` (création ou récupération) | oui | oui |
| Seulement une URL de webhook | un `webhookclient` | oui | non |

## Ordre de lecture {#reading-order}

1. [Clients de webhook](webhook-clients.md) : création d'un webhook, récupération de ceux qui
   existent, construction d'un client à partir d'une URL, et propriétés du webhook.
2. [Publier à travers un webhook](posting-through-webhooks.md) : l'effet `make ... post`, le
   builder (objet de construction) de message de webhook, la modification et la suppression de ce
   qu'un webhook a envoyé, les fils.
