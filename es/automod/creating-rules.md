---
title: Crear una regla
description: Construye una regla de AutoMod a partir de un activador y sus acciones, y después créala en Discord.
source-hash: ffe6c5764397
---

Esta página cubre el builder de reglas de AutoMod: los dos tipos de regla, las propiedades que
admite una regla y la construcción. Se asume que tienes un bot llamado `"my-bot"` conectado con
**Manage Server**, y que conoces el [contrato del builder](doc:concepts/builders) (objeto de
construcción).

## Cómo se crea una regla {#how-a-rule-is-created}

Una regla se crea en cuatro pasos: crear un activador, crear las acciones, pasar ambos a un
builder y, después, leer [`the build result of`](syntax:automodrulebuilder#result) del builder con
`await`. El constructor del builder recibe el nombre, el servidor y el activador, porque Discord
los fija en el momento de la creación.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!no-invites":
        set {_t} to a new automod keyword trigger with the keywords "*discord.gg*"
        set {_b} to a new automod rule builder named "No invites" in event-guild for messages using {_t}
        add a new automod response blocking the message to automod responses of {_b}
        await set {_rule} to the build result of {_b}
        reply with "created rule %discord id of {_rule}%"
```

Lo que se devuelve es una [regla de AutoMod](entity:automodrule) en vivo: lee sus propiedades o
[edítala](doc:automod/managing-rules) como cualquier otra entidad. Construir el mismo builder dos
veces crea dos reglas.

syntax: automodrulebuilder#result compact

## Reglas de mensajes y reglas de perfil {#message-rules-and-profile-rules}

Discord comprueba una regla en un momento concreto, elegido al crearla y que no cambia después:

| Constructor | Se comprueba cuando | Activadores admitidos |
| --- | --- | --- |
| [`... for messages using %triggerconfig%`](syntax:automodrulebuilder#new-message-builder) | un miembro envía un mensaje | todos los tipos |
| [`... for member profiles using %triggerconfig%`](syntax:automodrulebuilder#new-profile-builder) | un miembro cambia su nombre de usuario, su apodo o su biografía | solo activadores de palabras clave |

A una regla de perfil se le añade automáticamente la acción *bloquear interacciones de miembros*,
que es la única acción que Discord permite en ella.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!clean-names":
        set {_t} to a new automod keyword trigger with the keywords "*admin*"
        set {_b} to a new automod rule builder named "No fake staff" in event-guild for member profiles using {_t}
        await set {_rule} to the build result of {_b}
```

syntax: automodrulebuilder#new-message-builder compact

## Opciones {#options}

Todas las propiedades del builder son de solo escritura; léelas de vuelta en la regla construida.

| Propiedad | Valor por defecto | Valores aceptados |
| --- | --- | --- |
| [enabled](syntax:automodrulebuilder#enabled) | `true` | `true`, `false` |
| [automod responses](syntax:automodrulebuilder#automod-responses) | ninguna (reglas de perfil: bloquear interacción) | [acciones](doc:automod/triggers-and-responses) |
| [exempt roles](syntax:automodrulebuilder#exempt-roles) | ninguno | hasta 20 roles |
| [exempt channels](syntax:automodrulebuilder#exempt-channels) | ninguno | hasta 50 canales |
| [trigger config](syntax:automodrulebuilder#trigger-config) | el activador del constructor | un activador del mismo tipo |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!strict-words":
        set {_t} to a new automod keyword trigger with the keywords "badword" and "*worse*"
        set allow list of {_t} to "badwordle"
        set {_b} to a new automod rule builder named "Words" in event-guild for messages using {_t}
        set automod responses of {_b} to (a new automod response blocking the message)
        add (a new automod response sending an alert to the channel event-channel) to automod responses of {_b}
        add (a new automod response timing the member out for 10 minutes) to automod responses of {_b}
        add role with id "000000000000000000" to exempt roles of {_b}
        set enabled of {_b} to true
        await set {_rule} to the build result of {_b}
```

!!! warning "Una regla por servidor para algunos activadores"
    Discord permite una sola regla por servidor para los activadores **predefinido**, **spam** y
    **spam de menciones**, y para las reglas de perfil de miembro. Una segunda regla se rechaza con
    *[50035] Invalid Form Body*. Lista primero las reglas del servidor y
    [edita la existente](doc:automod/managing-rules) en su lugar.

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *[50035] Invalid Form Body* seguido del campo que falla | Un activador de una por servidor ya tiene una regla, o un valor está fuera del rango de Discord | Edita la regla existente; revisa el campo indicado en el mensaje |
| *[50035] Invalid Form Body* que nombra `actions` | Falta la acción, o es una que el activador no permite (un aislamiento temporal en una regla de spam) | Consulta la tabla de acciones en [activadores y acciones](doc:automod/triggers-and-responses) |
| *building talks to Discord, so this requires 'await'* (error de análisis) | `the build result of` se leyó sin `await` | Escribe `await set {_rule} to the build result of {_b}` |
| A *Discord error* naming **Missing Permissions** | Al bot le falta **Manage Server** | Concédeselo |

entity: automodrulebuilder
