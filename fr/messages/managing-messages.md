---
title: Gérer les messages
description: Modifier, épingler, publier, transférer, supprimer et purger un message que vous détenez, et lire tout ce qu'il contient.
source-hash: e88a53c09c20
---

Cette page couvre ce que vous pouvez faire à un message qui existe déjà : le modifier, l'épingler, le
publier, le transférer, le supprimer et lire ses propriétés. Vous devez déjà avoir un bot nommé
`"my-bot"` connecté et savoir [envoyer un message](doc:messages/sending-messages).

## Fonctionnement de la gestion d'un message {#how-a-message-is-managed}

Chaque effet de cette page prend un `message`, et un `message` provient de l'une de quatre sources :
l'événement en cours (`event-message`), le [résultat de construction](doc:concepts/builders) d'un
builder (objet de construction) de message, une récupération par identifiant, ou les messages
épinglés d'un salon. Les deux dernières sources sont des lectures seules et exigent `await` (voir
[cache (copie en mémoire) et await](doc:concepts/cache-and-await)) ; les effets eux-mêmes ne le
prennent jamais, car chacun attend la réponse de Discord avant que la ligne suivante ne s'exécute.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!edit":
        set {_m} to a new message with content "before" in event-channel
        await set {_sent} to the build result of {_m}
        edit {_sent} to show "after"
```

Le builder renvoie le message que le bot vient d'envoyer, c'est le seul message que le bot peut
toujours modifier. Les deux autres sources ressemblent à ceci :

```skript
await set {_msg} to message with id "1234567890" in event-channel
await set {_pins::*} to pinned messages of event-channel
```

[`message with id`](syntax:message#message-with-id) récupère un message d'un salon,
[`pinned messages of`](syntax:messagechannel#pinned-messages) récupère tous ses messages épinglés ;
les deux échouent avec une erreur lisible si l'identifiant est faux ou si le salon n'est pas visible
par le bot.

## Modifier {#editing}

[`edit`](syntax:message#edit) remplace ce qu'affiche un message. Il accepte un texte, un embed ou un
composant, et ce n'est pas un patch : le nouveau contenu remplace d'un coup le texte, les embeds, les
composants et les pièces jointes du message. Modifier avec un texte supprime les embeds que le message
avait, et modifier avec un embed vide son texte. Seuls les messages envoyés par le bot lui-même
peuvent être modifiés ; tous les autres sont refusés avant l'envoi de la requête.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!edit-embed":
        set {_m} to a new message with content "will get an embed" in event-channel
        await set {_sent} to the build result of {_m}
        set {_e} to a new discord embed
        set description of {_e} to "edited into an embed"
        edit {_sent} with {_e}
```

`edit ... with` et `edit ... to show` sont identiques. Pour garder à la fois un texte et un embed
après la modification, passez un builder de message qui porte les deux, comme décrit sur la page
[envoyer des messages](doc:messages/sending-messages).

syntax: message#edit compact

## Épingler et publier {#pinning-and-publishing}

