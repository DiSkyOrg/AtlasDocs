---
title: Commandes et composants
description: Ce qui change pour les commandes slash, contextuelles et textuelles, les boutons, menus déroulants, fenêtres modales et Components V2 quand vous portez un script DiSky 4.
source-hash: 630da9b2233c
---

Cette page liste ce qu'il faut changer dans un script DiSky 4 qui déclare des commandes ou envoie des composants. Vous devez déjà avoir un bot nommé `"my-bot"` connecté et connaître la syntaxe DiSky 4 que vous portez.

## Commandes slash et contextuelles {#slash-and-context-commands}

C'est le plus gros changement. Dans DiSky 4, une structure `slash command`, `user command` ou `message command` s'enregistrait toute seule sur Discord à la connexion du bot. Dans DiSky 5, ces structures sont **des modèles uniquement** : charger, recharger ou décharger l'une d'elles ne touche jamais Discord. Rien n'apparaît tant qu'un script n'exécute pas [update the discord commands](syntax:core/effects#effect-update-discord-commands) (remplacement complet) ou [register the discord command](syntax:core/effects#effect-register-discord-command) (insertion ou mise à jour), généralement depuis `on guild ready` ou `on ready`. Voir [Enregistrer des commandes](doc:interaction-commands/registering-commands).

Les entrées `bot:` et `guilds:` n'existent plus : ce sont des erreurs de chargement, supprimez-les. Le bot et le serveur cibles viennent de l'appel d'enregistrement. Les arguments passent de `<type="name">` à `<name: type>`, et la valeur est aussi lisible via `{_name}`.

DiSky 4 :

```skript
slash command ban <member="target"> [<string="reason">]:
    bot: "my-bot"
    guilds: 123456789012345678
    description: Ban a member
    enabled for: ban members
    arguments:
        target: Who to ban
        reason: Why
    trigger:
        defer the interaction
        reply with "Banned %arg-1% (%arg-2%)"
```

DiSky 5 (le bot est déjà connecté ; voir [Démarrer un bot](doc:getting-started/starting-a-bot)) :

```skript
slash command ban <target: member> [<reason: string>]:
    description: Ban a member
    enabled for: ban members
    arguments:
        target: Who to ban
        reason: Why
    trigger:
        defer the interaction
        reply with "Banned %{_target}% (%{_reason}%)"

on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

`update` remplace toute la liste de ce serveur ou de ce bot, donc un seul appel doit porter toutes les structures : `all structured application commands` rassemble chaque commande slash, `user` et `message`. Utilisez `globally in event-bot` depuis `on ready` pour les commandes globales. Les commandes contextuelles suivent la même règle ; seules leurs entrées diffèrent :

```skript
user command Report user:
    trigger:
        reply with hidden "Reported %target user%"
```

Les commandes construites à l'exécution continuent de fonctionner avec de nouvelles formulations : le mot `new` est désormais obligatoire (`a new slash command named "greet" with description "..."`), les drapeaux `required` et `autocomplete` deviennent `set required of {_opt} to true`, et les objets de données de locale sont remplacés par l'effet [localize](syntax:core/effects#effect-localize-command). Voir [Builders de commandes](doc:interaction-commands/command-builders) et [Options slash](doc:interaction-commands/slash-options).

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| entrées `bot:` et `guilds:` | supprimées | Erreur de chargement ; passez le bot ou le serveur à l'effet d'enregistrement |
| `<user="target">` | `<target: user>` | Nom d'abord, type Skript ensuite ; pas de valeurs par défaut sur les arguments slash |
| `arguments:` obligatoire | facultatif | Omettez-le quand aucun argument n'a besoin de description |
| `update commands {_c} globally in event-bot` | `update the discord commands {_c} globally in event-bot` | `update` remplace tout, `register` ajoute ou remplace uniquement les commandes listées |
| `unregister ... globally from %bot%` | `unregister the discord command "x" globally from event-bot` | Accepte aussi `all` |
| `remaining time` | `remaining cooldown` | Même sens |
| `return %slashchoices%` | `return choices %slashchoices%` | Le mot `choices` (ou `completions`) est obligatoire |
| `a new choice "x" with value "y"` | `a new choice named "x" with the value "y"` | `named` ou `with the name` est obligatoire |
| `new locale data for "fr" as "x"` | `localize the name of {_c} in "fr" to "x"` | Les objets de données de locale n'existent plus |
| `disable %slashcommand%` | `set disabled of {_c} to true` | Propriété de la commande |
| `slashcommandgroup`, `subslashcommand` types | `subcommandgroup`, `subcommand` | Compte pour les tests `x is a ...` |

## Commandes textuelles {#text-commands}

La structure `discord command` garde son en-tête et ses entrées (`aliases`, `roles`, `permissions`, `bots`, `executable in`, `prefixes`, `usage`, `description`, `category`, `permission message`, `trigger`). Les arguments gardent la même forme positionnelle (`<member>`, `arg-1`) ; une forme nommée `<who: member>` remplit aussi `{_who}`.

Un point se lit différemment. DiSky 4 séparait le premier caractère du nom pour en faire le préfixe quand aucune entrée `prefixes:` n'était donnée. DiSky 5 donne à la commande un préfixe vide et fait correspondre le nom entier, donc `discord command !ping` répond toujours à `!ping`. Rien ne casse, mais le nom de la commande est maintenant `!ping` et `used prefix` est vide. Déclarez `prefixes: "!"` sur `discord command ping` si un script lit le nom ou le préfixe séparément.

DiSky 4 :

```skript
discord command slow:
    prefixes: !
    guild cooldown: 10 seconds
    cooldown message: You must wait
    trigger:
        reply with "ok"

