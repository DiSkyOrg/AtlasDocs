---
title: Réactions
description: Réagir à un message, retirer une réaction et lire les réactions que Discord enregistre sur celui-ci.
source-hash: e5dfb6d479bd
---

Cette page couvre l'ajout d'une réaction à un message, son retrait, les événements déclenchés lorsqu'un
utilisateur réagit, et la lecture des réactions déjà présentes sur un message. Vous devez déjà avoir
un bot nommé `"my-bot"` connecté et savoir [envoyer un message](doc:messages/sending-messages).

## Fonctionnement des réactions {#how-reactions-work}

[`react to`](syntax:message#react) ajoute une ou plusieurs réactions à un message, au nom du bot. Il
accepte une liste d'émojis unicode, d'émojis personnalisés, ou les deux mélangés.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!react":
        react to event-message with "✅"
```

Chaque élément de la liste est soit un texte, soit une valeur `emote`. Un texte est lu comme un
caractère émoji unicode, ou comme la forme `<:name:id>` (ou `<a:name:id>` pour un émoji animé) d'un
émoji personnalisé ; une valeur `emote` réagit directement avec l'émoji personnalisé, et c'est le
choix le plus sûr, car il ne dépend jamais de la bonne écriture d'un texte. Obtenez-la avec
`emojis of` d'un serveur (depuis le cache, copie en mémoire) ou `mentioned emotes of` d'un message ;
utilisez `await set` avec `emotes of` d'un serveur lorsque vous avez besoin de la liste à jour (voir
[cache et await](doc:concepts/cache-and-await)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!react-emote":
        set {_emote} to first element of (emojis of event-guild)
        react to event-message with {_emote}
        react to event-message with ("👍" and {_emote})
```

syntax: message#react compact

## Retirer des réactions {#removing-reactions}

[`suppress`](syntax:emote#suppress-reactions) retire une réaction d'un message : utilisé seul, il
retire la réaction du bot ; suivi d'un utilisateur, il retire celle de cet utilisateur.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!unreact":
        set {_emote} to first element of (emojis of event-guild)
        suppress {_emote} from event-message
        suppress {_emote} of event-user from event-message
```

!!! warning "Seule une valeur d'émoji personnalisé fonctionne ici"
    `suppress` prend une valeur `emote`, pas un texte : il n'existe aucun moyen de lui passer un
    émoji unicode brut comme `"✅"`. Obtenez l'émoji personnalisé avec `emojis of` du serveur ou
    `mentioned emotes of` du message, comme ci-dessus. Il n'existe pas non plus d'effet pour effacer
    d'un coup toutes les réactions d'un message en v5 ; `suppress` cible toujours un seul émoji
    personnalisé (et éventuellement un seul utilisateur) par ligne.

syntax: emote#suppress-reactions compact

## Événements de réaction {#reaction-events}

[`on reaction add`](event:events#reaction-add) et [`on reaction remove`](event:events#reaction-remove)
se déclenchent pour chaque réaction ; `on reaction remove
all` se déclenche une seule fois lorsque toutes les réactions sont retirées d'un message d'un coup. `reaction message` est récupéré depuis
Discord avant le démarrage du trigger, il n'a donc jamais besoin de `await` (voir
[cache et await](doc:concepts/cache-and-await)).

| Événement | Valeurs |
| --- | --- |
| `on reaction add` | `event-channel`, `event-guild`, `event-member`, `event-user`, `reaction message` |
| `on reaction remove` | `event-channel`, `event-guild`, `event-member`, `event-user`, `reaction message` |
| `on reaction remove all` | `event-channel`, `event-guild`, `reaction message` |

```skript
on reaction add seen by "my-bot":
    send "%event-user% reacted to '%discord content of reaction message%'" to console
```

En v5, la réaction elle-même n'a pas encore de type `Emote` ; aucun des trois événements ne vous
indique donc quel émoji a été ajouté ou retiré, seulement qui a réagi et sur quel message.

event: events#reaction-add compact

## Lire les réactions {#reading-reactions}

[`reactions of`](syntax:message#reactions) d'un message renvoie un élément par émoji distinct utilisé.
Aucune de ses propriétés n'est exposée en v5 (ni l'émoji, ni le nombre) ; la liste n'est donc utile
que pour sa taille.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!reaction-count":
        reply with "%size of reactions of event-message% distinct reaction(s)"
```

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *[10014] Unknown Emoji* | `react to` a reçu un émoji personnalisé qui n'existe plus, ou un identifiant d'émoji non formaté | Utilisez une valeur `emote` fraîche obtenue avec `emojis of` ou `mentioned emotes of`, et non un identifiant saisi à la main |
| *[50013] Missing Permissions* | Le rôle du bot n'a pas **Add Reactions** dans ce salon | Accordez **Add Reactions** au rôle du bot |
