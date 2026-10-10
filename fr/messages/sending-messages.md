---
title: Envoyer des messages
description: Envoyer dans un salon, répondre à l'événement en cours, ou construire un message que vous pourrez modifier et épingler plus tard.
source-hash: 096c18e2bd26
---

Cette page couvre les trois façons de publier un message sur Discord : `post`, `reply with` et le
builder de message. Vous devez déjà avoir un bot nommé `"my-bot"` connecté, et connaître le
[contrat des builders](doc:concepts/builders) (objets de construction) ainsi que les
[trois règles de `await`](doc:concepts/cache-and-await).

## Fonctionnement de l'envoi {#how-sending-works}

[`post`](syntax:core/effects#post) envoie un texte, un embed ou un composant dans un salon que vous
indiquez. [`reply with`](syntax:core/effects#effect-reply-with) envoie les mêmes types de contenu,
mais choisit lui-même le salon : celui où l'événement en cours s'est produit. Ni l'un ni l'autre ne
vous renvoie le message envoyé ; pour l'obtenir, construisez-le d'abord (voir ci-dessous).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!post":
        post "plain text from DiSky" to event-channel
```

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!reply":
        reply with "replied in the event channel"
```

Dans un événement de message, `reply with` poste dans `event-channel`, exactement comme dans
l'exemple ci-dessus ; dans un événement d'interaction, il répond à l'interaction à la place, et
`hidden` rend cette réponse éphémère (seul l'utilisateur qui a déclenché l'interaction la voit, et
l'option ne fait rien en dehors des interactions). Ajoutez une référence pour relier la réponse à un
message, comme le fait la fonction de réponse de Discord :

```skript
reply with "replied with a reference" with reference event-message
```

syntax: core/effects#effect-reply-with compact

## Envoyer dans un salon {#posting-to-a-channel}

`post` et `dispatch` sont le même effet sous deux noms ; choisissez celui qui se lit le mieux. Il
accepte un texte, un [embed](doc:messages/embeds), un composant ou un sondage, et envoie dans
n'importe quel [salon de messages](entity:messagechannel) que vous lui donnez, et pas seulement
`event-channel` :

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!echo":
        set {_target} to event-channel
        post "posted from a variable" to {_target}
        dispatch "same effect, different name" in {_target}
```

!!! info "Les sondages passent par les mêmes effets"
    `post` et `reply with` acceptent aussi un sondage construit avec `a new poll titled ...`, et un
    builder de message le transmet via `attached poll`. Voir [créer des sondages](doc:messages/creating-polls).

syntax: core/effects#post compact

## Construire un message {#building-a-message}

[`a new message with content %string% in %messagechannel%`](syntax:messageaction#new-message-with-content)
et `a new message with embed %embedbuilder% in %messagechannel%` créent un builder de message : il
suit le même contrat que tous les autres builders, donc rien n'est envoyé tant que vous ne lisez pas
`the build result of` dessus, ce qui exige `await`. Ce qui revient est un vrai message, déjà envoyé :
vous pouvez le modifier, l'épingler ou lire n'importe laquelle de ses propriétés.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!edit":
        set {_m} to a new message with content "before" in event-channel
        await set {_sent} to the build result of {_m}
        edit {_sent} to show "after"
```

`reply with {_m}` accepte aussi un builder de message, en raccourci : il renvoie le contenu, les
embeds, les pièces jointes et le sondage du builder via le salon ou l'interaction de l'événement, sans
jamais le construire avec `the build result of`, donc vous ne récupérez aucun message. Il ignore le
salon propre au builder, et ne reprend ni `tts`, ni `suppressed notifications`, ni le
`referenced message` du builder ; utilisez `with reference` sur `reply with` lui-même pour cela.

```skript
set {_m} to a new message with content "reply from a builder" in event-channel
reply with {_m} with reference event-message
```

syntax: messageaction#result compact

## Options {#options}

Chaque propriété ci-dessous est en écriture seule sur le builder : relisez-la sur le message envoyé.

| Propriété | Défaut | Valeurs acceptées |
| --- | --- | --- |
| [discord content](syntax:messageaction#discord-content) | aucune | n'importe quel texte |
| [embed](syntax:messageaction#embed) | aucun | un [embed](doc:messages/embeds) |
| [attached poll](syntax:messageaction#attached-poll) | aucun | un [sondage](doc:messages/creating-polls) |
| [tts](syntax:messageaction#tts) | `false` | `true`, `false` |
| [suppressed embeds](syntax:messageaction#suppressed-embeds) | `false` | `true`, `false` |
| [suppressed notifications](syntax:messageaction#suppressed-notifications) | `false` | `true`, `false` |
| [referenced message](syntax:messageaction#referenced-message) | aucun | un message |
| [mention replied user](syntax:messageaction#mention-replied-user) | `true` | `true`, `false` |
| [fail on invalid reply](syntax:messageaction#fail-on-invalid-reply) | `false` | `true`, `false` |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!new-message":
        set {_m} to a new message with content "built, then sent" in event-channel
        set tts of {_m} to false
        set suppressed embeds of {_m} to false
        set suppressed notifications of {_m} to true
        await set {_sent} to the build result of {_m}
```

## Répondre à un message {#replying-to-a-message}

`referenced message`, `mention replied user` et `fail on invalid reply` sont la manière propre au
builder de répondre, en plus de `content` ou `embed`, au lieu de passer par `reply with ... with
reference`. `mention replied user` ne compte qu'une fois un `referenced message` défini : il décide si
l'auteur du message référencé est notifié. `fail on invalid reply` décide de ce qui se passe si ce
message n'existe plus au moment de l'envoi : `false` (la valeur par défaut) envoie le message quand
même, sans le lien de réponse ; `true` fait échouer la construction à la place.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!reply-ref":
        set {_m} to a new message with content "this is a reply" in event-channel
        set referenced message of {_m} to event-message
        set mention replied user of {_m} to false
        set fail on invalid reply of {_m} to false
        await set {_sent} to the build result of {_m}
```

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *IllegalStateException: this message has no content, no embed, no attachment and no component; Discord refuses an empty message* | `the build result of` a été lu sur un builder vide | Définissez un `content`, un `embed` ou une pièce jointe avant de construire |
| *IllegalStateException: this message's content is \<n> characters long, the maximum is 2000* | Le `content` (ou le `discord content`) du builder dépasse la limite de Discord | Raccourcissez le texte, ou répartissez-le sur plusieurs messages |

entity: messageaction
