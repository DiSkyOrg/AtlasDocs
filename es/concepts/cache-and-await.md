---
title: Caché y await
description: Qué guarda la caché (copia en memoria del bot), las tres reglas que deciden cuándo una línea necesita await y las lecturas que siempre lo necesitan.
source-hash: 84dcd78f3c1d
---

Esta página cubre de dónde viene el valor de una propiedad (la caché del bot o una llamada a Discord) y
el efecto [`await`](syntax:core/effects#effect-await) que lo decide. Se asume que tienes un bot conectado
como `"my-bot"` y que sabes cómo se lee y escribe una propiedad (consulta
[Entidades y propiedades](doc:concepts/entities-and-properties)).

## Cómo funciona la caché {#how-the-cache-works}

Cuando un bot se conecta, guarda en memoria una copia de los servidores, canales, roles y miembros que
puede ver: esa copia es la caché. Leer una propiedad como `name of event-guild` o `roles of event-member`
responde desde ella al instante, en el hilo principal, sin contactar a Discord. Lo que contiene la caché
depende de los intents (suscripciones a eventos) del bot, de la política de caché de miembros y de las
flags de caché, que se configuran antes de conectarse y se describen en la página de
[opciones del bot](doc:getting-started/bot-options).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!cached":
        reply with "%name of event-guild% has %size of roles of event-member% roles here"
```

Algunos valores nunca se guardan en caché porque Discord no los envía a los bots: baneos, invitaciones,
registros de auditoría, mensajes fijados, el perfil de un usuario. Leer uno implica pedírselo a Discord
por su API REST, lo que tarda un viaje de ida y vuelta por la red y no debe bloquear el hilo principal
del servidor. Para eso sirve `await`.

## Las tres reglas de await {#the-three-rules-of-await}

`await` se escribe delante de una línea completa. Ejecuta esa línea en un hilo de segundo plano, espera
la respuesta de Discord y luego reanuda el trigger con el resultado. Qué líneas lo aceptan y cuáles lo
necesitan depende del tipo de sintaxis de la línea.

| Tipo de sintaxis | Sin await | Con await | Ejemplo |
| --- | --- | --- | --- |
| Un efecto (`post`, `kick`, `destroy`, `edit`...) | Ya espera a Discord antes de que se ejecute la línea siguiente | Aceptado, con una advertencia de análisis de que es redundante | `post "hello" to event-channel` |
| Una lectura solo de recuperación (ver la tabla de abajo) | Error de análisis: el script no se carga | Obtiene el valor de Discord | `await set {_bans::*} to bans of event-guild` |
| Una lectura que admite await (existen caché y REST) | Caché: instantánea, puede estar vacía | Obtiene el valor actualizado de Discord | `await set {_owner} to discord owner of event-guild` |

Los efectos ya son asíncronos por sí solos: `post` envía el mensaje fuera del hilo principal y el trigger
continúa cuando Discord lo confirma, así que `await` no aporta nada. Las lecturas son donde la elección
importa:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!owner":
        set {_cached} to discord owner of event-guild
        await set {_fresh} to discord owner of event-guild
        reply with "cached: %{_cached}%, fresh: %{_fresh}%"
```

La primera línea de `discord owner` lee la caché y no devuelve nada si el dueño no está en caché (un
dueño desconectado con la política de caché de miembros `"online"`, por ejemplo). La segunda pregunta a
Discord y siempre devuelve el miembro. Ambas son válidas: elige la caché cuando lees con frecuencia y
puedes tolerar un fallo, `await` cuando necesitas que el valor esté presente.

Una propiedad que admite await es una que el atlas marca como tal: los [miembros](syntax:guild#members)
de un servidor, su [discord owner](syntax:guild#discord-owner), [user with id](syntax:user#user-with-id)
y [member with id](syntax:member#member-with-id) son las que encontrarás primero; la página
[Obtener entidades por ID](doc:concepts/getting-by-id) cubre las dos últimas.

syntax: core/effects#effect-await compact

## Lecturas solo de recuperación {#retrieve-only-reads}

Estas propiedades no tienen caché. Discord las sirve solo cuando se piden, así que leer una sin `await`
es un error de análisis que nombra la propiedad, y el script no se carga hasta corregir la línea. Cada
una devuelve un valor nuevo cada vez que se ejecuta.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!audit":
        await set {_bans::*} to bans of event-guild
        await set {_pins::*} to pinned messages of event-channel
        reply with "%size of {_bans::*}% bans, %size of {_pins::*}% pinned messages"
```

| Propiedad | Entidad | Devuelve |
| --- | --- | --- |
| [application info](syntax:bot#application-info) | bot | la aplicación a la que pertenece el bot |
| [invites](syntax:guild#invites) | servidor | todas las invitaciones del servidor |
| [webhooks](syntax:guild#webhooks) | servidor | todos los webhooks del servidor |
| [emotes](syntax:guild#emotes) | servidor | los emojis personalizados del servidor |
| [bans](syntax:guild#bans) | servidor | los primeros 1000 baneos |
| [active threads](syntax:guild#active-threads) | servidor | hilos que aún no están archivados |
| [audit logs](syntax:guild#audit-logs) | servidor | entradas del registro de auditoría |
| [profile](syntax:user#profile) | usuario | el banner y el color del perfil |
| [private channel](syntax:user#private-channel) | usuario | el canal de mensajes directos con el usuario, abierto si hace falta |
| [interested members](syntax:scheduledevent#interested-members) | evento programado | miembros que pulsaron *Me interesa* |
| [pinned messages](syntax:messagechannel#pinned-messages) | cualquier canal de mensajes | los mensajes fijados |
| [channel webhooks](syntax:standardguildmessagechannel#channel-webhooks) | canal de texto o de anuncios | los webhooks propios del canal |
| [thread members](syntax:threadchannel#thread-members) | canal de hilo | miembros que se unieron al hilo |
| [start message](syntax:threadchannel#start-message) | canal de hilo | el mensaje desde el que se inició el hilo |
| [archived threads](syntax:threadcontainer#archived-threads) | canal de texto, de anuncios o de foro | hilos públicos archivados |
| [archived private threads](syntax:threadcontainer#archived-private-threads) | canal de texto, de anuncios o de foro | hilos privados archivados |
| [the build result of](syntax:roleaction#result) | cualquier builder | la entidad que crea el builder |
| [message with id](syntax:message#message-with-id) | canal de mensajes | un mensaje por ID |

`the build result of` es la línea en la que un [builder](doc:concepts/builders) crea de verdad su objeto
en Discord, por eso figura en esta lista.

## Esperar un cambio {#awaiting-a-change}

`await` también se aplica a la escritura de una propiedad. Sin él, un cambio que pasa por Discord
(`set nickname of`, `add ... to roles of`, `add ... to flags of`) se envía y el trigger avanza antes de
que Discord lo confirme; una lectura en la línea siguiente puede seguir viendo el valor anterior. Con
`await`, la línea se bloquea hasta que Discord aplica el cambio, así que la siguiente lectura ve el
estado nuevo.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!verify":
        await add bypasses verification to flags of event-member
        reply with "flags now: %flags of (member with id (discord id of event-member) in event-guild)%"
```

Lo mismo vale para cada propiedad que el atlas marca como respaldada por REST: roles, flags, apodo, el
tema de un canal o el canal AFK de un servidor. Un `set` sin `await` basta cuando nada lee el valor de
vuelta en el mismo trigger.

## Hilos y tiempos {#threads-and-timing}

La línea que sigue a `await` se ejecuta en un hilo de segundo plano, donde bloquear esperando a Discord
es seguro; cuando termina, el trigger reanuda en el hilo principal con sus variables locales intactas,
así que nada de lo que escribes después de `await` se ejecuta fuera del hilo. Skript trata todo lo que
va después de un `await` como diferido, igual que el código posterior a un efecto `wait`. Un error de
DiSky lanzado dentro de la línea esperada (un ID desconocido, un permiso que falta) es un error legible
en la consola, no un fallo del servidor, y se puede capturar con `try` (consulta
[Errores](doc:concepts/errors)).

!!! info "Viene de v4"
    Los efectos `retrieve X and store it in {_var}` ya no existen: cada uno es ahora una lectura de
    propiedad escrita como `await set {_var} to X`.

## Errores que puedes ver {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *the 'bans' property is online-only and requires 'await' to be read* (mismo texto para cada propiedad de la tabla de arriba) | Se leyó una propiedad solo de recuperación en una línea sin `await` | Antepón `await` a la línea: `await set {_bans::*} to bans of event-guild` |
| *building talks to Discord, so this requires 'await'* | Se leyó `the build result of` de un builder sin `await` | Escribe `await set {_role} to the build result of {_builder}` |
| *the 'message with id' getter is online-only and requires 'await'* | `message with id` se usó sin `await` | Antepón `await` a la línea |
| *This effect is already async; 'await' is redundant here.* (advertencia, el script igualmente se carga) | Se puso `await` delante de un efecto | Quita el `await`; el efecto ya espera por sí solo |
