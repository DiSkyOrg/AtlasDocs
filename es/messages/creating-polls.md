---
title: Crear encuestas
description: Crea una encuesta con su pregunta, sus respuestas y su duración, y envíala sola o adjunta a un mensaje.
source-hash: 14d873b48b97
---

Esta página cubre crear una encuesta y enviarla: sola con `post` o `reply with`, o adjunta a un
builder de mensajes (objeto de construcción). Leer una encuesta, cerrarla y sus eventos de voto están
en la página de [encuestas](doc:messages/polls). Se asume que tienes un bot llamado `"my-bot"` conectado
y que sabes cómo funciona [enviar mensajes](doc:messages/sending-messages).

## Cómo se crea una encuesta {#how-a-poll-is-built}

[`a new poll titled %string%`](syntax:pollbuilder#new-poll) crea una encuesta a partir de su pregunta.
Añade sus respuestas a [`poll answer drafts`](syntax:pollbuilder#poll-answer-drafts) y luego pásala a
[`post`](syntax:core/effects#post) o a [`reply with`](syntax:core/effects#effect-reply-with) como
cualquier otro contenido. `with` y `asking` funcionan en lugar de `titled`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!lunch":
        set {_poll} to a new poll titled "Where do we eat?"
        add "Pizza", "Burgers" and "Sushi" to poll answer drafts of {_poll}
        post {_poll} to event-channel
```

Una encuesta no es un [builder](doc:concepts/builders) en el sentido de ese término: no tiene
`build result of`, y enviarla nunca necesita `await`. Se comprueba al enviarla o adjuntarla, así que una
encuesta sin respuestas falla en esa línea, no en la que la creó. La encuesta que sale es una copia:
modificar `{_poll}` después no cambia nada en Discord, y la misma encuesta puede enviarse dos veces.

syntax: pollbuilder#new-poll compact

## Opciones {#options}

| Propiedad | Por defecto | Valores aceptados |
| --- | --- | --- |
| [poll question](syntax:pollbuilder#poll-question) | la pregunta del constructor | hasta 300 caracteres |
| [poll answer drafts](syntax:pollbuilder#poll-answer-drafts) | ninguna | de 1 a 10 respuestas; `set`, `add`, `remove` |
| [poll duration](syntax:pollbuilder#poll-duration) | `24 hours` | de `1 hour` a `7 days` |
| [multi answer](syntax:pollbuilder#multi-answer) | `false` | `true`: los votantes pueden elegir varias respuestas |

A diferencia de la mayoría de builders, estas propiedades se pueden leer de nuevo, así que un script
puede comprobar la encuesta antes de enviarla.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!vote":
        set {_poll} to a new poll asking "Which features next?"
        add "Music" and "Levels" to poll answer drafts of {_poll}
        set poll duration of {_poll} to 3 days
        set multi answer of {_poll} to true
        reply with "%size of poll answer drafts of {_poll}% options, open for %poll duration of {_poll}%"
        reply with {_poll}
```

## Respuestas con emoji {#answers-with-an-emoji}

Un texto simple añadido a `poll answer drafts` se convierte en una respuesta sin emoji. Para añadir un
emoji, usa en su lugar [`a new poll answer with text %string% with emoji %emote/string%`](syntax:pollanswerdata#new-answer):
el emoji puede ser un emoji unicode, un emote, o la forma `<:name:id>` de uno personalizado.

```skript
set {_poll} to a new poll titled "Favorite food?"
add (a new poll answer with text "Pizza" with emoji "🍕") to poll answer drafts of {_poll}
add (a new poll answer with text "Sushi" with emoji "🍣") to poll answer drafts of {_poll}
remove "Pizza" from poll answer drafts of {_poll}
```

`remove` busca las respuestas por su texto, tanto si se añadieron como texto como si se añadieron como
objeto de respuesta. Un objeto de respuesta todavía se puede modificar con
[draft answer text](syntax:pollanswerdata#draft-answer-text) y
[draft answer emoji](syntax:pollanswerdata#draft-answer-emoji) antes de añadirlo; una vez añadido, la
encuesta guarda su propia copia.

syntax: pollanswerdata#new-answer compact

## Encuestas en un builder de mensajes {#polls-on-a-message-builder}

`post` y `reply with` olvidan el mensaje que envían. Para conservarlo, para cerrar la encuesta más tarde
o para leer sus votantes, asigna [`attached poll`](syntax:messageaction#attached-poll) en un
[builder de mensajes](sending-messages.md#building-a-message) y constrúyelo: la encuesta sale junto con
el contenido del mensaje.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!poll-kept":
        set {_poll} to a new poll titled "Ship it?"
        add "Yes" and "No" to poll answer drafts of {_poll}
        set {_m} to a new message with content "Release vote" in event-channel
        set attached poll of {_m} to {_poll}
        await set {_sent} to the build result of {_m}
        set {poll::release} to {_sent}
```

Un mensaje contiene como máximo una encuesta: asignar `attached poll` de nuevo reemplaza la anterior.
Una encuesta no puede compartir mensaje con componentes V2 (contenedores, secciones, bloques de texto).

syntax: messageaction#attached-poll compact

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *a poll needs at least one answer* | La encuesta se envió con `poll answer drafts` vacío | Añade respuestas antes de enviarla |
| *a poll holds at most 10 answers, this one has \<n>* | Demasiadas respuestas | Quita algunas, o divide en dos encuestas |
| *a poll lasts between 1 hour and 168 hours (7 days), this one lasts \<n> hours* | `poll duration` está fuera de rango | Elige una duración de 1 hora a 7 días |
| *the poll question is \<n> characters long, the maximum is 300* | La pregunta es demasiado larga | Acórtala |
| *the poll answer "..." is \<n> characters long, the maximum is 55* | Una respuesta es demasiado larga | Acórtala |

entity: pollbuilder
