---
title: AutoMod
description: Créer, modifier et surveiller les règles AutoMod de Discord depuis un script.
source-hash: c6d3e1a63126
---

AutoMod est le filtre intégré de Discord : une règle recherche quelque chose dans les messages ou
les profils des membres, et réagit d'elle-même, même lorsque le bot est hors ligne. Cette section
explique comment créer des règles, modifier celles qu'un serveur possède déjà, et réagir lorsqu'une
règle se déclenche. Vous devez déjà avoir un bot nommé `"my-bot"` connecté (voir
[Démarrer un bot](doc:getting-started/starting-a-bot)) avec **Manage Server** sur le serveur, et
connaître le [contrat du builder (objet de construction)](doc:concepts/builders).

## Composition d'une règle {#what-a-rule-is-made-of}

Une règle comporte trois parties, chacune étant une entité à part entière :

| Partie | Entité | Répond à |
| --- | --- | --- |
| Déclencheur | [triggerconfig](entity:triggerconfig) | ce que la règle recherche : mots-clés, motifs regex, une liste prédéfinie, spam de mentions, spam |
| Actions | [automodresponse](entity:automodresponse) | ce que la règle fait : bloquer le message, envoyer une alerte, exclure temporairement le membre, bloquer les interactions |
| Règle | [automodrule](entity:automodrule) | son nom, le moment où elle est vérifiée, les membres et les salons qu'elle ignore |

Vous construisez d'abord le déclencheur et les actions, vous les transmettez à un
[builder de règle AutoMod](entity:automodrulebuilder), puis vous lisez `the build result of` ce
builder pour créer la règle.

## Ordre de lecture {#reading-order}

1. [Créer une règle](creating-rules.md) : le builder de règle, de la règle minimale à une règle
   entièrement configurée.
2. [Déclencheurs et actions](triggers-and-responses.md) : chaque type de déclencheur et ses options,
   chaque action.
3. [Gérer les règles](managing-rules.md) : lister les règles d'un serveur, les modifier en direct,
   les supprimer, et l'événement d'exécution.
