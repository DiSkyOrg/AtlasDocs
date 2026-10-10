---
title: Restreindre une commande
description: Limiter où une commande s'exécute et qui peut l'exécuter, ajouter un temps de recharge, et réagir lorsqu'une vérification la refuse.
source-hash: 5a7066979be2
---

Cette page couvre les entrées qui restreignent une [commande déclarée](doc:chat-commands/declaring-a-command) :
où elle s'exécute, qui peut l'exécuter, son temps de recharge, et la manière de réagir lorsqu'une
vérification la refuse. Vous devez avoir un bot nommé `"my-bot"` connecté.

## Fonctionnement des vérifications {#how-checks-work}

[`on discord command used`](doc:chat-commands/listing-and-events) se déclenche en premier, avant
toutes les vérifications ci-dessous ; l'annuler arrête la commande net. Au-delà de ce point, les
vérifications s'exécutent dans un ordre fixe, et la première qui échoue arrête les suivantes :

| Étape | Vérification | Raison de l'échec | Message configuré |
| --- | --- | --- | --- |
| 1 | `bots` | `wrong bot` | aucun |
| 2 | `executable in` | `wrong channel` | aucun |
| 3 | `roles` | `missing role` | aucun |
| 4 | `permissions` | `missing permission` | `permission message` |
| 5 | `cooldown` | `cooldown` | `cooldown message` |
| 6 | analyse des arguments | `invalid arguments` | `usage message` |

Une entrée que vous ne définissez pas est ignorée, et non appliquée comme « aucun n'est autorisé » :
sans `roles`, n'importe quel rôle convient ; sans `executable in`, tous les types de salons sont
acceptés. `permission message`, `cooldown message` et `usage message` sont les seules entrées qui
envoient elles-mêmes une réponse ; les trois autres raisons n'envoient rien, sauf si
[`on discord command failed`](#reacting-to-a-refusal) répond aussi.

```skript
discord command admin:
    prefixes: "!"
    permissions: administrator
    permission message: "You need to be an administrator, %event-user%."
    trigger:
        reply with "you are an admin"
```

## Où une commande s'exécute {#where-a-command-runs}

`executable in` prend une liste de mots et restreint les types de salons dans lesquels la commande
répond. L'omettre revient à lister tous les mots ci-dessous.

| Mot | Salons |
| --- | --- |
| `guild`, `server` | tous les types de salons de serveur : textuel, d'annonces, vocal, de conférence, et les trois types de fils |
| `dm`, `pm`, `private message`, `direct message`, `private` | messages privés |
| `thread`, `threads` | fils publics, privés et d'annonces |
| `voice` | salons vocaux et de conférence |
| `text` | salons textuels et d'annonces |

```skript
discord command dmonly:
    prefixes: "!"
    executable in: dm
    trigger:
        reply with "this only works in DMs"
```

## Qui peut l'exécuter {#who-can-run-it}

`roles`, `permissions` et `bots` restreignent chacun qui peut exécuter la commande ; définissez-en
autant que nécessaire, ils doivent tous être satisfaits. `roles` prend une liste de noms ou
d'identifiants de rôles, séparés par des virgules :

```skript
discord command vip:
    prefixes: "!"
    roles: VIP, 1335575588307734528
    trigger:
        reply with "you have the role"
```

`permissions` prend les littéraux de permission de Skript, comme `administrator` utilisé plus haut ;
listez-en plusieurs avec une virgule : `permissions: kick members, ban members`. Un nom de permission
non reconnu est une erreur de chargement, et non d'exécution (voir
[Erreurs ci-dessous](#errors-you-may-see)).

`bots` limite la commande à un ou plusieurs [bots](doc:getting-started/multiple-bots) par leur nom ;
sur tout autre bot, la commande est refusée avec `wrong bot` au lieu de s'exécuter :

```skript
discord command onlyminimal:
    prefixes: "!"
    bots: my-bot
    trigger:
        reply with "handled by %event-bot%"
```

## Temps de recharge {#cooldowns}

`cooldown` prend une durée et bloque toute nouvelle utilisation tant qu'elle n'est pas écoulée ;
`cooldown scope` détermine qui partage ce minuteur, et vaut `user` par défaut.

| Portée | Partagé entre |
| --- | --- |
| `user`, `member` | le même utilisateur, dans tous les serveurs et salons |
| `guild`, `server` | tous les membres de ce serveur |
| `channel` | tous les membres de ce salon |

Une utilisation n'est enregistrée qu'une fois toutes les vérifications ci-dessus passées, analyse des
arguments comprise : un appel refusé pour `invalid arguments` ne démarre jamais le temps de recharge.

```skript
discord command slow:
    prefixes: "!"
    cooldown: 10 seconds
    cooldown message: "Wait %remaining cooldown% before using %name of event-discordcommand% again."
    trigger:
        reply with "slow command used"
```

```skript
discord command guildslow:
    prefixes: "!"
    cooldown: 10 seconds
    cooldown scope: guild
    trigger:
        reply with "guild-wide cooldown started"
```

syntax: discordcommand#cooldown compact

## Réagir à un refus {#reacting-to-a-refusal}

[`on discord command failed`](event:events#discord-command-failed) se déclenche pour chaque appel
refusé, quelle que soit la vérification qui l'a arrêté. `failure reason` indique laquelle :

| Raison | Quand | Message configuré |
| --- | --- | --- |
| `invalid arguments` | un argument est absent ou ne s'analyse pas | `usage message` |
| `wrong channel` | `executable in` a refusé le salon | aucun |
| `missing role` | `roles` a refusé le membre | aucun |
| `missing permission` | `permissions` a refusé le membre | `permission message` |
| `cooldown` | le temps de recharge n'est pas écoulé | `cooldown message` |
| `wrong bot` | `bots` ne liste pas ce bot | aucun |

`remaining cooldown` n'est défini que pour un échec `cooldown` ; c'est une durée, prête pour
`%remaining cooldown%`. Utilisez cet événement pour répondre aux trois raisons qui n'ont pas de
message configuré :

```skript
on discord command failed:
    send "[CMD] failed %name of event-discordcommand%: %failure reason% (remaining %remaining cooldown%)" to console
    if failure reason is "wrong channel":
        reply with "wrong channel for %name of event-discordcommand%"
    if failure reason is "missing role":
        reply with "you lack the role for %name of event-discordcommand%"
    if failure reason is "wrong bot":
        reply with "not for %event-bot%"
```

event: events#discord-command-failed compact

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *Unknown permission 'x' in the discord command 'name'* | une entrée `permissions` n'est pas un littéral de permission valide | utilisez un nom de permission reconnu par Discord, canonique (`kick members`) ou alias (`manage messages`) |
| *'x' is not a valid place for 'executable in' (expected guild, dm, threads, voice or text)* | un mot de `executable in` est mal orthographié | utilisez l'un des mots du [tableau ci-dessus](#where-a-command-runs) |
| *'x' is not a valid cooldown scope (expected user, guild or channel)* | `cooldown scope` n'est pas l'une des trois portées `user`, `guild` ou `channel` | utilisez l'une des trois portées |
