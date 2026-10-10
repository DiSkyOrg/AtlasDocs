---
title: Clients de webhook
description: Créer un webhook dans un salon, récupérer ceux qui existent, ou construire un client à partir d'une URL de webhook.
source-hash: 0e65abfff670
---

Cette page couvre les trois façons d'obtenir quelque chose à travers quoi publier : créer un webhook,
récupérer les webhooks qu'un serveur ou un salon possède déjà, et construire un client à partir
d'une URL de webhook. Vous devez déjà avoir un bot nommé `"my-bot"` connecté, et connaître le
[contrat du builder (objet de construction)](doc:concepts/builders).

## Créer un webhook {#creating-a-webhook}

[`a new webhook builder named %string% in %guildchannel%`](syntax:webhookaction#new-webhook-builder)
prépare un webhook dans un salon ; comme tout builder, rien n'existe sur Discord tant que vous ne
lisez pas `the build result of` sous `await`. Le bot a besoin de **Manage Webhooks** dans ce salon.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!hook":
        set {_b} to a new webhook builder named "Announcer" in event-channel
        set webhook avatar of {_b} to "https://example.com/avatar.png"
        await set {_hook} to the build result of {_b}
        make {_hook} post "Hello from a fresh webhook"
```

`webhook avatar` est la seule propriété modifiable du builder (une URL d'image ou un chemin de
fichier local) : le nom et le salon sont donnés au constructeur. Un salon peut contenir 15 webhooks
au maximum ; au-delà, Discord refuse la construction.

syntax: webhookaction#new-webhook-builder compact

## Récupérer les webhooks existants {#retrieving-existing-webhooks}

[`webhooks of %guild%`](syntax:guild#webhooks) liste chaque webhook d'un serveur, et
[`channel webhooks of %standardguildmessagechannel%`](syntax:standardguildmessagechannel#channel-webhooks)
ceux d'un seul salon. Les deux interrogent Discord ; ils exigent donc tous deux `await` (voir
[cache et await](doc:concepts/cache-and-await)), et tous deux demandent **Manage Webhooks**.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!hooks":
        await set {_hooks::*} to channel webhooks of event-channel
        loop {_hooks::*}:
            reply with "%name of loop-value% (%webhook type of loop-value%)"
```

syntax: guild#webhooks compact

## Construire un client à partir d'une URL {#building-a-client-from-a-url}

[`a new webhook client from url %string%`](syntax:webhookclient#new-webhook-client) transforme une URL
de webhook (celle que Discord affiche sous **Integrations → Webhooks → Copy Webhook URL**) en client.
Elle ne demande aucune permission sur le serveur, et le bot n'a pas besoin d'y être : il ne sert qu'à
transporter les requêtes HTTP. Sans `using bot`, le seul bot chargé est utilisé.

```skript
options:
    hook-url: "https://discord.com/api/webhooks/123/abc"

on message received seen by "my-bot":
    if discord content of event-message is "!url-hook":
        set {_client} to a new webhook client from url {@hook-url} using bot "my-bot"
        make {_client} post "Posted through a URL"
```

Un client construit ainsi ne peut publier, modifier et supprimer que ses propres messages, rien
d'autre : il n'a ni nom, ni salon, ni propriétaire à lire, et `destroy` ne l'accepte pas.

!!! danger "L'URL est un secret"
    Quiconque détient une URL de webhook, ou son [token de webhook](syntax:webhookclient#webhook-token),
    peut publier à travers elle. Gardez-la dans un bloc `options:` ou dans un fichier distinct des
    scripts que vous partagez.

syntax: webhookclient#new-webhook-client compact

## Propriétés du webhook {#webhook-properties}

Un webhook récupéré ou créé expose son état côté Discord. `name`, `webhook avatar` et
`webhook channel` sont modifiables et changent le webhook sur Discord ; placez `await` devant pour
attendre la fin du changement avant la ligne suivante.

| Propriété | Renvoie | Modifiable |
| --- | --- | --- |
| [name](syntax:webhook#name) | son nom affiché | oui |
| [webhook avatar](syntax:webhook#webhook-avatar) | son URL d'avatar | oui, depuis une URL d'image ou un chemin de fichier local |
| [webhook channel](syntax:webhook#webhook-channel) | le salon dans lequel il publie | oui, vers un salon textuel (il est déplacé) |
| [webhook url](syntax:webhook#webhook-url) | l'URL à partir de laquelle un client peut être construit | non |
| [webhook token](syntax:webhookclient#webhook-token) | son token secret, aucun pour un webhook de suivi | non |
| [webhook owner](syntax:webhook#webhook-owner) | le membre qui l'a créé, aucun si inconnu | non |
| [webhook type](syntax:webhook#webhook-type) | `INCOMING`, ou `CHANNEL_FOLLOWER` pour un webhook relayant un salon d'annonces | non |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!rename-hooks":
        await set {_hooks::*} to channel webhooks of event-channel
        loop {_hooks::*}:
            await set name of loop-value to "Renamed"
```

## Supprimer un webhook {#deleting-a-webhook}

[`destroy`](syntax:core/effects#destroy) supprime un webhook ; chaque client construit à partir de
son URL cesse de fonctionner en même temps.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!clear-hooks":
        await set {_hooks::*} to channel webhooks of event-channel
        loop {_hooks::*}:
            destroy loop-value
```

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *a webhook client needs a running bot to carry its requests* | `a new webhook client from url` a été exécuté sans bot connecté, ou avec plusieurs bots et aucun nommé | Connectez d'abord un bot, ou ajoutez `using bot "my-bot"` |
| Un bloc *Discord error* mentionnant **Missing Permissions** | Le bot n'a pas **Manage Webhooks** dans le salon | Accordez-la sur le salon ou sur le serveur |
| *[10015] Unknown Webhook* | Le webhook a été supprimé, ou l'URL est incorrecte | Créez un nouveau webhook, ou vérifiez l'URL |

entity: webhook
