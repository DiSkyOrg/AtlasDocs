---
title: Messages
description: Envoyer, construire et gérer les messages Discord, d'un simple message aux fichiers, réactions et sondages.
source-hash: cf275900196e
---

Cette section couvre tout ce qu'un bot fait avec les messages : les envoyer, les construire à
l'avance, joindre des embeds et des fichiers, les modifier et les épingler, y réagir, puis créer
et lire des sondages. Vous devez déjà avoir un bot nommé `"my-bot"` connecté (voir
[Démarrer un bot](doc:getting-started/starting-a-bot)) et avoir lu la
[section concepts](doc:concepts), en particulier [cache](doc:concepts/cache-and-await)
(copie en mémoire) et await, ainsi que les [builders](doc:concepts/builders) (objets de
construction).

## Trois façons d'envoyer {#three-ways-to-send}

`post` envoie un texte, un embed ou un composant dans n'importe quel salon, sans en garder trace.
`reply with` répond de la même manière au message ou à l'interaction en cours, sans que vous ayez à
nommer un salon. Le builder de message configure tout en amont, et `the build result of` est la
seule expression qui vous renvoie le message envoyé, pour le modifier, l'épingler ou le référencer
plus tard.

| Besoin | Utiliser |
| --- | --- |
| Envoyer dans un salon déjà obtenu, puis passer à la suite | `post` |
| Répondre au message ou à l'interaction concerné par l'événement en cours | `reply with` |
| Joindre des fichiers, ajouter des composants, ou garder le message envoyé ensuite | le builder de message |
| Répondre avec un contenu construit à l'avance, sans le conserver | `reply with {_builder}` |

## Ordre de lecture {#reading-order}

1. [Envoyer des messages](sending-messages.md) : `post`, `reply with`, le builder de message et ses
   options.
2. [Embeds](embeds.md) : chaque propriété d'un embed et ses champs.
3. [Envois de fichiers](file-uploads.md) : joindre des fichiers et les relire.
4. [Gérer les messages](managing-messages.md) : modifier, épingler, publier, transférer, purger,
   indicateur de frappe.
5. [Réactions](reactions.md) : réagir, supprimer les réactions, événements de réaction.
6. [Créer des sondages](creating-polls.md) : construire un sondage et l'envoyer seul ou sur un
   message.
7. [Sondages](polls.md) : lire un sondage, lister ses votants, le terminer, événements de vote.

Pour publier sous un autre nom et un autre avatar, voir la [section webhooks](doc:webhooks).
