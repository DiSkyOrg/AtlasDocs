---
title: Permissions
description: Lire et modifier les permissions des rôles, lire ce qu'un membre peut faire, et autoriser ou refuser des permissions dans un salon.
source-hash: 2c7300782fd9
---

Cette page couvre les permissions Discord : celles qu'un rôle donne dans tout le serveur, celles
dont un membre dispose au final, et les surcharges (overrides) qu'un salon ajoute par-dessus. Vous
devez déjà avoir un bot nommé `"my-bot"` connecté et un serveur où il a **Manage Roles**.

## Fonctionnement des permissions {#how-permissions-work}

Discord décide de ce qu'un membre peut faire en deux couches. La couche du serveur est la somme
des permissions des rôles du membre (et de `@everyone`). La couche du salon, ce sont les surcharges
de permissions du salon : pour chaque rôle ou membre, une liste de permissions que le salon
**autorise** et une liste qu'il **refuse**, appliquées par-dessus la couche du serveur. Ce qu'une
surcharge n'autorise ni ne refuse est hérité de la couche du serveur. Un administrateur, comme le
propriétaire du serveur, a toutes les permissions partout.

Chaque syntaxe de cette page contient le mot `discord` : Skript possède déjà
`permissions of %player%` pour les permissions Minecraft, et son expression l'emporterait sur une
variable non typée. Une permission s'écrit par son nom (`view channel`, `kick members`,
`administrator`) ou par un alias plus parlant (`send messages`, `manage messages`, `embed links`) ;
le type `permission` les liste toutes.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!perms":
        set {_guild::*} to discord permissions of event-member
        set {_here::*} to discord permissions of event-member in event-channel
        reply with "Guild-wide: %{_guild::*}%. In this channel: %{_here::*}%."
```

## Permissions d'un rôle {#role-permissions}

[`discord permissions of %role%`](syntax:role#discord-permissions) est la liste définie dans les
paramètres du rôle sur le serveur. `set`, `add` et `remove` modifient le rôle sur Discord, et
`delete` (ou le fait de la définir à rien) laisse le rôle sans aucune permission. `reset` n'est pas
accepté : un rôle n'a pas de valeur par défaut à laquelle revenir.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!helper":
        set {_b} to a new role builder named "Helper" in event-guild
        await set {_role} to the build result of {_b}
        await set discord permissions of {_role} to send messages and embed links
        await add manage messages to discord permissions of {_role}
        remove embed links from discord permissions of {_role}
```

Sans `await`, la modification est envoyée en arrière-plan et la ligne suivante lit encore
l'ancienne liste ; avec `await`, le trigger (bloc de code) attend que Discord l'accepte. Le cache
(copie en mémoire) du rôle, lui, est rafraîchi quand Discord envoie la mise à jour au bot,
généralement un instant plus tard : relisez la liste après un court `wait` si vous avez besoin de
la nouvelle valeur. Une liste entière part vers Discord en une seule requête, donc
`add a and b to ...` ne coûte qu'un appel.

syntax: role#discord-permissions compact

## Permissions d'un membre {#member-permissions}

