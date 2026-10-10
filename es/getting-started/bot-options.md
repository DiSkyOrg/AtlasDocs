---
title: Opciones del bot
description: Cada opción de conexión que puedes establecer en un bot antes de conectarlo, y las dos opciones de presencia que puedes cambiar en cualquier momento.
source-hash: a12943b4f53f
---

Esta página enumera todas las opciones que acepta un bot: a qué intent (suscripción a eventos) del
gateway se suscribe, qué guarda en caché (copia en memoria), cómo comprime el
tráfico, cuántos shards (conexiones al gateway) ejecuta y qué presencia muestra. Ya sabes cómo crear
un bot y conectarlo (consulta [Iniciar un bot](doc:getting-started/starting-a-bot)) y tienes un token
a mano.

## Cómo funcionan las opciones {#how-options-work}

Un bot pasa por dos fases. Entre `a new discord bot` y `login` está *configurándose*: cada propiedad
de abajo puede establecerse, y leer una devuelve lo que configuraste. Una vez que se ejecuta `login`,
el bot está *en ejecución* y su conexión se construye con las opciones que tenía en ese momento. Las
opciones de conexión (`intents`, `member cache policy`, `cache flags`, `compression`, `shard count` y
`token`) son **solo de construcción**: establecer una en un bot en ejecución no cambia nada en la
conexión y muestra en la consola un error legible en su lugar. Las dos opciones de presencia
(`activity` y `online status`) son **en vivo**: establécelas antes de `login` para que el bot arranque
con ellas, o en un bot en ejecución para cambiarlas al instante.

```skript
options:
    token: "YOUR-TOKEN"

command /startbot <text>:
    trigger:
        shutdown the bot named "my-bot"
        set {_bot} to a new discord bot
        set token of {_bot} to {@token}
        set intents of {_bot} to "default intents"
        set member cache policy of {_bot} to "all"
        set cache flags of {_bot} to "activity, voice_state, online_status"
        set compression of {_bot} to "zlib"
        set activity of {_bot} to "with Skript"
        set online status of {_bot} to dnd
        login {_bot} as "my-bot"
```

El `shutdown` inicial hace que el comando sea seguro al recargar: volver a ejecutarlo reemplaza el
bot llamado `"my-bot"` en lugar de conectar una segunda copia. Cada línea `set` entre la creación y
el `login` es opcional; un bot con solo un token se conecta con los valores por defecto de la tabla
de abajo.

## Opciones {#options}

Cada propiedad se lee con `<property> of {_bot}` y se escribe con
`set <property> of {_bot} to <value>`. Los valores de texto no distinguen entre mayúsculas y
minúsculas; los nombres que contienen un espacio pueden escribirse con espacio o con guion bajo
(`voice state` o `voice_state`).

