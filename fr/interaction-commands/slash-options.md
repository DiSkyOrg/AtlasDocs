---
title: Options slash
description: Types d'arguments, descriptions et choix, saisie semi-automatique, options typées, bornes, et lecture de la valeur d'une option n'importe où.
source-hash: 3fa7a293c0c6
---

Cette page couvre ce qui se place dans les emplacements `<name: type>` de l'en-tête d'une
[commande slash](doc:interaction-commands/slash-commands) : les mots de type que Discord comprend, la
manière de décrire une option et de lui donner des choix, la saisie semi-automatique, et les bornes que
seul un builder d'option peut définir. Vous devez déjà avoir un bot nommé `"my-bot"` connecté et un en-tête
`slash command` sous les yeux.

## Fonctionnement des options {#how-options-work}

Chaque `<name: type>` de l'en-tête `slash command <path> <arguments>:` est une option. Discord l'affiche
comme un champ typé dans le client et la valide avant que l'interaction n'atteigne le bot : `{_name}`
contient donc déjà une vraie valeur, un membre, un rôle, un nombre, jamais un texte brut à analyser.

```skript
slash command mod ban <target: member> [<reason: string>]:
    description: Ban a member
    trigger:
        reply with hidden "Would ban %{_target}% for %{_reason}%"
```

`<target: member>` est obligatoire ; `[<reason: string>]` est facultatif et `{_reason}` vaut `none` lorsque
l'utilisateur ne le renseigne pas. Une option obligatoire ne peut jamais suivre une option facultative, la
même règle que celle que l'en-tête impose lui-même (voir [Commandes slash](doc:interaction-commands/slash-commands)).
Une option prend exactement une valeur : il n'existe pas de forme plurielle, et Discord n'a pas de notion de
valeur par défaut, donc `<name: type = x>` n'est pas valide ici, contrairement à ce qui est possible pour une
[`discord command`](doc:chat-commands/arguments).

## Types d'options {#option-types}

Le mot de type détermine à la fois l'option Discord que Skript envoie et ce que `{_name}` contient en retour.

| Mot(s) de type | Type Discord | Contenu de `{_name}` | Remarques |
| --- | --- | --- | --- |
| `string`, `text` | STRING | le texte saisi | |
| `integer` | INTEGER | un nombre entier | |
| `number` | NUMBER | un nombre décimal | |
| `boolean` | BOOLEAN | `true` ou `false` | |
| `user` | USER | l'utilisateur Discord | |
| `member` | USER | le membre du serveur | même option USER, résolue en membre ; indisponible hors d'un serveur |
| `role` | ROLE | le rôle | |
| `mentionable` | MENTIONABLE | un utilisateur, un membre ou un rôle | selon ce que l'utilisateur a choisi |
| `attachment` | ATTACHMENT | le fichier envoyé | |
| `channel`, ou un type précis (`textchannel`, `voicechannel`, `stagechannel`, `newschannel`, `forumchannel`, `mediachannel`, `threadchannel`, `category`, `privatechannel`) | CHANNEL | le salon | un type précis restreint les salons que Discord laisse choisir à l'utilisateur ; voir [Bornes et types de salon](#bounds-and-channel-kinds) |
| `color` | STRING | une couleur Skript | saisie semi-automatique intégrée sur les noms de couleurs |
| `player`, `offlineplayer` | STRING | un joueur en ligne (ou hors ligne) | saisie semi-automatique intégrée sur les pseudos des joueurs en ligne |
| n'importe quel enum Skript (`gamemode`, et les enums propres à DiSky) | STRING | la constante de l'enum | ses constantes deviennent des choix fixes (25 au maximum), ou une saisie semi-automatique au-delà |

