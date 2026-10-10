---
title: Enviar mensajes
description: Publicar en un canal, responder al evento actual o construir un mensaje que puedas editar y fijar después.
source-hash: 096c18e2bd26
---

Esta página explica las tres formas de publicar un mensaje en Discord: `post`, `reply with` y el
builder de mensajes (objeto de construcción). Se asume que tienes un bot llamado `"my-bot"` conectado y
que conoces el [contrato de los builders](doc:concepts/builders) y las
[tres reglas de `await`](doc:concepts/cache-and-await).

## Cómo funciona el envío {#how-sending-works}

[`post`](syntax:core/effects#post) envía un texto, un embed o un componente al canal que indiques.
[`reply with`](syntax:core/effects#effect-reply-with) envía los mismos tipos de contenido, pero elige el
canal por ti: aquel en el que ocurrió el evento actual. Ninguno de los dos te devuelve el mensaje que
enviaron; para eso, construye uno primero (ver abajo).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!post":
        post "plain text from DiSky" to event-channel
```

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!reply":
        reply with "replied in the event channel"
```

En un evento de mensaje, `reply with` publica en `event-channel`, igual que en el ejemplo anterior; en
un evento de interacción responde a la interacción, y `hidden` hace que esa respuesta sea efímera (solo
la ve el usuario que la activó, y no tiene efecto fuera de las interacciones). Añade una referencia para
vincular la respuesta a un mensaje, como lo hace la función de respuesta de Discord:

```skript
reply with "replied with a reference" with reference event-message
```

syntax: core/effects#effect-reply-with compact

## Publicar en un canal {#posting-to-a-channel}

`post` y `dispatch` son el mismo efecto con dos nombres; usa el que te resulte más claro. Acepta un
texto, un [embed](doc:messages/embeds), un componente o una encuesta, y publica en cualquier
[canal de mensajes](entity:messagechannel) que le pases, no solo en `event-channel`:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!echo":
        set {_target} to event-channel
        post "posted from a variable" to {_target}
        dispatch "same effect, different name" in {_target}
```

!!! info "Las encuestas usan los mismos efectos"
    `post` y `reply with` también aceptan una encuesta creada con `a new poll titled ...`, y un builder
    de mensajes la lleva mediante `attached poll`. Consulta [crear encuestas](doc:messages/creating-polls).

syntax: core/effects#post compact

## Construir un mensaje {#building-a-message}

[`a new message with content %string% in %messagechannel%`](syntax:messageaction#new-message-with-content)
y `a new message with embed %embedbuilder% in %messagechannel%` crean un builder de mensajes: sigue el
mismo contrato que cualquier otro builder, así que no se envía nada hasta que lees `the build result
of` sobre él, lo que requiere `await`. Lo que recibes es un mensaje real, ya enviado: edítalo, fíjalo o
lee cualquiera de sus propiedades.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!edit":
        set {_m} to a new message with content "before" in event-channel
        await set {_sent} to the build result of {_m}
        edit {_sent} to show "after"
```

`reply with {_m}` también acepta un builder de mensajes como atajo: vuelve a enviar el contenido, los
embeds, los adjuntos y la encuesta del builder a través del canal del evento o de la interacción, sin
construirlo nunca con `the build result of`, así que no recibes ningún mensaje de vuelta. Ignora el canal
propio del builder y no transfiere `tts`, `suppressed notifications` ni el `referenced message` propio
del builder; para eso, usa `with reference` en el propio `reply with`.

```skript
set {_m} to a new message with content "reply from a builder" in event-channel
reply with {_m} with reference event-message
```

syntax: messageaction#result compact

## Opciones {#options}

Todas las propiedades siguientes son de solo escritura en el builder: léelas en el mensaje ya enviado.

| Propiedad | Valor por defecto | Valores aceptados |
| --- | --- | --- |
| [discord content](syntax:messageaction#discord-content) | ninguno definido | cualquier texto |
| [embed](syntax:messageaction#embed) | ninguno definido | un [embed](doc:messages/embeds) |
| [attached poll](syntax:messageaction#attached-poll) | ninguno definido | una [encuesta](doc:messages/creating-polls) |
| [tts](syntax:messageaction#tts) | `false` | `true`, `false` |
| [suppressed embeds](syntax:messageaction#suppressed-embeds) | `false` | `true`, `false` |
| [suppressed notifications](syntax:messageaction#suppressed-notifications) | `false` | `true`, `false` |
| [referenced message](syntax:messageaction#referenced-message) | ninguno definido | un mensaje |
| [mention replied user](syntax:messageaction#mention-replied-user) | `true` | `true`, `false` |
| [fail on invalid reply](syntax:messageaction#fail-on-invalid-reply) | `false` | `true`, `false` |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!new-message":
        set {_m} to a new message with content "built, then sent" in event-channel
        set tts of {_m} to false
        set suppressed embeds of {_m} to false
        set suppressed notifications of {_m} to true
        await set {_sent} to the build result of {_m}
```

## Responder a un mensaje {#replying-to-a-message}

`referenced message`, `mention replied user` y `fail on invalid reply` son la forma propia que tiene el
builder de responder, junto con `content` o `embed`, en lugar de hacerlo con `reply with ... with
reference`. `mention replied user` solo importa cuando ya hay un `referenced message` definido: decide si
el autor del mensaje referenciado recibe un ping. `fail on invalid reply` decide qué pasa si ese mensaje
ya no existe cuando el builder lo envía: `false` (el valor por defecto) envía el mensaje igualmente, sin
el enlace de respuesta; `true` hace que la construcción falle en su lugar.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!reply-ref":
        set {_m} to a new message with content "this is a reply" in event-channel
        set referenced message of {_m} to event-message
        set mention replied user of {_m} to false
        set fail on invalid reply of {_m} to false
        await set {_sent} to the build result of {_m}
```

## Errores que puedes ver {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *IllegalStateException: this message has no content, no embed, no attachment and no component; Discord refuses an empty message* | Se leyó `the build result of` sobre un builder sin nada definido | Define un `content`, un `embed` o un adjunto antes de construir |
| *IllegalStateException: this message's content is \<n> characters long, the maximum is 2000* | El `content` del builder (o `discord content`) supera el límite de Discord | Acorta el texto o divídelo en más de un mensaje |

entity: messageaction
