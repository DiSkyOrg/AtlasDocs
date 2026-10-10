---
title: Builders
description: Configurer un rôle, un salon, un message ou une invitation localement, puis le créer sur Discord en une ligne.
source-hash: 364a92d0c720
---

Cette page présente le contrat commun à tous les builders (objets de construction) de DiSky : comment
un builder se crée, pourquoi ses propriétés sont en écriture seule, et ce que fait
`the build result of`. Les pages de fonctionnalités ne listent que les setters de leur propre builder
et s'appuient sur cette page pour le reste. Vous devez déjà avoir un bot nommé `"my-bot"` connecté et
en cours d'exécution.

## Fonctionnement d'un builder {#how-a-builder-works}

Un builder est une requête Discord en attente. Le créer avec
[`a new role builder`](syntax:roleaction#new-role-builder) ne coûte rien et n'envoie rien à Discord ;
définir ses propriétés ne fait que remplir la requête localement. La lecture de
[`the build result of`](syntax:roleaction#result) sur le builder est la seule ligne qui envoie la
requête à Discord et renvoie l'entité créée. Comme cette ligne attend le réseau, elle exige `await`
(voir [cache et await](doc:concepts/cache-and-await)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!make-role":
        set {_b} to a new role builder named "Moderator" in event-guild
        set color of {_b} to orange
        set hoisted of {_b} to true
        set mentionable of {_b} to false
        await set {_role} to the build result of {_b}
        reply with "created %name of {_role}%"
```

Rien n'existe sur Discord tant que la ligne `await` n'a pas été exécutée ; les quatre lignes qui la
précèdent ne quittent jamais le serveur. Une fois la ligne terminée, `{_role}` est un rôle ordinaire :
chaque propriété et chaque effet de rôle fonctionne dessus. `the built role from {_b}` est la même
expression que `the build result of {_b}`, écrite avec le nom de l'entité produite ; chaque builder
possède cet alias (`the built guildchannel from`, `the built message from`, et ainsi de suite).

Seuls les éléments que Discord fige à la création vont dans le constructeur : un rôle a besoin d'un
nom et d'un serveur, un fil a besoin d'un nom et d'un salon ou d'un message parent, un message a besoin
de son contenu ou de son embed ainsi que d'un salon. Tout le reste est une propriété que vous définissez
ensuite, ou que vous laissez de côté.

syntax: roleaction#new-role-builder compact
syntax: roleaction#result compact

## Ce qu'un builder ne fait pas {#what-a-builder-does-not-do}

Les propriétés d'un builder sont en **écriture seule**. Lire `color of {_b}` ne donne rien : une
requête en attente n'a pas d'état lisible. Le côté lisible de chaque propriété est donc l'entité
obtenue à la construction. Lisez plutôt `color of {_role}` après la construction.

Un builder est un **modèle, pas un résultat mis en mémoire**. Lire `the build result of` deux fois sur
le même builder envoie deux requêtes et crée deux entités :

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!twice":
        set {_b} to a new role builder named "Temp" in event-guild
        await set {_first} to the build result of {_b}
        await set {_second} to the build result of {_b}
        reply with "%discord id of {_first}% and %discord id of {_second}%"
```

La validation a lieu au **moment de la construction**, et non lorsque vous définissez une propriété.
Définir un sujet sur un builder de salon vocal, ou une durée d'archivage automatique que Discord
n'accepte pas, ne provoque aucun avertissement : la requête échoue lorsque `the build result of` est
exécuté, et l'échec vous parvient par la [couche d'erreurs](doc:concepts/errors) de DiSky, comme tout
refus de Discord. Quelques contrôles que DiSky peut faire localement (un serveur déjà au plafond de
Discord pour les rôles ou les salons, un message sans rien à envoyer) échouent à cette même ligne,
avant qu'une requête ne parte.

!!! info "Builders et bots"
    Le bot qui envoie la requête est celui auquel appartient le contexte du constructeur : `event-guild`
    ou `event-channel` dans un gestionnaire vu par `"my-bot"` construit avec `"my-bot"`. Les builders
    ne prennent aucun argument de bot.

## Les types de builders {#the-builder-kinds}

Chaque builder ci-dessous suit le contrat décrit plus haut ; seuls le constructeur et les setters
changent. Les formes indiquées sont la syntaxe minimale : `named` accepte aussi `with the name`, et
`in` accepte `in the guild` ou `in the channel` partout.

| Builder | Crée | Forme du constructeur | Guide |
| --- | --- | --- | --- |
| [Rôle](entity:roleaction) | un rôle | `a new role builder named %string% in %guild%` | cette page |
| [Salon textuel](entity:channelaction) | un salon textuel | `a new text channel builder named %string% in %guild%` | plus tard |
| [Salon vocal](entity:channelaction) | un salon vocal | `a new voice channel builder named %string% in %guild%` | plus tard |
| [Salon de conférence](entity:channelaction) | un salon de conférence | `a new stage channel builder named %string% in %guild%` | plus tard |
| [Salon d'annonces](entity:channelaction) | un salon d'annonces | `a new news channel builder named %string% in %guild%` | plus tard |
| [Salon de forum](entity:channelaction) | un salon de forum | `a new forum channel builder named %string% in %guild%` | plus tard |
| [Salon média](entity:channelaction) | un salon média | `a new media channel builder named %string% in %guild%` | plus tard |
| [Catégorie](entity:channelaction) | une catégorie | `a new category builder named %string% in %guild%` | plus tard |
| [Fil public](entity:threadaction) | un fil public | `a new thread builder named %string% in %threadcontainer%` | plus tard |
| [Fil privé](entity:threadaction) | un fil privé | `a new private thread builder named %string% in %threadcontainer%` | plus tard |
| [Fil depuis un message](entity:threadaction) | un fil rattaché à un message | `a new thread builder named %string% from %message%` | plus tard |
| [Publication de forum](entity:forumpostaction) | une publication (fil) dans un salon de forum ou média | `a new post builder named %string% with message content %string% in %forumchannel/mediachannel%` | plus tard |
| [Invitation](entity:inviteaction) | une invitation | `a new invite builder in %guildchannel%` | plus tard |
| [Webhook](entity:webhookaction) | un webhook | `a new webhook builder named %string% in %guildchannel%` | [clients webhook](doc:webhooks/webhook-clients) |
| [Message webhook](entity:webhookmessageaction) | un message envoyé par un webhook | `a new webhook message with content %string% through %webhookclient%` | [envoyer via un webhook](doc:webhooks/posting-through-webhooks) |
| [Règle AutoMod](entity:automodrulebuilder) | une règle AutoMod | `a new automod rule builder named %string% in %guild% for messages using %triggerconfig%` | [créer une règle](doc:automod/creating-rules) |
| [Événement programmé (salon)](entity:scheduledeventaction) | un événement programmé tenu dans un salon vocal ou de conférence | `a new scheduled event builder named %string% in %guildchannel% starting at %date%` | plus tard |
| [Événement programmé (externe)](entity:scheduledeventaction) | un événement programmé tenu à un lieu donné | `a new scheduled event builder named %string% at %string% starting at %date% ending at %date% in %guild%` | plus tard |
| [Message](entity:messageaction) | un message envoyé | `a new message with content %string% in %messagechannel%` ou `a new message with embed %embedbuilder% in %messagechannel%` | [envoyer des messages](doc:messages/sending-messages) |

Deux objets ressemblent à des builders sans suivre ce contrat. Un [sondage](doc:messages/creating-polls)
s'envoie avec `post` ou `reply with` et n'a pas de `build result of` ; un
[builder d'écran d'accueil](doc:guilds/welcome-screen) modifie un écran qui existe déjà, il s'envoie donc
avec l'effet `update the welcome screen using`, qui ne renvoie rien. Contrairement à tous les builders
ci-dessus, les propriétés d'un sondage peuvent aussi être relues.

Chaque type expose la même expression `the build result of %builder%` ; une variable non typée qui
contient l'un de ces builders se résout selon son type à l'exécution, si bien que la chaîne ci-dessous
n'a besoin d'aucun cast. La catégorie revient comme une vraie catégorie, ce qu'attend la propriété
`category` du builder de salon textuel :

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!staff-area":
        set {_cat} to a new category builder named "Staff" in event-guild
        await set {_category} to the build result of {_cat}
        set {_b} to a new text channel builder named "staff-chat" in event-guild
        set category of {_b} to {_category}
        await set {_channel} to the build result of {_b}
        reply with "created %name of {_channel}% under %name of {_category}%"
```

!!! tip "Garder une construction dans un même bloc"
    Gardez ensemble le constructeur, ses setters et la ligne `await`. Un builder conservé dans une
    variable est facile à construire deux fois par erreur, et chaque construction crée une nouvelle
    entité.

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *building talks to Discord, so this requires 'await'* (erreur d'analyse, le script ne se charge pas) | `the build result of` a été lu sans `await` devant la ligne. | Écrivez `await set {_x} to the build result of {_b}`. |
| *IllegalStateException: this guild already has the maximum of 250 roles* (même forme avec *500 channels*) | Le serveur a atteint le plafond de Discord ; DiSky refuse avant d'envoyer la requête. | Supprimez d'abord les rôles ou les salons inutilisés. |
| *IllegalStateException: this message has no content, no embed, no attachment and no component; Discord refuses an empty message* | Un builder de message a été construit sans rien à envoyer. | Donnez-lui un contenu, un embed, une pièce jointe ou un composant avant la construction. |
| Un bloc *Discord error* qui nomme une permission manquante ou un champ invalide | Discord a refusé la requête au moment de la construction (permission **Gérer les rôles** absente, un sujet sur un salon vocal, une valeur invalide). | Corrigez la propriété fautive ; entourez la construction d'un `try` / `catch` pour la gérer dans le script, voir [erreurs](doc:concepts/errors). |
| Aucun message ; `color of {_b}` est vide | Les propriétés d'un builder sont en écriture seule. | Lisez la propriété sur l'entité construite, et non sur le builder. |
