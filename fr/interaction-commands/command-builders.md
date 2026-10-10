---
title: Builders de commandes
description: Construire des commandes slash, utilisateur et message comme des objets simples plutôt que des structures, et mélanger les deux.
source-hash: 4b7a917b71c3
---

Cette page couvre le chemin par builders (objets de construction) vers une commande d'application :
des objets simples que vous assemblez dans Skript, en alternative à
[`slash command`](doc:interaction-commands/slash-commands) et à
[`user command` / `message command`](doc:interaction-commands/context-commands). Vous devez déjà avoir
un bot nommé `"my-bot"` connecté.

## Fonctionnement des builders {#how-builders-work}

Un builder est un objet de commande dont les propriétés se règlent : un nom, une description, des
options, des sous-commandes. Il n'a pas de `trigger`, et rien n'atteint Discord tant qu'un script ne
l'envoie pas avec `update` ou `register`, les mêmes effets qu'utilise une structure.

```skript
on guild ready:
    set {_roll} to a new slash command named "roll" with description "Roll a dice"
    set {_sides} to a new integer option named "sides" with description "How many sides"
    set min value of {_sides} to 2
    set max value of {_sides} to 100
    add {_sides} to options of {_roll}

    register the discord command {_roll} in event-guild
```

Contrairement aux autres builders de DiSky, il n'existe pas de résultat de construction (*build
result*) séparé : les effets ci-dessus envoient l'objet lui-même, et `command id of {_roll}` n'est
renseigné qu'ensuite, une fois que Discord a répondu.

syntax: slashcommand#new-slash-command compact

## Répondre à une commande construite {#answering-a-built-command}

Une commande construite par un builder n'a pas de trigger propre ; elle reçoit donc sa réponse dans
l'événement générique [`on slash command`](event:events#slash-command), en la retrouvant par son nom.
Lisez une option avec [`slash option "name"`](doc:interaction-commands/slash-options) ; une option
facultative omise `is not set`.

```skript
on slash command:
    if used slash command is "roll":
        set {_sides} to slash option "sides"
        if {_sides} is not set:
            set {_sides} to 6
        reply with hidden "You rolled %random integer between 1 and {_sides}%"
```

## Propriétés {#properties}

Tous les types de builder partagent les propriétés `applicationcommand` ci-dessous ; `slashcommand` et
`slashoption` y ajoutent les leurs.

