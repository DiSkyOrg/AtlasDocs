---
title: Obtener entidades por ID
description: Busca un servidor, rol, usuario, miembro, canal o mensaje a partir de su ID de Discord, desde la caché o desde Discord.
source-hash: 893b6eae5d40
---

Esta página cubre las expresiones `X with id "..."`: qué entidades tienen una, cuáles necesitan un ámbito y
cuándo la búsqueda lee la caché o pregunta a Discord. Se asume que tienes un bot conectado como `"my-bot"`
y que conoces las [reglas de await](doc:concepts/cache-and-await), que aquí no se repiten.

## Cómo funciona un getter {#how-a-getter-works}

Toda entidad a la que puedes llegar desde fuera de un evento tiene un getter con la forma
`X with id %string%`. El ID es el *snowflake* (identificador de Discord) de la entidad, copiado desde el
cliente con el **Modo desarrollador** activado (clic derecho, **Copiar ID**). El getter devuelve la entidad,
o nada si el bot no conoce ese ID.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!role":
        set {_role} to role with id "123456789012345678"
        reply with "role: %name of {_role}%"
```

| Getter | Ámbito | Await | Ejemplo |
| --- | --- | --- | --- |
| [guild with id](syntax:guild#guild-with-id) | bot | solo caché | `guild with id "..."` |
| [role with id](syntax:role#role-with-id) | bot | solo caché | `role with id "..."` |
| [user with id](syntax:user#user-with-id) | bot | opcional: caché, o Discord con `await` | `await set {_u} to user with id "..."` |
| [text channel with id](syntax:textchannel#text-channel-with-id) | bot | solo caché | `text channel with id "..."` |
| [voice channel with id](syntax:voicechannel#voice-channel-with-id) | bot | solo caché | `voice channel with id "..."` |
| [stage channel with id](syntax:stagechannel#stage-channel-with-id) | bot | solo caché | `stage channel with id "..."` |
| [news channel with id](syntax:newschannel#news-channel-with-id) | bot | solo caché | `news channel with id "..."` |
| [forum channel with id](syntax:forumchannel#forum-channel-with-id) | bot | solo caché | `forum channel with id "..."` |
| [category with id](syntax:category#category-with-id) | bot | solo caché | `category with id "..."` |
| [thread channel with id](syntax:threadchannel#thread-channel-with-id) | bot | solo caché | `thread channel with id "..."` |
| [member with id](syntax:member#member-with-id) | `in %guild%` | opcional: caché, o Discord con `await` | `await set {_m} to member with id "..." in event-guild` |
| [scheduled event with id](syntax:scheduledevent#scheduled-event-with-id) | `in %guild%` | solo caché | `scheduled event with id "..." in event-guild` |
| [message with id](syntax:message#message-with-id) | `in %channel%` | obligatorio | `await set {_msg} to message with id "..." in event-channel` |

Los ID son texto, nunca números: un snowflake como `1234567890123456789` tiene más dígitos de los que Skript
conserva con precisión, así que `role with id 1234567890123456789` buscaría un ID redondeado. Escribe siempre
el ID entre comillas, o pasa una variable de texto que lo contenga.

## Getters globales y el bot {#global-getters-and-the-bot}

Los servidores, roles, usuarios y canales no pertenecen a nada que ya tengas en la mano, así que sus getters
buscan el ID en la caché de un bot y necesitan saber cuál. Cada uno termina con un `with bot %bot%` opcional:
omítelo cuando hay un solo bot conectado, y nombra el bot cuando hay varios.

```skript
on ready seen by "my-bot":
    set {_guild} to guild with id "123456789012345678" with bot event-bot
    send "found %name of {_guild}% on %event-bot%" to console
```

Cuando se omite `with bot` y hay un solo bot en marcha, se usa ese bot. Cuando hay varios, DiSky elige uno e
imprime en la consola una advertencia que pide especificar el bot; la búsqueda se ejecuta igual, pero contra
un bot que puede no estar en el servidor que esperas. Los scripts que ejecutan
[más de un bot](doc:getting-started/multiple-bots) deberían pasar siempre `with bot`.

syntax: member#member-with-id compact

## Getters con ámbito {#scoped-getters}

Un miembro, un evento programado y un mensaje solo existen dentro de otra cosa, así que sus getters reciben
ese contenedor en lugar de un bot: `member with id "..." in event-guild`,
`scheduled event with id "..." in event-guild`, `message with id "..." in event-channel`. El bot es el que
contiene el contenedor, así que no hay `with bot` que añadir. `from` funciona en lugar de `in`, y la palabra
del tipo es opcional (`in guild {_g}`, `in channel {_c}`).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!fetch":
        await set {_msg} to message with id "123456789012345678" in event-channel
        reply with "that message says: %discord content of {_msg}%"
```

`message with id` es solo de recuperación: los mensajes no se guardan en caché, así que el getter siempre
pregunta a Discord y la línea debe llevar `await`. Sin él, el script no se carga.

syntax: message#message-with-id compact

## Caché o Discord {#cache-or-discord}

`user with id` y `member with id` responden desde la caché cuando se escriben de forma simple, y preguntan a
Discord cuando la línea empieza por `await`. La forma en caché es instantánea pero solo conoce a los usuarios
y miembros que el bot ya ha visto (lo que depende de la política de caché de miembros); la forma con `await`
encuentra a cualquiera que el bot tenga permiso de ver.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!whois":
        set {_cached} to member with id "123456789012345678" in event-guild
        await set {_fresh} to member with id "123456789012345678" in event-guild
        reply with "cached: %{_cached}%, fetched: %{_fresh}%"
```

Con `await`, la caché se consulta primero y Discord solo se pregunta si no está; por eso anteponer `await` a
cada búsqueda no cuesta nada cuando la entidad ya es conocida. Los demás getters solo usan caché: un canal o un
rol que el bot no ve en su caché no se encuentra, sea cual sea el prefijo de la línea.

## Cuando el ID no existe {#when-the-id-is-unknown}

Una búsqueda en caché que no encuentra nada devuelve nada: la variable queda sin asignar y no se imprime ningún
error. Una búsqueda con `await` que Discord no puede resolver es un error de Discord (*Unknown User*,
*Unknown Member*, *Unknown Message*) que aparece como error legible en la consola, y la variable también queda
sin asignar. Comprueba la variable antes de usarla, o envuelve la búsqueda en `try` (consulta
[Errores](doc:concepts/errors)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!check":
        await set {_user} to user with id "000000000000000000"
        if {_user} is not set:
            reply with "no user with that id"
            stop
        reply with "found %name of {_user}%"
```

## Errores que puedes ver {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *the 'message with id' getter is online-only and requires 'await'* | `message with id` se usó en una línea sin `await` | Antepón `await` a la línea |
| *Several bots are loaded but none was specified; using '\<name>'. Specify the bot explicitly to remove this ambiguity.* | Un getter global se ejecutó sin `with bot` mientras había más de un bot conectado | Añade `with bot event-bot` (o `with the bot named "my-bot"`) al getter |
