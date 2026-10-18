---
title: Erreurs
description: Ce qui se passe lorsque Discord refuse une action, et comment try/catch, the last discord error et l'événement d'erreur global permettent à un script d'y réagir.
source-hash: 34c569a7d862
---

Cette page explique ce que fait DiSky lorsqu'une action échoue, côté Discord ou dans votre
script, ainsi que les outils pour y réagir : la section `try` / `catch` (bloc indenté),
`the last discord error` et l'événement `on disky exception`. Vous devez déjà avoir un bot nommé
`"my-bot"` connecté et un serveur où il peut agir.

## Ce qui se passe sans try {#what-happens-without-a-try}

Chaque effet qui communique avec Discord peut être refusé : le bot n'a pas la permission, la cible
a été supprimée, la valeur est hors limites. Une valeur obligatoire qui ne donne rien (une variable
non définie passée à `kick`) provoque le même échec, avant tout envoi. Dans les deux cas, DiSky
affiche dans la console un bloc *Discord error* lisible, et le trigger continue : la ligne en échec
ne fait rien, les lignes suivantes s'exécutent normalement, rien ne plante.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-nobody":
        discord kick {_nobody}
        reply with "still running: %the last discord error%"
```

Le bloc affiché dans la console a la forme suivante. Sa première ligne contient l'erreur elle-même :
`[code] meaning` pour une erreur renvoyée par Discord, `Exception: message` pour une erreur levée
avant que la requête ne parte. La ligne `at` pointe vers la ligne du script en échec, puis vient la
trace de la pile de l'exception sous-jacente.

```text
[DiSky] ---------------- Discord error ----------------
[DiSky] IllegalArgumentException: the member of 'kick' is not set
[DiSky] at discord kick {_nobody} (errors.sk, line 3)
[DiSky] -----------------------------------------------
```

L'erreur est aussi mémorisée dans [the last discord error](syntax:core/expressions#expression-last-discord-error),
afin que la ligne suivant l'échec puisse la lire. Cette expression est globale : elle contient la
dernière erreur de n'importe quel bot, interceptée ou non, et vaut `<none>` tant qu'aucune erreur ne
s'est produite. Pour traiter toutes ces erreurs au même endroit plutôt que de lire la console, voir
[gérer toutes les erreurs non interceptées](#handling-every-uncaught-error).

## Intercepter les erreurs avec try {#catching-errors-with-try}

Placez les lignes susceptibles d'échouer dans un [`try`](syntax:core/sections#section-try-catch),
suivi d'un `catch` qui nomme une variable de liste. Une fois le corps du `try` terminé, les erreurs
produites sont stockées dans cette variable et le corps du `catch` s'exécute ; si rien n'a échoué,
le `catch` est ignoré. Le préfixe `discord` de `kick` est expliqué [plus bas](#kick-and-skripts-own-kick).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick":
        try:
            discord kick event-member because of "try/catch demo"
        catch {_errors::*}:
            reply with "Could not kick: %{_errors::*}%"
```

Trois règles rendent la section prévisible :

- Une ligne en échec n'interrompt pas le corps du `try`. L'erreur est mise en tampon et la ligne
  suivante s'exécute ; une variable définie par un builder (objet de construction) ou un getter en
  échec reste donc simplement non définie. Vérifiez-la avant de l'utiliser.
- Plusieurs échecs dans un même corps arrivent ensemble dans un seul `catch`, dans l'ordre, un
  élément par échec : `%number of {_errors::*}%` indique combien il y en a.
- Le tampon appartient à l'événement traité, et non à un thread. Les effets s'exécutent sur un thread de
  travail, tandis que le trigger continue sur le thread principal ; le `catch` voit tout de même chaque
  erreur, et deux triggers exécutés en même temps ne voient jamais les erreurs l'un de l'autre.

