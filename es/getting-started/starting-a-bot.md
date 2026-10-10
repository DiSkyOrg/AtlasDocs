---
title: Iniciar un bot
description: Crea un bot, asígnale un token, conéctalo y apágalo correctamente.
source-hash: dfb59241dc30
---

Esta página explica cómo crear un bot, conectarlo bajo un nombre, los eventos que se activan una vez que se conecta y cómo apagarlo. Se asume que tienes DiSky v5 instalado (consulta la [guía de instalación](doc:getting-started/installation)) y un token de bot del Discord Developer Portal.

## Cómo funciona la conexión {#how-logging-in-works}

Un bot empieza como un objeto vacío y sin conexión. Lo configuras, le asignas un token y luego lo [conectas](syntax:core/effects#effect-login-bot) bajo un nombre; ese nombre es lo que usan el resto de tus scripts para recuperarlo después.

::: steps
1. Crea el bot con [a new discord bot](syntax:core/expressions#expression-new-discord-bot) y guárdalo en una variable.

2. Asigna su `token` con el token de tu bot, leído desde un bloque `options:` para que nunca quede escrito directamente en el código.

3. Llama a `login` dándole un nombre al bot. Acompáñalo de un `shutdown` para que el bot se desconecte cuando el plugin se descargue.
:::

```skript
options:
    token: "YOUR-TOKEN"

command /startbot:
    trigger:
        set {_bot} to a new discord bot
        set token of {_bot} to {@token}
        login {_bot} as "my-bot"
        send "&7Logging in 'my-bot'..."

on unload:
    shutdown the bot named "my-bot"
```

La conexión se ejecuta en segundo plano: el comando devuelve el control de inmediato y la validación con Discord ocurre fuera del hilo principal. Si el token está vacío o falta, o si el bot no logra conectarse, DiSky muestra en la consola un error legible en lugar de la excepción sin procesar; nada se rompe. Una vez establecida la conexión, el bot queda registrado bajo su nombre y `the bot named
"my-bot"` empieza a devolver ese bot en cualquier parte de tus scripts.

!!! warning "Configura antes de login"
    `token`, `intents`, `member cache policy`, `cache flags`, `compression` y `shard count` solo pueden establecerse mientras el bot todavía se está configurando. Cambiar cualquiera de ellos después de `login` produce un error legible en la consola, no un fallo. Consulta [opciones del bot](doc:getting-started/bot-options) para ver la lista completa y los valores aceptados.

syntax: core/expressions#expression-new-discord-bot compact
syntax: core/effects#effect-login-bot compact

## Eventos del ciclo de vida {#lifecycle-events}

Tres eventos globales cubren la vida de un bot. Se activan para cada bot que se conecta, así que filtra con `on ready seen by "my-bot":` cuando ejecutes [más de un bot](doc:getting-started/multiple-bots).

- [`on guild ready`](event:events#guild-ready-event) se activa una vez por cada servidor al que está conectado el bot, cuando terminan de cargarse sus datos.
- [`on ready`](event:events#bot-ready-event) se activa una sola vez, después de que todos los servidores hayan activado su propio `on guild ready`, cuando el bot está completamente conectado.
- [`on bot shutdown`](event:events#bot-shutdown-event) se activa cuando se cierra la conexión del bot con Discord.

```skript
on guild ready:
    send "[DiSky] guild ready: %name of event-guild% on %event-bot%" to console

on ready:
    send "[DiSky] %event-bot% READY (%guild count of event-bot% guilds)" to console

on bot shutdown:
    send "[DiSky] %event-bot% SHUTDOWN" to console
```

## Apagar el bot {#shutting-down}

[`shutdown the bot named "..."`](syntax:core/effects#effect-shutdown-bot) desconecta el bot y libera su nombre; después puede volver a conectarse. Acompaña siempre cada `login` con un `shutdown`, normalmente en un bloque `on unload:`, para que el bot se desconecte limpiamente cuando el plugin se recargue o el servidor de Minecraft se detenga.

```skript
on unload:
    shutdown the bot named "my-bot"
```

Conectar un *segundo* bot, distinto, bajo un nombre que ya está en ejecución no produce ningún error: el nuevo bot toma ese nombre en el registro, y el anterior sigue ejecutándose en segundo plano, sin poder alcanzarse ya por su nombre. Apaga siempre un bot antes de conectar un reemplazo con el mismo nombre. Llamar de nuevo a `login` sobre la misma variable de bot mientras ya está conectado es lo que realmente falla, con un error legible en la consola.

syntax: core/effects#effect-shutdown-bot compact

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *IllegalStateException: a bot needs a token before login (set token of %bot% to ...)* | `login` se llamó antes de establecer `token` | Establece `token of {_bot}` antes de `login` |
| *IllegalStateException: the bot '\<name>' is already connected* | `login` se volvió a llamar sobre la misma variable de bot mientras sigue en ejecución | Conecta cada variable de bot una sola vez; usa un bot nuevo para una nueva conexión |
| Sin mensaje; el efecto no hace nada | `shutdown the bot named "..."` recibió un nombre que ningún bot en ejecución tiene actualmente | Comprueba el nombre con [`the bot named "..."`](doc:getting-started/multiple-bots) antes de apagarlo, o asegúrate de que no se haya apagado ya |

Las opciones de conexión, como los intents (suscripciones a eventos), la política de caché (copia en memoria) de miembros y el sharding, se explican en la página de [opciones del bot](doc:getting-started/bot-options).

entity: bot
