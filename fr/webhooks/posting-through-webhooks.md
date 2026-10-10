---
title: Publier à travers un webhook
description: Publier, modifier et supprimer des messages en tant que webhook, avec un nom et un avatar propres à chaque message, dans un salon ou un fil.
source-hash: 881cb4db772a
---

Cette page explique ce que fait un client de webhook une fois que vous en avez un : publier un
message, remplacer son nom et son avatar pour ce seul message, conserver le message envoyé pour le
modifier ou le supprimer plus tard, et publier dans un fil. Vous devez déjà avoir un
[client de webhook](doc:webhooks/webhook-clients) dans `{_hook}` et un bot nommé `"my-bot"` connecté.

## Fonctionnement de la publication {#how-posting-works}

[`make %webhookclient% post %content%`](syntax:webhookclient#webhook-post) envoie un texte, un
[embed](doc:messages/embeds), un composant ou un [builder (objet de construction) de message](doc:messages/sending-messages)
à travers le webhook. `send` et `speak` sont le même effet sous d'autres noms. Comme `post`, il oublie
le message qu'il a envoyé.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!announce":
        set {_b} to a new webhook builder named "Announcer" in event-channel
        await set {_hook} to the build result of {_b}
        make {_hook} post "Server restart in 5 minutes"
        make {_hook} post "Restarted" with username "Status" and avatar "https://example.com/up.png"
```

`with username` et `and avatar` changent l'apparence du webhook pour ce message uniquement ; son nom
et son avatar d'origine restent inchangés. Un builder de message donné comme contenu sert de modèle :
son contenu, ses embeds, ses pièces jointes et ses composants sont envoyés, le reste du builder est
ignoré.

syntax: webhookclient#webhook-post compact

## Garder le message envoyé {#keeping-the-sent-message}

[`a new webhook message with content %string% through %webhookclient%`](syntax:webhookmessageaction#new-webhook-message-with-content)
et `a new webhook message with embed %embedbuilder% through %webhookclient%` créent un builder de
message de webhook. Il suit le [contrat du builder](doc:concepts/builders) : rien n'est envoyé tant
que `the build result of` n'est pas lu sous `await`, et cette lecture renvoie le message envoyé.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!status":
        set {_m} to a new webhook message with content "Checking..." through {_hook}
        set webhook username of {_m} to "Status"
        await set {_sent} to the build result of {_m}
        edit webhook message {_sent} of {_hook} to show "All systems up"
```

syntax: webhookmessageaction#result compact

## Options {#options}

Chaque propriété ci-dessous est en écriture seule sur le builder.

| Propriété | Valeur par défaut | Valeurs acceptées |
| --- | --- | --- |
| [webhook username](syntax:webhookmessageaction#webhook-username) | le nom du webhook | n'importe quel texte |
| [webhook avatar url](syntax:webhookmessageaction#webhook-avatar-url) | l'avatar du webhook | une URL d'image |
| [webhook thread](syntax:webhookmessageaction#webhook-thread) | aucun, le salon du webhook | un fil du salon du webhook |
| [webhook thread id](syntax:webhookmessageaction#webhook-thread-id) | aucun | un identifiant de fil |
| [discord content](syntax:webhookmessageaction#discord-content) | le texte du constructeur | n'importe quel texte |
| [embed](syntax:webhookmessageaction#embed) | l'embed du constructeur | un embed |
| [attachments](syntax:webhookmessageaction#attachments) | aucune | [envois de fichiers](doc:messages/file-uploads) |
| [components](syntax:webhookmessageaction#components) | aucun | composants |
| [tts](syntax:webhookmessageaction#tts) | `false` | `true`, `false` |
| [suppressed embeds](syntax:webhookmessageaction#suppressed-embeds) | `false` | `true`, `false` |
| [suppressed notifications](syntax:webhookmessageaction#suppressed-notifications) | `false` | `true`, `false` |

```skript
set {_m} to a new webhook message with content "Patch notes" through {_hook}
set webhook username of {_m} to "Changelog"
set webhook avatar url of {_m} to "https://example.com/log.png"
add (a new file upload from file "plugins/notes.txt") to attachments of {_m}
set suppressed notifications of {_m} to true
await set {_sent} to the build result of {_m}
```

## Modifier et supprimer {#editing-and-deleting}

[`edit webhook message %string/message% of %webhookclient% to show %content%`](syntax:core/effects#webhook-edit)
et [`delete webhook message %string/message% of %webhookclient%`](syntax:core/effects#webhook-delete)
prennent le message envoyé ou son identifiant. Un webhook ne peut modifier et supprimer que ses propres
messages ; un client construit à partir d'une URL fonctionne comme le webhook qu'elle désigne.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!cleanup":
        set {_m} to a new webhook message with content "temporary" through {_hook}
        await set {_sent} to the build result of {_m}
        delete webhook message (discord id of {_sent}) of {_hook}
```

syntax: core/effects#webhook-edit compact

## Fils {#threads}

Un webhook publie dans son propre salon, ou dans un fil de ce salon. Ajoutez `in thread %threadchannel%`
à l'un des trois effets, ou définissez `webhook thread` sur le builder. Un message envoyé dans un fil
doit être modifié et supprimé avec le même `in thread`, faute de quoi Discord répond que le message
n'existe pas.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!thread-post":
        set {_tb} to a new thread builder named "Logs" from event-message
        await set {_thread} to the build result of {_tb}
        make {_hook} post "first entry" in thread {_thread}
```

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *this message has no content, no embed, no attachment and no component; Discord refuses an empty message* | Un builder de message de webhook a été construit sans rien à envoyer | Définissez un contenu, un embed, une pièce jointe ou un composant |
| *[10008] Unknown Message* | Le message n'a pas été envoyé par ce webhook, ou il se trouve dans un fil et `in thread` manque | Modifiez-le à travers le webhook qui l'a envoyé, en nommant le fil |
| *[10015] Unknown Webhook* | Le webhook a été supprimé | Créez-en un nouveau ou récupérez-le |

entity: webhookmessageaction
