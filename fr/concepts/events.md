---
title: Événements
description: De quoi est fait un gestionnaire d'événement DiSky, quelles valeurs il expose et ce qu'il ne peut pas faire.
source-hash: 8115ccf52a85
---

Cette page décrit la forme d'un gestionnaire d'événement DiSky : la ligne `on ...:` et son filtre
`seen by`, les valeurs `event-` et les expressions nommées que tout gestionnaire peut lire, la manière dont
les valeurs récupérées auprès de Discord atteignent votre code, et la raison pour laquelle les événements
Discord ne peuvent pas être annulés. Vous devez avoir un bot connecté sous le nom `"my-bot"` (voir
[Démarrer un bot](doc:getting-started/starting-a-bot)).

## Fonctionnement d'un gestionnaire d'événement {#how-an-event-handler-works}

Un événement DiSky est un événement Skript ordinaire : `on <event>:` suivi d'un trigger (bloc de code).
Chaque forme d'événement accepte un suffixe facultatif `seen by "<bot name>"`, si bien que
`on message received seen by "my-bot":` ne se déclenche que pour le bot connecté sous ce nom (voir
[plusieurs bots](doc:getting-started/multiple-bots)) ; sans ce suffixe, le gestionnaire se déclenche pour
chaque bot. Quel que soit l'événement, le bot qui l'a reçu est `event-bot`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!ping":
        reply with "Pong from %event-bot% in %event-channel%!"
```

DiSky reçoit l'événement sur le thread propre à Discord, le filtre par bot, construit les valeurs de
l'événement, puis confie le trigger au thread principal du serveur : votre gestionnaire s'exécute sur le
thread principal, comme tout événement Bukkit, et peut donc manipuler librement les joueurs, les blocs et
les variables. Les effets comme [reply with](syntax:core/effects#effect-reply-with) bloquent le trigger
jusqu'à la confirmation de Discord, ce qui est traité dans [cache et await](doc:concepts/cache-and-await).

syntax: core/effects#effect-reply-with compact
event: events#message-receive compact

## Valeurs de l'événement {#event-values}

Les entités impliquées dans un événement sont exposées à la manière de Skript, sous la forme `event-<type>`.
Lesquelles existent dépend de l'événement ; la [référence des événements](/events), générée automatiquement,
les liste pour chacun. Une valeur qui ne s'applique pas vaut none, et non une erreur : `event-guild` et
`event-member` valent none lorsqu'un message ou une réaction provient d'un salon privé.

| Valeur | Type | Événements typiques |
| --- | --- | --- |
| `event-bot` | bot | tous les événements |
| `event-guild` | guild | tout ce qui se passe dans un serveur |
| `event-channel` | channel | messages, réactions, mises à jour de salons, vocal |
| `event-user` | user | messages, réactions, bannissements, mises à jour d'utilisateurs |
| `event-member` | member | arrivées, départs, rôles, pseudos, vocal |
| `event-message` | message | message reçu ou modifié, composants, sondages |
| `event-role` | role | rôle créé, supprimé ou mis à jour |
| `event-button` | button | bouton cliqué |
| `event-dropdown` | dropdown | menu déroulant cliqué |

Un salon est enregistré une fois par type de salon, si bien que le même événement répond aussi à
`event-textchannel`, `event-voicechannel`, `event-threadchannel`, `event-forumchannel`, `event-category` et
aux autres types de salon : la forme typée est définie lorsque le salon est réellement de ce type, et none
sinon. Utilisez `event-channel` lorsque le type importe peu.

```skript
on message received seen by "my-bot":
    if event-threadchannel is set:
        reply with "This message was sent in a thread"
```

## Expressions nommées de l'événement {#named-event-expressions}

Certaines données d'événement n'ont pas de forme `event-<type>`, car il s'agit d'un texte ou d'une liste, ou
parce qu'elles entreraient en conflit avec une autre valeur du même type. Elles sont exposées sous forme
d'expressions portant leur propre nom, valables uniquement dans leur événement : les utiliser ailleurs
provoque une erreur d'analyse indiquant que l'expression ne peut être utilisée que dans cet événement.

```skript
on button clicked seen by "my-bot":
    if click id is "confirm":
        reply with "Confirmed by %event-user%"
```

| Expression | Événement | Renvoie |
| --- | --- | --- |
| `click id` | `on button clicked` | l'identifiant personnalisé du bouton cliqué |
| `selected values` | `on dropdown clicked` | les options choisies, sous forme de liste de textes |
| `execute command` | `on slash command received` | le nom complet de la commande |
| `added roles` | `on role added` | les rôles donnés à `event-member`, sous forme de liste |
| `reaction message` | `on reaction add` | le message qui a reçu la réaction |

event: events#button-click compact

## Anciennes et nouvelles valeurs {#old-and-new-values}

Les événements de mise à jour se déclenchent après le changement et exposent les deux côtés : la valeur
actuelle sous un nom simple, la précédente sous le même nom précédé de `old` (`past` et `previous` sont
aussi acceptés). L'entité elle-même est déjà mise à jour : `nickname of event-member` lit donc la nouvelle
valeur ; seule l'expression `old` connaît encore l'ancienne.

```skript
on guild member nickname change seen by "my-bot":
    send "%event-member%: '%old member nickname%' -> '%member nickname%'" to console
