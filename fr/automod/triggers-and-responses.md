---
title: Déclencheurs et actions
description: Chaque type de déclencheur AutoMod avec ses options, et chaque action qu'une règle peut exécuter.
source-hash: 9bf6605fab0f
---

Cette page liste ce qu'une règle AutoMod peut rechercher et ce qu'elle peut faire à ce sujet. Ce sont
deux valeurs simples : construisez-les, ajustez-les, puis donnez-les à un
[builder de règle](doc:automod/creating-rules) ou à une [règle existante](doc:automod/managing-rules).
Vous devez déjà avoir un bot nommé `"my-bot"` connecté.

## Fonctionnement des déclencheurs {#how-triggers-work}

Un déclencheur est créé par l'une de cinq expressions, une par type. Ses options sont des propriétés
en écriture seule, et chacune ne s'applique qu'aux types listés à côté d'elle : définir
`filtered keywords` sur un déclencheur mention spam produit une erreur lisible, et non une absence
d'effet silencieuse.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!words":
        set {_t} to a new automod keyword trigger with the keywords "badword"
        add "*worse*" to filtered keywords of {_t}
        set allow list of {_t} to "badwordle"
        set {_b} to a new automod rule builder named "Words" in event-guild for messages using {_t}
        add a new automod response blocking the message to automod responses of {_b}
        await set {_rule} to the build result of {_b}
```

syntax: triggerconfig#new-keyword-trigger compact

## Types de déclencheurs {#trigger-kinds}

| Type | Créé avec | Un par serveur |
| --- | --- | --- |
| Mots-clés | [`a new automod keyword trigger [with the keywords %strings%]`](syntax:triggerconfig#new-keyword-trigger) | non |
| Motif | [`a new automod pattern trigger with the regex patterns %strings%`](syntax:triggerconfig#new-pattern-trigger) | non |
| Preset | [`a new automod preset trigger with the presets %keywordpresets%`](syntax:triggerconfig#new-preset-trigger) | oui |
| Spam de mentions | [`a new automod mention spam trigger with a limit of %number%`](syntax:triggerconfig#new-mention-spam-trigger) | oui |
| Spam | [`a new automod spam trigger`](syntax:triggerconfig#new-spam-trigger) | oui |

Les mots-clés acceptent un joker `*` au début, à la fin ou aux deux (`"*bad*"` correspond à
l'intérieur d'un mot). Les motifs sont des expressions régulières en syntaxe Rust, 10 motifs de
260 caractères au maximum. Un déclencheur par mots-clés et un déclencheur par motifs sont le même
type côté Discord : un déclencheur par mots-clés peut aussi contenir des motifs, et inversement ; il
lui faut au moins l'un des deux au moment de construire la règle.

Les presets sont les listes de mots maintenues par Discord : `profanity`, `sexual content` et `slurs`.

## Options des déclencheurs {#trigger-options}

| Propriété | S'applique à | Valeurs acceptées |
| --- | --- | --- |
| [filtered keywords](syntax:triggerconfig#filtered-keywords) | Mots-clés, motifs | textes, `set` ou `add` |
| [filtered patterns](syntax:triggerconfig#filtered-patterns) | Mots-clés, motifs | textes de regex, `set` ou `add` |
| [allow list](syntax:triggerconfig#allow-list) | Mots-clés, motifs, preset | textes qui ne déclenchent jamais la règle |
| [presets](syntax:triggerconfig#presets) | Preset | `profanity`, `sexual content`, `slurs` ; `set`, `add` ou `remove` |
| [mention limit](syntax:triggerconfig#mention-limit) | Spam de mentions | de 1 à 50 mentions uniques |
| [mention raid protection](syntax:triggerconfig#mention-raid-protection) | Spam de mentions | `true`, `false` |

```skript
set {_presets} to a new automod preset trigger with the presets profanity and slurs
add sexual content to presets of {_presets}
set allow list of {_presets} to "scunthorpe"

set {_mentions} to a new automod mention spam trigger with a limit of 5
set mention raid protection of {_mentions} to true
```

syntax: triggerconfig#new-preset-trigger compact
syntax: triggerconfig#new-mention-spam-trigger compact

## Actions {#responses}

Une action est créée par l'une de quatre expressions et ne change jamais ensuite. Une règle contient au
plus une action de chaque type : en ajouter une seconde du même type remplace la première.

| Action | Créée avec | Autorisée sur |
| --- | --- | --- |
| Bloquer le message | [`a new automod response blocking the message [with the custom message %string%]`](syntax:automodresponse#new-block-message) | règles de messages |
| Envoyer une alerte | [`a new automod response sending an alert to the channel %standardguildmessagechannel%`](syntax:automodresponse#new-send-alert) | règles de messages |
| Exclure temporairement le membre | [`a new automod response timing the member out for %timespan%`](syntax:automodresponse#new-timeout) | règles par mots-clés et de spam de mentions |
| Bloquer les interactions du membre | [`a new automod response blocking the member interactions`](syntax:automodresponse#new-block-interaction) | règles de profils (ajoutée automatiquement) |

Le message personnalisé d'un message bloqué est affiché à son auteur, 150 caractères au maximum. Une
exclusion temporaire dure jusqu'à 28 jours.

```skript
set {_block} to a new automod response blocking the message with the custom message "Keep it clean"
set {_alert} to a new automod response sending an alert to the channel event-channel
set {_mute} to a new automod response timing the member out for 5 minutes
set automod responses of {_b} to {_block}, {_alert} and {_mute}
```

Une action se relit à travers [response type](syntax:automodresponse#response-type),
[response message](syntax:automodresponse#response-message),
[response channel](syntax:automodresponse#response-channel) et
[response timeout](syntax:automodresponse#response-timeout) ; chacune vaut none lorsqu'elle ne
s'applique pas au type de l'action. `response type` se compare à `block message`, `send alert message`,
`timeout` et `block member interaction`.

syntax: automodresponse#new-block-message compact

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *this property only applies to a mention spam trigger, not a keyword one* (et les autres types) | Une option a été définie sur un type de déclencheur qui ne la possède pas | Vérifiez la colonne *S'applique à* ci-dessus |
| *the timeout duration must be greater than 0* | Une action d'exclusion temporaire a été créée avec une durée nulle | Donnez-lui une durée réelle |
| *[50035] Invalid Form Body* mentionnant le déclencheur | Un déclencheur par mots-clés sans mot-clé ni motif, une regex rejetée par Discord, une limite supérieure à 50 | Corrigez le champ nommé dans le message |

entity: triggerconfig
