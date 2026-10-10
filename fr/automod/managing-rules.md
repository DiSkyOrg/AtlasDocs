---
title: Gérer les règles
description: Lister les règles AutoMod d'un serveur, les modifier en direct, les supprimer, et réagir lorsqu'une règle se déclenche.
source-hash: 16ff0b33d451
---

Cette page couvre les règles qui existent déjà sur un serveur, qu'un script ou un modérateur les ait
créées : les lire, les modifier, les supprimer, et l'événement déclenché lorsqu'une règle agit. Vous
devez déjà avoir un bot nommé `"my-bot"` connecté avec **Manage Server**, et connaître les
[trois règles de `await`](doc:concepts/cache-and-await).

## Lire les règles d'un serveur {#reading-a-guilds-rules}

[`automod rules of %guild%`](syntax:guild#automod-rules) liste toutes les règles d'un serveur, et
[`automod rule with id %string% in %guild%`](syntax:automodrule#automod-rule-with-id) en récupère une.
DiSky ne garde aucun cache (copie en mémoire) d'AutoMod : les deux interrogent Discord, et exigent
donc tous deux `await`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!rules":
        await set {_rules::*} to automod rules of event-guild
        loop {_rules::*}:
            reply with "%name of loop-value%: %automod trigger type of loop-value%, enabled %enabled of loop-value%"
```

Ce que vous obtenez est un instantané pris à cet instant. Relisez une règle après l'avoir modifiée
pour voir son nouvel état.

| Propriété | Renvoie |
| --- | --- |
| [name](syntax:automodrule#name) | le nom de la règle |
| [enabled](syntax:automodrule#enabled) | si la règle est appliquée |
| [automod event type](syntax:automodrule#automod-event-type) | `message send` ou `member update` |
| [automod trigger type](syntax:automodrule#automod-trigger-type) | `keyword`, `spam`, `keyword preset`, `mention spam` ou `member profile keyword` |
| [filtered keywords](syntax:automodrule#filtered-keywords), [filtered patterns](syntax:automodrule#filtered-patterns), [allow list](syntax:automodrule#allow-list) | les listes du déclencheur par mots-clés |
| [presets](syntax:automodrule#presets) | les listes du déclencheur preset |
| [mention limit](syntax:automodrule#mention-limit), [mention raid protection](syntax:automodrule#mention-raid-protection) | les réglages du déclencheur mention spam |
| [exempt roles](syntax:automodrule#exempt-roles), [exempt channels](syntax:automodrule#exempt-channels) | qui et où la règle ignore |
| [automod responses](syntax:automodrule#automod-responses) | ce que fait la règle |
| [creator](syntax:automodrule#creator), [creator id](syntax:automodrule#creator-id) | qui l'a créée |

syntax: guild#automod-rules compact

## Modifier une règle {#editing-a-rule}

`name`, `enabled`, `exempt roles`, `exempt channels`, `automod responses` et `trigger config` sont
modifiables sur une règle. Chaque modification est envoyée à Discord immédiatement ; placez `await`
devant pour attendre la fin de cet envoi avant que la ligne suivante ne relise la règle.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!pause-rules":
        await set {_rules::*} to automod rules of event-guild
        loop {_rules::*}:
            await set enabled of loop-value to false
            await add event-channel to exempt channels of loop-value
```

`add` et `remove` partent de la règle telle qu'elle a été lue. Une seule ligne `add a and b to ...`
envoie les deux valeurs ensemble, mais deux lignes `add` séparées sur le même instantané partent
chacune de cet instantané : seule la seconde subsiste. Relisez la règle entre les deux.

[`trigger config`](syntax:automodrule#trigger-config) remplace ce que la règle recherche. Elle est en
écriture seule (lisez plutôt les propriétés de mots-clés, preset et mention), et le nouveau déclencheur
doit être du type de la règle : une règle par mots-clés accepte un déclencheur par mots-clés ou par
motifs, jamais un déclencheur preset.

```skript
set {_t} to a new automod keyword trigger with the keywords "newword"
await set trigger config of {_rule} to {_t}
```

syntax: automodrule#exempt-roles compact

## Supprimer une règle {#deleting-a-rule}

[`destroy`](syntax:core/effects#destroy) supprime une règle.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!drop-rule":
        await set {_rule} to automod rule with id "000000000000000000" in event-guild
        destroy {_rule}
```

!!! danger "Certaines règles ne peuvent pas être supprimées"
    Un serveur communautaire doit conserver sa règle mention spam : Discord refuse de la supprimer.
    Désactivez-la à la place avec `set enabled of {_rule} to false`.

## Quand une règle se déclenche {#when-a-rule-fires}

[`on automod execution`](event:events#automod-execution) se déclenche une fois par action exécutée par
une règle : une règle qui bloque le message et envoie une alerte le déclenche donc deux fois. Le bot a
besoin de l'[intent (abonnement aux événements)](doc:getting-started/bot-options) `auto_moderation_execution`
pour le recevoir.

```skript
on automod execution seen by "my-bot":
    send "%event-user% triggered %automod rule id of event-automod% in %event-channel%" to console
    send "matched '%matched keyword of event-automod%' in: %automod message content of event-automod%" to console
```

`event-automod` contient ce qui a été repéré. [matched keyword](syntax:automod#matched-keyword) et
[matched content](syntax:automod#matched-content) indiquent ce qui a déclenché la règle,
[automod message content](syntax:automod#automod-message-content) est le message complet (vide sans
l'intent `message_content`), et `event-automodresponse` est l'action en cours d'exécution.

event: events#automod-execution compact

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *requires 'await'* (erreur d'analyse) | `automod rules of` ou `automod rule with id` a été lu sans `await` | Placez `await` devant la ligne |
| *[50035] Invalid Form Body* mentionnant le déclencheur | `trigger config` a reçu un déclencheur d'un autre type | Utilisez un déclencheur du type de la règle |
| Un bloc *Discord error* lors de la suppression d'une règle mention spam | Le serveur est un serveur communautaire | Désactivez la règle à la place |

entity: automodrule
