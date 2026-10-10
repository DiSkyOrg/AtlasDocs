---
title: Enregistrer des commandes
description: Envoyer les commandes de structure et de builder à Discord avec update, register et unregister, et relire ce qui s'y trouve déjà.
source-hash: 143b97c889fc
---

Cette page couvre les trois effets qui envoient des [commandes slash](doc:interaction-commands/slash-commands),
des [commandes contextuelles](doc:interaction-commands/context-commands) et des
[builders](doc:interaction-commands/command-builders) vers Discord, ainsi que la relecture de ce qui y est
déjà enregistré. Vous devez déjà avoir un bot nommé `"my-bot"` connecté et au moins une commande déclarée,
par structure ou par builder.

## Fonctionnement de l'enregistrement {#how-registration-works}

Rien n'atteint Discord de lui-même : une structure `slash command` et un builder `a new slash command`
ne sont que des modèles tant qu'un script n'exécute pas l'un des trois effets sur eux.

| Effet | Fait | Utiliser quand |
| --- | --- | --- |
| [update](syntax:core/effects#effect-update-discord-commands) | Remplace la liste entière (un PUT) : tout ce qui manque dans les commandes données est supprimé | Synchronisation au démarrage, envoi de toutes les commandes d'un coup |
| [register](syntax:core/effects#effect-register-discord-command) | Insère ou met à jour par nom : ajoute ou remplace, sans toucher au reste de la liste | Ajouter ou modifier une seule commande sans toucher aux autres |
| [unregister](syntax:core/effects#effect-unregister-discord-commands) | Supprime une commande, par objet, nom ou id, ou toutes les commandes | Retirer une commande, ou vider une liste |

```skript
on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

[`all structured application commands`](syntax:core/expressions#expression-structured-discord-commands)
rassemble chaque structure `slash command`, `user command` et `message command` dans une seule liste, de
sorte qu'un builder rejoint le même appel : `update the discord commands (all structured application
commands) and {_roll} in event-guild`. Chacun des trois effets attend la réponse de Discord et n'accepte
jamais `await` ; un échec côté Discord passe par la [couche d'erreurs](doc:concepts/errors).

syntax: core/effects#effect-update-discord-commands compact

## Globale ou par serveur {#guild-or-global}

`in event-guild` s'applique immédiatement et ne concerne que ce serveur ; `globally in event-bot`
s'applique à tous les serveurs où se trouve le bot, mais peut mettre jusqu'à une heure à apparaître pour
les utilisateurs. L'enregistrement par serveur va dans `on guild ready`, qui se déclenche pour chaque
serveur où se trouve le bot (y compris ceux qu'il rejoint plus tard) ; l'enregistrement global va dans
`on ready`, qui ne se déclenche qu'une fois. Voir [Démarrer un bot](doc:getting-started/starting-a-bot)
pour la différence entre ces deux événements du cycle de vie.

```skript
on ready:
    set {_ping} to a new slash command named "ping" with description "Pong!"
    update the discord commands {_ping} globally in event-bot
```

Envoyer la même commande dans les deux sens fait afficher deux fois la commande dans Discord : les
commandes par serveur et les commandes globales sont des listes séparées, et non une seule liste
fusionnée. Discord limite aussi le nombre de fois où la liste complète d'un serveur peut être remplacée
par `update` : 200 fois par jour.

## Ajouter et retirer une commande {#adding-and-removing-one-command}

`register` et `unregister` modifient une seule commande sans remplacer la liste entière.

```skript
on guild ready:
    set {_roll} to a new slash command named "roll" with description "Roll a dice"
    register the discord command {_roll} in event-guild
```

`register` accepte aussi plusieurs commandes à la fois : `register the discord commands {_a} and {_b}
globally in event-bot`. `unregister` accepte un objet de commande, un nom ou un id brut, ainsi qu'un
raccourci pour tout supprimer :

```skript
unregister the discord command "ping" from event-guild
unregister the discord command {_roll} from event-guild
unregister all the discord commands from event-guild
```

Un objet de commande dont le [`command id`](syntax:applicationcommand#command-id) est connu est supprimé
directement ; un nom est d'abord recherché parmi les commandes enregistrées, ce qui coûte une requête
supplémentaire.

syntax: core/effects#effect-register-discord-command compact

## Lire ce que Discord contient {#reading-what-discord-has}

[`registered commands of`](syntax:core/expressions#expression-registered-discord-commands) demande à
Discord la liste en direct des commandes d'un serveur ou des commandes globales d'un bot, sous forme
d'objets de commande classiques dont le `command id` est déjà renseigné. C'est une lecture, elle nécessite
donc [`await`](doc:concepts/cache-and-await) :

```skript
await set {_cmds::*} to registered commands of event-guild
loop {_cmds::*}:
    send "%name of loop-value% (%command id of loop-value%, %command type of loop-value%)" to console
```

Une commande relue peut être modifiée puis renvoyée avec `register`, qui l'insère par nom :

```skript
await set {_cmds::*} to registered commands of event-guild
loop {_cmds::*}:
    if name of loop-value is "roll":
        set disabled of loop-value to true
        register the discord command loop-value in event-guild
```

syntax: core/expressions#expression-registered-discord-commands compact

## Rechargement et arrêt {#reload-and-shutdown}

Une structure `slash command` ou de commande contextuelle est un modèle, pas un enregistrement en direct :
recharger un script remplace le modèle, et la commande déjà envoyée à Discord continue de fonctionner, liée
au modèle qui correspond à son chemin complet au moment de son utilisation. Les temps de recharge
`on cooldown` font partie de ce modèle, donc un rechargement les réinitialise aussi.

!!! warning "Rien n'est supprimé à votre place"
    Retirer une structure d'un script, la décharger ou arrêter le bot ne supprime jamais la commande
    correspondante de Discord. Elle reste visible et répond à l'interaction (par les événements
    génériques, à défaut d'autre chose) jusqu'au prochain `update` qui la retire de la liste, ou jusqu'à
    un `unregister` explicite.

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Correction |
| --- | --- | --- |
| *the bot 'x' is not connected, it cannot manage commands yet* | `update` / `register` / `unregister` / `registered commands of` a été exécuté globalement avant la fin du `login`, ou après `shutdown` | attendez `on ready`, ou envoyez vers un serveur à la place |
| *no bot or guild to manage commands in (the variable is not set)* | le `%bot%` ou le `%guild%` donné à l'effet est une variable non définie | vérifiez que la variable est définie avant l'exécution de l'effet |
| *expected a bot (global commands) or a guild, got x* | `registered commands of` a reçu autre chose qu'un bot ou un serveur | passez `event-bot` ou `event-guild`, ou une variable qui en contient un |
| *'registered commands of' asks Discord and requires 'await' to be read* | `registered commands of` est utilisé hors d'un bloc `await` | encadrez la lecture par `await set {_x} to ...`, voir [Cache (copie en mémoire) et await](doc:concepts/cache-and-await) |
| Une erreur Discord mentionnant le code `50035` (*Invalid Form Body*) | une commande envoyée dépasse l'une des limites de Discord (longueur du nom, noms d'options en double, trop de choix...) | vérifiez la commande au regard des limites de Discord ; l'erreur indique le champ exact |
