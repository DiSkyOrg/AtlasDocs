---
title: Arguments
description: La grammaire des arguments dans l'en-tête d'une commande, la résolution de chaque type et la manière de relire les valeurs dans le trigger.
source-hash: a5d6f7564d0e
---

Cette page couvre la spécification d'arguments que vous écrivez dans l'[en-tête d'une
commande](doc:chat-commands/declaring-a-command), les types acceptés, la manière dont DiSky résout
chacun d'eux, et les expressions qui relisent ces valeurs dans le trigger. Vous devez déjà avoir une
commande déclarée et un bot nommé `"my-bot"` connecté.

## Fonctionnement des arguments {#how-arguments-work}

Tout ce qui suit le nom de la commande dans `discord command <name> <arguments>:` est une liste
d'emplacements `<type>`. Les entités Discord (un utilisateur, un rôle, un salon...) sont résolues à
partir d'une mention, d'un identifiant ou d'un nom **avant que le trigger ne s'exécute**, sur un
thread de travail ; `arg-1` contient donc déjà une vraie valeur lorsque votre code démarre. Seule la
résolution elle-même peut bloquer, jamais le trigger.

```skript
discord command hello <user> [<n: number = 1>]:
    prefixes: "!"
    usage message: "Usage: %usage of event-discordcommand%"
    trigger:
        reply with "Hello %arg-1% x%{_n}%"
```

| Forme | Signification | Exemple |
| --- | --- | --- |
| `<type>` | obligatoire, sans nom ; ne se lit que par sa position | `<user>` |
| `<name: type>` | obligatoire, se lit aussi comme `{_name}` | `<amount: number>` |
| `<name: type = default>` | facultatif ; `{_name}` vaut `default` s'il est omis | `<n: number = 1>` |
| `[<...>]` | facultatif, sans valeur par défaut ; vaut `none` lorsqu'il est omis | `[<who: member>]` |
| type au pluriel | correspond à une suite de fragments ; `{_name::*}` (ou `arg-N`) contient toutes les valeurs résolues | `<users>` |
| `<text>` final | glouton : le reste brut de la ligne, guillemets compris | `<text>` |

