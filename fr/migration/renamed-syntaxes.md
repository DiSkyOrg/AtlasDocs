---
title: Syntaxes renommées
description: Syntaxes qui existent toujours dans DiSky 5 mais s'écrivent autrement que dans DiSky 4.
source-hash: e7440c836326
---

Cette page liste les syntaxes qui ont survécu au passage de DiSky 4 à DiSky 5 sous une nouvelle forme :
une ligne DiSky 4 soit ne s'analyse plus, soit s'analyse et signifie autre chose. Vous devez déjà
connaître DiSky 4 et avoir un bot connecté sous le nom `"my-bot"`. Les syntaxes supprimées, ou dont le
modèle a entièrement changé (récupération, builders, commandes, composants, événements), ont leurs
propres pages.

## Le préfixe discord {#the-discord-prefix}

Skript enregistre ses propres syntaxes avant tout addon et retient le premier pattern qui correspond.
Quand l'opérande est une variable sans type (tout `{_x}` satisfait n'importe quel emplacement `%type%`
à l'analyse), une propriété DiSky dont la formulation est identique à celle de Skript perd en silence :
la ligne s'analyse et ne renvoie rien. DiSky 5 évite le conflit en plaçant un `discord` littéral dans le
nom de la propriété. Là où le préfixe était facultatif, il est désormais obligatoire, et quelques
patterns dont les mots facultatifs les rendaient ambigus exigent maintenant leur qualificatif.

```skript
# DiSky 4
set {_text} to content of event-message
send "%message author of event-message%" to console
```

