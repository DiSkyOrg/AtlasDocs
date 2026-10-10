---
title: Création de sondages
description: Construire un sondage avec sa question, ses réponses et sa durée, puis l'envoyer seul ou sur un message.
source-hash: 14d873b48b97
---

Cette page couvre la construction d'un sondage et son envoi : seul avec `post` ou `reply with`, ou
attaché à un builder (objet de construction) de message. La lecture d'un sondage, sa clôture et ses
événements de vote sont traités sur la page [sondages](doc:messages/polls). Vous devez déjà avoir un bot
nommé `"my-bot"` connecté et savoir comment fonctionne [l'envoi de messages](doc:messages/sending-messages).

## Construction d'un sondage {#how-a-poll-is-built}

[`a new poll titled %string%`](syntax:pollbuilder#new-poll) crée un sondage à partir de sa question.
Ajoutez-y ses réponses dans [`poll answer drafts`](syntax:pollbuilder#poll-answer-drafts), puis
transmettez-le à [`post`](syntax:core/effects#post) ou
[`reply with`](syntax:core/effects#effect-reply-with) comme tout autre contenu. `with` et `asking`
fonctionnent à la place de `titled`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!lunch":
        set {_poll} to a new poll titled "Where do we eat?"
        add "Pizza", "Burgers" and "Sushi" to poll answer drafts of {_poll}
        post {_poll} to event-channel
```

Un sondage n'est pas un [builder](doc:concepts/builders) au sens strict : il n'a pas de
`build result of`, et son envoi ne nécessite jamais `await`. Il est vérifié au moment de son envoi ou
de son attachement ; un sondage sans réponse échoue donc sur cette ligne, et non sur celle qui l'a
créé. Le sondage envoyé est une copie : modifier `{_poll}` ensuite ne change rien sur Discord, et le
même sondage peut être envoyé deux fois.

syntax: pollbuilder#new-poll compact

## Options {#options}

| Propriété | Par défaut | Valeurs acceptées |
| --- | --- | --- |
| [poll question](syntax:pollbuilder#poll-question) | la question passée au constructeur | jusqu'à 300 caractères |
| [poll answer drafts](syntax:pollbuilder#poll-answer-drafts) | aucune | de 1 à 10 réponses ; `set`, `add`, `remove` |
| [poll duration](syntax:pollbuilder#poll-duration) | `24 hours` | de `1 hour` à `7 days` |
| [multi answer](syntax:pollbuilder#multi-answer) | `false` | `true` : les votants peuvent choisir plusieurs réponses |

Contrairement à la plupart des builders, ces propriétés peuvent être relues : un script peut donc
vérifier le sondage avant de l'envoyer.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!vote":
        set {_poll} to a new poll asking "Which features next?"
        add "Music" and "Levels" to poll answer drafts of {_poll}
        set poll duration of {_poll} to 3 days
        set multi answer of {_poll} to true
        reply with "%size of poll answer drafts of {_poll}% options, open for %poll duration of {_poll}%"
        reply with {_poll}
```

## Réponses avec émoji {#answers-with-an-emoji}

Un simple texte ajouté à `poll answer drafts` devient une réponse sans émoji. Pour un émoji, ajoutez
plutôt [`a new poll answer with text %string% with emoji %emote/string%`](syntax:pollanswerdata#new-answer) :
l'émoji est un émoji unicode, un émoji personnalisé, ou la forme `<:name:id>` d'un
émoji personnalisé.

```skript
set {_poll} to a new poll titled "Favorite food?"
add (a new poll answer with text "Pizza" with emoji "🍕") to poll answer drafts of {_poll}
add (a new poll answer with text "Sushi" with emoji "🍣") to poll answer drafts of {_poll}
remove "Pizza" from poll answer drafts of {_poll}
```

`remove` retrouve les réponses par leur texte, qu'elles aient été ajoutées comme texte ou comme objet
de réponse. Un objet de réponse peut encore être modifié via
[draft answer text](syntax:pollanswerdata#draft-answer-text) et
[draft answer emoji](syntax:pollanswerdata#draft-answer-emoji) avant d'être ajouté ; une fois ajouté,
le sondage conserve sa propre copie.

syntax: pollanswerdata#new-answer compact

## Sondages sur un builder de message {#polls-on-a-message-builder}

`post` et `reply with` oublient le message qu'ils envoient. Pour le conserver, afin de clore le sondage
plus tard ou de lire ses votants, définissez [`attached poll`](syntax:messageaction#attached-poll) sur un
[builder de message](sending-messages.md#building-a-message) puis construisez-le : le sondage part avec
le contenu du message.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!poll-kept":
        set {_poll} to a new poll titled "Ship it?"
        add "Yes" and "No" to poll answer drafts of {_poll}
        set {_m} to a new message with content "Release vote" in event-channel
        set attached poll of {_m} to {_poll}
        await set {_sent} to the build result of {_m}
        set {poll::release} to {_sent}
```

Un message ne porte qu'un seul sondage au maximum : définir `attached poll` une nouvelle fois remplace le
précédent. Un sondage ne peut pas partager un message avec des composants v2 (conteneurs, sections,
affichages de texte).

syntax: messageaction#attached-poll compact

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *a poll needs at least one answer* | Le sondage a été envoyé avec un `poll answer drafts` vide | Ajoutez des réponses avant l'envoi |
| *a poll holds at most 10 answers, this one has \<n>* | Trop de réponses | Retirez-en, ou découpez-les en deux sondages |
| *a poll lasts between 1 hour and 168 hours (7 days), this one lasts \<n> hours* | `poll duration` est hors limites | Choisissez une durée entre 1 heure et 7 jours |
| *the poll question is \<n> characters long, the maximum is 300* | La question est trop longue | Raccourcissez-la |
| *the poll answer "..." is \<n> characters long, the maximum is 55* | Une réponse est trop longue | Raccourcissez-la |

entity: pollbuilder
