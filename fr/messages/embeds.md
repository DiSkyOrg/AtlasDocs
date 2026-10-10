---
title: Embeds
description: Construire un embed Discord en local, définir chacune de ses propriétés et ses champs, puis l'envoyer avec post, reply with ou un builder de message.
source-hash: ccb478d348a6
---

Cette page couvre la construction d'un embed Discord : chaque propriété que vous pouvez y définir, ses
champs, et ce que vous obtenez en lisant les embeds déjà présents sur un message. Vous devez déjà avoir
un bot nommé `"my-bot"` connecté et savoir [envoyer un message](doc:messages/sending-messages).

## Fonctionnement des embeds {#how-embeds-work}

[A new discord embed](syntax:core/expressions#expression-new-embed) crée un embed vide, entièrement
en mémoire ; chaque ligne `set <property> of {_e}` ne fait que le compléter, sans aucun appel à Discord.
Rien n'est envoyé tant que vous ne le confiez pas à quelque chose qui parle à un salon : passez-le à
`post` ou à `reply with`, ou définissez-le comme `embed` d'un [builder](doc:concepts/builders) (objet de
construction) puis lisez `the build result of` ce builder. Un embed est plus simple que le contrat complet
décrit sur la page des builders : il n'a ni `await` ni de `build result` propre, car seul, il ne parle
jamais à Discord.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!embed":
        set {_e} to a new discord embed
        set title of {_e} to "DiSky V5"
        set description of {_e} to "An embed built entirely in Skript."
        set color of {_e} to orange
        post {_e} to event-channel
