---
title: Activadores y acciones
description: Todos los tipos de activador de AutoMod con sus opciones, y todas las acciones que puede tomar una regla.
source-hash: 9bf6605fab0f
---

Esta página enumera lo que una regla de AutoMod puede buscar y lo que puede hacer al respecto.
Ambos son valores simples: créalos, ajústalos y después pásalos a un
[builder de reglas](doc:automod/creating-rules) (objeto de construcción) o a una
[regla existente](doc:automod/managing-rules). Se asume que tienes un bot llamado `"my-bot"` conectado.

## Cómo funcionan los activadores {#how-triggers-work}

Un activador se crea con una de cinco expresiones, una por tipo. Sus opciones son propiedades de
solo escritura, y cada una solo se aplica a los tipos que aparecen junto a ella: asignar
`filtered keywords` en un activador de spam de menciones produce un error legible, en lugar de
ignorarse en silencio.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!words":
        set {_t} to a new automod keyword trigger with the keywords "badword"
        add "*worse*" to filtered keywords of {_t}
        set allow list of {_t} to "badwordle"
        set {_b} to a new automod rule builder named "Words" in event-guild for messages using {_t}
        add a new automod response blocking the message to automod responses of {_b}
        await set {_rule} to the build result of {_b}
```

syntax: triggerconfig#new-keyword-trigger compact

## Tipos de activador {#trigger-kinds}

| Tipo | Se crea con | Uno por servidor |
| --- | --- | --- |
| Palabras clave | [`a new automod keyword trigger [with the keywords %strings%]`](syntax:triggerconfig#new-keyword-trigger) | no |
| Patrón | [`a new automod pattern trigger with the regex patterns %strings%`](syntax:triggerconfig#new-pattern-trigger) | no |
| Predefinido | [`a new automod preset trigger with the presets %keywordpresets%`](syntax:triggerconfig#new-preset-trigger) | sí |
| Spam de menciones | [`a new automod mention spam trigger with a limit of %number%`](syntax:triggerconfig#new-mention-spam-trigger) | sí |
| Spam | [`a new automod spam trigger`](syntax:triggerconfig#new-spam-trigger) | sí |

Las palabras clave admiten un comodín `*` al principio, al final o en ambos extremos (`"*bad*"`
coincide dentro de una palabra). Los patrones son expresiones regulares con sintaxis de Rust, hasta
10 patrones de 260 caracteres como máximo. Un activador de palabras clave y uno de patrones son el
mismo tipo en Discord: un activador de palabras clave también puede contener patrones, y viceversa;
al construir la regla necesita al menos uno de los dos.

Los predefinidos son las listas de palabras que mantiene Discord: `profanity`, `sexual content` y
`slurs`.

## Opciones del activador {#trigger-options}

| Propiedad | Se aplica a | Valores aceptados |
| --- | --- | --- |
| [filtered keywords](syntax:triggerconfig#filtered-keywords) | palabra clave, patrón | textos, `set` o `add` |
| [filtered patterns](syntax:triggerconfig#filtered-patterns) | palabra clave, patrón | textos de expresión regular, `set` o `add` |
| [allow list](syntax:triggerconfig#allow-list) | palabra clave, patrón, predefinido | textos que nunca activan la regla |
| [presets](syntax:triggerconfig#presets) | predefinido | `profanity`, `sexual content`, `slurs`; `set`, `add` o `remove` |
| [mention limit](syntax:triggerconfig#mention-limit) | spam de menciones | de 1 a 50 menciones únicas |
| [mention raid protection](syntax:triggerconfig#mention-raid-protection) | spam de menciones | `true`, `false` |

```skript
set {_presets} to a new automod preset trigger with the presets profanity and slurs
add sexual content to presets of {_presets}
set allow list of {_presets} to "scunthorpe"

set {_mentions} to a new automod mention spam trigger with a limit of 5
set mention raid protection of {_mentions} to true
```

syntax: triggerconfig#new-preset-trigger compact
syntax: triggerconfig#new-mention-spam-trigger compact

## Acciones {#responses}

Una acción se crea con una de cuatro expresiones y no cambia después. Una regla contiene como
máximo una acción de cada tipo: añadir una segunda del mismo tipo reemplaza a la primera.

| Acción | Se crea con | Permitida en |
| --- | --- | --- |
| Bloquear el mensaje | [`a new automod response blocking the message [with the custom message %string%]`](syntax:automodresponse#new-block-message) | reglas de mensajes |
| Enviar una alerta | [`a new automod response sending an alert to the channel %standardguildmessagechannel%`](syntax:automodresponse#new-send-alert) | reglas de mensajes |
| Aislar temporalmente al miembro | [`a new automod response timing the member out for %timespan%`](syntax:automodresponse#new-timeout) | reglas de palabras clave y de spam de menciones |
| Bloquear interacciones de miembros | [`a new automod response blocking the member interactions`](syntax:automodresponse#new-block-interaction) | reglas de perfil de miembro (añadida automáticamente) |

El mensaje personalizado de un mensaje bloqueado se muestra a su autor, con 150 caracteres como
máximo. Un aislamiento temporal dura hasta 28 días.

```skript
set {_block} to a new automod response blocking the message with the custom message "Keep it clean"
set {_alert} to a new automod response sending an alert to the channel event-channel
set {_mute} to a new automod response timing the member out for 5 minutes
set automod responses of {_b} to {_block}, {_alert} and {_mute}
```

Una acción se lee mediante [response type](syntax:automodresponse#response-type),
[response message](syntax:automodresponse#response-message),
[response channel](syntax:automodresponse#response-channel) y
[response timeout](syntax:automodresponse#response-timeout); cada una está vacía cuando no se aplica
al tipo de la acción. `response type` se compara con `block message`, `send alert message`,
`timeout` y `block member interaction`.

syntax: automodresponse#new-block-message compact

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *this property only applies to a mention spam trigger, not a keyword one* (y los demás tipos) | Se asignó una opción en un tipo de activador que no la tiene | Consulta la columna *Se aplica a* de arriba |
| *the timeout duration must be greater than 0* | Se creó una acción de aislamiento con duración cero | Indica una duración real |
| *[50035] Invalid Form Body* que nombra el activador | Un activador de palabras clave sin palabra clave ni patrón, una expresión regular que Discord rechaza, o un límite superior a 50 | Corrige el campo indicado en el mensaje |

entity: triggerconfig
