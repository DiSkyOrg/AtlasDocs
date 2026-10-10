---
title: Registrar comandos
description: Enviar comandos de estructura y de builder a Discord con update, register y unregister, y consultar lo que ya está registrado.
source-hash: 143b97c889fc
---

Esta página cubre los tres efectos que envían comandos [de barra](doc:interaction-commands/slash-commands),
[contextuales](doc:interaction-commands/context-commands) y [builder (objeto de construcción)](doc:interaction-commands/command-builders)
a Discord, y cómo leer lo que ya está registrado. Se asume que tienes un bot llamado `"my-bot"`
conectado y al menos un comando declarado, por estructura o por builder.

## Cómo funciona el registro {#how-registration-works}

Nada llega a Discord por sí solo: una estructura `slash command` y `a new slash command` (un builder) son
solo modelos hasta que un script ejecuta uno de tres efectos sobre ellos.

| Efecto | Hace | Úsalo cuando |
| --- | --- | --- |
| [update](syntax:core/effects#effect-update-discord-commands) | Reemplaza la lista completa (un PUT): todo lo que falte en los comandos dados se elimina | Sincronización al arrancar, enviar todos los comandos de una vez |
| [register](syntax:core/effects#effect-register-discord-command) | Añade o reemplaza por nombre: agrega o sustituye, y deja el resto de la lista intacto | Añadir o editar un comando sin tocar los demás |
| [unregister](syntax:core/effects#effect-unregister-discord-commands) | Elimina un comando, por objeto, nombre o id, o todos | Retirar un comando, o vaciar una lista |

```skript
on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

[`all structured application commands`](syntax:core/expressions#expression-structured-discord-commands)
reúne todas las estructuras `slash command`, `user command` y `message command` en una sola lista, así que
un comando de builder se une a la misma llamada: `update the discord commands (all structured application
commands) and {_roll} in event-guild`. Los tres efectos bloquean hasta que Discord responde y nunca
aceptan `await`; un fallo en el lado de Discord pasa por la [capa de errores](doc:concepts/errors).

syntax: core/effects#effect-update-discord-commands compact

## Global o por servidor {#guild-or-global}

`in event-guild` se aplica de inmediato y solo afecta a ese servidor; `globally in event-bot` se aplica a
todos los servidores en los que está el bot, pero puede tardar hasta una hora en aparecer para los usuarios.
El registro por servidor va en `on guild ready`, que se dispara para cada servidor en el que está el bot
(incluidos los que se unan más tarde); el registro global va en `on ready`, que se dispara una sola vez.
Consulta [Iniciar un bot](doc:getting-started/starting-a-bot) para ver en qué se diferencian los dos
eventos de ciclo de vida.

```skript
on ready:
    set {_ping} to a new slash command named "ping" with description "Pong!"
    update the discord commands {_ping} globally in event-bot
```

Enviar el mismo comando de las dos formas hace que Discord lo muestre dos veces: las listas por servidor y
las globales son separadas, no una combinada con la otra. Discord también limita cuántas veces al día se
puede reemplazar la lista completa de un servidor con `update`: 200 veces.

## Añadir y quitar un comando {#adding-and-removing-one-command}

`register` y `unregister` cambian un solo comando sin reemplazar la lista completa.

```skript
on guild ready:
    set {_roll} to a new slash command named "roll" with description "Roll a dice"
    register the discord command {_roll} in event-guild
```

`register` también acepta varios comandos a la vez: `register the discord commands {_a} and {_b}
globally in event-bot`. `unregister` acepta un objeto de comando, un nombre o un id sin procesar, y un
atajo para eliminar todos:

```skript
unregister the discord command "ping" from event-guild
unregister the discord command {_roll} from event-guild
unregister all the discord commands from event-guild
```

Un objeto de comando con un [`command id`](syntax:applicationcommand#command-id) conocido se elimina
directamente; un nombre se busca primero entre los comandos registrados, así que cuesta una petición extra.

syntax: core/effects#effect-register-discord-command compact

## Leer lo que tiene Discord {#reading-what-discord-has}

[`registered commands of`](syntax:core/expressions#expression-registered-discord-commands) pide a Discord
la lista en vivo de un servidor o de los comandos globales de un bot, como objetos de comando normales con
su `command id` ya establecido. Es una lectura, así que necesita [`await`](doc:concepts/cache-and-await):

```skript
await set {_cmds::*} to registered commands of event-guild
loop {_cmds::*}:
    send "%name of loop-value% (%command id of loop-value%, %command type of loop-value%)" to console
```

Un comando recuperado se puede editar y volver a enviar con `register`, que lo actualiza por nombre:

```skript
await set {_cmds::*} to registered commands of event-guild
loop {_cmds::*}:
    if name of loop-value is "roll":
        set disabled of loop-value to true
        register the discord command loop-value in event-guild
```

syntax: core/expressions#expression-registered-discord-commands compact

## Recarga y apagado {#reload-and-shutdown}

Una estructura `slash command` o contextual es un modelo, no un registro activo: al recargar un script se
reemplaza el modelo, y el comando ya enviado a Discord sigue funcionando, vinculado al modelo que coincida
con su ruta completa en el momento en que se usa. Los tiempos de espera asociados a `on cooldown` forman
parte de ese modelo, así que una recarga también los restablece.

!!! warning "Nada se elimina automáticamente"
    Quitar una estructura de un script, descargarlo o apagar el bot nunca elimina de Discord el comando
    correspondiente. Sigue visible y respondiendo (a través de los eventos genéricos, si no hay nada más)
    hasta el siguiente `update` que lo saque de la lista, o hasta que un `unregister` explícito lo elimine.

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *the bot 'x' is not connected, it cannot manage commands yet* | `update`/`register`/`unregister`/`registered commands of` se ejecutó de forma global antes de que terminara `login`, o después de `shutdown` | espera a `on ready`, o envía a un servidor en su lugar |
| *no bot or guild to manage commands in (the variable is not set)* | el `%bot%` o `%guild%` pasado al efecto es una variable sin definir | comprueba que la variable esté definida antes de ejecutar el efecto |
| *expected a bot (global commands) or a guild, got x* | `registered commands of` recibió algo distinto de un bot o un servidor | pasa `event-bot` o `event-guild`, o una variable que contenga uno de ellos |
| *'registered commands of' asks Discord and requires 'await' to be read* | `registered commands of` se usó fuera de un bloque `await` | envuelve la lectura en `await set {_x} to ...`; consulta [Caché y await](doc:concepts/cache-and-await) |
| Un error de Discord con código `50035` (*Invalid Form Body*) | un comando enviado incumple uno de los límites de Discord (longitud del nombre, nombres de opción duplicados, demasiadas opciones fijas...) | revisa el comando frente a los límites de Discord; el error indica el campo exacto |
