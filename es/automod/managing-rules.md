---
title: Gestionar reglas
description: Lista las reglas de AutoMod de un servidor, edítalas en vivo, elimínalas y reacciona cuando una se active.
source-hash: 16ff0b33d451
---

Esta página cubre las reglas que ya existen en un servidor, las haya creado un script o un
moderador: leerlas, modificarlas, eliminarlas y el evento que se dispara cuando una actúa. Se
asume que tienes un bot llamado `"my-bot"` conectado con **Manage Server**, y que conoces las
[tres reglas de `await`](doc:concepts/cache-and-await).

## Leer las reglas de un servidor {#reading-a-guilds-rules}

[`automod rules of %guild%`](syntax:guild#automod-rules) lista cada regla de un servidor, y
[`automod rule with id %string% in %guild%`](syntax:automodrule#automod-rule-with-id) recupera una.
DiSky no mantiene una caché (copia en memoria) de AutoMod, así que ambas consultan a Discord y
ambas necesitan `await`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!rules":
        await set {_rules::*} to automod rules of event-guild
        loop {_rules::*}:
            reply with "%name of loop-value%: %automod trigger type of loop-value%, enabled %enabled of loop-value%"
```

Lo que obtienes es una instantánea tomada en ese momento. Vuelve a leer una regla después de
editarla para ver el nuevo estado.

| Propiedad | Devuelve |
| --- | --- |
| [name](syntax:automodrule#name) | el nombre de la regla |
| [enabled](syntax:automodrule#enabled) | si la regla se aplica |
| [automod event type](syntax:automodrule#automod-event-type) | `message send` o `member update` |
| [automod trigger type](syntax:automodrule#automod-trigger-type) | `keyword`, `spam`, `keyword preset`, `mention spam` o `member profile keyword` |
| [filtered keywords](syntax:automodrule#filtered-keywords), [filtered patterns](syntax:automodrule#filtered-patterns), [allow list](syntax:automodrule#allow-list) | las listas del activador de palabras clave |
| [presets](syntax:automodrule#presets) | las listas del activador predefinido |
| [mention limit](syntax:automodrule#mention-limit), [mention raid protection](syntax:automodrule#mention-raid-protection) | la configuración del activador de spam de menciones |
| [exempt roles](syntax:automodrule#exempt-roles), [exempt channels](syntax:automodrule#exempt-channels) | a quién y dónde ignora la regla |
| [automod responses](syntax:automodrule#automod-responses) | lo que hace la regla |
| [creator](syntax:automodrule#creator), [creator id](syntax:automodrule#creator-id) | quién la creó |

syntax: guild#automod-rules compact

## Editar una regla {#editing-a-rule}

`name`, `enabled`, `exempt roles`, `exempt channels`, `automod responses` y `trigger config` se
pueden escribir en una regla. Cada cambio se envía a Discord de inmediato; antepón `await` para
esperar a que termine antes de que la línea siguiente vuelva a leer la regla.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!pause-rules":
        await set {_rules::*} to automod rules of event-guild
        loop {_rules::*}:
            await set enabled of loop-value to false
            await add event-channel to exempt channels of loop-value
```

`add` y `remove` parten de la regla tal como se leyó. Una sola línea `add a and b to ...` envía
ambos valores juntos, pero dos líneas `add` separadas sobre la misma instantánea parten cada una de
esa instantánea, así que solo sobrevive la segunda: vuelve a leer la regla entre ambas.

[`trigger config`](syntax:automodrule#trigger-config) reemplaza lo que busca la regla. Es de solo
escritura (lee en su lugar las propiedades de palabras clave, predefinidos y menciones), y el nuevo
activador debe ser del tipo de la regla: una regla de palabras clave acepta un activador de palabras
clave o de patrones, nunca uno predefinido.

```skript
set {_t} to a new automod keyword trigger with the keywords "newword"
await set trigger config of {_rule} to {_t}
```

syntax: automodrule#exempt-roles compact

## Eliminar una regla {#deleting-a-rule}

[`destroy`](syntax:core/effects#destroy) elimina una regla.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!drop-rule":
        await set {_rule} to automod rule with id "000000000000000000" in event-guild
        destroy {_rule}
```

!!! danger "Algunas reglas no se pueden eliminar"
    Un servidor comunitario debe conservar su regla de spam de menciones: Discord rechaza eliminarla.
    Desactívala con `set enabled of {_rule} to false` en su lugar.

## Cuando se activa una regla {#when-a-rule-fires}

[`on automod execution`](event:events#automod-execution) se dispara una vez por cada acción que toma
una regla: una regla que bloquea el mensaje y envía una alerta lo dispara dos veces. Para ello, el
bot necesita el [intent](doc:getting-started/bot-options) (suscripción a eventos)
`auto_moderation_execution`.

```skript
on automod execution seen by "my-bot":
    send "%event-user% triggered %automod rule id of event-automod% in %event-channel%" to console
    send "matched '%matched keyword of event-automod%' in: %automod message content of event-automod%" to console
```

`event-automod` contiene lo que coincidió. [matched keyword](syntax:automod#matched-keyword) y
[matched content](syntax:automod#matched-content) indican qué activó la regla,
[automod message content](syntax:automod#automod-message-content) es el mensaje completo (vacío sin
el intent `message_content`), y `event-automodresponse` es la acción que se está ejecutando.

event: events#automod-execution compact

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *requires 'await'* (error de análisis) | `automod rules of` o `automod rule with id` se leyó sin `await` | Antepón `await` a la línea |
| *[50035] Invalid Form Body* que nombra el activador | `trigger config` se asignó con un activador de otro tipo | Usa un activador del tipo de la regla |
| Un *Discord error* al eliminar una regla de spam de menciones | El servidor es un servidor comunitario | Desactiva la regla en su lugar |

entity: automodrule