| Propriété | Par défaut | Valeurs acceptées |
| --- | --- | --- |
| [name](syntax:applicationcommand#name) | le nom donné à la création | texte, selon les mêmes règles de nommage que la structure qu'il reproduit |
| [command id](syntax:applicationcommand#command-id) | non renseigné | lecture seule, renseigné une fois la commande enregistrée |
| [command type](syntax:applicationcommand#command-type) | fixé selon la façon dont elle a été créée | `"slash"`, `"user"` ou `"message"`, lecture seule |

`enabled for`, `disabled`, `nsfw`, `contexts` et `integration types` s'appliquent aussi à tous les
builders ; voir [Réglages des commandes](doc:interaction-commands/command-settings).

| Propriété (slashcommand) | Par défaut | Valeurs acceptées |
| --- | --- | --- |
| [description](syntax:slashcommand#description) | le texte donné à la création | n'importe quel texte |
| [options](syntax:slashcommand#options) | vide | une liste de `slashoption` |
| [subcommands](syntax:slashcommand#subcommands) | vide | une liste de `subcommand` |
| [subcommand groups](syntax:slashcommand#subcommand-groups) | vide | une liste de `subcommandgroup` |

| Propriété (slashoption) | Par défaut | Valeurs acceptées |
| --- | --- | --- |
| [description](syntax:slashoption#description) | le texte donné à la création | n'importe quel texte |
| [option type](syntax:slashoption#option-type) | fixé selon la façon dont elle a été créée | lecture seule |
| [required](syntax:slashoption#required) | `false` | `true` / `false` |
| [auto complete](syntax:slashoption#auto-complete) | `false` | `true` / `false` ; options string, integer et number uniquement |
| [choices](syntax:slashoption#choices) | aucun | jusqu'à 25 `slashchoice` ; options string, integer et number uniquement |
| [min value](syntax:slashoption#min-value) | aucune | un nombre ; options integer et number uniquement |
| [max value](syntax:slashoption#max-value) | aucune | un nombre ; options integer et number uniquement |
| [min length](syntax:slashoption#min-length) | aucune | `0` à `6000` ; options string uniquement |
| [max length](syntax:slashoption#max-length) | aucune | `1` à `6000` ; options string uniquement |
| [channel types](syntax:slashoption#channel-types) | vide (n'importe quel salon) | une liste de types de salon ; options channel uniquement |

syntax: slashoption#new-slash-option compact

## Sous-commandes et groupes {#subcommands-and-groups}

Une `subcommand` est une entrée `/root sub` avec sa propre description et ses options ; un
`subcommandgroup` regroupe plusieurs sous-commandes sous `/root group sub`. Une commande slash a soit
des options, soit des sous-commandes (avec ou sans groupes), jamais les deux.

```skript
on guild ready:
    set {_mod} to a new slash command named "mod" with description "Moderation tools"

    set {_ban} to a new subcommand named "ban" with description "Ban a member"
    add a new user option named "target" with description "Who to ban" to options of {_ban}
    add {_ban} to subcommands of {_mod}

    set {_kick} to a new subcommand named "kick" with description "Kick a member"
    add a new user option named "target" with description "Who to kick" to options of {_kick}
    add {_kick} to subcommands of {_mod}

    register the discord command {_mod} in event-guild
```

`/mod ban` et `/mod kick` ci-dessus correspondent à la même forme déclarée par structure dans
[Commandes slash](doc:interaction-commands/slash-commands) ; un groupe de sous-commandes ajoute un
niveau de plus : construisez-le avec `a new subcommand group named ... with description ...`, ajoutez-y
des sous-commandes, puis ajoutez le groupe à `subcommand groups of` de la commande.

syntax: subcommand#new-subcommand compact

## Mélanger structures et builders {#mixing-structures-and-builders}

`structured slash command "mod"` lit une commande déclarée par structure comme le même type d'objet
qu'un builder : modifiable, et indépendant du fichier `.sk` qui l'a déclarée. Localisez-la, ajoutez une
option, puis envoyez-la comme n'importe quel autre objet.

```skript
on guild ready:
    set {_mod} to structured slash command "mod"
    localize the description of {_mod} in "fr" to "Outils de modération"
    register the discord command {_mod} in event-guild
```

Une structure et un builder peuvent aussi être envoyés côte à côte, dans un seul appel :
`update the discord commands (all structured application commands) and {_roll} in event-guild`
remplace chaque commande déclarée par structure et ajoute `{_roll}` dans le même PUT. Une commande
déclarée par structure exécute toujours son propre `trigger` ; une commande déclarée par builder ne
répond que dans l'événement générique. Les deux déclenchent l'événement générique en premier, quelle
que soit la façon dont elles ont été déclarées.

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Correction |
| --- | --- | --- |
| *'sub_command' is not an option type; use a subcommand or a subcommand group instead* (même formulation pour `'sub_command_group'`) | une nouvelle option a été construite avec un type structurel au lieu d'un `subcommand` ou d'un `subcommand group` | construisez un objet `subcommand` ou `subcommand group`, et non une option |
| *a \<type\> option cannot have autocomplete* | `auto complete` a été mis à `true` sur une option boolean, user, channel, role, mentionable ou attachment | seules les options string, integer et number prennent en charge la saisie semi-automatique |
| *only integer and number options have a minimum value* (même formulation pour le maximum) | `min value` / `max value` a été défini sur une option non numérique | seules les options integer et number acceptent des bornes |
| *the choice 'x' has a text value but its option is an integer option* (ou *a number option*) | la valeur d'un `slashchoice` ne correspond pas au type de son option | donnez au choix une valeur numérique, ou passez l'option en `string` |
| *a \<type\> option cannot have choices* | `choices` a été défini sur une option boolean, user, channel, role, mentionable ou attachment | seules les options string, integer et number acceptent des choix |

entity: applicationcommand
