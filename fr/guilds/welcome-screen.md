---
title: Écran d'accueil
description: Lire l'écran d'accueil d'un serveur communautaire et remplacer sa description et ses salons recommandés.
source-hash: 2dcafa1de6ee
---

Cette page couvre l'écran d'accueil : la carte qu'un serveur communautaire affiche aux nouveaux
membres, avec une description et jusqu'à cinq salons recommandés. Vous devez avoir un bot nommé
`"my-bot"` connecté, un serveur avec **Communauté** activée, et la permission **Gérer le serveur** pour
le bot s'il modifie l'écran.

## Lire l'écran d'accueil {#reading-the-welcome-screen}

[`welcome screen of %guild%`](syntax:guild#welcome-screen) demande à Discord l'écran actuel, il
nécessite donc `await`. Ce qui revient est un instantané : il ne change pas lorsque l'écran est modifié,
relisez-le dans ce cas.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!welcome":
        await set {_screen} to the welcome screen of event-guild
        reply with "%description of {_screen}%"
        loop welcome channels of {_screen}:
            reply with "%welcome channel of loop-value%: %description of loop-value% %emoji of loop-value%"
```

Chaque entrée de `welcome channels` est un `welcomechannel` avec trois propriétés :
[welcome channel](syntax:welcomechannel#welcome-channel) (le salon lui-même, aucun si le bot ne peut pas
le voir), [description](syntax:welcomechannel#description) et [emoji](syntax:welcomechannel#emoji), soit
l'émoji tel qu'il s'affiche dans un message.

syntax: guild#welcome-screen compact

## Modifier l'écran d'accueil {#editing-the-welcome-screen}

La modification passe par un builder (objet de construction), mais pas le builder habituel : l'écran
d'accueil existe déjà, il n'y a donc rien à construire. Créez-le avec
[`a new welcome screen builder for %guild%`](syntax:welcomescreenbuilder#new-welcome-screen-builder),
définissez ce que vous voulez changer, puis envoyez-le avec
[`update the welcome screen using %welcomescreenbuilder%`](syntax:welcomescreenbuilder#update-welcome-screen).
Cet effet attend Discord, si bien que la ligne suivante voit déjà le nouvel écran.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!set-welcome":
        set {_rules} to a new welcome channel for event-channel with description "Read the rules" with emoji "📜"
        set {_b} to a new welcome screen builder for event-guild
        set welcome screen enabled of {_b} to true
        set description of {_b} to "Welcome to the guild!"
        set welcome channels of {_b} to {_rules}
        update the welcome screen using {_b}
```

Seules les propriétés que vous définissez sont envoyées ; les autres conservent leur valeur sur Discord.

syntax: welcomescreenbuilder#update-welcome-screen compact

## Options {#options}

| Propriété | Par défaut | Valeurs acceptées |
| --- | --- | --- |
| [welcome screen enabled](syntax:welcomescreenbuilder#welcome-screen-enabled) | inchangé | `true`, `false` |
| [description](syntax:welcomescreenbuilder#description) | inchangée | un texte |
| [welcome channels](syntax:welcomescreenbuilder#welcome-channels) | inchangés | jusqu'à 5 salons recommandés ; `set`, `add`, `remove`, `delete` |

[`a new welcome channel for %guildchannel% with description %string% [with emoji %emote/string%]`](syntax:welcomechannel#new-welcome-channel)
crée une entrée. La description fait 42 caractères au maximum, l'émoji est facultatif (un émoji unicode,
un émoji personnalisé (emote) ou la forme `<:name:id>` de ce dernier), et le salon doit être un salon
textuel, vocal, de conférence, d'annonces ou de forum : une catégorie ou un fil est refusé. Une entrée ne
change jamais une fois créée ; créez-en une nouvelle pour la modifier.

!!! warning "Un builder neuf commence vide"
    `welcome channels` sur un builder **remplace la liste entière** sur Discord, et un nouveau builder ne
    part pas de l'écran actuel. Pour ajouter un salon à la liste existante, lisez d'abord l'écran, puis
    copiez ses salons sur le builder, comme ci-dessous.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!add-welcome":
        await set {_screen} to the welcome screen of event-guild
        set {_b} to a new welcome screen builder for event-guild
        set welcome channels of {_b} to welcome channels of {_screen}
        add (a new welcome channel for event-channel with description "Say hi") to welcome channels of {_b}
        update the welcome screen using {_b}
```

`remove` prend une entrée et supprime toutes les entrées pointant vers le même salon, quelle que soit leur
description. `delete welcome channels of {_b}` vide la liste, ce qui l'efface sur Discord une fois le
builder envoyé.

syntax: welcomechannel#new-welcome-channel compact

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| Une *erreur Discord* lors de la lecture de l'écran | Le serveur n'est pas un serveur communautaire, ou n'a jamais configuré d'écran d'accueil | Activez **Communauté** dans les paramètres du serveur |
| *the channel '...' cannot be put on a welcome screen* | L'entrée pointe vers une catégorie ou un fil | Utilisez un salon textuel, vocal, de conférence, d'annonces ou de forum |
| *[50035] Invalid Form Body* mentionnant `welcome_channels` | Plus de 5 entrées, ou une description de plus de 42 caractères | Raccourcissez la liste ou la description |
| Une *erreur Discord* mentionnant **Missing Permissions** | Le bot n'a pas la permission **Gérer le serveur** | Accordez-la |

entity: welcomescreenbuilder
