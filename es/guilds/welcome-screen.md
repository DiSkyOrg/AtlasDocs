---
title: Pantalla de bienvenida
description: Leer la pantalla de bienvenida de un servidor comunitario y reemplazar su descripción y sus canales.
source-hash: 2dcafa1de6ee
---

Esta página cubre la pantalla de bienvenida: la tarjeta que un servidor comunitario muestra a los nuevos
miembros, con una descripción y hasta cinco canales recomendados. Se asume que tienes un bot llamado
`"my-bot"` conectado, un servidor con **Comunidad** activada y el permiso **Gestionar servidor** para el
bot si edita la pantalla.

## Leer la pantalla de bienvenida {#reading-the-welcome-screen}

[`welcome screen of %guild%`](syntax:guild#welcome-screen) pide a Discord la pantalla actual, así que
requiere `await`. Lo que devuelve es una instantánea: no cambia cuando se edita la pantalla, así que
para eso vuelve a leerla.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!welcome":
        await set {_screen} to the welcome screen of event-guild
        reply with "%description of {_screen}%"
        loop welcome channels of {_screen}:
            reply with "%welcome channel of loop-value%: %description of loop-value% %emoji of loop-value%"
```

Cada entrada de `welcome channels` es un `welcomechannel` con tres propiedades:
[welcome channel](syntax:welcomechannel#welcome-channel) (el propio canal, ninguno si el bot no puede
verlo), [description](syntax:welcomechannel#description) y [emoji](syntax:welcomechannel#emoji), el
emoji tal como se muestra en un mensaje.

syntax: guild#welcome-screen compact

## Editar la pantalla de bienvenida {#editing-the-welcome-screen}

Editar pasa por un builder (objeto de construcción), pero no el habitual: la pantalla de bienvenida ya
existe, así que no hay nada que construir. Crea uno con
[`a new welcome screen builder for %guild%`](syntax:welcomescreenbuilder#new-welcome-screen-builder),
establece lo que quieras cambiar y después envíalo con
[`update the welcome screen using %welcomescreenbuilder%`](syntax:welcomescreenbuilder#update-welcome-screen).
Ese efecto espera a Discord, así que la línea siguiente ya ve la nueva pantalla.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!set-welcome":
        set {_rules} to a new welcome channel for event-channel with description "Read the rules" with emoji "📜"
        set {_b} to a new welcome screen builder for event-guild
        set welcome screen enabled of {_b} to true
        set description of {_b} to "Welcome to the guild!"
        set welcome channels of {_b} to {_rules}
        update the welcome screen using {_b}
```

Solo se envían las propiedades que estableces; las demás conservan su valor en Discord.

syntax: welcomescreenbuilder#update-welcome-screen compact

## Opciones {#options}

| Propiedad | Predeterminado | Valores aceptados |
| --- | --- | --- |
| [welcome screen enabled](syntax:welcomescreenbuilder#welcome-screen-enabled) | sin cambios | `true`, `false` |
| [description](syntax:welcomescreenbuilder#description) | sin cambios | un texto |
| [welcome channels](syntax:welcomescreenbuilder#welcome-channels) | sin cambios | hasta 5 canales de bienvenida; `set`, `add`, `remove`, `delete` |

[`a new welcome channel for %guildchannel% with description %string% [with emoji %emote/string%]`](syntax:welcomechannel#new-welcome-channel)
crea una entrada. La descripción tiene como máximo 42 caracteres, el emoji es opcional (un emoji
Unicode, un emoji personalizado o la forma `<:name:id>` de uno personalizado), y el canal debe ser de
texto, de voz, de escenario, de anuncios o de foro: una categoría o un hilo se rechaza. Una entrada nunca
cambia una vez creada; crea una nueva para cambiarla.

!!! warning "Un builder nuevo empieza vacío"
    `welcome channels` en un builder reemplaza la **lista completa** en Discord, y un builder nuevo no
    parte de la pantalla actual. Para añadir un canal a la lista existente, lee primero la pantalla y
    copia sus canales al builder, como se muestra abajo.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!add-welcome":
        await set {_screen} to the welcome screen of event-guild
        set {_b} to a new welcome screen builder for event-guild
        set welcome channels of {_b} to welcome channels of {_screen}
        add (a new welcome channel for event-channel with description "Say hi") to welcome channels of {_b}
        update the welcome screen using {_b}
```

`remove` toma una entrada y elimina todas las entradas que apuntan al mismo canal, sea cual sea su
descripción. `delete welcome channels of {_b}` vacía la lista, lo que la borra en Discord una vez
enviado el builder.

syntax: welcomechannel#new-welcome-channel compact

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| Un *Discord error* al leer la pantalla | El servidor no es comunitario, o nunca configuró una pantalla de bienvenida | Activa **Comunidad** en la configuración del servidor |
| *the channel '...' cannot be put on a welcome screen* | La entrada apunta a una categoría o a un hilo | Usa un canal de texto, de voz, de escenario, de anuncios o de foro |
| *[50035] Invalid Form Body* que nombra `welcome_channels` | Más de 5 entradas, o una descripción de más de 42 caracteres | Recorta la lista o la descripción |
| Un *Discord error* que nombra **Missing Permissions** | Al bot le falta **Gestionar servidor** | Concédelo |

entity: welcomescreenbuilder
