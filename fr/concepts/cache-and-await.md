---
title: Cache et await
description: Ce que contient le cache, les trois règles qui déterminent quand une ligne a besoin de await, et les lectures qui en ont toujours besoin.
source-hash: 84dcd78f3c1d
---

Cette page explique d'où provient la valeur d'une propriété (le cache du bot ou un appel à Discord) et
l'effet [`await`](syntax:core/effects#effect-await) qui en décide. Vous devez avoir un bot connecté
sous le nom `"my-bot"`, et savoir comment une propriété se lit et s'écrit (voir
[Entités et propriétés](doc:concepts/entities-and-properties)).

## Fonctionnement du cache {#how-the-cache-works}

Lorsqu'un bot se connecte, il conserve en mémoire une copie des serveurs, salons, rôles et membres qu'il
peut voir : cette copie est le cache (copie en mémoire). Lire une propriété comme `name of event-guild`
ou `roles of event-member` répond immédiatement à partir du cache, sur le thread principal, sans
contacter Discord. Ce que contient le cache dépend des intents du bot, de sa politique de cache des
membres et de ses drapeaux de cache, qui se règlent avant la connexion et sont décrits sur la page
[options du bot](doc:getting-started/bot-options).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!cached":
        reply with "%name of event-guild% has %size of roles of event-member% roles here"
```

Certaines valeurs ne sont jamais mises en cache, car Discord ne les envoie pas aux bots : bannissements,
invitations, journaux d'audit, messages épinglés, profil d'un utilisateur. Lire l'une d'elles revient à
demander à Discord via son API REST, ce qui prend un aller-retour réseau et ne doit pas bloquer le thread
principal du serveur. C'est à cela que sert `await`.

## Les trois règles de await {#the-three-rules-of-await}

`await` s'écrit devant une ligne entière. Il exécute cette ligne sur un thread de travail, attend la
réponse de Discord, puis reprend le trigger (bloc de code) avec le résultat. Les lignes qui acceptent await, et celles
qui en ont besoin, dépendent du type de syntaxe présent sur la ligne.

| Type de syntaxe | Sans await | Avec await | Exemple |
| --- | --- | --- | --- |
| Un effet (`post`, `kick`, `destroy`, `edit`...) | Attend déjà Discord avant que la ligne suivante ne s'exécute | Accepté, avec un avertissement d'analyse indiquant qu'il est superflu | `post "hello" to event-channel` |
| Une lecture réservée à la récupération (voir le tableau plus bas) | Erreur d'analyse : le script ne se charge pas | Récupère la valeur auprès de Discord | `await set {_bans::*} to bans of event-guild` |
| Une lecture accessible avec await (cache et REST existent tous deux) | Cache : immédiat, peut être vide | Récupère la valeur fraîche auprès de Discord | `await set {_owner} to discord owner of event-guild` |

Les effets sont asynchrones par nature : `post` envoie le message hors du thread principal, et le trigger
continue une fois que Discord a confirmé l'envoi, si bien que `await` n'y ajoute rien. Ce sont les
lectures qui demandent un choix :

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!owner":
        set {_cached} to discord owner of event-guild
        await set {_fresh} to discord owner of event-guild
        reply with "cached: %{_cached}%, fresh: %{_fresh}%"
```

La première ligne `discord owner` lit le cache et ne renvoie rien si le propriétaire n'y figure pas (un
propriétaire hors ligne avec la politique de cache des membres `"online"`, par exemple). La seconde
demande la valeur à Discord et renvoie toujours le membre. Les deux écritures sont valides : choisissez
le cache lorsque vous lisez souvent et que vous acceptez une absence, `await` lorsque la valeur doit
impérativement être présente.

