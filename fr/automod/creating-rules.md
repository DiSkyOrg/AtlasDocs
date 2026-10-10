---
title: Créer une règle
description: Construire une règle AutoMod à partir d'un déclencheur et de ses actions, puis la créer sur Discord.
source-hash: ffe6c5764397
---

Cette page couvre le builder (objet de construction) de règle AutoMod : les deux types de règles, les
propriétés qu'une règle accepte, et la construction. Vous devez déjà avoir un bot nommé `"my-bot"`
connecté avec **Manage Server**, et connaître le [contrat du builder](doc:concepts/builders).

## Comment une règle est créée {#how-a-rule-is-created}

Une règle se crée en quatre étapes : créer un déclencheur, créer les actions, placer les deux dans un
builder, puis lire [`the build result of`](syntax:automodrulebuilder#result) ce builder sous `await`.
Le constructeur du builder prend le nom, le serveur et le déclencheur, car Discord les fige à la
création.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!no-invites":
        set {_t} to a new automod keyword trigger with the keywords "*discord.gg*"
        set {_b} to a new automod rule builder named "No invites" in event-guild for messages using {_t}
        add a new automod response blocking the message to automod responses of {_b}
        await set {_rule} to the build result of {_b}
        reply with "created rule %discord id of {_rule}%"
```

Ce qui revient est une [règle AutoMod](entity:automodrule) vivante : lisez ses propriétés ou
[modifiez-la](doc:automod/managing-rules) comme toute autre entité. Construire deux fois le même
builder crée deux règles.

syntax: automodrulebuilder#result compact

## Règles de messages et règles de profils {#message-rules-and-profile-rules}

Discord vérifie une règle à un moment précis, choisi à la création et jamais modifié ensuite :

| Constructeur | Vérifiée quand | Déclencheurs acceptés |
| --- | --- | --- |
| [`... for messages using %triggerconfig%`](syntax:automodrulebuilder#new-message-builder) | un membre envoie un message | tous les types |
| [`... for member profiles using %triggerconfig%`](syntax:automodrulebuilder#new-profile-builder) | un membre modifie son nom d'utilisateur, son pseudo ou sa bio | uniquement les déclencheurs par mots-clés |

Une règle de profil reçoit automatiquement la réponse *block member interaction*, qui est la seule
réponse que Discord autorise sur ce type de règle.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!clean-names":
        set {_t} to a new automod keyword trigger with the keywords "*admin*"
        set {_b} to a new automod rule builder named "No fake staff" in event-guild for member profiles using {_t}
        await set {_rule} to the build result of {_b}
```

syntax: automodrulebuilder#new-message-builder compact

## Options {#options}

Chaque propriété du builder est en écriture seule ; relisez-les sur la règle construite.

| Propriété | Valeur par défaut | Valeurs acceptées |
| --- | --- | --- |
| [enabled](syntax:automodrulebuilder#enabled) | `true` | `true`, `false` |
| [automod responses](syntax:automodrulebuilder#automod-responses) | aucune (règles de profil : *block member interaction*) | [actions](doc:automod/triggers-and-responses) |
| [exempt roles](syntax:automodrulebuilder#exempt-roles) | aucun | jusqu'à 20 rôles |
| [exempt channels](syntax:automodrulebuilder#exempt-channels) | aucun | jusqu'à 50 salons |
| [trigger config](syntax:automodrulebuilder#trigger-config) | le déclencheur du constructeur | un déclencheur du même type |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!strict-words":
        set {_t} to a new automod keyword trigger with the keywords "badword" and "*worse*"
        set allow list of {_t} to "badwordle"
        set {_b} to a new automod rule builder named "Words" in event-guild for messages using {_t}
        set automod responses of {_b} to (a new automod response blocking the message)
        add (a new automod response sending an alert to the channel event-channel) to automod responses of {_b}
        add (a new automod response timing the member out for 10 minutes) to automod responses of {_b}
        add role with id "000000000000000000" to exempt roles of {_b}
        set enabled of {_b} to true
        await set {_rule} to the build result of {_b}
```

!!! warning "Une seule règle par serveur pour certains déclencheurs"
    Discord n'autorise qu'une seule règle par serveur pour les déclencheurs **preset**, **spam** et
    **mention spam**, ainsi que pour les règles de profil. Une seconde règle est refusée avec
    *[50035] Invalid Form Body*. Listez d'abord les règles du serveur et
    [modifiez la règle existante](doc:automod/managing-rules) à la place.

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *[50035] Invalid Form Body* suivi du champ en cause | Un déclencheur limité à une règle par serveur en a déjà une, ou une valeur est hors des limites de Discord | Modifiez la règle existante ; vérifiez le champ nommé dans le message |
| *[50035] Invalid Form Body* mentionnant `actions` | Aucune action, ou une action que le déclencheur n'autorise pas (une exclusion temporaire sur une règle de spam) | Voir le tableau des actions dans [déclencheurs et actions](doc:automod/triggers-and-responses) |
| *building talks to Discord, so this requires 'await'* (erreur d'analyse) | `the build result of` a été lu sans `await` | Écrivez `await set {_rule} to the build result of {_b}` |
| Un bloc *Discord error* mentionnant **Missing Permissions** | Le bot n'a pas **Manage Server** | Accordez-la au bot |

entity: automodrulebuilder
