---
title: Premiers pas
description: Ce qu'est DiSky v5, ce dont vous avez besoin avant d'écrire un bot et où aller ensuite.
source-hash: 9ac23e9890d3
---

DiSky v5 est un addon (extension de Skript) qui vous permet d'écrire des bots Discord directement
en Skript. Il fonctionne sur un serveur Paper et s'appuie sur [JDA](https://jda.wiki) pour la
connexion à Discord ; chaque bot que vous créez se comporte donc comme un bot JDA classique en
dessous.

## Ce dont vous avez besoin {#what-you-need}

- Un **serveur Paper** en **1.21** ou plus récent.
- **Java 21** ou plus récent.
- **Skript 2.16.1** ou plus récent, avec `use type properties: true` dans le `config.sk` de Skript.
  Cette option est activée par défaut dans les versions récentes de Skript ; les syntaxes partagées
  de DiSky (propriétés comme `name of {_bot}`) en dépendent et ne seront pas analysées si elle est
  désactivée.
- Une **application Discord** avec un token de bot, créée sur le
  [Discord Developer Portal](https://discord.com/developers/applications).

## Ordre de lecture {#reading-order}

1. [Installation](installation.md) : installer le plugin et vérifier qu'il est bien chargé.
2. [Démarrer un bot](starting-a-bot.md) : créer un bot, le connecter, puis l'arrêter proprement.
3. [Options du bot](bot-options.md) : toutes les options de connexion, des intents au nombre de shards.
4. [Plusieurs bots](multiple-bots.md) : faire tourner plusieurs bots et les retrouver par leur nom.

!!! tip "API impérative uniquement"
    Tous les exemples de cette section utilisent l'API impérative des bots : `a new discord bot`,
    puis `set` pour ses propriétés, puis `login`. C'est la seule forme traitée ici et dans le reste
    de l'atlas.