Les mêmes mots permettent aussi de créer une [option slash typée](syntax:core/expressions#expression-new-typed-slash-option)
sur un builder, en dehors de l'en-tête d'une structure :

```skript
set {_target} to a new typed member option named "target" with description "Who"
```

syntax: core/expressions#expression-new-typed-slash-option compact

## Décrire les options {#describing-options}

Une section `arguments:` de la structure décrit chaque option par son nom : une ligne simple pour une
description courte, ou une sous-section lorsqu'une option a aussi besoin de choix.

```skript
slash command mod ban <target: member> [<reason: string>]:
    description: Ban a member
    arguments:
        target: Who to ban
        reason:
            description: Why
            choices:
                Spam: spam
                Rude: rude
    trigger:
        reply with hidden "Would ban %{_target}% for %{_reason}%"
```

Une option absente de `arguments:`, ou sans ligne `description:`, garde le texte par défaut de Discord :
*No description provided*. `choices:` est une section de lignes `Name: value`, jusqu'à 25, et n'est valide
que sur une option `string`, `integer` ou `number` ; la valeur à droite doit s'analyser comme le type de cette
option (un nombre pour `integer` ou `number`, n'importe quoi pour `string`). Dès qu'une option a des choix,
Discord ne permet à l'utilisateur de choisir que dans cette liste.

## Saisie semi-automatique {#autocomplete}

Un argument dont la sous-section contient `on completion request:` au lieu de `choices:` est marqué pour la
saisie semi-automatique : la section s'exécute à chaque frappe, et [`return choices`](syntax:core/effects#effect-return-slash-choices)
y répond et arrête le trigger à cet endroit, avec jusqu'à 25 suggestions.

```skript
slash command fruit <name: string>:
    description: Pick a fruit
    arguments:
        name:
            description: The fruit
            on completion request:
                send "[CMD] completion for %current argument%" to console
                return choices "apple", "banana" and "cherry"
    trigger:
        reply with hidden "You picked %{_name}%"
```

`current argument` désigne l'option sur laquelle Discord pose la question (utile dès qu'une commande a plus
d'une option en saisie semi-automatique) ; `return choices` accepte des textes ou des nombres simples,
utilisés à la fois comme libellé et comme valeur, ou `a new choice named "..." with value ...` lorsque les
deux doivent différer.

Sans section `on completion request:`, une option typée (`color`, `player`, `offlineplayer`, ou un enum de
plus de 25 constantes) propose quand même une saisie semi-automatique par elle-même, à partir de sa liste
intégrée. Une option ne peut pas avoir à la fois `choices:` et `on completion request:` (voir
[Erreurs ci-dessous](#errors-you-may-see)).

Une option de builder dont `auto complete` est défini n'a pas de section de structure pour y répondre : c'est
l'événement générique [`on slash completion`](event:events#slash-command-completion-event), avec
`return choices`, qui s'en charge, de la même façon que les [builders de commandes](doc:interaction-commands/command-builders)
répondent à leurs commandes de manière générique.

syntax: core/effects#effect-return-slash-choices compact

## Lire les options n'importe où {#reading-options-anywhere}

[`slash option "name"`](syntax:core/expressions#expression-slash-option-value) lit n'importe quelle option par
son nom, qu'elle vienne d'une structure ou d'un builder, partout où une interaction slash est dans la portée.

| Expression | Renvoie |
| --- | --- |
| `{_name}` | la valeur d'une option nommée, uniquement pour une commande déclarée par un en-tête `slash command` |
| `arg-1` / `member argument` | lecture par position ou par type, mêmes idiomes que pour une [`discord command`](doc:chat-commands/arguments), uniquement pour une commande déclarée par structure |
| `slash option "name"` | la valeur, typée telle que Discord l'a envoyée |
| `slash option "name" as member` | la valeur de la même option, résolue en membre du serveur |
| `slash option "name" as <optiontype>` | la valeur de la même option, relue comme un type Discord précis (`string`, `integer`, `number`, `boolean`, `user`, `channel`, `role`, `mentionable`, `attachment`) |

```skript
on slash command:
    set {_target} to slash option "target"
    send "%used slash command% option target=%{_target}%" to console
```

`slash option` ne se résout qu'à l'intérieur de [`on slash command`](event:events#slash-command),
[`on slash completion`](event:events#slash-command-completion-event) ou
[`on slash command cooldown`](event:events#application-command-cooldown) ; utilisé ailleurs, il provoque une
erreur de chargement. Il fonctionne de la même façon que la commande derrière lui provienne d'une structure
`slash command` ou d'un builder, ce qui explique pourquoi les événements génériques voient les deux.

syntax: core/expressions#expression-slash-option-value compact

## Bornes et types de salon {#bounds-and-channel-kinds}

Le `<name: type>` de l'en-tête d'une `slash command` ne prévoit pas d'entrée pour les bornes : un intervalle
numérique, une longueur de texte ou un ensemble restreint de types de salon n'existent que sur une option de
builder, `a new <type> slash option` ou `a new typed ... slash option`.

```skript
set {_sides} to a new integer option named "sides" with description "How many sides"
set min value of {_sides} to 2
set max value of {_sides} to 100
```

| Propriété | Par défaut | Valeurs acceptées |
| --- | --- | --- |
| [min value](syntax:slashoption#min-value) | aucune | n'importe quel nombre, options `integer` et `number` uniquement |
| [max value](syntax:slashoption#max-value) | aucune | n'importe quel nombre, options `integer` et `number` uniquement |
| [min length](syntax:slashoption#min-length) | aucune | `0` à `6000`, options `string` uniquement |
| [max length](syntax:slashoption#max-length) | aucune | `1` à `6000`, options `string` uniquement |
| [channel types](syntax:slashoption#channel-types) | vide (n'importe quel type) | un ou plusieurs types de salon, options `channel` uniquement |

`set channel types of {_opt} to text and voice` restreint une option `channel` de la même façon que la
déclarer en `textchannel` le fait, mais lui permet d'accepter plusieurs types. Voir
[Builders de commandes](doc:interaction-commands/command-builders) pour construire et envoyer l'option elle-même.

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Correction |
| --- | --- | --- |
| *Unknown type 'x' for an argument of the slash command* | un mot de type dans `<...>` n'est ni un type Skript ni un type DiSky connu | vérifiez les mots listés dans [Types d'options](#option-types) |
| *The argument 'x' has more than 25 choices; use 'on completion request' instead* | une sous-section `choices:` contient plus de 25 lignes | passez à la [saisie semi-automatique](#autocomplete) |
| *The argument 'x' cannot have both choices and an 'on completion request' section* | la sous-section d'un argument contient les deux | n'en gardez qu'un |
| *The argument 'x' is a \<type> option, which cannot have choices* | `choices:` est défini sur un argument `boolean`, `user`, `member`, `role`, `mentionable`, `attachment` ou `channel` | seules les options `string`, `integer` et `number` acceptent des choix |
| *'x' is not a valid \<type> for the choice 'y'* | la valeur d'un choix ne s'analyse pas comme le type de son option | donnez un nombre à un choix `integer` / `number`, n'importe quel texte à un choix `string` |
| *a \<type> option cannot have choices* / *a \<type> option cannot have autocomplete* | `choices` ou `auto complete` est défini sur une option de builder dont le type ne le prend pas en charge | même restriction, côté builder |
| *only integer and number options have a minimum value* (même formulation pour le maximum) | `min value` ou `max value` est défini sur une option de builder non numérique | seules les options `integer` et `number` acceptent des bornes |
| *A slash option can only be read in a slash command, slash completion or slash command cooldown event* | `slash option "..."` est utilisé hors de ces trois événements | déplacez la lecture dans l'un d'eux |

entity: slashoption
