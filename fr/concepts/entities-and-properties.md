---
title: Entités et propriétés
description: Chaque objet Discord est une entité ; ses données se lisent et s'écrivent sous forme de propriétés.
source-hash: 1cd0f4533c71
---

Cette page présente le schéma derrière presque chaque syntaxe de l'atlas : un objet Discord est une
entité, et ses données sont des propriétés que vous lisez et écrivez avec une grammaire fixe. Vous devez
avoir un bot connecté sous le nom `"my-bot"`, et l'option `use type properties: true` de Skript activée
(voir [Prérequis](doc:getting-started)).

## Fonctionnement des propriétés {#how-properties-work}

Un serveur, un membre, un rôle, un message, un salon : chacun est une *entité*, un type Skript adossé à
un objet Discord réel. Les données d'une entité sont des *propriétés*, lues sous l'une de deux formes
équivalentes :

```skript
on ready seen by "my-bot":
    send "[DiSky] %name of event-bot% (%discord id of event-bot%)" to console
    send "[DiSky] %event-bot's name%" to console
```

`name of event-bot` et `event-bot's name` donnent la même valeur ; utilisez celle qui se lit le mieux
dans la phrase. Les deux formes sont valides pour chaque propriété de l'atlas, sur chaque entité qui la
possède.

Les entités forment aussi une hiérarchie : une entité plus précise se convertit en une entité plus
générale partout où ce type plus général est attendu. Un salon textuel est aussi un salon de serveur, un
salon de messages et un salon ; `name of event-channel` est donc valide même lorsque `event-channel` est
en réalité un salon textuel. De même, un membre se convertit en son utilisateur, si bien qu'une propriété
qui n'existe que sur `user` se lit aussi depuis une variable `member`.

## Propriétés partagées {#shared-properties}

Certaines propriétés sont enregistrées une seule fois et partagées par toutes les entités qui les
possèdent, au lieu d'être réimplémentées pour chaque entité. Lire ou écrire l'une d'elles exige
[`use type properties: true`](doc:getting-started) dans la configuration de Skript, option que les
versions récentes de Skript activent par défaut.

| Propriété | Portée par |
| --- | --- |
| `name` | applicationinfo, bot, embedfield, emote, forumtag, guild, member, role, scheduledevent, sticker, user, channel, webhook |
| `avatar url` | applicationinfo, bot, guild, member, sticker, user |
| `guild` | logentry, member, message, role, scheduledevent, webhook, guildchannel, guildsticker |
| `online status` | bot, member |
| `color` | embedbuilder, role, roleaction |
| `jump url` | message, guildchannel |
| `value` | embedfield |
| `title` | embedbuilder, modal |
| `style` | button, textinput |

```skript
on ready seen by "my-bot":
    set {_g} to first element of (guilds of event-bot)
    send "[DiSky] guild %name of {_g}%, avatar %avatar url of {_g}%" to console
```

## Identifiants et mentions {#ids-and-mentions}

Deux propriétés viennent d'entités de niveau interface plutôt que d'une entité précise ; elles se lisent
donc de la même façon sur tout ce à quoi Discord attribue un identifiant ou une mention.
[`discord id`](syntax:snowflake#discord-id) et [`creation date`](syntax:snowflake#creation-date) marchent
sur tout *snowflake* (identifiant Discord : un membre, un utilisateur, un serveur, un rôle, un salon, un message...) ;
[`mention tag`](syntax:mentionable#mention-tag) marche sur toute entité *mentionnable* (un utilisateur,
un membre, un rôle, un salon, un émoji) et s'affiche comme une mention cliquable lorsqu'elle est envoyée
dans un message.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!id":
        reply with "Your id is %discord id of event-member%, your account dates from %creation date of event-member%"
        reply with "Hey %mention tag of event-member%!"
```

syntax: snowflake#discord-id compact
syntax: mentionable#mention-tag compact

## Modifier une propriété {#changing-a-property}

Une propriété modifiable s'écrit avec `set <property> of <entity> to <value>` ; une propriété qui contient
une liste accepte aussi `add ... to` et `remove ... from`.

```skript
on ready seen by "my-bot":
    set {_g} to first element of (guilds of event-bot)
    set {_m} to first element of (members of {_g})
    set {_r} to first element of (roles of {_g})
    set nickname of {_m} to "new nick"
    add {_r} to roles of {_m}
    remove {_r} from roles of {_m}
```

Un setter n'est pas une simple affectation : la plupart envoient une requête à Discord, et le trigger
continue sans attendre la réponse. Préfixez la ligne avec `await` lorsque la ligne suivante relit la
valeur ; voir [Cache et await](doc:concepts/cache-and-await) pour ce cas et pour les propriétés qui
demandent `await` du côté de la lecture.

!!! info "Certaines propriétés ne se relisent jamais"
    Les builders (objets de construction) et les embeds sont en écriture seule : vous définissez leurs propriétés pour façonner
    ce qui sera créé, mais les relire ne donne rien, car il n'existe aucun objet Discord vivant à lire
    tant que le builder n'a pas été exécuté. Voir [Builders](doc:concepts/builders).

## Valeurs énumérées {#enum-values}

Certaines propriétés contiennent une valeur parmi un ensemble fixe, lue comme un littéral et non comme un
texte. Comparez-les ou définissez-les sans guillemets, et placez le côté gauche d'une comparaison entre
parenthèses pour que Skript n'essaie pas d'analyser toute la condition comme une seule expression.

| Énumération | Exemple de littéral |
| --- | --- |
| `onlinestatus` | `idle` |
| `channeltype` | `text` |
| `memberflag` | `did rejoin` |
| `activitytype` | `playing` |
| `permission` | `manage channel` |
| `buttonstyle` | `primary` |
| `selecttarget` | `role` |
| `separatorspacing` | `small` |
| `textinputstyle` | `short` |

```skript
on ready seen by "my-bot":
    set online status of event-bot to dnd
    if (online status of event-bot) is dnd:
        send "[DiSky] my-bot is set to do not disturb" to console
```

`online status` s'affiche *ne pas déranger*, mais le mot "pas" casse un littéral nu : le littéral à
écrire est donc `dnd`, et non `do not disturb`.
