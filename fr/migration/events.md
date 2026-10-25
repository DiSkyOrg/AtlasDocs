---
title: Événements
description: Ce qui change dans les déclencheurs d'événements quand vous passez un script de DiSky 4 à DiSky 5.
source-hash: 5c7d85c68af1
---

La plupart des patterns d'événements sont identiques dans DiSky 5 ; ce qui change, ce sont surtout les
valeurs qu'ils exposent. Cette page liste les événements renommés et supprimés, la nouvelle manière de lire
les valeurs "ancienne et nouvelle", et ce qui a remplacé l'auteur du journal d'audit et `retrieve`. Vous
devez déjà savoir comment fonctionne un événement DiSky (voir [Événements](doc:concepts/events)) et avoir
des scripts DiSky 4 à porter.

## Noms des événements {#event-names}

Tous les patterns d'événements de DiSky 4 sont toujours analysés dans DiSky 5, à quelques exceptions près.
Le filtre par bot est inchangé : chaque pattern accepte toujours `seen by "<bot name>"`, et `event-bot` est
disponible dans chaque événement, exactement comme avant.

L'événement `disky command` est devenu [`on discord command used`](event:events#discord-command-used). Il
reste annulable, et un nouvel événement frère, `on discord command failed`, se déclenche quand une commande
est refusée (temps de recharge, permission manquante, argument invalide).

```skript
# DiSky 4
on disky command:
    cancel event

# DiSky 5
on discord command used seen by "my-bot":
    send "%event-user% used %name of event-discordcommand%" to console

on discord command failed seen by "my-bot":
    send "refused: %failure reason%" to console
```

`on disky error` fonctionne toujours sous le même nom, et `on discord error` ou `on disky exception` sont
acceptés aussi. Il expose désormais `event-discorderror` au lieu de `event-string`, une nouvelle expression
`error location`, et ne se déclenche que pour les erreurs qu'aucun bloc `try` n'a interceptées (voir
[erreurs](doc:concepts/errors)).