```

| Événement | Nouvelle valeur | Ancienne valeur |
| --- | --- | --- |
| `on guild member nickname change` | `member nickname` | `old member nickname` |
| `on discord user name change` | `name` | `old name` |
| `on discord user online status change` | `online status` | `old online status` |
| `on discord scheduled event name change` | `scheduled event name` | `old scheduled event name` |

event: events#member-nickname-event compact

## Valeurs récupérées auprès de Discord {#values-fetched-from-discord}

Quelques valeurs ne font pas partie de ce que Discord envoie avec l'événement : le message derrière une
réaction, ou l'utilisateur et le membre derrière un vote de sondage. DiSky les récupère auprès de Discord
sur un thread de travail avant le démarrage du trigger et les stocke sur l'événement ; dans le gestionnaire,
ce sont donc des valeurs ordinaires.

```skript
on reaction add seen by "my-bot":
    send "%event-user% reacted to '%discord content of reaction message%'" to console
```

Les [règles de await](doc:concepts/cache-and-await) s'appliquent à ce que vous faites dans le gestionnaire,
jamais aux valeurs propres à l'événement : une valeur d'événement n'a jamais besoin de `await`.

## Les événements ne sont pas annulables {#events-are-not-cancellable}

Un événement venant de Discord ne peut pas être annulé : Discord a déjà appliqué le changement au moment où
votre gestionnaire s'exécute. Écrire `cancel event` dans un tel gestionnaire ne se charge pas ; Skript signale
à l'analyse que l'événement ne peut pas être annulé. Réagissez plutôt que d'annuler : supprimez le message,
retirez le rôle, expulsez le membre.

```skript
on message received seen by "my-bot":
    if discord content of event-message contains "spam":
        destroy event-message
```

Les exceptions sont les événements que DiSky déclenche lui-même, avant d'exécuter une commande qu'il a
déclarée : [`on discord command used`](event:events#discord-command-used), où l'annulation arrête la commande
(voir [liste et événements](doc:chat-commands/listing-and-events)), et
[`on slash command cooldown`](event:events#application-command-cooldown), où l'annulation laisse la commande
s'exécuter malgré son temps de recharge (voir [paramètres des commandes](doc:interaction-commands/command-settings)).
[`on disky exception`](event:events#disky-error-event) est lui aussi annulable : l'annuler empêche une
erreur non interceptée d'apparaître dans la console (voir [erreurs](doc:concepts/errors#handling-every-uncaught-error)).

## Familles d'événements {#event-families}

DiSky déclenche 123 événements, générés à partir des mêmes descripteurs que la
[référence des événements](/events), qui reste la liste complète. Ils se répartissent en une douzaine de
familles ; les valeurs citées ci-dessous sont celles que partage le plus souvent chaque famille.

| Famille | Exemples | Valeurs typiques |
| --- | --- | --- |
| Cycle de vie du bot | `on ready`, `on guild ready`, `on bot shutdown` | `event-bot`, `event-guild` |
| Messages | `on message received`, `on message edited`, `on message deleted` | `event-message`, `event-channel`, `event-user` |
| Réactions et sondages | `on reaction add`, `on message poll vote added` | `reaction message`, `event-user`, `event-member` |
| Commandes | `on slash command received`, `on user command received` | `execute command`, `event-user`, `event-channel` |
| Composants | `on button clicked`, `on dropdown clicked`, `on modal clicked` | `click id`, `selected values`, `event-message` |
| Membres | `on member joined guild`, `on role added`, `on member timeout` | `event-member`, `event-guild` |
| Utilisateurs | `on discord user name change`, `on discord user typing` | `event-user`, `old name` |
| Serveur | `on discord guild ban`, `on discord guild name update` | `event-guild`, `event-user` |
| Salons et fils | `on discord channel create`, `on discord thread join` | `event-channel`, `event-guild` |
| Rôles | `on discord guild role created`, `on discord guild role permissions update` | `event-role`, `event-guild` |
| Vocal | `on member voice join`, `on discord guild voice muted` | `event-member`, `event-guild` |
| Ressources du serveur | `on discord emoji added`, `on discord guild sticker added`, `on discord scheduled event create` | `event-guild` |
| Erreurs | `on disky exception` | `event-discorderror`, `error location`, `event-bot` |

!!! tip "Journaliser pendant l'exploration"
    Une simple fonction Skript permet de vérifier à moindre coût quels événements se déclenchent et ce que
    contiennent leurs valeurs ; ce n'est rien de propre à DiSky, et vous pouvez la supprimer une fois le
    script terminé.

```skript
function writeDebug(event: text, data: text):
    send "[DiSky-evt] %{_event}% -> %{_data}%" to console

on member joined guild seen by "my-bot":
    writeDebug("member join", "member=%event-member% guild=%event-guild%")
```
