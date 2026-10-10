---
title: Obtenir des entités par identifiant
description: Retrouver un serveur, un rôle, un utilisateur, un membre, un salon ou un message à partir de son identifiant Discord, depuis le cache ou depuis Discord.
source-hash: 893b6eae5d40
---

Cette page présente les expressions `X with id "..."` : quelles entités en possèdent une, lesquelles
demandent une portée, et quand la recherche lit le cache ou interroge Discord. Vous devez avoir un bot
connecté sous le nom `"my-bot"`, et connaître les [règles de await](doc:concepts/cache-and-await), qui
ne sont pas répétées ici.

## Fonctionnement d'un getter {#how-a-getter-works}

Chaque entité accessible hors d'un événement possède un getter de la forme `X with id %string%`. L'identifiant
est le snowflake (identifiant Discord) de l'entité, copié depuis le client avec le **Mode développeur** activé (clic droit,
**Copier l'identifiant**). Le getter renvoie l'entité, ou rien lorsque le bot ne connaît pas cet identifiant.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!role":
        set {_role} to role with id "123456789012345678"
        reply with "role: %name of {_role}%"
```

| Getter | Portée | Await | Exemple |
| --- | --- | --- | --- |
| [guild with id](syntax:guild#guild-with-id) | bot | cache uniquement | `guild with id "..."` |
| [role with id](syntax:role#role-with-id) | bot | cache uniquement | `role with id "..."` |
| [user with id](syntax:user#user-with-id) | bot | facultatif : cache, ou Discord avec `await` | `await set {_u} to user with id "..."` |
| [text channel with id](syntax:textchannel#text-channel-with-id) | bot | cache uniquement | `text channel with id "..."` |
| [voice channel with id](syntax:voicechannel#voice-channel-with-id) | bot | cache uniquement | `voice channel with id "..."` |
| [stage channel with id](syntax:stagechannel#stage-channel-with-id) | bot | cache uniquement | `stage channel with id "..."` |
| [news channel with id](syntax:newschannel#news-channel-with-id) | bot | cache uniquement | `news channel with id "..."` |
| [forum channel with id](syntax:forumchannel#forum-channel-with-id) | bot | cache uniquement | `forum channel with id "..."` |
| [category with id](syntax:category#category-with-id) | bot | cache uniquement | `category with id "..."` |
| [thread channel with id](syntax:threadchannel#thread-channel-with-id) | bot | cache uniquement | `thread channel with id "..."` |
| [member with id](syntax:member#member-with-id) | `in %guild%` | facultatif : cache, ou Discord avec `await` | `await set {_m} to member with id "..." in event-guild` |
| [scheduled event with id](syntax:scheduledevent#scheduled-event-with-id) | `in %guild%` | cache uniquement | `scheduled event with id "..." in event-guild` |
| [message with id](syntax:message#message-with-id) | `in %channel%` | obligatoire | `await set {_msg} to message with id "..." in event-channel` |

Les identifiants sont du texte, jamais des nombres : un snowflake comme `1234567890123456789` a plus de
chiffres que Skript n'en conserve avec précision, donc `role with id 1234567890123456789` chercherait un
identifiant arrondi. Mettez toujours l'identifiant entre guillemets, ou passez une variable texte qui le
contient.

## Getters globaux et bot {#global-getters-and-the-bot}

Les serveurs, rôles, utilisateurs et salons n'appartiennent à rien que vous détenez déjà : leurs getters
cherchent donc l'identifiant dans le cache d'un bot, et doivent savoir de quel bot il s'agit. Chacun se
termine par un `with bot %bot%` facultatif : omettez-le lorsqu'un seul bot est connecté, et nommez le bot
lorsque plusieurs le sont.

```skript
on ready seen by "my-bot":
    set {_guild} to guild with id "123456789012345678" with bot event-bot
    send "found %name of {_guild}% on %event-bot%" to console
```

Lorsque `with bot` est omis et qu'un seul bot est en cours d'exécution, ce bot est utilisé. Lorsque plusieurs
bots tournent, DiSky en choisit un et affiche un avertissement dans la console qui vous demande de préciser le
bot ; la recherche s'exécute quand même, mais sur un bot qui n'est peut-être pas présent dans le serveur attendu.
Les scripts qui font tourner [plusieurs bots](doc:getting-started/multiple-bots) doivent toujours passer
`with bot`.

syntax: member#member-with-id compact

## Getters à portée {#scoped-getters}

Un membre, un événement programmé et un message n'existent qu'à l'intérieur d'autre chose : leurs getters
prennent donc ce conteneur au lieu d'un bot, par exemple `member with id "..." in event-guild`,
`scheduled event with id "..." in event-guild` ou `message with id "..." in event-channel`. Le bot est celui
qui détient le conteneur, il n'y a donc pas de `with bot` à ajouter. `from` fonctionne à la place de `in`, et
le mot désignant le type est facultatif (`in guild {_g}`, `in channel {_c}`).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!fetch":
        await set {_msg} to message with id "123456789012345678" in event-channel
        reply with "that message says: %discord content of {_msg}%"
```

`message with id` ne fait que de la récupération : les messages ne sont pas mis en cache, le getter interroge
donc toujours Discord, et la ligne doit porter `await`. Sans lui, le script ne se charge pas.

syntax: message#message-with-id compact

## Cache ou Discord {#cache-or-discord}

`user with id` et `member with id` lisent le cache lorsqu'ils sont écrits simplement, et interrogent Discord
lorsque la ligne commence par `await`. La forme avec cache est immédiate, mais ne connaît que les utilisateurs
et membres que le bot a déjà rencontrés (ce qui dépend de la politique de cache des membres) ; la forme avec
await trouve n'importe quel utilisateur que le bot a le droit de voir.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!whois":
        set {_cached} to member with id "123456789012345678" in event-guild
        await set {_fresh} to member with id "123456789012345678" in event-guild
        reply with "cached: %{_cached}%, fetched: %{_fresh}%"
```

Avec `await`, le cache est tout de même consulté en premier, et Discord n'est interrogé qu'en cas d'absence ;
préfixer chaque recherche avec `await` ne coûte donc rien lorsque l'entité est déjà connue. Les autres getters
n'utilisent que le cache : un salon ou un rôle que le bot ne voit pas dans son cache n'est pas trouvé, quel que
soit le préfixe de la ligne.

## Quand l'identifiant est inconnu {#when-the-id-is-unknown}

Une recherche en cache qui ne trouve rien renvoie rien : la variable reste non définie, et aucune erreur
n'est affichée. Une recherche avec await que Discord ne peut pas résoudre produit une erreur Discord
(*Unknown User*, *Unknown Member*, *Unknown Message*), signalée de façon lisible dans la console, et la
variable reste elle aussi non définie. Vérifiez la variable avant de l'utiliser, ou entourez la recherche
d'un `try` (voir [Erreurs](doc:concepts/errors)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!check":
        await set {_user} to user with id "000000000000000000"
        if {_user} is not set:
            reply with "no user with that id"
            stop
        reply with "found %name of {_user}%"
```

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *the 'message with id' getter is online-only and requires 'await'* | `message with id` a été utilisé sur une ligne sans `await` | Préfixez la ligne avec `await` |
| *Several bots are loaded but none was specified; using '\<name>'. Specify the bot explicitly to remove this ambiguity.* | Un getter global a été exécuté sans `with bot` alors que plusieurs bots étaient connectés | Ajoutez `with bot event-bot` (ou `with the bot named "my-bot"`) au getter |
