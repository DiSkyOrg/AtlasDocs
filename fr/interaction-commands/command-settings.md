---
title: Réglages des commandes
description: Permissions, contextes, noms et descriptions localisés, et temps de recharge, communs à toutes les commandes slash, utilisateur et message.
source-hash: 4cae79bb39b7
---

Cette page couvre les réglages que partagent les [commandes slash](doc:interaction-commands/slash-commands),
les [commandes contextuelles](doc:interaction-commands/context-commands) et les
[builders](doc:interaction-commands/command-builders) : qui les voit, où elles fonctionnent, leurs noms
et descriptions traduits, et leur temps de recharge. Vous devez déjà avoir un bot nommé `"my-bot"`
connecté, ainsi qu'une commande, structure ou builder, sur laquelle définir ces réglages.

## Fonctionnement des réglages {#how-settings-work}

Chacun de ces réglages existe en deux formes : comme entrée de structure, à côté de `description` et
`trigger`, et comme propriété de l'objet builder. Les deux finissent sur la même commande ; utilisez
la forme qui correspond à la façon dont la commande a été déclarée.

| Réglage | Entrée de structure | Propriété de builder | Par défaut | Valeurs acceptées |
| --- | --- | --- | --- | --- |
| Permissions requises | `enabled for` | [enabled for](syntax:applicationcommand#enabled-for) | aucune : tout le monde | noms de permissions séparés par des virgules |
| Masquée par défaut | `disabled` | `disabled` | `false` | `true`, `false` |
| Restriction d'âge (NSFW) | `nsfw` | `nsfw` | `false` | `true`, `false` |
| Où elle fonctionne | `contexts` | [contexts](syntax:applicationcommand#contexts) | serveur uniquement | `guild`/`server`, `bot dm`/`dm`/`private message`, `group dm` |
| Mode d'installation | `integration types` | `integration types` | `guild install` | `guild install`/`server install`, `user install` |
| Délai de réutilisation | `cooldown` | pas disponible sur un builder | aucun | une durée, par exemple `10 seconds` |
| Qui partage un temps de recharge | `cooldown scope` | pas disponible sur un builder | `user` | `user`, `guild`, `channel` |
| Nom traduit | section `name:` | `localize the name of ...` | nom de l'en-tête ou du builder | lignes `locale: text` |
| Description traduite | section `description:` | `localize the description of ...` | aucune | lignes `locale: text` |

```skript
slash command roll <sides: integer>:
    description: Roll a dice
    enabled for: manage server
    contexts: guild, bot dm
    cooldown: 5 seconds
    trigger:
        reply with hidden "You rolled between 1 and %{_sides}%"
```

## Qui voit une commande {#who-sees-a-command}

`enabled for` liste les permissions dont un membre a besoin pour voir et utiliser la commande par
défaut ; les administrateurs peuvent toujours l'utiliser, et une liste vide signifie que tout le monde
peut l'utiliser. `disabled` masque la commande à tout le monde sauf aux administrateurs, quel que soit
`enabled for`. Ces deux réglages ne sont que des valeurs par défaut : les réglages d'intégration
propres à un serveur, modifiés par un membre disposant de **Gérer le serveur**, peuvent encore les
remplacer côté Discord.

```skript
set {_ban} to a new slash command named "ban" with description "Ban a member"
set enabled for of {_ban} to ban members
```

Une racine `slash command mod` fusionnée à partir de sous-commandes (voir
[Commandes slash](doc:interaction-commands/slash-commands)) sans descripteur propre hérite de
`enabled for` comme intersection de ce qu'autorisent ses sous-commandes : une permission doit figurer
sur chaque sous-commande pour se retrouver sur la racine.

## Où une commande est disponible {#where-a-command-is-available}

`contexts` restreint les surfaces depuis lesquelles la commande peut être utilisée : `guild` (la valeur
par défaut de Discord, la seule définie si vous omettez cette entrée), `bot dm` et `group dm`.
`integration types` restreint la façon dont elle a été installée : `guild install`, la valeur par
défaut, ou `user install`, qui place la commande dans la liste de commandes personnelle de l'utilisateur,
utilisable sur les serveurs où le bot n'a jamais été installé.

```skript
set {_roll} to a new slash command named "roll" with description "Roll a dice"
set contexts of {_roll} to guild and bot dm
```

## Traductions {#translations}

Les sections `name:` et `description:` d'une structure contiennent une ligne `locale: text` par langue ;
une section `description:` a besoin d'une ligne `en-US` (ou `en`) servant de valeur par défaut partout
ailleurs. `name:` n'en a jamais besoin, puisque l'en-tête fournit déjà le nom par défaut.

```skript
slash command greet <who: user>:
    description:
        en-US: Greet someone
        fr: Saluer quelqu'un
    name:
        fr: saluer
    arguments:
        who: Who to greet
    trigger:
        reply with hidden "Hello %{_who}%!"
```

Un builder, ses options, sous-commandes, groupes et choix (nom seulement) utilisent à la place
[`localize the name/description of`](syntax:core/effects#effect-localize-command), un appel par langue :

```skript
set {_cmd} to a new slash command named "ban" with description "Ban a member"
localize the name of {_cmd} in "fr" to "bannir"
localize the description of {_cmd} in "fr" to "Bannir un membre"
```

Relisez les traductions avec `name localizations of {_cmd}` et `description localizations of {_cmd}`,
qui renvoient toutes deux une liste de lignes `"locale: text"`. Les locales sont les codes propres à
Discord (`fr`, `en-GB`, `pt-BR`...) ; un nom de langue simple (`"french"`) fonctionne aussi.

syntax: core/effects#effect-localize-command compact

## Temps de recharge {#cooldowns}

`cooldown` bloque la réutilisation pendant une durée ; `cooldown scope` détermine qui partage ce minuteur.

| Portée | Partagé entre |
| --- | --- |
| `user` (par défaut) | le même utilisateur, sur tous les serveurs et tous les salons |
| `guild` | tous les membres de ce serveur |
| `channel` | toutes les personnes de ce salon |

Une section `on cooldown:` réagit à un appel bloqué, avec `remaining cooldown` renseigné :

```skript
slash command slow:
    description: 10 seconds cooldown
    cooldown: 10 seconds
    cooldown scope: user
    on cooldown:
        reply with hidden "Wait %remaining cooldown%"
    trigger:
        reply with hidden "Not on cooldown!"
```

Sans section `on cooldown:`, DiSky répond de lui-même : un message éphémère *"You can use this
command again in \<time\>."*, afin que l'interaction ne reste jamais sans accusé de réception. L'événement
générique [`on slash command cooldown`](event:events#application-command-cooldown) (ainsi que
`on user command cooldown`, `on message command cooldown` et `on application command cooldown`) se
déclenche aussi, et peut être annulé : [l'annuler](doc:concepts/events) laisse la commande s'exécuter
quand même, et laisse au trigger le soin de répondre à l'interaction. Un rechargement réinitialise
tous les temps de recharge, puisqu'il repart d'un modèle vierge ; voir
[Enregistrer des commandes](doc:interaction-commands/registering-commands).

event: events#application-command-cooldown compact

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Correction |
| --- | --- | --- |
| *Unknown permission 'x' in the slash command 'name'* | un mot de `enabled for` n'est pas une permission reconnue par Discord | utilisez un nom de permission reconnu par Discord, canonique ou alias |
| *'x' is not an interaction context (expected guild, bot dm or group dm)* | un mot de `contexts` est mal orthographié | utilisez l'un des mots de [Où une commande est disponible](#where-a-command-is-available) |
| *'x' is not an integration type (expected guild install or user install)* | un mot de `integration types` est mal orthographié | utilisez `guild install` (ou `server install`) / `user install` |
| *'x' is not a Discord locale (available: ...)* | un code de locale placé avant `localize` ou dans une section `name:` / `description:` n'est pas reconnu | utilisez un code de locale Discord ou un nom de langue |
| *A localized description needs a default 'en-US' (or 'en') line* | une section `description:` n'a pas de ligne `en-US` / `en` | ajoutez-en une : elle devient la valeur de repli pour toutes les autres locales |
| *The slash command 'name' has an 'on cooldown' section but no 'cooldown' entry* | `on cooldown:` a été défini sans `cooldown` | ajoutez une entrée `cooldown`, ou supprimez la section |
| *'x' is not a valid cooldown scope (expected user, guild or channel)* | `cooldown scope` n'est pas l'un des trois mots | utilisez `user`, `guild` ou `channel` |