```

syntax: core/expressions#expression-new-embed compact

## Options {#options}

Chaque propriété se définit avec `set <property> of {_e} to <value>`. DiSky applique immédiatement, sur la
ligne `set` elle-même, les limites de longueur et d'URL de `EmbedBuilder` de JDA ; les limites du nombre de
champs et de la longueur totale ne s'appliquent qu'une fois l'embed attaché quelque part (voir
[Erreurs que vous pouvez rencontrer](#errors-you-may-see)).

| Propriété | Défaut | Valeurs acceptées |
| --- | --- | --- |
| [title](syntax:embedbuilder#title) | aucun | texte, jusqu'à 256 caractères |
| [title url](syntax:embedbuilder#title-url) | aucun | une URL `http(s)://` ou `attachment://` |
| [description](syntax:embedbuilder#description) | aucun | texte, jusqu'à 4096 caractères |
| [color](syntax:embedbuilder#color) | aucun | une couleur |
| [discord author](syntax:embedbuilder#discord-author) | aucun | texte, jusqu'à 256 caractères |
| [author icon](syntax:embedbuilder#author-icon) | aucun | une URL `http(s)://` ou `attachment://` |
| [author url](syntax:embedbuilder#author-url) | aucun | une URL `http(s)://` ou `attachment://` |
| [footer](syntax:embedbuilder#footer) | aucun | texte, jusqu'à 2048 caractères |
| [footer icon](syntax:embedbuilder#footer-icon) | aucun | une URL `http(s)://` ou `attachment://` |
| [image](syntax:embedbuilder#image) | aucun | une URL `http(s)://` ou `attachment://` |
| [thumbnail](syntax:embedbuilder#thumbnail) | aucun | une URL `http(s)://` ou `attachment://` |
| [timestamp](syntax:embedbuilder#timestamp) | aucun | une date |
| [fields](syntax:embedbuilder#fields) | aucun | ajout uniquement, voir [Champs](#fields) ci-dessous ; 25 au maximum |

Une propriété ne se relit que pour deux d'entre elles : `description of {_e}` renvoie ce que vous avez
défini, et `fields of {_e}` renvoie la liste à laquelle vous avez ajouté. Toutes les autres propriétés,
y compris `title` et `color`, ne renvoient rien même juste après leur définition : `EmbedBuilder` de JDA
n'expose aucun getter pour elles, donc DiSky n'a rien à renvoyer.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!embed-full":
        set {_e} to a new discord embed
        set title of {_e} to "DiSky V5"
        set title url of {_e} to "https://disky.me"
        set description of {_e} to "An embed built entirely in Skript."
        set color of {_e} to orange
        set discord author of {_e} to "DiSky"
        set author icon of {_e} to "https://disky.me/icon.png"
        set footer of {_e} to "Powered by DiSky"
        set image of {_e} to "https://disky.me/banner.png"
        set thumbnail of {_e} to "https://disky.me/thumb.png"
        set timestamp of {_e} to now
        post {_e} to event-channel
```

## Champs {#fields}

Un champ est un objet à part, construit séparément puis ajouté aux `fields` de l'embed. Trois écritures
en créent un : simple (`inline` vaut `false` par défaut), avec une valeur `inline` explicite, ou avec
`inline` forcé par la forme `new inline field`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!embed-fields":
        set {_e} to a new discord embed
        set title of {_e} to "Ping results"
        add (a new embed field named "Region" with value "eu-west") to fields of {_e}
        add (a new embed field named "Status" with value "OK" inline true) to fields of {_e}
        loop fields of {_e}:
            send "%name of loop-value% = %value of loop-value% (inline: %inline of loop-value%)" to console
        post {_e} to event-channel
```

Les trois écritures reconnues :

```skript
set {_f1} to a new embed field named "Region" with value "eu-west"
set {_f2} to a new embed field named "Status" with value "OK" inline true
set {_f3} to a new inline embed field named "Latency" with value "42ms"
```

`add {_f1} to fields of {_e}` attache un champ à un embed ; un champ ne se relit qu'avec `name of`,
`value of` et `inline of` (comme utilisé sur `loop-value` plus haut). Un nom de champ de plus de 256
caractères, ou une valeur de plus de 1024, échoue immédiatement, à la création du champ et non à son
ajout.

syntax: core/expressions#expression-new-embed-field compact

## Lire des embeds {#reading-embeds}

[`embeds of`](syntax:message#embeds) d'un message envoyé renvoie ses embeds ; un message construit avec
DiSky porte un seul embed, donc la liste ne contient généralement qu'un élément. Chacun revient sous forme
de `MessageEmbed` de JDA, un type en lecture seule sans type Skript propre, mais DiSky le convertit en
`embedbuilder` partout où un tel type est attendu : stockez-le dans une variable, définissez-lui d'autres
propriétés, puis renvoyez-le comme nouvel embed.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!requote":
        set {_e} to first element of embeds of event-message
        set footer of {_e} to "requoted by DiSky"
        post {_e} to event-channel
```

Cela ne modifie jamais le message d'origine : le convertisseur copie le contenu de l'embed envoyé dans un
`EmbedBuilder` neuf, donc `post`, `reply with` ou un builder de message reste ce qui affiche le résultat
sur Discord. Pour changer en place l'embed affiché par un message existant, `edit` ce message avec le
nouvel embed (voir [gérer les messages](doc:messages/managing-messages)).

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *IllegalArgumentException: Title cannot be longer than 256 characters.* | `title` a été défini avec plus de 256 caractères | Raccourcissez le titre, ou déplacez le reste dans `description` |
| *IllegalArgumentException: URL must be a valid http(s) or attachment url.* | `title url`, `author icon`, `author url`, `footer icon`, `image` ou `thumbnail` a reçu une valeur qui n'est pas un lien `http://`, `https://` ou `attachment://` valide | Corrigez l'URL, ou laissez la propriété non définie |
| *IllegalArgumentException: Name cannot be longer than 256 characters* (or *Value cannot be longer than 1024 characters*) | Le nom ou la valeur d'un champ est trop long | Raccourcissez-le avant de créer le champ |
| *IllegalStateException: Cannot build an empty embed!* | L'embed ne contenait rien (ni titre, description, champ, auteur, footer, image ni thumbnail) au moment de l'attacher à un message | Définissez au moins une propriété avant `set embed of` ou `a new message with embed` |
| *IllegalStateException: Cannot build an embed with more than 25 embed fields set!* | Plus de 25 champs ont été ajoutés | Gardez 25 champs au maximum, ou répartissez le contenu sur plusieurs embeds |

entity: embedbuilder