`await` fonctionne comme d'habitude dans un `try` : une lecture en simple récupération, ou un
résultat de builder que Discord refuse, arrive dans le `catch` comme le ferait un effet (voir
[le cache (copie en mémoire) et await](doc:concepts/cache-and-await)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-many":
        try:
            discord kick {_nobody}
            unmute {_nobody2}
        catch {_errors::*}:
            reply with "%number of {_errors::*}% error(s): %{_errors::*}%"
```

Imbriquer un `try` dans un autre n'est pas pris en charge : la section interne remplace le tampon de
l'événement, si bien que les erreurs levées dans le corps externe, avant ou après la section interne,
sont affichées dans la console au lieu d'atteindre le `catch` externe. Gardez un seul `try` par bloc
de lignes liées.

!!! warning "Un catch doit suivre directement son try"
    `catch` doit être la section qui suit immédiatement le `try` auquel il appartient ; toute ligne
    entre les deux provoque une erreur d'analyse (*A 'catch' section must directly follow a 'try' section.*).
    Un `catch` écrit sans `try` est accepté et ne s'exécute jamais.

### Arrêter le trigger {#stopping-the-trigger}

Ajoutez `and stop` à la ligne du `catch` pour terminer le trigger une fois son corps exécuté. Sans
cela, le trigger continue après le `catch` comme si le `try` avait réussi.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-or-stop":
        try:
            discord kick event-member
        catch {_errors::*} and stop:
            reply with "Could not kick, giving up."
        reply with "Kicked %event-member%."
```

syntax: core/sections#section-try-catch compact

## Lire une erreur {#reading-an-error}

Qu'elle provienne d'une variable de `catch` ou de `the last discord error`, une erreur est un
`discorderror` doté de trois propriétés.

| Propriété | Pour un refus de Discord | Pour un échec côté script |
| --- | --- | --- |
| [`error code`](syntax:discorderror#error-code) | Le code numérique de Discord (`50013`) | `-1` |
| [`error meaning`](syntax:discorderror#error-meaning) | Le libellé court de Discord (`Missing Permissions`) | le nom de l'exception (`IllegalArgumentException`) |
| [`error message`](syntax:discorderror#error-message) | le même libellé que la signification ; pour un `50035`, les champs rejetés par Discord | le message complet (`the member of 'kick' is not set`) |

Affichée sous forme de texte (`%{_errors::*}%`, `%loop-value%`, `%the last discord error%`), une
erreur s'écrit `[50013] Missing Permissions` lorsque Discord l'a refusée, et
`IllegalArgumentException: the member of 'kick' is not set` lorsque le script l'a levée. Testez le
code pour donner une réponse précise :

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick":
        try:
            discord kick event-member
        catch {_errors::*}:
            if error code of {_errors::1} is 50013:
                reply with "I'm missing the Kick Members permission."
            else:
                reply with "Kick failed: %error meaning of {_errors::1}%"
```

Hors d'un `try`, [the last discord error](syntax:core/expressions#expression-last-discord-error)
donne le même objet pour le dernier échec. Comme elle est globale et jamais effacée, comparez-la à
ce que vous attendez plutôt que de tester si elle est définie.

```skript
on ready seen by "my-bot":
    discord kick {_nobody}
    send "code %error code of the last discord error%: %the last discord error%" to console
```

syntax: core/expressions#expression-last-discord-error compact

## Gérer toutes les erreurs non interceptées {#handling-every-uncaught-error}

Un gestionnaire [`on disky exception`](event:events#disky-error-event) (`on discord error` est le
même événement) se déclenche sur le thread principal pour chaque erreur qu'aucun `try` n'a
interceptée, juste avant que DiSky ne l'affiche. `event-discorderror` est l'erreur, avec les trois
propriétés ci-dessus, et `error location` indique le fichier de script et la ligne en échec.
Écrivez `cancel event` pour que l'erreur n'apparaisse pas dans la console.

```skript
on disky exception:
    cancel event
    send "[my-bot] %event-discorderror% (%error location ? "no script line"%)" to console
    if error code of event-discorderror is 50013:
        post "Missing permission: %error meaning of event-discorderror%" to text channel with id "123456789012345678"
```

Quatre règles précisent ce qui atteint le gestionnaire et ce qu'il change :

- Une erreur levée dans un `try` va dans son `catch` et ne déclenche jamais l'événement : un script
  peut donc combiner les deux, `try` là où il a une réponse précise, le gestionnaire global pour le reste.
- `cancel event` décide seulement si le bloc est affiché dans la console, et cette décision est prise
  dès que le gestionnaire marque une pause. Annulez avant le premier `wait` ou le premier effet
  Discord, comme ci-dessus.
- Une erreur levée par le gestionnaire lui-même (un salon de journalisation supprimé) est affichée
  dans la console et ne déclenche jamais l'événement à nouveau : un gestionnaire en échec ne peut
  donc pas boucler. Seule exception : une propriété modifiée sans `await`, dont la requête part en
  arrière-plan et revient sans trigger associé ; écrivez `await set ...` dans le gestionnaire.
- `event-bot` est le bot dont l'événement s'exécutait au moment de l'erreur. Il n'est pas défini
  pour une erreur sans trigger derrière elle, pas plus que `error location` ; un filtre
  `seen by "my-bot"` ignore ces erreurs.

event: events#disky-error-event compact

## Codes d'erreur Discord courants {#common-discord-error-codes}

Les codes ci-dessous sont ceux que rencontre le plus souvent un script de modération ou de
messagerie ; la colonne de signification contient le texte exact que renvoie `error meaning` pour
chacun d'eux.

| Code | Signification | Cause typique |
| --- | --- | --- |
| `10003` | Unknown Channel | Le salon a été supprimé, ou l'identifiant est incorrect |
| `10007` | Unknown Member | L'utilisateur a quitté le serveur avant l'exécution de l'action |
| `10008` | Unknown Message | Le message a été supprimé, ou l'identifiant est incorrect |
| `10011` | Unknown Role | Le rôle a été supprimé, ou l'identifiant est incorrect |
| `10013` | Unknown User | Aucun compte Discord ne possède cet identifiant |
| `10026` | Unknown Ban | `unban` sur un utilisateur qui n'est pas banni |
| `10062` | Unknown Interaction | L'interaction a expiré (3 secondes pour l'acquitter, 15 minutes pour la suite) |
| `40060` | Interaction has already been acknowledged | Une seconde réponse ou un second différé sur la même interaction |
| `50001` | Missing Access | Le bot ne voit pas le salon ni le serveur |
| `50006` | Cannot send an empty message | Un message sans contenu, embed, composant ni fichier |
| `50007` | Cannot send messages to this user | L'utilisateur a désactivé les messages privés du serveur, ou a bloqué le bot |
| `50013` | Missing Permissions | Le rôle du bot n'a pas la permission, ou se situe sous le rôle le plus élevé de la cible |
| `50034` | A Message provided to bulk_delete was older than 2 weeks | Suppression en masse de messages datant de plus de 14 jours |
| `50035` | Invalid Form Body | Une valeur dépasse les limites de Discord (texte trop long, format d'identifiant incorrect, une seconde règle d'un type AutoMod limité à une règle par serveur) ; le message d'erreur indique chaque champ rejeté sous la forme `field: reason` |

Discord documente la liste complète sous
[Opcodes and Status Codes](https://discord.com/developers/docs/topics/opcodes-and-status-codes#json).

## `kick` et le `kick` de Skript {#kick-and-skripts-own-kick}

Skript fournit un effet `kick %players%`, enregistré avant le `kick %member%` de DiSky. Lorsque
l'opérande est une variable non typée comme `{_target}`, c'est l'effet de Skript qui l'emporte à
l'analyse, et il ne fait rien à l'exécution, sans rien signaler : ni ligne dans la console, ni
erreur à intercepter. Écrivez [`discord kick`](syntax:member#kick) lorsque le membre provient d'une
variable ; avec une valeur typée comme `event-member`, les deux écritures atteignent DiSky.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-var":
        set {_target} to event-member
        try:
            discord kick {_target} because of "spam"
        catch {_errors::*}:
            reply with "%{_errors::*}%"
```

!!! tip "Préfixer les effets de modération par habitude"
    `discord kick` est toujours accepté : utiliser le préfixe partout ne coûte rien et supprime le
    seul cas où un échec ne laisse aucune trace. Les autres effets de modération (`ban`, `unban`,
    `mute`, `time out`) n'ont pas d'équivalent dans Skript et n'ont pas besoin de préfixe.

entity: discorderror
