---
title: Commandes slash
description: La structure de commande slash, son chemin, sa description et son trigger, et son envoi vers Discord.
source-hash: 83dbe60b030a
---

Cette page présente la structure `slash command` : son en-tête, ses entrées, son trigger (bloc de
code), et la manière dont un script l'envoie à Discord. Vous devez déjà avoir un bot nommé
`"my-bot"` connecté et avoir lu la [vue d'ensemble des commandes](doc:interaction-commands).

## Fonctionnement d'une commande slash {#how-a-slash-command-works}

Une structure `slash command` est un **modèle**, déclaré à côté du bloc `on ready` de votre bot, et
non à l'intérieur. Son en-tête indique le nom de la commande et ses options ; son `trigger`
s'exécute lorsqu'un utilisateur utilise réellement `/name` sur Discord. Rien n'est envoyé à Discord
au chargement, au rechargement ni au déchargement : un script pousse le résultat explicitement,
généralement depuis `on guild ready`.

```skript
slash command ping:
    description: Pong!
    trigger:
        reply with hidden "Pong! (%used slash command%)"
```

```skript
on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

`/ping` exécute désormais le trigger ci-dessus et répond avec un `Pong! (ping)` éphémère.

syntax: core/structures#structure-slash-command-structure compact

!!! warning "Depuis la v4"
    En v4, la structure s'enregistrait elle-même sur Discord, avec les entrées `bot:` et `guilds:` ;
    en v5, la structure n'enregistre rien, et un script appelle `update the discord commands ...`
    depuis `on guild ready` (ou `on ready` pour les commandes globales). Rien n'est supprimé de
    Discord non plus au déchargement ni à l'arrêt : c'est en republiant les commandes qu'une commande
    disparaît. Les options se déclarent dans l'en-tête sous la forme `<name: type>` au lieu d'une
    liste `arguments:`, et ne peuvent pas avoir de valeur par défaut, Discord n'en ayant pas.
    Annuler `on cooldown` n'empêche pas la commande de s'exécuter.

## Entrées {#entries}

Chaque entrée ci-dessous est facultative ; `description` vaut par défaut "No description provided".

| Entrée | Valeur par défaut | Valeurs acceptées |
| --- | --- | --- |
| [description](syntax:slashcommand#description) | "No description provided" | texte, ou une section de lignes `locale: text` avec une ligne `en-US` obligatoire |
| [name](syntax:applicationcommand#name-localizations) | le nom de l'en-tête | une section de noms traduits `locale: text` |
| arguments | aucun | une section : pour chaque option, `name: description` ou une sous-section (`description`, `choices`, `on completion request`) |
| `trigger` | aucun pour une racine ou un groupe | une section de code Skript |

`enabled for`, `disabled`, `nsfw`, `contexts`, `integration types`, `cooldown`, `cooldown scope` et
`on cooldown` restreignent et localisent la commande ; voir
[Réglages des commandes](doc:interaction-commands/command-settings).

## Sous-commandes et groupes {#subcommands-and-groups}

Un chemin compte d'un à trois mots en minuscules : une commande, un groupe facultatif et une
sous-commande facultative. Deux structures partageant le premier mot fusionnent en une seule commande
Discord :

```skript
slash command mod ban <target: member> [<reason: string>]:
    description: Ban a member
    trigger:
        reply with hidden "Would ban %{_target}%"

slash command mod kick <target: member>:
    description: Kick a member
    trigger:
        reply with hidden "Would kick %{_target}%"
```

`mod ban` et `mod kick` deviennent un seul `/mod` avec deux sous-commandes. Un chemin sans `trigger`
décrit la racine ou un groupe, au lieu d'une commande terminale :

```skript
slash command mod:
    description: Moderation tools
    enabled for: manage server

slash command settings color:
    description: Colour settings

slash command settings color set <color: color>:
    description: Set the colour
    trigger:
        reply with hidden "Colour %{_color}%"
```

`settings color` regroupe `settings color set` sous `/settings color`. Sans descripteur de racine,
la racine hérite de ses permissions de l'intersection de ses sous-commandes. Déclarer la même racine
dans deux scripts différents fusionne aussi, mais affiche un avertissement dans la console ; gardez
un seul script par racine.

## Dans le trigger {#inside-the-trigger}

| Valeur | Contient |
| --- | --- |
| `{_name}` | la valeur d'une option nommée, telle que déclarée dans l'en-tête |
| `arg-1` | la même option, par position |
| `member argument` | la première option dont le type est `member` |
| `used slash command` | le chemin complet exécuté, par exemple `mod ban` |
| `event-user`, `event-member`, `event-guild`, `event-channel`, `event-bot` | le contexte de l'invocation |

[`reply with hidden`](doc:messages/sending-messages) ne répond qu'à l'utilisateur ayant lancé la
commande, et `defer the interaction` acquitte l'interaction tôt lorsque le trigger est lent, avant le
délai de 3 secondes de Discord. Voir [Options slash](doc:interaction-commands/slash-options) pour les
types d'options, les choix et la saisie semi-automatique.

## Publier sur Discord {#pushing-to-discord}

`update the discord commands (all structured application commands) in event-guild` depuis
`on guild ready` envoie chaque commande déclarée par structure à ce serveur ; la variante globale
s'écrit `update the discord commands {_ping} globally in event-bot` depuis `on ready`. Un rechargement
ne touche jamais Discord de lui-même. Voir [Enregistrer des commandes](doc:interaction-commands/registering-commands)
pour `register`, `unregister` et les délais des commandes globales et de serveur.

syntax: core/expressions#expression-structured-discord-commands compact

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *'x' is not a valid slash command name (lowercase, 1 to 32 letters, digits, - or _)* | un mot du chemin ne respecte pas les règles de nommage de Discord | utilisez uniquement des lettres minuscules, des chiffres, `-` ou `_` |
| *A slash command argument needs a name: \<user\> should be \<name: user\>* | une option de l'en-tête n'a pas de `name:` | écrivez `<name: type>`, et non `<type>` seul |
| *A slash command argument cannot have a default value* | `<name: type = default>` a été utilisé | rendez l'option facultative (`[<name: type>]`) et testez `{_name}` dans le trigger |
| *A required argument cannot follow an optional one in a slash command* | un `<...>` obligatoire se trouve après `[<...>]` | placez les options obligatoires en premier |
| *The slash command has arguments but no trigger* | des options sont déclarées mais `trigger:` est absent | ajoutez une section `trigger:`, ou supprimez les options pour décrire une racine ou un groupe |

entity: slashcommand
