---
title: Options du bot
description: Chaque option de connexion définissable sur un bot avant son démarrage, et les deux options de présence modifiables à tout moment.
source-hash: a12943b4f53f
---

Cette page liste toutes les options qu'un bot accepte : les intents (abonnements aux événements) de
la passerelle auxquels il s'abonne, ce qu'il garde en cache, la façon dont il compresse le trafic, le
nombre de shards qu'il utilise et la présence qu'il affiche. Vous savez déjà créer un bot et le
connecter (voir [Démarrer un bot](doc:getting-started/starting-a-bot)), et vous avez un token sous la
main.

## Fonctionnement des options {#how-options-work}

Un bot passe par deux phases. Entre `a new discord bot` et `login`, il est *en configuration* : chaque
propriété ci-dessous peut être définie, et lire l'une d'elles renvoie la valeur configurée. Une fois
`login` exécuté, le bot est *en cours d'exécution* et sa connexion est construite avec les options
qu'il avait à ce moment-là. Les options de connexion (`intents`, `member cache policy`,
`cache flags`, `compression`, `shard count` et le `token`) ne se définissent qu'à la construction :
en définir une sur un bot en cours d'exécution ne modifie pas la connexion et affiche à la place une
erreur lisible dans la console. Les deux options de présence (`activity` et `online status`) sont
modifiables à chaud : définissez-les avant `login` pour démarrer avec elles, ou sur un bot en cours
d'exécution pour les changer à la volée.

```skript
options:
    token: "YOUR-TOKEN"

command /startbot <text>:
    trigger:
        shutdown the bot named "my-bot"
        set {_bot} to a new discord bot
        set token of {_bot} to {@token}
        set intents of {_bot} to "default intents"
        set member cache policy of {_bot} to "all"
        set cache flags of {_bot} to "activity, voice_state, online_status"
        set compression of {_bot} to "zlib"
        set activity of {_bot} to "with Skript"
        set online status of {_bot} to dnd
        login {_bot} as "my-bot"
```

Le `shutdown` placé en tête rend la commande sans risque au rechargement : la relancer remplace le bot
nommé `"my-bot"` au lieu de connecter une seconde copie. Chaque ligne `set` située entre la création et
le `login` est facultative ; un bot qui n'a qu'un token se connecte avec les valeurs par défaut du
tableau ci-dessous.

## Options {#options}

Chaque propriété se lit avec `<property> of {_bot}` et s'écrit avec
`set <property> of {_bot} to <value>`. Les valeurs textuelles ne sont pas sensibles à la casse ; les
noms qui contiennent un espace peuvent s'écrire avec un espace ou un tiret bas (`voice state` ou
`voice_state`).

