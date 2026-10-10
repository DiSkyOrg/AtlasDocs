---
title: Varios bots
description: Ejecutar varios bots en un mismo servidor, filtrar eventos por bot y leer el estado de un bot.
source-hash: 254c79bb8d32
---

Esta página cubre lo que cambia cuando hay más de un bot conectado en el mismo servidor: cómo se
filtran los eventos por bot, cómo encontrar un bot por su nombre y qué propiedades indican qué está
haciendo un bot. Ya sabes cómo crear y conectar un bot con [Iniciar un bot](doc:getting-started/starting-a-bot).

## Cómo coexisten varios bots {#how-several-bots-coexist}

Cada bot es una conexión independiente identificada por el nombre que le das en
[login](syntax:core/effects#effect-login-bot). Los nombres se comparan sin distinguir mayúsculas, y
nada limita cuántos bots se ejecutan a la vez: conecta un segundo bot exactamente como el primero, con
otro nombre.

```skript
options:
    token: "YOUR-TOKEN"
    music-token: "YOUR-MUSIC-TOKEN"

on load:
    set {_bot} to a new discord bot
    set token of {_bot} to {@token}
    login {_bot} as "my-bot"
    set {_music} to a new discord bot
    set token of {_music} to {@music-token}
    login {_music} as "music"

on unload:
    shutdown the bot named "my-bot"
    shutdown the bot named "music"
```

En la v5, el bot nunca es un argumento de un efecto o de una expresión: DiSky lo deduce de la entidad
sobre la que actúas. Cuando respondes a un mensaje, editas un canal o expulsas a un miembro, el bot que
recibió ese mensaje, canal o miembro es el que realiza el trabajo, así que el mismo script funciona sin
cambios tanto si hay uno como diez bots cargados.

!!! info "Un nombre, un bot"
    Reutilizar el nombre de un bot en ejecución para un nuevo `login` no detiene al bot anterior;
    apágalo primero, como se describe en [Iniciar un bot](doc:getting-started/starting-a-bot#shutting-down).

## Filtrar eventos con seen by {#filtering-events-with-seen-by}

Cada evento de DiSky se activa una vez por cada bot que lo recibe. Con dos bots en el mismo servidor,
`on message received:` se ejecuta dos veces por un mismo mensaje, una vez con cada bot. Para escuchar
a un solo bot, añade `seen by "<name>"` a la línea del evento: el trigger (bloque de código) solo se
ejecuta cuando el bot con ese nombre disparó el evento. Sin el filtro, el trigger se ejecuta para cada
bot.

```skript
on ready seen by "music":
    send "music is up with %guild count of event-bot% guilds" to console

on message received seen by "my-bot":
    send "my-bot saw a message from %event-user% in %event-channel%" to console
```

Dentro de cualquier evento de DiSky, `event-bot` es el bot que lo disparó, use o no `seen by`. Es la
forma habitual de distinguir bots en un manejador compartido, y también funciona en los eventos de
ciclo de vida: un manejador de [ready](event:events#bot-ready-event) o de
[guild ready](event:events#guild-ready-event) sin filtro se ejecuta una vez por bot, con `event-bot`
establecido en consecuencia.

`seen by` compara el nombre con el que se conectó el bot, no su nombre de usuario de Discord, y la
comparación no distingue mayúsculas. Un filtro que nombra a un bot que nunca se conecta no es un error:
el trigger simplemente nunca se ejecuta.

event: events#bot-ready-event compact

## Buscar un bot {#finding-a-bot}

Fuera de un evento, [the bot named](syntax:core/expressions#expression-bots) devuelve el bot conectado
con ese nombre, y `all bots` devuelve todos los bots en ejecución. Un nombre desconocido no devuelve un
error sino nada, así que comprueba el resultado antes de usarlo.

```skript
command /bot-info <text>:
    trigger:
        set {_bot} to the bot named arg-1
        if {_bot} is not set:
            send "No loaded bot named '%arg-1%'."
            stop
        send "%name of {_bot}%: %guild count of {_bot}% guilds, %gateway ping of {_bot}% ms"
```

`all bots` es una lista, así que funciona con `loop` y con `number of`:

```skript
command /bots:
    trigger:
        send "%number of all bots% bot(s) loaded:"
        loop all bots:
            send "- %name of loop-value% (%running shards of loop-value% shard(s))"
```

Un bot aparece en `all bots` en cuanto `login` ha construido su conexión, lo que ocurre antes de que se
active su evento `ready`. Usa la condición [connected](syntax:bot#connected) (`if {_bot} is connected:`)
cuando la diferencia importe.

syntax: core/expressions#expression-bots compact

## Leer el estado de un bot {#reading-a-bots-state}

Las siguientes propiedades son de solo lectura y describen la conexión en vivo. Todas aceptan un bot
de `the bot named`, `loop-value` o `event-bot`.

| Propiedad | Devuelve | Notas |
| --- | --- | --- |
| [name](syntax:bot#name) | texto | El nombre de conexión, no el nombre de usuario de Discord. |
| [gateway ping](syntax:bot#gateway-ping) | número (ms) | Media de todos los shards; `-1` antes de que el bot esté en ejecución. |
| [guild count](syntax:bot#guild-count) | número | `0` antes de que el bot esté en ejecución. |
| [guilds](syntax:bot#guilds) | servidores | Vacío antes de que el bot esté en ejecución. |
| [self user](syntax:bot#self-user) | usuario | La cuenta de Discord del propio bot; ninguna antes de que el bot esté en ejecución. |
| [avatar url](syntax:bot#avatar-url) | texto | El avatar efectivo del usuario del bot; ninguno antes de que el bot esté en ejecución. |
| [running shards](syntax:bot#running-shards) | número | Shards conectados en este momento; `0` antes de que el bot esté en ejecución. |
| [online status](syntax:bot#online-status) | estado en línea | El estado que estableciste, o ninguno si nunca estableciste uno. |

```skript
command /bot-status <text>:
    trigger:
        set {_bot} to the bot named arg-1
        if {_bot} is not set:
            stop
        send "user: %self user of {_bot}% (%avatar url of {_bot}%)"
        send "shards: %running shards of {_bot}%/%shard count of {_bot}%"
        send "status: %online status of {_bot}%"
        loop guilds of {_bot}:
            send "- %name of loop-value%"
```

`shard count of {_bot}` es el total con el que se construyó el bot, así que `running shards` dividido
entre `shard count` indica si todos los shards están activos. Las opciones de sharding en sí se explican
en [Opciones del bot](doc:getting-started/bot-options).

syntax: bot#gateway-ping compact

syntax: bot#guild-count compact

syntax: bot#running-shards compact
