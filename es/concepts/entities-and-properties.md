---
title: Entidades y propiedades
description: Cada objeto de Discord es una entidad; sus datos se leen y escriben como propiedades.
source-hash: 1cd0f4533c71
---

Esta página cubre el patrón detrás de casi cualquier sintaxis del atlas: un objeto de Discord es una
entidad, y sus datos son propiedades que se leen y escriben con una gramática fija. Se asume que tienes
un bot conectado como `"my-bot"` y que `use type properties: true` está activado en Skript (consulta
[Lo que necesitas](doc:getting-started)).

## Cómo funcionan las propiedades {#how-properties-work}

Un servidor, un miembro, un rol, un mensaje, un canal: cada uno es una *entidad*, un tipo de Skript
respaldado por un objeto real de Discord. Los datos de una entidad son una *propiedad*, que se lee con
una de dos formas equivalentes:

```skript
on ready seen by "my-bot":
    send "[DiSky] %name of event-bot% (%discord id of event-bot%)" to console
    send "[DiSky] %event-bot's name%" to console
```

`name of event-bot` y `event-bot's name` leen el mismo valor; usa la que quede mejor en la frase. Ambas
formas funcionan para cada propiedad del atlas, en cada entidad que la tenga.

Las entidades también forman una jerarquía: una entidad más específica se convierte en una más general
donde se espera ese tipo más general. Un canal de texto también es un canal de servidor, un canal de
mensajes y un canal, así que `name of event-channel` funciona incluso cuando `event-channel` es
realmente un canal de texto; un miembro se convierte en su usuario de la misma forma, así que una
propiedad que solo existe en `user` también se lee desde una variable `member`.

## Propiedades compartidas {#shared-properties}

Algunas propiedades se registran una vez y se comparten entre todas las entidades que las tienen, en
lugar de reimplementarse en cada una. Leer o escribir una requiere
[`use type properties: true`](doc:getting-started) en la configuración de Skript, que las versiones
recientes de Skript activan por defecto.

| Propiedad | Presente en |
| --- | --- |
| `name` | applicationinfo, bot, embedfield, emote, forumtag, guild, member, role, scheduledevent, sticker, user, channel, webhook |
| `avatar url` | applicationinfo, bot, guild, member, sticker, user |
| `guild` | logentry, member, message, role, scheduledevent, webhook, guildchannel, guildsticker |
| `online status` | bot, member |
| `color` | embedbuilder, role, roleaction |
| `jump url` | message, guildchannel |
| `value` | embedfield |
| `title` | embedbuilder, modal |
| `style` | button, textinput |

```skript
on ready seen by "my-bot":
    set {_g} to first element of (guilds of event-bot)
    send "[DiSky] guild %name of {_g}%, avatar %avatar url of {_g}%" to console
```

## Ids y menciones {#ids-and-mentions}

Dos propiedades vienen de entidades a nivel de interfaz en lugar de una concreta, así que se leen igual
en cualquier cosa a la que Discord asigne un ID o una mención. [`discord id`](syntax:snowflake#discord-id)
y [`creation date`](syntax:snowflake#creation-date) funcionan en cualquier *snowflake* (identificador de
Discord: un miembro, un usuario, un servidor, un rol, un canal, un mensaje...);
[`mention tag`](syntax:mentionable#mention-tag) funciona en cualquier entidad *mencionable* (un usuario,
un miembro, un rol, un canal, un emoji), y se muestra como una mención clicable cuando se envía en un
mensaje.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!id":
        reply with "Your id is %discord id of event-member%, your account dates from %creation date of event-member%"
        reply with "Hey %mention tag of event-member%!"
```

syntax: snowflake#discord-id compact
syntax: mentionable#mention-tag compact

## Cambiar una propiedad {#changing-a-property}

Una propiedad modificable se escribe con `set <property> of <entity> to <value>`; una propiedad que
contiene una lista también acepta `add ... to` y `remove ... from`.

```skript
on ready seen by "my-bot":
    set {_g} to first element of (guilds of event-bot)
    set {_m} to first element of (members of {_g})
    set {_r} to first element of (roles of {_g})
    set nickname of {_m} to "new nick"
    add {_r} to roles of {_m}
    remove {_r} from roles of {_m}
```

Un setter no es una asignación simple: la mayoría envía una petición a Discord, y el trigger avanza sin
esperar la respuesta. Antepón `await` a la línea cuando la línea siguiente lea el valor de vuelta; consulta
[Caché y await](doc:concepts/cache-and-await) para eso y para las propiedades que necesitan `await` en el
lado de lectura.

!!! info "Algunas propiedades nunca se leen de vuelta"
    Los builders y los embeds son de solo escritura: estableces sus propiedades para definir lo que se va
    a crear, pero leer una no devuelve nada, porque no hay un objeto vivo de Discord del que leer hasta que
    se ejecuta el builder. Consulta [Builders](doc:concepts/builders).

## Valores de enum {#enum-values}

Algunas propiedades contienen un valor de un conjunto fijo, interpretado como literal y no como texto.
Compáralas o asígnalas sin comillas, y pon entre paréntesis el lado izquierdo de una comparación para que
Skript no intente analizar toda la condición como una sola expresión.

| Enum | Ejemplo de literal |
| --- | --- |
| `onlinestatus` | `idle` |
| `channeltype` | `text` |
| `memberflag` | `did rejoin` |
| `activitytype` | `playing` |
| `permission` | `manage channel` |
| `buttonstyle` | `primary` |
| `selecttarget` | `role` |
| `separatorspacing` | `small` |
| `textinputstyle` | `short` |

```skript
on ready seen by "my-bot":
    set online status of event-bot to dnd
    if (online status of event-bot) is dnd:
        send "[DiSky] my-bot is set to do not disturb" to console
```

`online status` se muestra como *do not disturb*, pero la palabra "not" rompe un literal sin comillas,
así que el literal que escribes es `dnd`, no `do not disturb`.