[`pin`](syntax:message#pin) ajoute un message aux épingles de son salon et
[`unpin`](syntax:message#unpin) le retire ; un salon contient jusqu'à 50 messages épinglés. Épingler un
message qui n'est pas celui du bot exige la permission **Gérer les messages**.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!pin":
        pin event-message
    if discord content of event-message is "!unpin":
        unpin event-message
```

[`is pinned`](syntax:message#pinned) lit l'instantané que vous détenez, pas Discord : juste après
`pin event-message`, `event-message is pinned` reste faux. Récupérez à nouveau le message avec
`message with id` lorsque vous avez besoin de l'indicateur à jour.

[`publish`](syntax:message#publish) (ou `crosspost`) envoie un message vers chaque serveur qui suit son
salon. Cela ne fonctionne que sur un message publié dans un salon d'annonces ; ailleurs, Discord le
refuse avec une erreur lisible dans la console.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!publish":
        publish event-message
```

## Transférer et supprimer {#forwarding-and-deleting}

[`forward`](syntax:message#forward) envoie une copie d'un message dans un autre salon ; la copie porte
le marqueur *transféré* de Discord, et `is forwarded` est vrai sur elle.
[`destroy`](syntax:core/effects#destroy) supprime un seul message, et [`purge`](syntax:message#purge)
supprime une liste de messages en un minimum de requêtes.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!forward":
        forward event-message to event-channel
    if discord content of event-message is "!delete":
        destroy event-message
```

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!purge":
        set {_m} to a new message with content "temporary" in event-channel
        await set {_first} to the build result of {_m}
        await set {_second} to the build result of {_m}
        purge {_first} and {_second}
```

`purge` regroupe les messages par salon et utilise l'API de suppression groupée de Discord, qui
accepte de 2 à 100 messages à la fois et uniquement des messages de moins de deux semaines. Les listes
plus longues sont découpées en lots de 100, un message seul retombe sur une suppression simple, et les
messages de plus de deux semaines sont supprimés un par un ; vous n'avez jamais à filtrer la liste
vous-même. Supprimer des messages écrits par d'autres, un par un ou en masse, exige **Gérer les
messages**.

!!! danger "La suppression est définitive"
    `destroy` et `purge` ne demandent aucune confirmation, et il n'existe aucun moyen de restaurer un
    message supprimé. Vérifiez `discord author of` avant de supprimer lorsque la liste provient d'un salon.

syntax: message#purge compact
syntax: core/effects#destroy compact

## Autres effets {#other-effects}

[`show typing status in`](syntax:messagechannel#send-typing) fait apparaître l'indicateur *le bot est en
train d'écrire...* dans un salon pendant 10 secondes, ou jusqu'à ce que le bot y envoie un message ; il
prend le salon, et non un message. [`suppress the embeds of`](syntax:message#suppress-embeds) masque les
aperçus de liens que Discord a générés pour un message. [`end the poll of`](syntax:message#end-poll)
ferme le sondage porté par un message ; les sondages sont traités sur la page
[sondages](doc:messages/polls).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!typing":
        show typing status in event-channel
    if discord content of event-message is "!no-previews":
        suppress the embeds of event-message
```

## Lire un message {#reading-a-message}

Les propriétés d'un message se lisent avec `<property> of <message>`. Celles qui se chevauchent avec un
nom de Skript portent un préfixe `discord` : Skript choisit la première syntaxe enregistrée dont le
motif correspond, et une variable non typée comme `{_msg}` accepte n'importe quel emplacement ; une
syntaxe Skript ou d'addon (extension de Skript) de même forme
gagnerait donc silencieusement sur celle de DiSky. `discord content`, `discord author`,
`discord attachments` et `discord components` évitent cela ; écrivez-les toujours avec le préfixe.

| Propriété | Renvoie |
| --- | --- |
| [discord content](syntax:message#discord-content) | le texte brut, sans mise en forme |
| [discord author](syntax:message#discord-author) | l'auteur en tant qu'utilisateur ; aucun pour un webhook |
| [member author](syntax:message#member-author) | l'auteur en tant que membre ; aucun en dehors d'un serveur |
| [guild](syntax:message#guild) | le serveur ; aucun en messages privés |
| [jump url](syntax:message#jump-url) | le lien qui ouvre le message dans Discord |
| [referenced message](syntax:message#referenced-message) | le message auquel il répond, s'il y en a un |
| [embeds](syntax:message#embeds) | les embeds qu'il affiche |
| [discord attachments](syntax:message#discord-attachments) | ses fichiers, sous forme de [pièces jointes](doc:messages/file-uploads) |
| [discord components](syntax:message#discord-components) | ses boutons, menus déroulants et autres composants, aplatis |
| [reactions](syntax:message#reactions) | ses [réactions](doc:messages/reactions), avec leurs compteurs |
| [poll](syntax:message#poll) | son [sondage](doc:messages/polls), s'il y en a un |
| [mentioned users](syntax:message#mentioned-users) | chaque utilisateur mentionné dans le texte |
| [mentioned members](syntax:message#mentioned-members) | les mêmes, en tant que membres ; vide en dehors d'un serveur |
| [mentioned roles](syntax:message#mentioned-roles) | chaque rôle mentionné ; vide en dehors d'un serveur |
| [mentioned channels](syntax:message#mentioned-channels) | chaque salon textuel mentionné |
| [mentioned voice channels](syntax:message#mentioned-voice-channels) | chaque salon vocal mentionné |
| [mentioned emotes](syntax:message#mentioned-emotes) | chaque émoji personnalisé utilisé ; les émojis unicode ne sont pas inclus |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!info":
        reply with "by %discord author of event-message%: %jump url of event-message%"
        reply with "%size of mentioned users of event-message% user(s) mentioned"
```

Dix conditions décrivent l'état d'un message. Elles lisent toutes l'instantané que vous détenez, et
Skript les nie chacune avec `is not` (`if event-message is not pinned:`).

| Condition | Vraie lorsque |
| --- | --- |
| [is edited](syntax:message#edited) | le message a été modifié depuis son envoi |
| [is pinned](syntax:message#pinned) | il est épinglé dans son salon |
| [is ephemeral](syntax:message#ephemeral) | une seule personne peut le voir (une réponse d'interaction) |
| [is tts](syntax:message#tts) | il a été envoyé avec la synthèse vocale |
| [is from a guild](syntax:message#from-a-guild) | il a été envoyé dans un salon de serveur |
| [is from a dm](syntax:message#from-a-dm-private-message-direct-message) | il a été envoyé dans un salon privé |
| [is a voice message](syntax:message#a-voice-message) | c'est un message vocal ; sa pièce jointe a une `attachment duration` |
| [is forwarded](syntax:message#forwarded) | c'est une copie créée par `forward` |
| [has a poll](syntax:message#a-poll) | un sondage y est attaché |
| [is using components v2](syntax:message#using-components-v2) | il est construit à partir de conteneurs, de sections et d'affichages de texte |

```skript
on message received seen by "my-bot":
    if event-message is from a dm:
        stop
    if event-message has a poll:
        reply with "%poll question of poll of event-message%"
```

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *[50013] Missing Permissions* on `pin`, `unpin`, `destroy` or `publish` | Le message n'appartient pas au bot, et le bot n'a pas **Gérer les messages** dans ce salon | Accordez la permission au rôle du bot, ou n'agissez que sur les messages du bot |
| *IllegalStateException: Attempted to update message that was not sent by this account. You cannot modify other User's messages!* | `edit` a reçu un message écrit par quelqu'un d'autre | Ne modifiez que les messages envoyés par le bot ; sinon, `destroy` le message et envoyez-en un nouveau |
| *InsufficientPermissionException: Cannot delete messages of other users* | `purge` a reçu un message écrit par quelqu'un d'autre, et le bot n'a pas **Gérer les messages** | Accordez la permission, ou filtrez la liste sur `discord author of` avant de purger |
| *[10008] Unknown Message* | Le message a été supprimé avant l'exécution de l'effet, ou `message with id` a reçu un mauvais identifiant | Vérifiez l'identifiant, ou entourez la ligne d'un `try` et lisez l'[erreur](doc:concepts/errors) |

entity: message
