---
title: Sondages
description: Lire un sondage attaché à un message, lister ses votants, le terminer avant son échéance et réagir aux votes.
source-hash: 1290991b6d6f
---

Cette page couvre un sondage déjà publié sur Discord : lire sa question et ses réponses, lister les
personnes qui ont voté, le terminer avant son échéance, et réagir aux votes au fur et à mesure. L'envoi
d'un sondage est traité sur la page [création de sondages](doc:messages/creating-polls). Vous devez
déjà avoir un bot nommé `"my-bot"` connecté et savoir [lire un message](doc:messages/managing-messages).

## Fonctionnement des sondages {#how-polls-work}

[`has a poll`](syntax:message#a-poll) indique si un message porte un sondage ; si c'est le cas,
[`poll of`](syntax:message#poll) appliqué au message renvoie un `messagepoll` avec un `poll question`
et une liste de `poll answers`, ainsi que [multi answer](syntax:messagepoll#multi-answer),
[poll layout](syntax:messagepoll#poll-layout) et
[poll expiration date](syntax:messagepoll#poll-expiration-date).

```skript
on message received seen by "my-bot":
    if event-message has a poll:
        set {_poll} to poll of event-message
        reply with "%poll question of {_poll}%"
        loop poll answers of {_poll}:
            reply with "%answer text of loop-value%: %answer votes of loop-value% votes"
```

## Réponses {#answers}

Chaque élément de `poll answers` est un `pollanswer`.

| Propriété | Renvoie |
| --- | --- |
| [answer text](syntax:pollanswer#answer-text) | le texte de l'option |
| [answer votes](syntax:pollanswer#answer-votes) | le nombre de votes reçus, sous forme de nombre simple |
| [answer emote](syntax:pollanswer#answer-emote) | l'émoji affiché à côté, si le sondage en a un ; rien sinon |
| [answer id](syntax:pollanswer#answer-id) | son numéro, à partir de 1, dans l'ordre où les réponses ont été déclarées |
| [answer self voted](syntax:pollanswer#answer-self-voted) | indique si le bot lui-même a voté pour elle |

`answer votes` n'a jamais besoin de `await` : le décompte voyage avec le message lui-même, et non dans
une requête séparée. `answer emote` s'affiche sous forme d'émoji, il peut donc être inséré directement
dans un message.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!poll-winner":
        set {_poll} to poll of event-message
        set {_best} to first element of (poll answers of {_poll})
        loop poll answers of {_poll}:
            if answer votes of loop-value > answer votes of {_best}:
                set {_best} to loop-value
        reply with "leading: %answer text of {_best}% (%answer votes of {_best}%)"
```

## Lister les votants {#listing-voters}

[`voters of poll answer %number/pollanswer% of %message%`](syntax:core/expressions#expression-poll-voters)
liste les utilisateurs ayant choisi une réponse. La réponse est un `pollanswer` ou son `answer id` ; le
message est celui qui porte le sondage, et non le sondage lui-même. La liste est récupérée depuis
Discord, en totalité (toutes les pages), la ligne nécessite donc `await`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!voters":
        set {_m} to {poll::release}
        loop poll answers of (poll of {_m}):
            await set {_voters::*} to the voters of poll answer loop-value of {_m}
            reply with "%answer text of loop-value%: %{_voters::*}%"
            delete {_voters::*}
```

`{poll::release}` contient un message envoyé depuis un [builder de message](doc:messages/creating-polls),
seule façon de conserver le message d'un sondage. Un numéro de réponse inexistant produit une erreur
lisible (*this poll has no answer numbered \<n>*).

syntax: core/expressions#expression-poll-voters compact

## Terminer un sondage {#ending-a-poll}

[`end the poll of`](syntax:message#end-poll) clôt un sondage avant son échéance ; personne ne peut
voter après l'exécution de cette ligne.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!end-poll":
        end the poll of event-message
```

[`is expired`](syntax:messagepoll#expired) est vrai une fois l'échéance du sondage passée et que plus
aucun vote n'est accepté ; [`is finalized`](syntax:messagepoll#finalized) est vrai une fois que Discord
a considéré les décomptes comme définitifs, ce que fait aussi immédiatement `end the poll of`.
`end the poll of` refuse un message sans sondage, ainsi qu'un sondage déjà expiré ou finalisé.

syntax: message#end-poll compact

## Événements de vote {#vote-events}

[`on message poll vote added`](event:events#poll-vote-add) et
[`on message poll vote removed`](event:events#poll-vote-remove) se déclenchent pour chaque vote.
`event-message`, `event-member` et `event-user` sont récupérés depuis Discord avant le démarrage du
trigger ; aucun n'a donc besoin de `await` (voir [cache et await](doc:concepts/cache-and-await)).
`event-member` vaut none pour un vote effectué en message privé.

| Événement | Valeurs |
| --- | --- |
| `on message poll vote added` | `event-channel`, `event-guild`, `event-member`, `event-user`, `event-message` |
| `on message poll vote removed` | `event-channel`, `event-guild`, `event-member`, `event-user`, `event-message` |

```skript
on message poll vote added seen by "my-bot":
    send "%event-user% voted on a poll in %event-channel%" to console
```

Aucun des deux événements ne précise quelle réponse a été votée : seulement qui a voté, et sur quel
message. Consultez les [votants](#listing-voters) de chaque réponse si vous avez besoin de savoir
quelle option a changé.

event: events#poll-vote-add compact

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *IllegalStateException: this message carries no poll* | `end the poll of` a été appelé sur un message sans sondage | Vérifiez d'abord avec [`has a poll`](syntax:message#a-poll) |
| *IllegalStateException: this poll is already over* | `end the poll of` a été appelé sur un sondage déjà expiré ou finalisé | Vérifiez `is expired`/`is finalized` avant l'appel, ou n'appelez cette ligne qu'une seule fois |

entity: messagepoll
