---
title: Récupérer et créer
description: Comment les lignes "retrieve ... and store it in" et "create ... and store it in" de DiSky 4 s'écrivent dans DiSky 5.
source-hash: f8e07bcbb048
---

Cette page couvre le changement qui touche presque tous les scripts DiSky 4 : les lignes qui
finissaient par `and store it in {_var}` n'existent plus. Vous devez déjà avoir un script DiSky 4 à
porter et avoir lu ce que sont [await](doc:concepts/cache-and-await) et
[les builders](doc:concepts/builders) (objets de construction) ; cette page ne fait que faire
correspondre les anciennes lignes à ces notions.

## Retrieve devient await {#retrieving-becomes-await}

DiSky 4 avait un effet `retrieve ... and store it in` par lecture en ligne. Dans DiSky 5, la même
donnée est une simple expression, et l'effet [await](syntax:core/effects#effect-await) placé devant
la ligne la récupère auprès de Discord : `await set {_v} to X`. La fin `[with bot %bot%]` disparaît
aussi, car le bot est déduit de l'entité que vous passez.

DiSky 4 :

```skript
retrieve user with id "000000000000000000" and store it in {_user}
retrieve member with id "000000000000000000" from event-guild and store it in {_member}
retrieve all bans from event-guild and store them in {_bans::*}
retrieve the owner of event-guild and store it in {_owner}
```

DiSky 5 :

```skript
await set {_user} to user with id "000000000000000000"
await set {_member} to member with id "000000000000000000" in event-guild
await set {_bans::*} to bans of event-guild
await set {_owner} to discord owner of event-guild
```