on disky command:
    cancel event
```

DiSky 5 :

```skript
discord command slow:
    prefixes: "!"
    cooldown: 10 seconds
    cooldown scope: guild
    cooldown message: "Wait %remaining cooldown% before using this again."
    trigger:
        reply with "ok"

on discord command used:
    cancel event
```

`prefixes` est maintenant une expression évaluée à chaque message, donc mettez les valeurs textuelles entre guillemets. Voir [Déclarer une commande](doc:chat-commands/declaring-a-command), [Restreindre une commande](doc:chat-commands/restricting-a-command) et [Liste et événements](doc:chat-commands/listing-and-events).

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `discord command !ping` (sans `prefixes:`) | ligne identique | Répond toujours à `!ping` ; le nom inclut maintenant `!` et le préfixe est vide |
| `prefixes: !, ?` | `prefixes: "!", "?"` | Mettez les valeurs entre guillemets |
| `cooldown message: text` | `cooldown message: "text"` | Peut utiliser `%remaining cooldown%` |
| `guild cooldown: 10 seconds` | `cooldown: 10 seconds` and `cooldown scope: guild` | La portée est `user` (par défaut), `guild` ou `channel` |
| (aucun) | `usage message: "..."` | Envoyé en cas d'arguments invalides |
| `on disky command` | `on discord command used` | Annulable ; `on discord command failed` se déclenche quand une vérification refuse |
| `event-string` (the prefix) | `used prefix` | Plus de valeur d'événement textuelle |
| `used-prefix`, `used-alias`, `used-args` | `used prefix`, `used alias`, `used arguments` | Les formes avec trait d'union ne sont plus analysées |

## Composants et interactions {#components-and-interactions}

Les boutons, menus déroulants, rangées, conteneurs et fenêtres modales sont maintenant des holders modifiables : `event-button` et `event-dropdown` peuvent être changés puis renvoyés, et le composant construit est un instantané. Une rangée est facultative ; un bouton ajouté aux composants d'un message rejoint la dernière rangée qui a de la place, et un menu déroulant a la sienne. Tout composant Components V2 passe le message en V2 de lui-même. Voir [Envoyer des messages](doc:messages/sending-messages).

Plusieurs mots facultatifs sont devenus obligatoires, et le type `label` a disparu : chaque champ de fenêtre modale reçoit son libellé dans son constructeur (`labeled "..."`) et possède une `description`. La section `apply component replacement` n'a pas d'équivalent ; remplacez les composants un par un.

DiSky 4 :

```skript
on button clicked:
    if clicked button is "yes":
        edit button of the event to show new success button with id "yes" named "Done"

set {_modal} to a new modal with id "form" named "Feedback"
set {_input} to a new short text input with id "title"
set {_label} to new label "Feedback Title" with {_input}
add {_label} to rows of {_modal}
show {_modal}
```

DiSky 5 :

```skript
on button clicked:
    if clicked id is "yes":
        set label of event-button to "Done"
        replace the component with id "yes" of event-message with event-button
    else if clicked id is "open":
        set {_modal} to a new modal with id "form" titled "Feedback"
        set {_input} to a new short text input with id "title" labeled "Feedback Title"
        add {_input} to components of {_modal}
        show {_modal}
```

`replace the component with id ...` remplace un seul composant. [edit interaction components](syntax:core/effects#effect-edit-interaction-components) remplace tous les composants du message, et demande d'abord `defer the interaction and edit`. `reply with` ne stocke plus le message et n'a plus d'entrée `content:` : construisez un message avec `a new message with content "..." in %channel%`, attachez les composants avec `add ... to components of {_m}`, puis `reply with {_m}` ; un composant seul peut être envoyé directement en réponse.

| DiSky 4 | DiSky 5 | Note |
| --- | --- | --- |
| `clicked button` (the id text) | `clicked id` or `clicked button id` | `event-button` est maintenant le bouton lui-même |
| `edit button of the event to show %b%` | `replace the component with id "x" of event-message with %b%` | Remplace un composant |
| `edit message component with the id %s% of %message% to show %b%` | `replace the component with id %s% of %message% with %b%` | Fonctionne sur tout composant ; `unique id` est aussi accepté |
| `apply component replacement ...` | supprimé | Remplacez les composants un par un |
| `defer the interaction and wait silently` | `defer the interaction hidden` | `and wait` a disparu ; `and edit` est nouveau pour les clics |
| `new primary button "x"` | `new primary button with id "x"` | Le mot `id` est obligatoire ; les boutons de lien utilisent `with url` |
| `new entities dropdown ... targeting "users"` | `new entity dropdown ... targeting users and roles` | Prend l'enum `selecttarget`, pas du texte |
| `new modal ... named "x"`, `new label ...` | `new modal ... titled "x"`; `labeled` on the input | Le type `label` est supprimé |
| `rows of %message%` | `components of %messageaction%` | Fonctionne aussi sur les rangées, conteneurs et fenêtres modales |
| `make a new container ...:` section | `a new container` | Une expression ; `content of` devient `components of` |
| `spoiler state` | `spoiler` | Nom de propriété raccourci |

syntax: core/effects#effect-edit-interaction-components compact
