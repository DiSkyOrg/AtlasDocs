---
title: Commandes d'interaction
description: Commandes slash et commandes contextuelles du clic droit, déclarées par une structure ou un builder (objet de construction) et envoyées à Discord par le script.
source-hash: 5e0612dbf4f7
---

Une *commande d'interaction* est enregistrée sur Discord et affichée par le client lui-même : une
`/command` dans le sélecteur, ou une entrée du menu **Apps** du clic droit sur un
utilisateur ou un message. Discord vérifie le type de ses arguments et les valide avant que le bot
ne les reçoive. Vous devez déjà avoir un bot nommé `"my-bot"` connecté (voir
[Démarrer un bot](doc:getting-started/starting-a-bot)).

```skript
slash command ping:
    description: Pong!
    trigger:
        reply with hidden "Pong! (%used slash command%)"

on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

La structure déclare la commande et son trigger (bloc de code) ; le bloc `on guild ready` est ce
qui la publie sur Discord. Rien n'atteint Discord de lui-même, ni au chargement, ni au
rechargement, ni au déchargement.

## Structure ou builder {#structure-or-builder}

| Besoin | Utiliser |
| --- | --- |
| Une `/command` avec son propre trigger, connue au chargement du script | une [structure de commande slash](slash-commands.md) |
| Une `/command` assemblée à l'exécution, à partir de données ou par serveur | un [builder (objet de construction)](command-builders.md) |
| Une entrée du menu **Apps** du clic droit | une [commande contextuelle](context-commands.md), structure ou builder |
| Une commande reconnue dans un texte tapé, sans enregistrement Discord | une [commande textuelle](doc:chat-commands) |

Les deux formes produisent les mêmes objets de commande et peuvent être envoyées dans le même appel ;
une structure conserve son propre `trigger`, un builder est traité par l'événement générique
`on slash command`.

## Ordre de lecture {#reading-order}

1. [Commandes slash](slash-commands.md) : la structure, son chemin, sa description, son trigger, et
   ce qui a changé depuis la v4.
2. [Options slash](slash-options.md) : types d'arguments, choix, saisie semi-automatique, options
   typées.
3. [Commandes contextuelles](context-commands.md) : `user command` et `message command`, et leurs
   cibles.
4. [Builders de commandes](command-builders.md) : construire une commande sous forme d'objet, et la
   mélanger avec des structures.
5. [Enregistrer des commandes](registering-commands.md) : `update`, `register`, `unregister`,
   rechargement.
6. [Réglages des commandes](command-settings.md) : permissions, contextes, localisation, temps de
   recharge.
