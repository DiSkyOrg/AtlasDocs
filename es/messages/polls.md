---
title: Encuestas
description: Lee una encuesta adjunta a un mensaje, lista a sus votantes, ciérrala antes de tiempo y reacciona cuando alguien vote.
source-hash: 1290991b6d6f
---

Esta página cubre una encuesta que ya está en Discord: leer su pregunta y sus respuestas, listar quién
votó, cerrarla antes de su fecha límite y reaccionar a los votos a medida que llegan. Enviar una se
explica en [crear encuestas](doc:messages/creating-polls). Se asume que tienes un bot llamado
`"my-bot"` conectado y que sabes [leer un mensaje](doc:messages/managing-messages).

## Cómo funcionan las encuestas {#how-polls-work}

[`has a poll`](syntax:message#a-poll) indica si un mensaje contiene una encuesta; cuando es así,
[`poll of`](syntax:message#poll) del mensaje devuelve un `messagepoll` con un `poll question` y una lista
de `poll answers`, junto con [multi answer](syntax:messagepoll#multi-answer),
[poll layout](syntax:messagepoll#poll-layout) y
[poll expiration date](syntax:messagepoll#poll-expiration-date).

```skript
on message received seen by "my-bot":
    if event-message has a poll:
        set {_poll} to poll of event-message
        reply with "%poll question of {_poll}%"
        loop poll answers of {_poll}:
            reply with "%answer text of loop-value%: %answer votes of loop-value% votes"
```

## Respuestas {#answers}

Cada elemento de `poll answers` es un `pollanswer`.

| Propiedad | Devuelve |
| --- | --- |
| [answer text](syntax:pollanswer#answer-text) | el texto de la opción |
| [answer votes](syntax:pollanswer#answer-votes) | el número de votos que tiene, como número simple |
| [answer emote](syntax:pollanswer#answer-emote) | el emoji que se muestra junto a ella, si la encuesta tiene uno; si no, nada |
| [answer id](syntax:pollanswer#answer-id) | su número, desde 1 en el orden en que se declararon las respuestas |
| [answer self voted](syntax:pollanswer#answer-self-voted) | si el propio bot votó por ella |

`answer votes` nunca necesita `await`: el recuento viaja con el propio mensaje, no con una consulta
aparte. `answer emote` se imprime como el propio emoji, así que puede ir directamente en un mensaje.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!poll-winner":
        set {_poll} to poll of event-message
        set {_best} to first element of (poll answers of {_poll})
        loop poll answers of {_poll}:
            if answer votes of loop-value > answer votes of {_best}:
                set {_best} to loop-value
        reply with "leading: %answer text of {_best}% (%answer votes of {_best}%)"
```

## Listar votantes {#listing-voters}

[`voters of poll answer %number/pollanswer% of %message%`](syntax:core/expressions#expression-poll-voters)
lista los usuarios que eligieron una respuesta. La respuesta es un `pollanswer` o su `answer id`; el
mensaje es el que contiene la encuesta, no la encuesta en sí. La lista se obtiene de Discord, todas sus
páginas, así que la línea necesita `await`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!voters":
        set {_m} to {poll::release}
        loop poll answers of (poll of {_m}):
            await set {_voters::*} to the voters of poll answer loop-value of {_m}
            reply with "%answer text of loop-value%: %{_voters::*}%"
            delete {_voters::*}
```

`{poll::release}` contiene un mensaje enviado desde un [builder de mensajes](doc:messages/creating-polls)
(objeto de construcción), la única forma de conservar el mensaje de la encuesta. Un número de respuesta
que la encuesta no tiene produce un error legible (*this poll has no answer numbered \<n>*).

syntax: core/expressions#expression-poll-voters compact

## Cerrar una encuesta {#ending-a-poll}

[`end the poll of`](syntax:message#end-poll) cierra una encuesta antes de su fecha límite; después de
ejecutarlo, nadie puede votar en ella.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!end-poll":
        end the poll of event-message
```

[`is expired`](syntax:messagepoll#expired) es verdadero cuando ha pasado la fecha límite de la encuesta
y ya no se aceptan votos; [`is finalized`](syntax:messagepoll#finalized) es verdadero cuando Discord ha
dado por definitivos los recuentos de votos, algo que `end the poll of` también hace de inmediato.
`end the poll of` rechaza un mensaje sin encuesta y una encuesta que ya está expirada o finalizada.

syntax: message#end-poll compact

## Eventos de voto {#vote-events}

[`on message poll vote added`](event:events#poll-vote-add) y
[`on message poll vote removed`](event:events#poll-vote-remove) se activan por cada voto.
`event-message`, `event-member` y `event-user` se obtienen de Discord antes de que empiece el trigger,
así que ninguno necesita `await` (consulta [caché y await](doc:concepts/cache-and-await));
`event-member` es nada para un voto emitido en un mensaje directo (DM).

| Evento | Valores |
| --- | --- |
| `on message poll vote added` | `event-channel`, `event-guild`, `event-member`, `event-user`, `event-message` |
| `on message poll vote removed` | `event-channel`, `event-guild`, `event-member`, `event-user`, `event-message` |

```skript
on message poll vote added seen by "my-bot":
    send "%event-user% voted on a poll in %event-channel%" to console
```

Ninguno de los dos eventos indica qué respuesta se votó: solo quién votó y en qué mensaje. Consulta los
[votantes](#listing-voters) de cada respuesta si necesitas saber qué opción cambió.

event: events#poll-vote-add compact

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *IllegalStateException: this message carries no poll* | `end the poll of` se llamó sobre un mensaje sin encuesta adjunta | Comprueba antes [`has a poll`](syntax:message#a-poll) |
| *IllegalStateException: this poll is already over* | `end the poll of` se llamó sobre una encuesta que ya está expirada o finalizada | Comprueba `is expired`/`is finalized` antes de llamarlo, o llámalo una sola vez |

entity: messagepoll