Un argument obligatoire ne peut jamais suivre un argument facultatif : DiSky rejette la commande
entière au chargement (voir [Erreurs que vous pouvez rencontrer](#errors-you-may-see)).

## Types d'arguments {#argument-types}

Les entités Discord se résolvent par la recherche propre à DiSky ; tout le reste se replie sur
l'analyseur de Skript pour ce type. Un argument au pluriel résout chaque fragment séparément, et un
fragment qui ne se résout pas est retiré de la liste au lieu de faire échouer toute la commande.

| Mot de type | Résolu à partir de | Remarques |
| --- | --- | --- |
| `user` | mention, identifiant ou nom | un identifiant interroge Discord (REST) si l'utilisateur n'est pas en cache ; un nom est recherché parmi les membres du serveur |
| `member` | mention, identifiant ou nom | serveur uniquement ; vaut `none` en message privé |
| `role` | mention, identifiant ou nom | serveur uniquement, cache uniquement |
| `guild` | identifiant ou nom | recherché dans tous les serveurs où le bot est présent, pas seulement dans le serveur actuel |
| `message` | un identifiant (recherché dans le salon actuel) ou un lien vers un message | interroge toujours Discord (REST) |
| `emote` | un émoji personnalisé comme `<:name:id>` | un émoji Unicode standard ne se résout pas |
| `bot` | le nom donné à `login ... as` | le registre de bots propre à DiSky, et non un compte Discord |
| `channel` | `<#id>`, un identifiant ou un nom | serveur uniquement, cache uniquement ; accepte tout type de salon |
| `textchannel`, `voicechannel`, `stagechannel`, `newschannel`, `forumchannel`, `mediachannel`, `threadchannel`, `category`, `privatechannel` | même chose que `channel` | résolu de la même façon, conservé uniquement si le résultat est bien ce type de salon |

Tout autre type que Skript analyse lui-même dans un contexte de commande (`number`, `text`,
`timespan`, `boolean` et les autres) fonctionne de la même manière, via l'analyseur de Skript pour
ce type.

## Lire les arguments {#reading-arguments}

Dans le trigger, ainsi que dans `on discord command used` et `on discord command failed`, lisez un
argument par sa position, par son type, ou par son nom s'il en possède un.

| Expression | Renvoie |
| --- | --- |
| [`arg-1`](syntax:core/expressions#expression-discord-command-argument) | la ou les valeurs du premier argument |
| `the 2nd argument` | la même chose, par rang |
| `last argument` | le dernier argument déclaré |
| `arguments` | les valeurs de tous les arguments, aplaties dans une seule liste |
| `user argument` | le premier argument de type `user` |
| `text argument-2` | le deuxième argument de type `text` |
| `{_name}` / `{_name::*}` | la variable locale d'un argument nommé : une valeur unique, ou une liste pour un type au pluriel |
| `used arguments` | le texte brut tapé après le nom de la commande, non analysé |

```skript
discord command entities <role> <textchannel> [<who: member>]:
    prefixes: "!"
    trigger:
        reply with "role=%arg-1% channel=%arg-2% member=%{_who}%"
```

```skript
discord command many <users>:
    prefixes: "!"
    trigger:
        reply with "%size of arguments% users: %arg-1%"
```

syntax: core/expressions#expression-discord-command-argument compact

## Arguments facultatifs et valeurs par défaut {#optional-arguments-and-defaults}

La valeur par défaut placée après `=` peut être un littéral (`= 1`) ou une expression complète ; elle
est évaluée à nouveau à chaque fois que l'argument est omis. Un argument facultatif sans valeur par
défaut vaut simplement `none`.

`!entities @role #general` (sans troisième mot) répond `role=... channel=... member=<none>`, puisque
`{_who}` n'a jamais été défini.

## Guillemets et texte glouton {#quoting-and-greedy-text}

Tout ce qui suit le nom de la commande est découpé sur les espaces en fragments ; un groupe entre
guillemets doubles (`"two words"`) devient un seul fragment, sans ses guillemets. Un unique argument
`<text>` placé en fin de ligne fait exception : étant glouton, il prend à la place le reste intact de
la ligne, guillemets et espaces supplémentaires compris.

```skript
discord command echo <text>:
    prefixes: "!"
    trigger:
        reply with "you said: %arg-1%"
```

`!echo a b  "c"` répond `you said: a b  "c"` : le double espace et les guillemets sont conservés.

## Lorsque les arguments sont invalides {#when-arguments-are-invalid}

L'analyse intervient en dernier, après toutes les vérifications sur l'auteur et le lieu (l'ordre
complet est décrit dans [Restreindre une commande](doc:chat-commands/restricting-a-command)) : un
argument obligatoire manquant, ou dont aucun fragment ne se résout, échoue avec `invalid arguments`.
Définissez un [`usage message`](syntax:discordcommand#usage) pour répondre automatiquement ; sans lui,
DiSky n'envoie rien, et seul `on discord command failed` le voit.

```skript
discord command hello <user> [<n: number = 1>]:
    prefixes: "!"
    usage message: "Usage: %usage of event-discordcommand%"
    trigger:
        reply with "Hello %arg-1% x%{_n}%"
```

`!hello` seul répond `Usage: hello <user> [<n: number>]` (la valeur par défaut est absente de la forme
générée) et déclenche `on discord command failed` avec `failure reason` défini à `invalid arguments`.

syntax: discordcommand#usage compact

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *Unknown type 'x' for an argument of the discord command* | un mot de type dans `<...>` n'est ni un type Skript ni un type DiSky connu | vérifiez les mots de [Types d'arguments](#argument-types) |
| *A required argument cannot follow an optional one in a discord command* | un `<...>` obligatoire se trouve après `[<...>]` ou `<... = default>` | placez les arguments obligatoires en premier, ou rendez-les facultatifs aussi |
| *'x' is not a valid argument name (it becomes the local variable {_x})* | le `name:` placé avant le type est vide, ou contient `{`, `}` ou `::` | utilisez un mot simple comme nom |
| *'x' is not a valid default value for a Y argument* | le texte placé après `=` ne s'analyse pas comme le type de l'argument | donnez une valeur acceptée par ce type, ou supprimez la valeur par défaut |

!!! info "Les arguments hors plage affichent le message de Skript"
    Demander un rang que la commande n'a pas (`arg-3` sur une commande à deux arguments), ou un type
    qu'elle ne possède pas (`text argument` sans argument de type texte), échoue à l'analyse : le
    `arg-1` propre à Skript correspond d'abord au même motif et le rejette avec *"only in the on
    command event"*, et non avec l'erreur plus précise de DiSky.
