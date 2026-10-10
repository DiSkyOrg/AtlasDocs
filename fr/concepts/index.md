---
title: Concepts
description: Les mécanismes communs à toutes les fonctionnalités de DiSky, avant de manipuler des messages, des interactions ou des serveurs.
source-hash: 9a7beeb6cfaa
---

Cette section présente les mécanismes qui se répètent dans tout l'atlas : les entités et leurs
propriétés, l'attente de Discord, la recherche d'entités par identifiant, les builders (objets de construction), les
erreurs et les événements. Vous devez déjà avoir un bot connecté sous le nom `"my-bot"` (voir
[Démarrer un bot](doc:getting-started/starting-a-bot)).

## Ce que couvre une page de concepts {#what-a-concept-page-covers}

Un guide de fonctionnalité (gérer les messages, les interactions, les serveurs...) montre *ce* qu'il
faut construire. Une page de concepts montre le schéma sur lequel ce guide s'appuie, sans le
réexpliquer : en quoi la lecture d'une propriété diffère de son écriture, quand une ligne a besoin de
`await`, comment un builder devient un objet Discord réel, à quoi ressemble
une erreur dans la console, et comment un événement se déclenche. Une fois un schéma connu, chaque
guide qui l'utilise se lit comme une application directe de ce schéma, et non comme une nouveauté.

## Ordre de lecture {#reading-order}

1. [Entités et propriétés](entities-and-properties.md) : chaque objet Discord est une entité ; ses
   propriétés se lisent et s'écrivent avec la forme `X of %entity%`.
2. [Cache et await](cache-and-await.md) : les trois règles de `await`, et la raison pour laquelle
   certaines lectures en ont besoin.
3. [Obtenir des entités par identifiant](getting-by-id.md) : la famille `X with id "..."`, cache
   contre REST.
4. [Builders](builders.md) : le contrat des builders et `the build result of`.
5. [Erreurs](errors.md) : `try`/`catch`, `the last discord error` et le format d'erreur de la console.
6. [Événements](events.md) : anatomie d'un événement, `event-bot`, `seen by` et valeurs de
   l'événement.