Une propriété accessible avec await est celle que l'atlas marque comme telle : les
[membres](syntax:guild#members) d'un serveur, son [propriétaire Discord](syntax:guild#discord-owner),
[utilisateur avec id](syntax:user#user-with-id) et [membre avec id](syntax:member#member-with-id) sont
ceux que vous rencontrerez en premier ; la page [obtenir des entités par identifiant](doc:concepts/getting-by-id)
traite des deux derniers.

syntax: core/effects#effect-await compact

## Lectures réservées à la récupération {#retrieve-only-reads}

Ces propriétés n'ont aucun cache. Discord ne les fournit que sur demande, donc lire l'une d'elles sans
`await` provoque une erreur d'analyse qui nomme la propriété, et le script ne se charge pas tant que la
ligne n'est pas corrigée. Chacune renvoie une valeur fraîche à chaque exécution.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!audit":
        await set {_bans::*} to bans of event-guild
        await set {_pins::*} to pinned messages of event-channel
        reply with "%size of {_bans::*}% bans, %size of {_pins::*}% pinned messages"
```

| Propriété | Entité | Renvoie |
| --- | --- | --- |
| [application info](syntax:bot#application-info) | bot | l'application à laquelle le bot appartient |
| [invites](syntax:guild#invites) | serveur | toutes les invitations du serveur |
| [webhooks](syntax:guild#webhooks) | serveur | tous les webhooks du serveur |
| [emotes](syntax:guild#emotes) | serveur | les émojis personnalisés du serveur |
| [bans](syntax:guild#bans) | serveur | les 1 000 premiers bannissements |
| [active threads](syntax:guild#active-threads) | serveur | les fils non encore archivés |
| [audit logs](syntax:guild#audit-logs) | serveur | les entrées du journal d'audit |
| [profile](syntax:user#profile) | utilisateur | la bannière et la couleur de profil |
| [private channel](syntax:user#private-channel) | utilisateur | le salon privé (MP) avec l'utilisateur, ouvert si besoin |
| [interested members](syntax:scheduledevent#interested-members) | événement programmé | les membres ayant cliqué sur *Intéressé* |
| [pinned messages](syntax:messagechannel#pinned-messages) | n'importe quel salon de messages | les messages épinglés |
| [channel webhooks](syntax:standardguildmessagechannel#channel-webhooks) | salon textuel ou d'annonces | les webhooks propres au salon |
| [thread members](syntax:threadchannel#thread-members) | salon de fil | les membres ayant rejoint le fil |
| [start message](syntax:threadchannel#start-message) | salon de fil | le message à partir duquel le fil a été créé |
| [archived threads](syntax:threadcontainer#archived-threads) | salon textuel, d'annonces ou de forum | les fils publics archivés |
| [archived private threads](syntax:threadcontainer#archived-private-threads) | salon textuel, d'annonces ou de forum | les fils privés archivés |
| [the build result of](syntax:roleaction#result) | n'importe quel builder (objet de construction) | l'entité créée par le builder |
| [message with id](syntax:message#message-with-id) | salon de messages | un message, par identifiant |

`the build result of` est la ligne où un [builder](doc:concepts/builders) crée réellement son objet sur
Discord, ce qui explique sa présence dans cette liste.

## Attendre un changement {#awaiting-a-change}

`await` s'applique aussi à l'écriture d'une propriété. Sans lui, un changement qui passe par Discord
(`set nickname of`, `add ... to roles of`, `add ... to flags of`) est envoyé, et le trigger continue avant
que Discord ne l'ait confirmé ; une lecture sur la ligne suivante peut encore voir l'ancienne valeur. Avec
`await`, la ligne bloque jusqu'à ce que Discord ait appliqué le changement, si bien que la lecture suivante
voit le nouvel état.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!verify":
        await add bypasses verification to flags of event-member
        reply with "flags now: %flags of (member with id (discord id of event-member) in event-guild)%"
```

La même règle vaut pour chaque propriété que l'atlas marque comme passant par REST : les rôles, les
drapeaux, le pseudo, le sujet d'un salon ou le salon AFK d'un serveur. Un `set` simple suffit lorsque rien
ne relit la valeur dans le même trigger.

## Threads et temporisation {#threads-and-timing}

La ligne qui suit `await` s'exécute sur un thread de travail, où attendre Discord est sans danger ; une fois
celle-ci terminée, le trigger reprend sur le thread principal avec ses variables locales intactes. Rien de ce
que vous écrivez après `await` ne s'exécute donc hors du thread principal. Skript traite tout ce qui suit un
`await` comme différé, exactement comme le code qui suit un effet `wait`. Une erreur DiSky levée dans la ligne
attendue (un identifiant inconnu, une permission manquante) est signalée de façon lisible dans la console, sans
faire planter le serveur, et peut être interceptée avec `try` (voir [Erreurs](doc:concepts/errors)).

!!! info "Venant de la v4"
    Les effets `retrieve X and store it in {_var}` ont disparu : chacun d'eux est désormais une lecture de
    propriété, écrite `await set {_var} to X`.

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *the 'bans' property is online-only and requires 'await' to be read* (même formulation pour chaque propriété du tableau ci-dessus) | Une propriété réservée à la récupération a été lue sur une ligne sans `await` | Préfixez la ligne : `await set {_bans::*} to bans of event-guild` |
| *building talks to Discord, so this requires 'await'* | `the build result of` d'un builder a été lu sans `await` | Écrivez `await set {_role} to the build result of {_builder}` |
| *the 'message with id' getter is online-only and requires 'await'* | `message with id` a été utilisé sans `await` | Préfixez la ligne avec `await` |
| *This effect is already async; 'await' is redundant here.* (avertissement, le script se charge tout de même) | `await` a été placé devant un effet | Retirez le `await` ; l'effet attend déjà par lui-même |