`on member ban` et `on member kick` sont supprimés. Pour un bannissement, utilisez
[`on guild ban`](event:events#guild-ban-event) (`event-user`, `event-guild` ; il n'y a pas de
`event-member`, car l'utilisateur a pu partir). DiSky 5 n'a pas d'événement d'expulsion : une expulsion est
enregistrée dans le journal d'audit ; lisez-la donc depuis
[`on guild log entry create`](event:events#guild-log-entry-create-event) et vérifiez le `log action type`
de l'entrée.

```skript
on guild log entry create seen by "my-bot":
    send "%log action type of event-entry%: %logged user of event-entry%" to console
```

## Anciennes et nouvelles valeurs {#old-and-new-values}

DiSky 4 donnait à chaque événement "X changed" deux expressions, `new X` et `old X` (ainsi que `current` et
`past`). Dans DiSky 5, environ 45 de ces événements exposent plutôt les valeurs sous forme de valeurs de
l'événement typées : la nouvelle est `event-<type>`, la précédente est `past event-<type>`, et les
expressions `new X` / `old X` n'existent plus.

```skript
# DiSky 4
on channel name change:
    send "%old channel name% -> %new channel name%" to console

# DiSky 5
on channel name change seen by "my-bot":
    send "%past event-text% -> %event-text%" to console
```

Les familles passées aux valeurs sont les mises à jour de salons (nom, sujet, nsfw, position, parent, mode
lent, limite d'utilisateurs, bitrate, archivé, verrouillé, etc.), les mises à jour de serveurs (salon AFK,
bannière, nombre de boosts, icône, nom, propriétaire, splash), les mises à jour de rôles (couleur, nom,
affiché séparément, icône, position, mentionnable), ainsi que les mises à jour du nom des émojis et des
stickers. Les événements d'arrivée et de départ vocal exposent le salon comme `event-channel`, et
`past event-channel` pour celui qui a été quitté.

Les événements qui ont gardé des expressions sont les mises à jour de membres, d'utilisateurs et
d'événements programmés, les permissions de rôles, les rôles d'émojis et les tags de stickers. Ils ont perdu
le préfixe `new` et `current` : la valeur actuelle prend la forme nue, et l'ancienne accepte toujours `old`,
`past` et `previous`.

```skript
# DiSky 4
on member nickname change:
    send "%old member nickname% -> %new member nickname%" to console

# DiSky 5
on member nickname change seen by "my-bot":
    send "%old member nickname% -> %member nickname%" to console
```

Quelques valeurs ont aussi changé de type :

- La mise à jour de la région d'un salon donne un texte, et `<none>` quand la région est automatique.
- La mise à jour de la durée d'archivage automatique d'un salon donne un nombre de minutes.
- La mise à jour des flags d'un salon expose `new flags` et `old flags` sous forme de liste de textes.
- La mise à jour de la réaction par défaut d'un salon expose `new default reaction` et
  `old default reaction`, car Skript analyse `event-emoji` comme un pluriel.

| Événement | Nouvelle valeur DiSky 5 | Ancienne valeur DiSky 5 |
| --- | --- | --- |
| `on channel name change` | `event-text` | `past event-text` |
| `on channel slowmode change` | `event-number` | `past event-number` |
| `on guild name change` | `event-text` | `past event-text` |
| `on role color change` | `event-color` | `past event-color` |
| `on member nickname change` | `member nickname` | `old member nickname` |
| `on user name change` | `name` | `old name` |
| `on channel flags change` | `new flags` | `old flags` |

La [référence des événements](/events) liste les valeurs exactes de chaque événement ; fiez-vous à elle
plutôt que de deviner le type.

## L'auteur de l'événement {#the-event-author}

DiSky 4 exposait `event-author` sur environ 80 événements (rôle ajouté, salon créé, membre banni, serveur
mis à jour...), rempli en lisant le journal d'audit du serveur. DiSky 5 n'a `event-author` sur aucun
événement ; un script qui le lit ne passe donc plus l'analyse.

Le journal d'audit reste lisible, et c'est là que se trouve l'auteur. Dans `on guild log entry create`,
`event-entry` est l'entrée et `logged user of event-entry` est l'utilisateur qui a agi. En dehors de cet
événement, `audit logs of %guild%` renvoie les entrées récentes, et demande
[`await`](doc:concepts/cache-and-await) car il interroge Discord.

```skript
on guild log entry create seen by "my-bot":
    send "%logged user of event-entry% did %log action type of event-entry% (%log reason of event-entry%)" to console
```

Pour réagir à l'auteur d'un changement précis, écoutez l'événement d'entrée du journal et filtrez sur
`log action type`, au lieu de lire `event-author` dans l'événement de changement.

## Valeurs récupérées {#retrieved-values}

Dans DiSky 4, certaines valeurs étaient marquées comme valeurs REST et devaient être récupérées avec
`retrieve event-message and store it in {_m}`. L'effet `retrieve event-x` a disparu : DiSky 5 récupère ces
valeurs avant le démarrage de votre trigger (bloc de code), ce sont donc des valeurs ordinaires qui n'ont
jamais besoin de `await`.

- Vote de sondage ajouté et retiré : `event-message`, `event-member` et `event-user`.
- Utilisateur ajouté et retiré d'un événement programmé : `event-user` et `event-member`.
- Réaction ajoutée, retirée et toutes retirées : le message est l'expression `reaction message` (le mot
  `reaction` est obligatoire), et non `event-message`.

```skript
# DiSky 4
on reaction add:
    retrieve event-message and store it in {_m}

# DiSky 5
on reaction add seen by "my-bot":
    send "%event-user% reacted to '%discord content of reaction message%'" to console
```

Le trigger démarre après l'aller-retour réseau. La suppression et la modification de message ont perdu le
contenu en cache que DiSky 4 conservait : `on message delete` n'expose plus ni le message supprimé ni son
ancien texte, seulement `event-guild`, `event-channel` et l'identifiant du message sous forme de
`event-number` ; `on message edit` expose le nouveau `event-message` mais pas de `event-string` avec le
contenu précédent. DiSky 5 n'a pas de cache de messages (copie en mémoire) d'où les restaurer.

Dans la réaction ajoutée et retirée, `event-emote` est désormais uniquement l'émoji personnalisé, et
`<none>` pour un emoji unicode. Pour lire n'importe quelle réaction, personnalisée ou unicode, utilisez
l'expression `reaction emoji` (`event-emoji` ne passe pas l'analyse : Skript lit le mot comme un pluriel).

```skript
on reaction add seen by "my-bot":
    send "%event-user% reacted with %reaction emoji%" to console
```

## Ce qu'il faut changer {#what-to-change}

| Dans DiSky 4 | Dans DiSky 5 |
| --- | --- |
| `on disky command` | `on discord command used`, et `on discord command failed` |
| `on member ban`, `on member kick` | `on guild ban`, `on guild log entry create` |
| `new X`, `old X` dans un événement de changement | `event-X`, `past event-X` |
| `new nickname`, `current name` | `nickname`, `name` |
| `event-author` | `logged user of event-entry` dans `on guild log entry create` |
| `retrieve event-message and store it in {_m}` | `event-message`, ou `reaction message` |
| `event-string` dans la suppression et la modification de message | aucun |
| `event-emote` dans la réaction ajoutée et retirée | `reaction emoji` (personnalisé ou unicode) |

event: events#discord-command-used compact

event: events#guild-log-entry-create-event compact