| Propiedad | Predeterminado | Valores aceptados |
| --- | --- | --- |
| [intents](syntax:bot#intents) | `"default intents"` | `"default intents"`, `"all"` o nombres de intents separados por comas |
| [member cache policy](syntax:bot#member-cache-policy) | `"default"` | `"all"`, `"default"`, `"none"`, `"online"`, `"owner"`, `"voice"` |
| [cache flags](syntax:bot#cache-flags) | ninguna establecida (se aplican los valores propios de JDA) | `"default"`, `"all"`, `"none"` o nombres de flags separados por comas |
| [compression](syntax:bot#compression) | `"zlib"` | `"zlib"`, `"none"` |
| [shard count](syntax:bot#shard-count) | `-1` (el número recomendado por Discord) | `-1`, `1` o cualquier número igual o mayor que 2 |
| [activity](syntax:bot#activity) | ninguna | cualquier texto, que se muestra como *Playing <text>* |
| [online status](syntax:bot#online-status) | el predeterminado de Discord (online) | `online`, `idle`, `dnd`, `invisible` |

## Intents {#intents}

Los intents del gateway indican a Discord qué grupos de eventos quiere recibir tu bot. Un bot sin el
intent `guild_messages` nunca ve un mensaje enviado en un servidor, sin importar lo que tu script
escuche. El valor es una lista de nombres de intents separados por comas, o un atajo; establecerlo
reemplaza el conjunto completo.

```skript
set intents of {_bot} to "guild_messages, message_content, guild_members"
```

Hay dos atajos, y ambos pueden combinarse con nombres para añadir algunos intents más:

- `"default intents"` (o `"default"`): el conjunto que usa un bot nuevo, marcado en la tabla de abajo.
- `"all"`: todos los intents que JDA conoce.

```skript
set intents of {_bot} to "default intents, guild_message_polls"
```

| Intent | Predeterminado | Privilegiado | Necesario para |
| --- | :---: | :---: | --- |
| `guild_messages` | sí | | mensajes enviados en canales de servidor |
| `message_content` | sí | sí | leer el texto y los archivos adjuntos de los mensajes |
| `guild_members` | sí | sí | eventos de entrada, salida y actualización de miembros; caché completa de miembros |
| `guild_presences` | sí | sí | estado en línea y actividades de los miembros |
| `guild_moderation` | sí | | baneos, desbaneos y entradas del registro de auditoría |
| `guild_expressions` | sí | | eventos de emojis, stickers y soundboard |
| `guild_webhooks` | sí | | eventos de actualización de webhooks |
| `guild_invites` | sí | | eventos de creación y eliminación de invitaciones |
| `guild_voice_states` | sí | | entrada, salida y cambios de estado en canales de voz |
| `guild_message_reactions` | sí | | reacciones en canales de servidor |
| `guild_message_typing` | sí | | eventos de escritura en canales de servidor |
| `direct_messages` | sí | | mensajes enviados al bot en mensajes directos |
| `scheduled_events` | sí | | cambios en eventos programados |
| `guild_message_polls` | | | votos de encuestas en canales de servidor |
| `direct_message_polls` | | | votos de encuestas en mensajes directos |
| `direct_message_reactions` | | | reacciones en mensajes directos |
| `direct_message_typing` | | | eventos de escritura en mensajes directos |
| `auto_moderation_configuration` | | | cambios en las reglas de AutoMod |
| `auto_moderation_execution` | | | acciones de AutoMod |

Los intents privilegiados solo se entregan si están activados para tu aplicación en
**Bot → Privileged Gateway Intents** del Developer Portal. Leer `intents of {_bot}` devuelve los
nombres activados en mayúsculas, separados por comas.

!!! warning "El conjunto predeterminado incluye los tres intents privilegiados"
    Un bot que se deja en `"default intents"` necesita **los tres** interruptores privilegiados
    activados en el Developer Portal, o Discord cierra la conexión justo después de conectarse.
    Activa esos interruptores o establece una lista explícita sin los que no necesites.

syntax: bot#intents compact

## Caché {#caching}

Dos propiedades deciden qué guarda el bot en memoria, y ambas van antes de `login`.
`member cache policy` indica qué miembros siguen en caché una vez que Discord los ha enviado.
`cache flags` enumera los datos adicionales que se guardan en caché además de las propias entidades. Establecer cualquiera
de las dos reemplaza su valor anterior.

```skript
set member cache policy of {_bot} to "online"
set cache flags of {_bot} to "default, emoji"
```

| Política de caché de miembros | Miembros que se mantienen en caché |
| --- | --- |
| `"default"` | miembros en un canal de voz y propietarios de servidores (valor por defecto de JDA) |
| `"all"` | todos los miembros de todos los servidores; necesita el intent `guild_members` para llenarse |
| `"online"` | miembros cuyo estado no es desconectado; necesita `guild_presences` |
| `"voice"` | miembros en un canal de voz |
| `"owner"` | propietarios de servidores |
| `"none"` | nadie más allá del propio bot |

Las flags de caché aceptan los nombres de abajo o uno de tres atajos: `"default"` equivale a
`activity`, `voice_state` y `online_status`; `"all"` activa todas las flags; `"none"` vacía la lista.
Una flag solo se llena cuando su intent está activado.

| Flag de caché | Guarda en caché | Necesita intent |
| --- | --- | --- |
| `activity` | actividades de los miembros | `guild_presences` |
| `online_status` | estado en línea de los miembros | `guild_presences` |
| `client_status` | en qué cliente (escritorio, móvil, web) está conectado un miembro | `guild_presences` |
| `voice_state` | quién está en qué canal de voz | `guild_voice_states` |
| `emoji` | emojis personalizados | `guild_expressions` |
| `sticker` | stickers personalizados | `guild_expressions` |
| `soundboard_sounds` | sonidos del soundboard | `guild_expressions` |
| `scheduled_events` | eventos programados | `scheduled_events` |
| `member_overrides` | excepciones de permisos por miembro en los canales | |
| `role_tags` | etiquetas de roles (roles de bot, de integración y de booster) | |
| `forum_tags` | etiquetas disponibles de los canales de foro | |

Leer cualquiera de las dos propiedades devuelve los nombres configurados en mayúsculas, así que un bot
que nunca configuraste devuelve `"DEFAULT"` como política y un texto vacío como flags.

La propiedad `compression` pertenece al mismo grupo: `"zlib"` (el predeterminado) comprime el tráfico
del gateway, y `"none"` lo desactiva. No la toques a menos que estés depurando la conexión en bruto.

syntax: bot#cache-flags compact

## Sharding {#sharding}

Un shard es una conexión al gateway; Discord exige que los bots de 2.500 servidores o más repartan
sus servidores entre varias. La propiedad `shard count` decide cuántas conexiones abre el bot: `-1`
(el predeterminado) pide a Discord el número recomendado, `1` fuerza una sola conexión y cualquier
número igual o mayor que 2 fuerza esa cantidad. La expresión
[recommended shard count](syntax:core/expressions#expression-recommended-shard-count) es un nombre
legible para `-1`.

```skript
set shard count of {_bot} to recommended shard count
```

El sharding es invisible para tus scripts. Los eventos de ciclo de vida como `on ready` y
`on bot shutdown` se activan una vez por bot, cuando sube o baja su último shard, y no una vez por
shard; los filtros `seen by` y las propiedades del bot funcionan igual sea cual sea el número. Cuando
el bot está en ejecución, `shard count of {_bot}` devuelve el total real de shards y
[running shards](syntax:bot#running-shards) indica cuántos están conectados en ese momento:

```skript
on ready seen by "my-bot":
    send "%running shards of event-bot%/%shard count of event-bot% shards up" to console
```

Mantén `-1` a menos que sepas qué número necesitas: Discord decide cuántos shards puede abrir un bot,
y un número forzado que no acepte falla al conectar.

syntax: bot#shard-count compact

## Presencia {#presence}

`activity` establece el texto que se muestra bajo el nombre del bot como *Playing <text>*; un texto
vacío lo elimina. `online status` elige el punto de presencia: `online`, `idle`, `dnd` (no molestar) o
`invisible`. A diferencia de las opciones de conexión, ambas son en vivo: establecerlas antes de
`login` da al bot su presencia inicial, y establecerlas en un bot en ejecución actualiza todos los
shards al instante.

```skript
on ready seen by "my-bot":
    set activity of event-bot to "in %guild count of event-bot% guilds"
    set online status of event-bot to idle
```

El valor de `online status` es un tipo de DiSky, no un texto: escribe `dnd`, no `"dnd"`. La misma
propiedad lee la presencia de un miembro, pero solo se puede escribir en un bot.

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *shard count can't be changed on a running bot; set it before login* (mismo texto para `intents`, `cache flags`, `member cache policy`, `compression` y `token`) | Se estableció una propiedad de construcción después de `login`. | Apaga el bot, establece la propiedad en un bot nuevo y vuelve a conectarlo. |
| *unknown member cache policy 'x' (try: all, default, none, online, owner, voice)* | El nombre de la política está mal escrito. | Usa uno de los nombres de la lista. |
| Un bloque *Discord error* que nombra una constante `GatewayIntent` o `CacheFlag` desconocida | Un nombre de intent o de flag de caché de la lista está mal escrito. | Revisa los nombres en las secciones [Intents](#intents) y [Caché](#caching). |
| El bot se conecta y luego se desconecta con el código de cierre 4014 de Discord (*Disallowed intent(s)*) | Un intent privilegiado está activado en el bot pero no en el Developer Portal. | Actívalo en **Bot → Privileged Gateway Intents**, o quítalo de `intents`. |