```skript
# DiSky 5
set {_text} to discord content of event-message
send "%discord author of event-message%" to console
```

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `[discord] [message] content` | `discord content of %message%` | Même nom sur les builders de message, les text displays et les messages de webhook. |
| `[discord] [message] (user\|author\|writer)` | `discord author of %message%` | Les alias `user` et `writer` n'existent plus. |
| `author` of an embed | `discord author of %embedbuilder%` | `author icon` et `author url` sont inchangés. |
| `[discord] [message] attachment[s]` | `discord attachments of %message%` | |
| `[member] colo[u]rs` | `discord colors of %member%` | Renvoie un `rolecolor`. |
| `thread owner` | `discord owner of %threadchannel%` | Les serveurs utilisent le même nom : `discord owner of %guild%`. |
| scheduled event `location` | `discord location of %scheduledevent%` | Modifiable sur un événement en cours. |
| `[discord] permissions of %member/role/player%` | `discord permissions of %member%` | Le préfixe est obligatoire ; voir [Permissions](#permissions). |
| `%commandsenders/members% has permission %strings%` | `%members% has discord permission %permissions%` | Les chaînes brutes et les expéditeurs de commande ne sont plus acceptés. |
| `[the] last (disky\|discord) (error\|exception)` | `the last discord error` | |
| `click[ed] (id\|button)` | `click[ed] (id\|component id\|button id)` | `clicked button` n'existe plus. |

Les effets gardent à la place leur propre échappatoire : `[discord] kick` et `[discord] ban` placent
`discord` **avant** le verbe uniquement. DiSky 4 le plaçait après le verbe (`kick the discord member`),
ce qui ne s'analyse plus.

```skript
# DiSky 4
kick the discord member {_m} because of "spam"
```

```skript
# DiSky 5
kick {_m} because of "spam"
discord kick {_m} because of "spam"
```

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `kick [the] discord [member] %member%` | `[discord] kick [the] [member] %member%` | Retirez le mot après le verbe. |
| `ban [the] discord [member] %member%` | `[discord] ban [the] [member] %member%` | Pareil ; voir [Ordre des clauses de ban](#ban-clause-order). |
| `[voice] mute`, `unmute`, `move`, `disconnect` + `discord member` | `[voice] mute [the] [member] %member%`, ... | `discord` après le verbe ne s'analyse plus. |

## Bots {#bots}

Les mots-clés des bots ont été resserrés pour qu'un mot isolé ne puisse pas être pris pour autre chose.
Les expressions d'activité gardent leurs mots, mais l'activité d'un bot est désormais une seule
propriété `activity of %bot%` au lieu d'un `presence`.

```skript
# DiSky 4
set presence of {_bot} to watching "the server"
stop {_bot}
```

```skript
# DiSky 5
set activity of {_bot} to watching "the server"
stop bot {_bot}
```

Une chaîne simple affectée à l'activité est une activité "playing". Les autres types se construisent
avec des expressions dédiées :

| Expression | Type |
| --- | --- |
| `playing [to] %string%` | Playing |
| `watching [to] %string%` | Watching |
| `listening [to] %string%` | Listening |
| `streaming [to] %string% with [the] url %string%` | Streaming |
| `competing [in\|to] %string%` | Competing |
| `custom status [of] %string%` | Custom status |

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `[force] (stop\|shutdown) [the] [bot] %bot%` | `(shut down\|stop\|disconnect) [the] [discord] bot[s] %bots%` | Le mot `bot` est obligatoire (`stop {_bot}` échoue), `force` n'existe plus, et une liste est acceptée. |
| `[get] [the] bot [(named\|with name)] %string%` | `[the] bot[s] named %string%` | `named` est obligatoire ; la recherche ignore la casse. |
| `[discord] presence` | `activity of %bot%` | Affectez une chaîne ou l'une des expressions ci-dessus. |
| `[discord] [online] status of %bot/member%` | `online status of %bot%`, `online status of %member%` | `online` est obligatoire. La forme membre est en lecture seule. |
| `[discord] bot token` | `token of %bot%` | Modifiable avant `login` uniquement. |
| `[discord] bot ping` | `gateway ping of %bot%` | |
| `catch [the] [exception] %~objects%` | `catch [the] [error[s]] %~objects%` | `catch the exception {_e}` ne s'analyse plus ; écrivez `catch the error {_e}`. |

## Messages et embeds {#messages-and-embeds}

Les propriétés d'embed gardent en majorité les mêmes mots, avec quelques renommages. Elles restent en
écriture seule sur un builder (objet de construction), et un embed est capturé en instantané au moment
où vous l'attachez.

```skript
# DiSky 4
set time stamp of {_embed} to now
set embed color of {_embed} to red
```

```skript
# DiSky 5
set timestamp of {_embed} to now
set color of {_embed} to red
```

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `time[( \|-)]stamp` of an embed | `timestamp of %embedbuilder%` | |
| `(embed\|discord) colo[u]r` | `color of %embedbuilder%` | Sur un Skript sans la propriété native `color`, c'est `discord color`. |
| `[discord] [message] mentioned text channels` | `mentioned channels of %message%` | `mentioned voice channels`, `members`, `roles`, `users` et `emotes` gardent leurs noms. |
| `[discord] [message] (emo(te\|ji)\|reaction)[s]` | `reactions of %message%` | Les alias `emote` et `emoji` n'existent plus. |
| `[discord] [message] referenc(ing\|ed) message` | `referenced message of %message%` | |
| `att[achment[s]] %attachment% is [an] (image\|img)` | `%attachments% is [an] image [attachment]` | Sujet en premier ; `img` n'existe plus. Même forme pour `video`, `audio` et `spoiler`. |
| `[discord] [attachment] ur(l\|i)` | `attachment url of %attachment%` | `file name` et `file extension` sont les deux autres. |
| `(download\|dl) [the] [attachment] %attachment% (in\|to) [the] [(folder\|path)] %string%` | `download [the] [attachment] %attachment% (in\|to) [the] [(folder\|file\|path)] %string%` | `dl` n'existe plus ; la cible peut maintenant être un fichier. |

## Serveurs, membres et modération {#guilds-members-and-moderation}

### Ordre des clauses de ban {#ban-clause-order}

Les deux clauses facultatives de `ban` ont changé de place : la durée de suppression des messages vient
désormais **avant** la raison. Une ligne DiSky 4 qui place la raison en premier ne s'analyse plus.

```skript
# DiSky 4
ban the discord member {_m} due to "spam" and delete 1 day worth of messages
```

```skript
# DiSky 5
ban {_m} and delete 1 day worth of messages because of "spam"
```

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `ban [the] discord [member] %member% [reason] [and delete %-timespan% worth of messages]` | `[discord] ban [the] [member] %member% [and (delete\|remove) %-timespan% [worth ]of message[s]] [(due to\|because of\|with [the] reason) %-string%]` | La durée, puis la raison. |
| `ban [the] discord [member] %string% from %guild% [reason]` | `[discord] ban [the] [user] [with] [id] %string% (from\|of) [the] [guild] %guild% [and delete ...] [reason]` | Bannissement par identifiant ; il a gagné la clause de suppression. |
| `unban [the] [discord] [user] %user/string% from %guild%` | `[discord] unban [the] [user] %user% (from\|in) [the] [guild] %guild% [reason]` | Prend un `user`, pas un identifiant brut : récupérez-le d'abord avec `await`. |

### Permissions {#permissions}

DiSky 4 avait une seule expression `permissions of ... in ...` avec `add`, `remove` et `reset`. DiSky 5
rend le niveau du salon explicite : une surcharge de salon a un côté **autorisé** et un côté **refusé**,
et vous modifiez chacun par son nom. Les permissions d'un rôle au niveau du serveur forment une
propriété distincte, plus simple.

```skript
add manage messages to allowed discord permissions of {_role} in {_channel}
add send messages to denied discord permissions of {_role} in {_channel}
remove manage messages from allowed discord permissions of {_role} in {_channel}
reset allowed discord permissions of {_role} in {_channel}
```

- `add` sur le côté autorisé accorde la permission (et la retire du côté refusé).
- `add` sur le côté refusé la refuse.
- `remove` retire la permission de ce côté uniquement : elle redevient héritée, jamais un refus implicite.
- `delete` ou `reset` supprime toute la surcharge.

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `permissions of %role%` | `discord permissions of %role%` | `set`, `add`, `remove` et `delete` ; il n'y a pas de `reset`. |
| `permissions of %member%` | `discord permissions of %member%` | Permissions effectives, en lecture seule. |
| `permissions of %member/role% in %channel%` | `discord permissions of %member/role% in %guildchannel%` | Permissions effectives, en lecture seule. |
| `add ... to permissions of ... in ...` | `(allowed\|denied) discord permissions of %member/role% in %guildchannel%` | Choisissez le côté explicitement. |

### Membres, rôles et salons {#members-roles-and-channels}

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `%user% in [the] [guild] %guild%` | `member of %user% in [the] [guild] %guild%` | La forme de DiSky 4 avalait tous les "X in Y". |
| `discord name of %guild%` | `name of %guild%` | Pareil pour chaque entité : c'est le `name` de Skript. Modifiable sur les serveurs, rôles, salons et émojis personnalisés. |
| `[discord] (public\|everyone) role` | `everyone role of %guild%` | |
| `boost[(ing\|er)] (amount\|number\|size)` | `boost count of %guild%` | `boost tier`, `boost role` et `boosters` perdent les formes en `ing`/`er`. |
| `[discord] boost[ing] date` | `boost date of %member%` | |
| `[channel] parent` | `category of %standardguildchannel%` | |
| `[channel] max[imum] user[s]` | `user limit of %audiochannel%` | |
| `channel name` | `name of %channel%` | Modifiable sur un salon en cours. |
| `[channel] slow[( \|-)]mode` | `slowmode of %slowmodechannel%` | Modifiable sur un salon en cours. |
| `[channel] jump url` | `jump url of %guildchannel%` | |
| `move [the] [discord] role %role% above/under/up/down` | mêmes mots | Inchangé à l'écriture ; déplacer un rôle à côté du plus haut ou du plus bas est désormais sans effet au lieu d'une erreur. |

!!! warning "Les déplacements de rôle peuvent encore être refusés"
    Un saut sur de nombreuses positions à la fois peut être refusé par Discord avec *could not be moved due
    to hierarchical power*. Déplacez le rôle par étapes plus courtes.