| Propriété | Valeur par défaut | Valeurs acceptées |
| --- | --- | --- |
| [intents](syntax:bot#intents) | `"default intents"` | `"default intents"`, `"all"`, ou des noms d'intents séparés par des virgules |
| [member cache policy](syntax:bot#member-cache-policy) | `"default"` | `"all"`, `"default"`, `"none"`, `"online"`, `"owner"`, `"voice"` |
| [cache flags](syntax:bot#cache-flags) | aucun (les valeurs par défaut de JDA s'appliquent) | `"default"`, `"all"`, `"none"`, ou des noms de flags séparés par des virgules |
| [compression](syntax:bot#compression) | `"zlib"` | `"zlib"`, `"none"` |
| [shard count](syntax:bot#shard-count) | `-1` (le nombre recommandé par Discord) | `-1`, `1`, ou tout nombre à partir de 2 |
| [activity](syntax:bot#activity) | aucune | n'importe quel texte, affiché sous la forme *Playing <text>* |
| [online status](syntax:bot#online-status) | celui de Discord (en ligne) | `online`, `idle`, `dnd`, `invisible` |

## Intents {#intents}

Les intents de la passerelle indiquent à Discord quels groupes d'événements votre bot souhaite
recevoir. Un bot sans l'intent `guild_messages` ne voit jamais un message envoyé dans un serveur, quoi
que votre script écoute. La valeur est une liste de noms d'intents séparés par des virgules, ou un
raccourci ; la définir remplace l'ensemble complet.

```skript
set intents of {_bot} to "guild_messages, message_content, guild_members"
```

Deux raccourcis existent. Ils peuvent tous deux être combinés avec des noms pour ajouter quelques
intents en plus :

- `"default intents"` (ou `"default"`) : l'ensemble qu'utilise un bot neuf, signalé dans le tableau
  ci-dessous.
- `"all"` : tous les intents que JDA connaît.

```skript
set intents of {_bot} to "default intents, guild_message_polls"
```

| Intent | Par défaut | Privilégié | Nécessaire pour |
| --- | :---: | :---: | --- |
| `guild_messages` | oui | | messages envoyés dans les salons de serveur |
| `message_content` | oui | oui | lecture du texte et des pièces jointes des messages |
| `guild_members` | oui | oui | arrivées, départs et mises à jour des membres ; cache complet des membres |
| `guild_presences` | oui | oui | statut en ligne et activités des membres |
| `guild_moderation` | oui | | bannissements, débannissements, entrées du journal d'audit |
| `guild_expressions` | oui | | événements sur les émojis, stickers et sons de soundboard |
| `guild_webhooks` | oui | | événements de mise à jour des webhooks |
| `guild_invites` | oui | | événements de création et de suppression d'invitations |
| `guild_voice_states` | oui | | arrivées, départs et changements dans les salons vocaux |
| `guild_message_reactions` | oui | | réactions dans les salons de serveur |
| `guild_message_typing` | oui | | événements de saisie dans les salons de serveur |
| `direct_messages` | oui | | messages envoyés au bot en MP |
| `scheduled_events` | oui | | modifications des événements programmés |
| `guild_message_polls` | | | votes aux sondages dans les salons de serveur |
| `direct_message_polls` | | | votes aux sondages en MP |
| `direct_message_reactions` | | | réactions en MP |
| `direct_message_typing` | | | événements de saisie en MP |
| `auto_moderation_configuration` | | | modifications des règles AutoMod |
| `auto_moderation_execution` | | | actions AutoMod |

Les intents privilégiés ne sont transmis que s'ils sont activés pour votre application, sous
**Bot → Privileged Gateway Intents** sur le Discord Developer Portal. Lire `intents of {_bot}` renvoie
les noms activés, en majuscules et séparés par des virgules.

!!! warning "L'ensemble par défaut inclut les trois intents privilégiés"
    Un bot laissé sur `"default intents"` a besoin des **trois** bascules privilégiées activées sur le
    Developer Portal, sinon Discord ferme la connexion juste après le login. Activez-les, ou
    définissez une liste explicite sans ceux dont vous n'avez pas besoin.

syntax: bot#intents compact

## Mise en cache {#caching}

Deux propriétés déterminent ce que le bot garde en mémoire, et toutes deux se définissent avant
`login`. La `member cache policy` indique quels membres restent en cache une fois que Discord les a
envoyés. Les `cache flags` listent les données supplémentaires mises en cache en plus des entités
elles-mêmes. Définir l'une ou l'autre remplace sa valeur précédente.

```skript
set member cache policy of {_bot} to "online"
set cache flags of {_bot} to "default, emoji"
```

| Valeur | Membres conservés en cache |
| --- | --- |
| `"default"` | membres dans un salon vocal et propriétaires de serveur (valeur par défaut de JDA) |
| `"all"` | chaque membre de chaque serveur ; nécessite l'intent `guild_members` pour se remplir |
| `"online"` | membres dont le statut n'est pas hors ligne ; nécessite `guild_presences` |
| `"voice"` | membres dans un salon vocal |
| `"owner"` | propriétaires de serveur |
| `"none"` | personne, hormis le bot lui-même |

Les cache flags acceptent les noms ci-dessous, ou l'un des trois raccourcis : `"default"` désigne
`activity`, `voice_state` et `online_status` ; `"all"` active tous les flags ; `"none"` vide la liste.
Un flag ne se remplit que si son intent est activé.

| Cache flag | Met en cache | Intent requis |
| --- | --- | --- |
| `activity` | activités des membres | `guild_presences` |
| `online_status` | statut en ligne des membres | `guild_presences` |
| `client_status` | le client (bureau, mobile, web) utilisé par un membre | `guild_presences` |
| `voice_state` | qui se trouve dans quel salon vocal | `guild_voice_states` |
| `emoji` | émojis personnalisés | `guild_expressions` |
| `sticker` | stickers personnalisés | `guild_expressions` |
| `soundboard_sounds` | sons de soundboard | `guild_expressions` |
| `scheduled_events` | événements programmés | `scheduled_events` |
| `member_overrides` | surcharges de permissions par membre sur les salons | |
| `role_tags` | tags de rôles (rôles de bot, d'intégration, de booster) | |
| `forum_tags` | tags disponibles des salons de forum | |

Lire l'une ou l'autre propriété renvoie les noms configurés en majuscules ; un bot que vous n'avez
jamais configuré renvoie donc `"DEFAULT"` pour sa politique et un texte vide pour ses flags.

La propriété `compression` appartient au même groupe : `"zlib"` (par défaut) compresse le trafic de la
passerelle, `"none"` le désactive. Ne la modifiez pas, sauf pour déboguer la connexion brute.

syntax: bot#cache-flags compact

## Découpage en shards {#sharding}

Un shard (connexion à la passerelle) est une seule connexion à Discord. Discord exige que les bots
présents dans 2 500 serveurs ou plus répartissent leurs serveurs sur plusieurs shards. La propriété
`shard count` détermine le nombre de connexions que le bot ouvre : `-1` (par défaut) demande à Discord
son nombre recommandé, `1` force une connexion unique, et tout nombre supérieur ou égal à 2 force ce
nombre. L'expression [recommended shard count](syntax:core/expressions#expression-recommended-shard-count)
est un nom lisible pour `-1`.

```skript
set shard count of {_bot} to recommended shard count
```

Le découpage en shards est invisible pour vos scripts. Les événements de cycle de vie comme `on ready`
et `on bot shutdown` se déclenchent une fois par bot, lorsque son dernier shard démarre ou s'arrête, et
non une fois par shard ; les filtres `seen by` et les propriétés du bot fonctionnent de la même manière
quel que soit le nombre. Une fois le bot en cours d'exécution, `shard count of {_bot}` renvoie le total
réel de shards, et [running shards](syntax:bot#running-shards) indique combien sont actuellement
connectés :

```skript
on ready seen by "my-bot":
    send "%running shards of event-bot%/%shard count of event-bot% shards up" to console
```

Gardez `-1`, sauf si vous connaissez le nombre dont vous avez besoin : Discord décide du nombre de
shards qu'un bot peut ouvrir, et un nombre forcé qu'il n'accepte pas fait échouer la connexion.

syntax: bot#shard-count compact

## Présence {#presence}

`activity` définit le texte affiché sous le nom du bot sous la forme *Playing <text>* ; un texte vide le
supprime. `online status` choisit le point de présence : `online`, `idle`, `dnd` (ne pas déranger) ou
`invisible`. Contrairement aux options de connexion, ces deux options sont modifiables à chaud :
les définir avant `login` donne au bot sa présence de départ, et les définir sur un bot en cours
d'exécution met immédiatement à jour chaque shard.

```skript
on ready seen by "my-bot":
    set activity of event-bot to "in %guild count of event-bot% guilds"
    set online status of event-bot to idle
```

La valeur de `online status` est un type DiSky, pas un texte : écrivez `dnd`, et non `"dnd"`. La même
propriété lit la présence d'un membre, mais n'est modifiable que sur un bot.

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *shard count can't be changed on a running bot; set it before login* (même message pour `intents`, `cache flags`, `member cache policy`, `compression` et `token`) | Une propriété de construction a été définie après `login`. | Arrêtez le bot, définissez la propriété sur un nouveau bot, puis connectez-le à nouveau. |
| *unknown member cache policy 'x' (try: all, default, none, online, owner, voice)* | Le nom de la politique est mal orthographié. | Utilisez l'un des noms listés. |
| Un bloc *erreur Discord* mentionnant une constante `GatewayIntent` ou `CacheFlag` inconnue | Un nom d'intent ou de cache flag de la liste est mal orthographié. | Vérifiez les noms dans les sections [Intents](#intents) et [Mise en cache](#caching). |
| Le bot se connecte, puis se déconnecte avec le code de fermeture 4014 de Discord (*Disallowed intent(s)*) | Un intent privilégié est activé sur le bot mais pas sur le Developer Portal. | Activez-le sous **Bot → Privileged Gateway Intents**, ou retirez-le de `intents`. |
