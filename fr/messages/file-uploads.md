---
title: Envois de fichiers
description: Construire un fichier depuis un chemin local, une url ou une pièce jointe reçue, le joindre à un message et relire les pièces jointes.
source-hash: fde9e2c311e4
---

Cette page explique comment envoyer des fichiers : construire un envoi de fichier depuis un chemin
local, une url ou une pièce jointe reçue, le joindre à un builder (objet de construction) de message,
puis relire les pièces jointes d'un message envoyé. Vous devez déjà avoir un bot nommé `"my-bot"`
connecté et savoir [envoyer un message](doc:messages/sending-messages).

## Fonctionnement des envois {#how-uploads-work}

[A new file upload](syntax:core/expressions#expression-new-file-upload) encapsule une source dans
un objet local, ajouté aux `attachments` d'un [builder de message](doc:concepts/builders) avant son
envoi. Quatre sources permettent de le construire, selon le mot placé après `from` :

| Source | Forme | Remarques |
| --- | --- | --- |
| Fichier local | `from [local] file %string%` | Le chemin est résolu depuis le répertoire de travail du serveur ; DiSky vérifie tout de suite que le fichier existe. |
| URL | `from ur(l|i) %string%` | Téléchargée seulement à l'envoi du message, jamais à la création. |
| Pièce jointe | `from attachment %attachment%` | Renvoie une pièce jointe reçue ; elle est aussi téléchargée à l'envoi. |
| Image | `from image %image%` | Enregistrée uniquement si l'addon (extension de Skript) SkImage2 est installé ; l'image est encodée en PNG immédiatement, car elle n'existe qu'en mémoire. |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!file-local":
        set {_f} to a new file upload from file "plugins/DiSky/logo.png"
        set {_m} to a new message with content "here's the logo" in event-channel
        add {_f} to attachments of {_m}
        await set {_sent} to the build result of {_m}
```

Rien n'est lu sur le disque ni téléchargé tant que le message qui porte l'envoi n'est pas réellement
envoyé, à l'exception de la vérification d'existence du fichier local et de l'encodage de l'image
décrits plus haut ; ces deux opérations doivent se faire maintenant, car il n'y a rien à différer.

syntax: core/expressions#expression-new-file-upload compact

## Noms et spoilers {#naming-and-spoilers}

Chaque constructeur accepte un `named` (ou `with the name`) facultatif, ainsi qu'un `with spoiler`.
Si rien n'est donné, le nom est celui de la source : le nom de fichier du fichier local ou de la
pièce jointe, le dernier segment du chemin de l'url (ou `"file"` s'il n'en a pas), ou
`image-<hex>.png` pour une image.

```skript
set {_f} to a new file upload from url "https://example.com/logo.png" named "banner.png" with spoiler true
```

`with spoiler true` et [`set spoiler of {_f}`](syntax:fileupload#spoiler) fonctionnent tous deux en
ajoutant le préfixe `SPOILER_` au nom ; le remettre à `false` retire ce préfixe. Comme la vérification
porte sur le nom actuel, renommez le fichier avant de définir `spoiler`, et non après, sous peine
d'écraser le préfixe. [`file description`](syntax:fileupload#file-description) définit le texte
alternatif lu par les lecteurs d'écran et affiché au survol ; il n'a pas de valeur lisible, seulement
un setter.

```skript
set {_f} to a new file upload from file "plugins/DiSky/logo.png"
set file name of {_f} to "company-logo.png"
set spoiler of {_f} to true
set file description of {_f} to "the company logo"
```

## Attacher à un message {#attaching-to-a-message}

[`attachments`](syntax:messageaction#attachments) d'un [builder de message](doc:concepts/builders)
accepte `set`, `add` et `remove` ; le relire donne les noms des fichiers ajoutés jusqu'ici, et
`remove` prend un nom plutôt que l'envoi lui-même.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!file-list":
        set {_a} to a new file upload from file "plugins/DiSky/logo.png" named "a.png"
        set {_b} to a new file upload from file "plugins/DiSky/logo.png" named "b.png"
        set {_m} to a new message with content "one file" in event-channel
        set attachments of {_m} to {_a} and {_b}
        remove "a.png" from attachments of {_m}
        await set {_sent} to the build result of {_m}
```

Un envoi depuis une url ou une pièce jointe n'est téléchargé qu'au moment où `the build result of`
s'exécute ; une url morte échoue donc à cet endroit, et non sur la ligne du `add`.
`reply with {_m} with reference event-message` envoie les pièces jointes d'un builder de la même
façon que `the build result of`. Les galeries de médias et les affichages de fichiers (composants v2)
acceptent eux aussi les envois de fichiers, de la même manière.

syntax: messageaction#attachments compact

## Lire les pièces jointes {#reading-attachments}

[`discord attachments of`](syntax:message#discord-attachments) appliqué à un message envoyé renvoie
ses fichiers sous forme de `attachment`, un type en lecture seule qui a ses propres propriétés et
conditions.

| Propriété | Renvoie |
| --- | --- |
| [attachment url](syntax:attachment#attachment-url) | l'url CDN du fichier |
| [file name](syntax:attachment#file-name) | le nom du fichier, préfixe de spoiler inclus |
| [file extension](syntax:attachment#file-extension) | l'extension, ou rien si le fichier n'en a pas |
| [attachment duration](syntax:attachment#attachment-duration) | la durée d'une pièce jointe audio (message vocal), ou rien sinon |

Quatre conditions décrivent le type de fichier :

| Condition | Vraie quand |
| --- | --- |
| [is an image attachment](syntax:attachment#an-image-attachment) | le fichier est une image |
| [is a video attachment](syntax:attachment#a-video-attachment) | le fichier est une vidéo |
| [is an audio attachment](syntax:attachment#an-audio-attachment) | le fichier est un message vocal ; `attachment duration` fonctionne dessus |
| [is a spoiler attachment](syntax:attachment#a-spoiler-attachment) | le nom du fichier porte le préfixe `SPOILER_` |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!file-echo":
        set {_att} to first element of discord attachments of event-message
        if {_att} is set:
            set {_f} to a new file upload from attachment {_att} named "echo-%file name of {_att}%"
            set {_m} to a new message with content "re-uploaded" in event-channel
            add {_f} to attachments of {_m}
            await set {_sent} to the build result of {_m}
```

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *IllegalArgumentException: the file '\<path>' does not exist* | `a new file upload from file` a reçu un chemin où il n'y a rien | Vérifiez que le chemin est relatif au répertoire de travail du serveur, et que le fichier est présent |
| *UncheckedIOException: could not download '\<url>'* | L'url donnée à `from url` n'a pas pu être téléchargée à l'envoi du message | Vérifiez que l'url est accessible, ou encadrez l'envoi d'un `try` et lisez l'[erreur](doc:concepts/errors) |
| Un bloc *Discord error* qui signale un fichier trop volumineux | Le fichier dépasse la limite de Discord par envoi pour le serveur (en général 10 MB, davantage avec les boosts du serveur) | DiSky ne vérifie pas la taille lui-même ; réduisez ou compressez le fichier avant de l'envoyer |

entity: fileupload
