---
title: Démarrer un bot
description: Créer un bot, lui donner un token, le connecter puis l'arrêter proprement.
source-hash: dfb59241dc30
---

Cette page explique comment créer un bot, le connecter sous un nom, les événements déclenchés
une fois la connexion établie, puis l'arrêter. Vous devez déjà avoir DiSky v5 installé (voir le
[guide d'installation](doc:getting-started/installation)) et un token de bot, obtenu depuis le
Discord Developer Portal.

## Fonctionnement de la connexion {#how-logging-in-works}

Un bot commence comme un objet vide, non connecté. Vous le configurez, lui donnez un token, puis
le [connectez](syntax:core/effects#effect-login-bot) sous un nom ; ce nom permet ensuite de le
retrouver dans vos scripts.

::: steps
1. Créez le bot avec [a new discord bot](syntax:core/expressions#expression-new-discord-bot)
   et stockez-le dans une variable.

2. Définissez son `token` avec le token de votre bot, lu depuis un bloc `options:` afin qu'il ne
   figure jamais en clair dans le code.

3. Appelez `login` en lui donnant un nom. Associez-le à un `shutdown` pour que le bot se
   déconnecte au déchargement du plugin.
:::

```skript
options:
    token: "YOUR-TOKEN"

command /startbot:
    trigger:
        set {_bot} to a new discord bot
        set token of {_bot} to {@token}
        login {_bot} as "my-bot"
        send "&7Logging in 'my-bot'..."

on unload:
    shutdown the bot named "my-bot"
```

Le login s'exécute en arrière-plan : la commande rend la main immédiatement, et la validation
auprès de Discord se fait hors du thread principal. Si le token est vide ou absent, ou si le bot
ne parvient pas à se connecter, DiSky affiche une erreur lisible dans la console au lieu de
l'exception brute ; rien ne plante. Une fois la connexion réussie, le bot est enregistré sous son
nom, et `the bot named
"my-bot"` renvoie vers lui partout dans vos scripts.

!!! warning "Configurer avant login"
    `token`, `intents`, `member cache policy`, `cache flags`, `compression` et `shard count`
    ne peuvent être définis que tant que le bot est en cours de configuration. Modifier l'un
    d'eux après `login` provoque une erreur lisible dans la console, et non un plantage. Voir
    [options du bot](doc:getting-started/bot-options) pour la liste complète et les valeurs
    acceptées.

syntax: core/expressions#expression-new-discord-bot compact
syntax: core/effects#effect-login-bot compact

## Événements du cycle de vie {#lifecycle-events}

Trois événements globaux couvrent la vie d'un bot. Ils se déclenchent pour chaque bot connecté ;
filtrez-les avec `on ready seen by "my-bot":` lorsque vous faites tourner
[plusieurs bots](doc:getting-started/multiple-bots).

- [`on guild ready`](event:events#guild-ready-event) se déclenche une fois pour chaque serveur
  auquel le bot est connecté, à la fin du chargement des données de ce serveur.
- [`on ready`](event:events#bot-ready-event) se déclenche une seule fois, après que chaque serveur
  a déclenché son propre `on guild ready`, lorsque le bot est entièrement connecté.
- [`on bot shutdown`](event:events#bot-shutdown-event) se déclenche une fois la connexion du bot
  à Discord fermée.

```skript
on guild ready:
    send "[DiSky] guild ready: %name of event-guild% on %event-bot%" to console

on ready:
    send "[DiSky] %event-bot% READY (%guild count of event-bot% guilds)" to console

on bot shutdown:
    send "[DiSky] %event-bot% SHUTDOWN" to console
```

## Arrêter le bot {#shutting-down}

[`shutdown the bot named "..."`](syntax:core/effects#effect-shutdown-bot) déconnecte le bot et
libère son nom ; il peut être reconnecté ensuite. Associez toujours un `login` à un `shutdown`,
généralement dans un bloc `on unload:`, pour que le bot se déconnecte proprement lors du
rechargement du plugin ou de l'arrêt du serveur Minecraft.

```skript
on unload:
    shutdown the bot named "my-bot"
```

Connecter un *second* bot, distinct, sous un nom déjà utilisé par un bot en cours d'exécution ne
provoque pas d'erreur : le nouveau bot prend ce nom dans le registre, et l'ancien continue de
tourner en arrière-plan, sans être plus joignable par son nom. Arrêtez toujours un bot avant de
connecter un remplaçant sous le même nom. Appeler `login` une nouvelle fois sur la même variable de
bot alors qu'il est déjà connecté, en revanche, échoue avec une erreur lisible dans la console.

syntax: core/effects#effect-shutdown-bot compact

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *IllegalStateException: a bot needs a token before login (set token of %bot% to ...)* | `login` a été appelé avant que `token` soit défini | Définissez `token of {_bot}` avant `login` |
| *IllegalStateException: the bot '\<name>' is already connected* | `login` a été appelé une nouvelle fois sur la même variable de bot, alors qu'il est toujours en cours d'exécution | Connectez une variable de bot une seule fois ; utilisez un nouveau bot pour une nouvelle connexion |
| Aucun message ; l'effet ne fait rien | `shutdown the bot named "..."` a reçu un nom qu'aucun bot en cours d'exécution ne possède | Vérifiez le nom avec [`the bot named "..."`](doc:getting-started/multiple-bots) avant de l'arrêter, ou assurez-vous qu'il n'a pas déjà été arrêté |

Les options de connexion, comme les intents (abonnements aux événements), la politique de cache des
membres et le découpage en shards, sont traitées sur la page
[options du bot](doc:getting-started/bot-options).

entity: bot
