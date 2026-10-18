---
title: Émojis personnalisés et stickers
description: Créer des émojis personnalisés et des stickers dans un serveur, réserver un émoji à certains rôles, puis les supprimer.
source-hash: 2610f71e6a18
---

Cette page couvre la création des émojis personnalisés et des stickers (autocollants) d'un serveur à
partir d'une image, puis leur suppression. Vous devez avoir un bot nommé `"my-bot"` connecté,
connaître le fonctionnement des [builders](doc:concepts/builders) (objets de construction), et
donner au bot les permissions listées en fin de page.

## Créer un émoji personnalisé {#creating-an-emote}

[`a new emote builder named %string% with image %string/fileupload% in %guild%`](syntax:emotebuilder#new-emote-builder)
prépare un émoji personnalisé ; [`the build result of`](syntax:emotebuilder#result) le crée sur
Discord et le renvoie, il nécessite donc `await`. L'image est une URL `https://`, un chemin sur le
serveur Minecraft, ou un [envoi de fichier](syntax:core/expressions#expression-new-file-upload).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!add-emote":
        set {_b} to a new emote builder named "party_blob" with image "https://example.com/blob.png" in event-guild
        await set {_emote} to the built emote from {_b}
        reply with "Created %{_emote}%, use it as :%name of {_emote}%:"
```

Rien n'est téléchargé avant l'exécution de la ligne `await` : DiSky lit alors l'image, la vérifie
puis l'envoie. Ce qui revient est un `emote` ordinaire, donc
[emote image url](syntax:emote#emote-image-url), `name` et `destroy` fonctionnent dessus.
Contrairement à la plupart des builders, un builder d'émoji se relit : `name of {_b}` donne le nom
avec lequel il sera créé.

| Règle | Valeur |
| --- | --- |
| Nom | 2 à 32 caractères, uniquement des lettres, des chiffres et des tirets bas |
| Image | PNG, JPEG, GIF ou WEBP, 256 Ko au maximum ; un GIF donne un émoji animé |
| Emplacements | 50 émojis fixes et 50 animés, davantage avec les boosts (jusqu'à 250 de chaque) |

syntax: emotebuilder#new-emote-builder compact
syntax: emotebuilder#result compact

## Réserver un émoji à des rôles {#restricting-an-emote-to-roles}

Par défaut, tout le serveur peut utiliser un nouvel émoji personnalisé.
[allowed roles](syntax:emotebuilder#allowed-roles) le limite aux membres qui ont l'un des rôles
listés ; ces rôles doivent appartenir au même serveur. La propriété accepte `set`, `add`, `remove`
et `delete`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!vip-emote":
        set {_b} to a new emote builder named "vip_star" with image "plugins/DiSky/star.png" in event-guild
        add role with id "123456789012345678" to allowed roles of {_b}
        await set {_emote} to the built emote from {_b}
        reply with "%{_emote}% is reserved to %size of allowed roles of {_emote}% role(s)"
```

`allowed roles of` un émoji existant lit la même liste ; elle est vide quand tout le monde peut
l'utiliser.

syntax: emotebuilder#allowed-roles compact

## Créer un sticker {#creating-a-sticker}

Un sticker fonctionne de la même façon, avec deux champs supplémentaires que Discord exige ou
affiche : une description et des tags.
[`a new sticker builder named %string% with image %string/fileupload% in %guild%`](syntax:stickerbuilder#new-sticker-builder)
(`with file` fonctionne aussi) le prépare, et la construction le crée. Un sticker a besoin
d'**au moins un tag** : les mots ou les emojis pour lesquels Discord le suggère quand un membre
les tape.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!add-sticker":
        set {_b} to a new sticker builder named "Party Blob" with image "https://example.com/blob-320.png" in event-guild
        set description of {_b} to "A blob that parties"
        add "tada" and "party" to sticker tags of {_b}
        await set {_sticker} to the built guildsticker from {_b}
        reply with "Created the sticker %name of {_sticker}%"
```

| Propriété | Par défaut | Valeurs acceptées |
| --- | --- | --- |
| [description](syntax:stickerbuilder#description) | vide | vide, ou 2 à 100 caractères |
| [sticker tags](syntax:stickerbuilder#sticker-tags) | aucun | au moins un ; pas de virgule dans un tag ; 200 caractères au maximum une fois réunis |

Le nom fait 2 à 30 caractères. Le fichier est un PNG, un APNG, un GIF ou une animation Lottie JSON
de 512 Ko au maximum ; Discord affiche les stickers en 320x320 pixels, une image carrée de cette
taille rend donc le mieux. Les stickers Lottie sont réservés aux serveurs vérifiés et partenaires.
DiSky reconnaît le format d'après le contenu du fichier, une URL sans extension fonctionne donc. Un
serveur dispose de 5 emplacements de stickers, davantage avec les boosts (jusqu'à 60).

`description of` et `sticker tags of` lisent aussi un sticker existant du serveur.

syntax: stickerbuilder#new-sticker-builder compact
syntax: stickerbuilder#sticker-tags compact

## Supprimer des émojis personnalisés et des stickers {#deleting-emotes-and-stickers}

[`destroy`](syntax:core/effects#destroy) supprime un émoji personnalisé ou un sticker du serveur,
comme n'importe quelle autre entité. Pour en trouver un, lisez les
[émojis du serveur](syntax:guild#emojis) ou ses [stickers](syntax:guild#stickers) depuis le cache
(copie en mémoire), ou utilisez `await` avec [emotes](syntax:guild#emotes) pour interroger
Discord directement.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!clean-emotes":
        loop emojis of event-guild:
            if name of loop-value starts with "temp_":
                destroy loop-value
```

!!! danger "La suppression est définitive"
    Un émoji personnalisé ou un sticker supprimé ne peut pas être restauré. Construisez-le de
    nouveau à partir de son image si vous en avez besoin ; il reçoit un nouvel identifiant.

## Permissions {#permissions}

Le bot a besoin de **Create Expressions** pour créer des émojis personnalisés et des stickers ; il
peut ensuite modifier et supprimer ceux qu'il a créés. Supprimer ceux créés par quelqu'un d'autre
demande **Manage Expressions**. Les deux s'accordent via un rôle, dans les paramètres du serveur.

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *the emote name '...' is invalid: it must be 2 to 32 characters long and only contain letters, digits and underscores* | Un espace, un tiret ou un accent dans le nom | N'utilisez que des lettres, des chiffres et des tirets bas |
| *the emote image read from '...' is larger than 256 KB, the maximum Discord accepts* (*512 KB* for a sticker file) | L'image est trop lourde | Compressez ou redimensionnez l'image |
| *the emote image is not a PNG, JPEG, GIF or WEBP image* / *a sticker must be a PNG, APNG, GIF or Lottie JSON file* | La source n'est pas une image, ou un JPEG a été donné pour un sticker | Convertissez le fichier |
| *could not read the emote image from '...': not found* | L'URL répond 404, ou le chemin est faux | Vérifiez l'URL ou le chemin |
| *a sticker needs at least one tag (a word or an emoji Discord suggests it for)* | `sticker tags` est vide | Ajoutez au moins un tag |
| *[30008] Maximum number of emojis reached* / *[30039] Maximum number of stickers reached* | Le serveur n'a plus d'emplacement libre | Supprimez-en un, ou boostez le serveur |
| *Cannot perform action due to a lack of Permission. Missing permission: CREATE_GUILD_EXPRESSIONS* | Il manque **Create Expressions** au bot | Accordez-la |
| *[50035] Invalid Form Body* mentionnant `image` ou `file` | Discord n'a pas pu décoder le fichier | Utilisez une image valide au bon format |

entity: emotebuilder
