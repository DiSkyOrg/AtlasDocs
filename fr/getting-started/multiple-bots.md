---
title: Plusieurs bots
description: Faire tourner plusieurs bots sur un même serveur, filtrer les événements par bot et lire l'état d'un bot.
source-hash: 254c79bb8d32
---

Cette page explique ce qui change lorsque plusieurs bots sont connectés sur un même serveur : comment
les événements sont filtrés par bot, comment retrouver un bot par son nom, et quelles propriétés
indiquent ce que fait un bot. Vous savez déjà créer un bot et le connecter grâce à
[Démarrer un bot](doc:getting-started/starting-a-bot).

## Comment plusieurs bots cohabitent {#how-several-bots-coexist}

Chaque bot est une connexion indépendante, identifiée par le nom que vous donnez à
[login](syntax:core/effects#effect-login-bot). Les noms sont comparés sans tenir compte de la casse, et
rien ne limite le nombre de bots en cours d'exécution : connectez un second bot exactement comme le
premier, sous un autre nom.

```skript
options:
    token: "YOUR-TOKEN"
    music-token: "YOUR-MUSIC-TOKEN"

on load:
    set {_bot} to a new discord bot
    set token of {_bot} to {@token}
    login {_bot} as "my-bot"
    set {_music} to a new discord bot
    set token of {_music} to {@music-token}
    login {_music} as "music"

on unload:
    shutdown the bot named "my-bot"
    shutdown the bot named "music"
```

Dans la v5, le bot n'est jamais un argument d'un effet ou d'une expression : DiSky le déduit de
l'entité sur laquelle vous agissez. Lorsque vous répondez à un message, modifiez un salon ou expulsez un
membre, c'est le bot qui a reçu ce message, ce salon ou ce membre qui effectue l'action. Le même script
fonctionne donc sans modification, qu'un ou dix bots soient chargés.

!!! info "Un nom, un bot"
    Réutiliser le nom d'un bot en cours d'exécution pour un nouveau `login` n'arrête pas l'ancien bot ;
    arrêtez-le d'abord, comme décrit dans [Démarrer un bot](doc:getting-started/starting-a-bot#shutting-down).

## Filtrer les événements avec seen by {#filtering-events-with-seen-by}

Chaque événement DiSky se déclenche une fois par bot qui le reçoit. Avec deux bots dans le même serveur,
`on message received:` s'exécute deux fois pour un seul message, une fois avec chaque bot. Pour écouter
un seul bot, ajoutez `seen by "<name>"` à la ligne de l'événement : le trigger (bloc de code) ne
s'exécute alors que si le bot portant ce nom a déclenché l'événement. Sans ce filtre, le trigger
s'exécute pour chaque bot.

```skript
on ready seen by "music":
    send "music is up with %guild count of event-bot% guilds" to console

on message received seen by "my-bot":
    send "my-bot saw a message from %event-user% in %event-channel%" to console
```

Dans un événement DiSky, `event-bot` est le bot qui l'a déclenché, qu'un `seen by` soit utilisé ou non.
C'est le moyen habituel de distinguer les bots dans un gestionnaire partagé, et cela fonctionne aussi
pour les événements de cycle de vie : un gestionnaire de [ready](event:events#bot-ready-event) ou de
[guild ready](event:events#guild-ready-event) sans filtre se déclenche une fois par bot, avec
`event-bot` défini en conséquence.

`seen by` compare le nom de connexion du bot, et non son nom d'utilisateur Discord, et la comparaison
ignore la casse. Un filtre qui nomme un bot jamais connecté n'est pas une erreur : le trigger ne
s'exécute tout simplement jamais.

event: events#bot-ready-event compact

## Trouver un bot {#finding-a-bot}

En dehors d'un événement, [the bot named](syntax:core/expressions#expression-bots) renvoie le bot connecté
sous ce nom, et `all bots` renvoie tous les bots en cours d'exécution. Un nom inconnu ne renvoie rien
plutôt qu'une erreur ; testez donc le résultat avant de l'utiliser.

```skript
command /bot-info <text>:
    trigger:
        set {_bot} to the bot named arg-1
        if {_bot} is not set:
            send "No loaded bot named '%arg-1%'."
            stop
        send "%name of {_bot}%: %guild count of {_bot}% guilds, %gateway ping of {_bot}% ms"
```

`all bots` est une liste : elle fonctionne donc avec `loop` et `number of` :

```skript
command /bots:
    trigger:
        send "%number of all bots% bot(s) loaded:"
        loop all bots:
            send "- %name of loop-value% (%running shards of loop-value% shard(s))"
```

Un bot apparaît dans `all bots` dès que `login` a construit sa connexion, ce qui se produit avant le
déclenchement de son événement `ready`. Utilisez la condition [connected](syntax:bot#connected)
(`if {_bot} is connected:`) lorsque la différence compte.

syntax: core/expressions#expression-bots compact

## Lire l'état d'un bot {#reading-a-bots-state}

Les propriétés suivantes sont en lecture seule et décrivent la connexion en cours. Toutes acceptent un
bot provenant de `the bot named`, `loop-value` ou `event-bot`.

| Propriété | Renvoie | Remarques |
| --- | --- | --- |
| [name](syntax:bot#name) | texte | Le nom de connexion, et non le nom d'utilisateur Discord. |
| [gateway ping](syntax:bot#gateway-ping) | nombre (ms) | Moyenne sur les shards ; `-1` avant que le bot soit en cours d'exécution. |
| [guild count](syntax:bot#guild-count) | nombre | `0` avant que le bot soit en cours d'exécution. |
| [guilds](syntax:bot#guilds) | serveurs | Vide avant que le bot soit en cours d'exécution. |
| [self user](syntax:bot#self-user) | utilisateur | Le compte Discord du bot ; aucun avant que le bot soit en cours d'exécution. |
| [avatar url](syntax:bot#avatar-url) | texte | L'avatar effectif de l'utilisateur du bot ; aucun avant que le bot soit en cours d'exécution. |
| [running shards](syntax:bot#running-shards) | nombre | Shards actuellement connectés ; `0` avant que le bot soit en cours d'exécution. |
| [online status](syntax:bot#online-status) | statut en ligne | Le statut que vous avez défini, ou aucun si vous n'en avez jamais défini. |

```skript
command /bot-status <text>:
    trigger:
        set {_bot} to the bot named arg-1
        if {_bot} is not set:
            stop
        send "user: %self user of {_bot}% (%avatar url of {_bot}%)"
        send "shards: %running shards of {_bot}%/%shard count of {_bot}%"
        send "status: %online status of {_bot}%"
        loop guilds of {_bot}:
            send "- %name of loop-value%"
```

`shard count of {_bot}` est le total avec lequel le bot a été construit ; `running shards` divisé par
`shard count` indique donc si tous les shards sont en ligne. Les options de sharding elles-mêmes sont
décrites dans [Options du bot](doc:getting-started/bot-options).

syntax: bot#gateway-ping compact

syntax: bot#guild-count compact

syntax: bot#running-shards compact