[`discord permissions of %member%`](syntax:member#discord-permissions) est ce que le membre peut
faire dans tout le serveur : les permissions de tous ses rôles réunies, ou toutes pour le
propriétaire et un administrateur. Elle est en lecture seule, car un membre tient ses permissions
de ses rôles : modifiez plutôt ses rôles, ou les permissions de ces rôles. La modifier est une
erreur d'analyse quand Skript sait que la valeur est un membre, et une erreur lisible dans la
console quand le membre vient d'une variable non typée.

Pour tester une permission plutôt que de les lister, utilisez
[`%members% have discord permissions %permissions%`](syntax:member#has-permission). La condition
n'est vraie que si le membre a toutes les permissions données, et elle tient compte des surcharges
du salon quand vous ajoutez `in %guildchannel%`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!clear":
        if event-member has discord permission manage messages in event-channel:
            reply with "You may clean this channel."
        else:
            reply with "You need Manage Messages here."
```

syntax: member#has-permission compact

## Permissions dans un salon {#permissions-in-a-channel}

[`discord permissions of %member/role% in %guildchannel%`](syntax:core/expressions#expression-discord-permissions-in-channel)
est le résultat des deux couches pour un membre ou un rôle dans un salon : ce qu'il peut vraiment
y faire. Elle est en lecture seule. Dans un fil, ce sont les surcharges du salon parent qui
s'appliquent, puisqu'un fil n'en a pas.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!can-talk":
        set {_p::*} to discord permissions of event-member in event-channel
        if {_p::*} contain send messages:
            reply with "You can talk here."
```

## Surcharges de salon {#channel-overrides}

[`allowed discord permissions of %member/role% in %guildchannel%`](syntax:core/expressions#expression-channel-permission-override)
et sa jumelle `denied discord permissions of ...` sont les deux listes d'une surcharge. Les deux
sont vides quand le salon n'a pas de surcharge pour ce rôle ou ce membre. Les modifier crée la
surcharge si besoin.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!lock":
        set {_everyone} to everyone role of event-guild
        await add send messages to denied discord permissions of {_everyone} in event-channel
        await add send messages to allowed discord permissions of event-member in event-channel
        reply with "Channel locked, except for you."
```

Les deux listes n'ont jamais de permission en commun, ce qui détermine le comportement de chaque
modification :

| Modification | Sur `allowed` | Sur `denied` |
| --- | --- | --- |
| `add` | Les autorise, et les retire de `denied` | Les refuse, et les retire de `allowed` |
| `remove` | Les retire de `allowed` seulement : elles redeviennent héritées, pas refusées | Les retire de `denied` seulement : elles redeviennent héritées, pas autorisées |
| `set` | Autorise exactement celles-ci ; celles qui étaient refusées ne le sont plus | Refuse exactement celles-ci ; celles qui étaient autorisées ne le sont plus |
| `reset`, `delete` | Supprime toute la surcharge, `allowed` et `denied` ensemble | Pareil |

`reset allowed discord permissions of {_role} in event-channel` ramène le salon à la couche du
serveur pour ce rôle. Retirer chaque permission une par une laisse au contraire une surcharge vide
sur le salon : elle ne fait rien, mais reste listée dans les paramètres du salon jusqu'à ce que
vous la réinitialisiez.

!!! warning "Les fils utilisent les surcharges de leur parent"
    Un fil n'a pas de surcharge propre. Modifier une surcharge en donnant un fil comme salon
    modifie la surcharge de son salon parent, pour tous les fils de ce salon.

Comme une propriété, une modification de surcharge s'exécute en arrière-plan sans `await`, et
attend Discord avec.

syntax: core/expressions#expression-channel-permission-override compact

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *Cannot perform action due to a lack of Permission. Missing permission: MANAGE_ROLES* | Le bot ne peut pas modifier les rôles | Donnez **Manage Roles** au bot |
| *Cannot perform action due to a lack of Permission. Missing permission: MANAGE_PERMISSIONS* | Le bot ne peut pas modifier les surcharges de ce salon | Donnez au bot **Manage Roles** sur le serveur, ou **Manage Permissions** dans le salon |
| *Cannot perform action due to a lack of Permission. Missing permission: ...* nommant une autre permission | Le bot a tenté de donner, autoriser ou refuser une permission qu'il n'a pas lui-même | Donnez d'abord cette permission au bot, ou retirez-la |
| *Cannot modify a role that is higher or equal in hierarchy* | Le rôle est au niveau ou au-dessus du rôle le plus haut du bot | Placez le rôle du bot au-dessus |
| *the discord permissions of a member cannot be changed* | Un `set`, `add` ou `remove` sur les permissions de serveur d'un membre | Modifiez ses rôles, ou une surcharge de salon |