Certaines lectures ont un côté cache (copie en mémoire). [`user with id`](syntax:user#user-with-id)
et [`member with id`](syntax:member#member-with-id) répondent depuis le cache sans `await` et
interrogent Discord avec ; `bans`, `invites`, `pinned messages` et le reste de la liste des lectures
en ligne uniquement n'ont pas de cache, donc elles ont besoin de `await` pour être analysées. Les deux
cas sont détaillés dans [cache et await](doc:concepts/cache-and-await).

| DiSky 4 | DiSky 5 |
| --- | --- |
| `retrieve user with id %string% and store it in %~objects%` | `await set {_u} to user with id %string%` |
| `retrieve member with id %string% from %guild% and store it in ...` | `await set {_m} to member with id %string% in %guild%` |
| `retrieve message with id %string% from %channel% and store it in ...` | `await set {_m} to message with id %string% in %messagechannel%` |
| `retrieve last %number% messages of %channel% and store them in ...` | `await set {_m::*} to the last %number% messages of %messagechannel%` |
| `retrieve pinned messages of %channel% and store them in ...` | `await set {_p::*} to pinned messages of %messagechannel%` |
| `retrieve bans from %guild% and store them in ...` | `await set {_b::*} to bans of %guild%` |
| `retrieve the owner of %guild% and store it in ...` | `await set {_o} to discord owner of %guild%` |

`owner of` est l'expression propre à Skript, ce qui explique que le nom DiSky 5 contienne le mot
`discord`. La récupération d'une invitation par identifiant et les nombres de membres par rôle n'ont
pas d'équivalent dans DiSky 5 : lisez `invites of` le serveur et filtrez.

## Create devient un builder {#creating-becomes-a-builder}

Une ligne DiSky 4 `create ... and store it in`, ou une section `create`, remplissait une requête et
l'envoyait en une seule fois. Dans DiSky 5, vous créez un builder, vous définissez ses propriétés une
ligne chacune, puis vous lisez [`the build result of`](syntax:roleaction#result) avec `await` : cette
dernière ligne est la seule qui parle à Discord. Tout ce que Discord fige à la création (le nom et le
serveur d'un rôle, le parent d'un fil) passe dans le constructeur.

DiSky 4 :

```skript
set {_a} to a new text channel action in event-guild
set channel name of {_a} to "support"
set channel topic of {_a} to "Ask here"
set channel parent of {_a} to {_category}
create the action {_a} and store the channel in {_channel}
```

DiSky 5 :

```skript
set {_b} to a new text channel builder named "support" in event-guild
set topic of {_b} to "Ask here"
set category of {_b} to {_category}
await set {_channel} to the build result of {_b}
```

Les propriétés d'un builder sont en écriture seule et il construit une fois par lecture : gardez donc
ensemble le constructeur, les setters et la ligne `await` ; le contrat est décrit sur la page
[builders](doc:concepts/builders).

| DiSky 4 | Constructeur DiSky 5 |
| --- | --- |
| `a new role in %guild%` (section) / `a new role action in %guild%` | `a new role builder named %string% in %guild%` |
| `a new text channel action in %guild%` (aussi vocal, catégorie, forum, annonces, conférence) | `a new text channel builder named %string% in %guild%` |
| `create thread named %string% in %channel% and store it in ...` | `a new thread builder named %string% in %threadcontainer%` |
| `create private thread named %string% in %channel% ...` | `a new private thread builder named %string% in %threadcontainer%` |
| `create thread named %string% ... with message %message% ...` | `a new thread builder named %string% from %message%` |
| `create post in %forumchannel% named %string% with message %string% ...` | `a new post builder named %string% with message content %string% in %forumchannel/mediachannel%` |
| `create invite in %guild/channel% with max uses %number% and store it in ...` | `a new invite builder in %guildchannel%`, puis `set invite max uses of {_b} to %number%` |
| `create scheduled event named %string% in %guildchannel% at %date% and store it in ...` | `a new scheduled event builder named %string% in %guildchannel% starting at %date%` |
| `create emote named %string% with url %string% in %guild% and store it in ...` | `a new emote builder named %string% with image %string% in %guild%` |

Deux cas changent de forme plus que les autres. Une invitation appartient désormais à un salon, donc
`create invite in event-guild` n'a pas de forme directe ; choisissez un salon. Et l'image d'un émoji
personnalisé est lue quand le builder est construit, qu'il s'agisse d'une URL, d'un chemin de fichier
ou d'un envoi de fichier.

```skript
# DiSky 4: create invite in event-channel with max uses 10 and store it in {_inv}
set {_b} to a new invite builder in event-channel
set invite max uses of {_b} to 10
await set {_inv} to the build result of {_b}
```

Les créations sous forme de section suivent la même règle : le corps de la section devient une ligne
`set` par entrée, et le `and store it in` final devient la ligne `await`. Une section de règle AutoMod
DiSky 4 devient un `new automod rule builder`, une configuration de déclencheur et des expressions
d'action (voir [créer une règle](doc:automod/creating-rules)) ; la section d'écran d'accueil devient un
`new welcome screen builder` suivi de `update the welcome screen using` (voir
[l'écran d'accueil](doc:guilds/welcome-screen)). Aucun des deux n'a de `build result of` à stocker.

## Conserver un message envoyé {#keeping-a-sent-message}

DiSky 4 laissait `post` et `reply with` renvoyer le message qu'ils avaient envoyé. DiSky 5 n'a pas de
`and store it in` sur aucun effet, pas même sur le `post` de webhook. Pour conserver le message envoyé,
construisez vous-même un message : le builder de message est le seul builder dont le résultat de la
construction est le message qui vient d'être envoyé.

DiSky 4 :

```skript
create a new message and store it in {_msg}:
    set the content of the message to "hello world"
    add {_embed} to the embeds of message
post {_msg} to event-channel and store it in {_sent}
```

DiSky 5 :

```skript
set {_b} to a new message with content "hello world" in event-channel
add {_embed} to embeds of {_b}
await set {_sent} to the build result of {_b}
```

Le salon fait partie du constructeur, donc le message part sur la ligne `await` et `{_sent}` est un
message ordinaire que vous pouvez `edit`, auquel vous pouvez réagir ou que vous pouvez épingler. Une
réponse est le même builder avec `set referenced message of {_b} to event-message`. Quand vous n'avez
pas besoin de récupérer le message, `post "hello" to event-channel` et `reply with "hello"` restent
inchangés.

| DiSky 4 | DiSky 5 |
| --- | --- |
| `post %string% to %channel% and store it in {_m}` | `await set {_m} to the build result of (a new message with content %string% in %messagechannel%)` |
| `post %embed% to %channel% and store it in {_m}` | `await set {_m} to the build result of (a new message with embed %embedbuilder% in %messagechannel%)` |
| `reply with %string% and store it in {_m}` | le même builder dans `event-channel`, plus `referenced message` |
| `reply with hidden ... and store it in {_m}` | pas de remplacement : une réponse masquée ne peut pas être récupérée |

## Récupérer une valeur de l'événement {#retrieving-an-event-value}

`retrieve event-value "member" and store it in {_m}` n'existe plus. Une valeur qui a besoin de
Discord, comme un membre qu'il faut aller chercher, est récupérée avant le déclenchement de
l'événement et exposée comme une simple valeur `event-`, donc vous lisez `event-member` directement,
sans `await`. Voir [événements](doc:migration/events) pour la correspondance complète et
[événements](doc:concepts/events) pour savoir comment les valeurs parviennent à un gestionnaire.

```skript
on member joined:
    send "Welcome %event-member%" to console
```

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

Une ligne DiSky 4 portée à moitié échoue au chargement. Voici les messages affichés par DiSky 5.

| Message (console) | Cause | Correction |
| --- | --- | --- |
| *the 'bans' property is online-only and requires 'await' to be read* | Une propriété en lecture seule en ligne a été lue sans `await` | Écrivez `await set {_b::*} to bans of event-guild` |
| *the 'message with id' getter is online-only and requires 'await'* | `message with id` a été utilisé sans `await` | Préfixez la ligne avec `await` |
| *building talks to Discord, so this requires 'await'* | `the build result of` un builder a été lu sans `await` | Écrivez `await set {_x} to the build result of {_b}` |
| *Can't understand this condition/effect: retrieve ...* | L'ancien effet `retrieve ... and store it in` n'existe plus | Réécrivez-le avec `await set` |
| *Can't understand this condition/effect: create ...* | L'ancien effet `create ... and store it in` n'existe plus | Utilisez un builder et `the build result of` |
