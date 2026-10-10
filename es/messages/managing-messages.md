---
title: Gestionar mensajes
description: Editar, fijar, publicar, reenviar y eliminar un mensaje que ya tienes, y leer todo lo que contiene.
source-hash: e88a53c09c20
---

Esta página cubre lo que puedes hacer con un mensaje que ya existe: cambiarlo, fijarlo, publicarlo,
reenviarlo, eliminarlo y leer sus propiedades. Se asume que tienes un bot llamado `"my-bot"` conectado y
que sabes [enviar un mensaje](doc:messages/sending-messages).

## Cómo se gestiona un mensaje {#how-a-message-is-managed}

Todos los efectos de esta página reciben un `message`, y un `message` procede de uno de cuatro lugares:
el evento en el que estás (`event-message`), el [resultado de la construcción](doc:concepts/builders) de
un builder de mensajes, una búsqueda por id o los mensajes fijados de un canal. Las dos últimas son
lecturas de solo recuperación y necesitan `await` (ver [caché y await](doc:concepts/cache-and-await));
los propios efectos nunca lo necesitan, porque cada uno espera la respuesta de Discord antes de que se
ejecute la línea siguiente.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!edit":
        set {_m} to a new message with content "before" in event-channel
        await set {_sent} to the build result of {_m}
        edit {_sent} to show "after"
```

El builder devuelve el mensaje que el bot acaba de enviar, que es el único mensaje que el bot siempre
puede editar. Las otras dos fuentes se ven así:

```skript
await set {_msg} to message with id "1234567890" in event-channel
await set {_pins::*} to pinned messages of event-channel
```

[`message with id`](syntax:message#message-with-id) obtiene un mensaje de un canal, y
[`pinned messages of`](syntax:messagechannel#pinned-messages) todos los mensajes fijados de él; ambos
fallan con un error legible si el id es incorrecto o si el bot no puede ver el canal.

## Editar {#editing}

[`edit`](syntax:message#edit) reemplaza lo que muestra un mensaje. Acepta un texto, un embed o un
componente, y no es un parche: el nuevo contenido reemplaza a la vez el texto, los embeds, los
componentes y los adjuntos del mensaje. Editar con un texto elimina los embeds que tenía el mensaje, y
editar con un embed vacía su texto. Solo se pueden editar los mensajes enviados por el propio bot;
cualquier otro se rechaza antes de que salga la petición.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!edit-embed":
        set {_m} to a new message with content "will get an embed" in event-channel
        await set {_sent} to the build result of {_m}
        set {_e} to a new discord embed
        set description of {_e} to "edited into an embed"
        edit {_sent} with {_e}
```

`edit ... with` y `edit ... to show` son el mismo efecto. Para conservar a la vez un texto y un embed tras
la edición, pasa un builder de mensajes que lleve ambos, tal como se describe en la página de
[enviar mensajes](doc:messages/sending-messages).

syntax: message#edit compact

## Fijar y publicar {#pinning-and-publishing}

[`pin`](syntax:message#pin) añade un mensaje a los fijados de su canal y [`unpin`](syntax:message#unpin)
lo quita; un canal admite hasta 50 mensajes fijados. Fijar un mensaje que no es del bot requiere el
permiso **Manage Messages**.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!pin":
        pin event-message
    if discord content of event-message is "!unpin":
        unpin event-message
```

[`is pinned`](syntax:message#pinned) lee la copia que tienes, no lo que dice Discord: justo después de
`pin event-message`, `event-message is pinned` sigue siendo falso. Vuelve a obtener el mensaje con
`message with id` cuando necesites el indicador actualizado.

[`publish`](syntax:message#publish) (o `crosspost`) envía un mensaje a todos los servidores que siguen su
canal. Solo funciona con un mensaje publicado en un canal de anuncios; en cualquier otro caso, Discord lo
rechaza con un error legible en la consola.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!publish":
        publish event-message
```

## Reenviar y eliminar {#forwarding-and-deleting}

[`forward`](syntax:message#forward) envía una copia de un mensaje a otro canal; la copia lleva la marca de
reenviado de Discord y `is forwarded` es verdadero en ella. [`destroy`](syntax:core/effects#destroy)
elimina un mensaje, y [`purge`](syntax:message#purge) elimina una lista de ellos con el menor número de
peticiones posible.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!forward":
        forward event-message to event-channel
    if discord content of event-message is "!delete":
        destroy event-message
```

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!purge":
        set {_m} to a new message with content "temporary" in event-channel
        await set {_first} to the build result of {_m}
        await set {_second} to the build result of {_m}
        purge {_first} and {_second}
```

`purge` agrupa los mensajes por canal y usa el endpoint de borrado masivo de Discord, que acepta de 2 a
100 mensajes a la vez y solo admite mensajes de menos de dos semanas. Las listas más largas se dividen en
lotes de 100, un único mensaje recurre a un borrado simple, y los mensajes de más de dos semanas se borran
uno a uno; nunca tienes que filtrar la lista tú mismo. Borrar mensajes escritos por otros, uno a uno o en
masa, requiere **Manage Messages**.

!!! danger "La eliminación es permanente"
    `destroy` y `purge` no piden confirmación, y no hay forma de restaurar un mensaje eliminado.
    Comprueba `discord author of` antes de eliminar cuando la lista proviene de un canal.

syntax: message#purge compact
syntax: core/effects#destroy compact

## Otros efectos {#other-effects}

[`show typing status in`](syntax:messagechannel#send-typing) hace aparecer el indicador de escritura del
bot en un canal durante 10 segundos, o hasta que el bot publique allí; recibe el canal, no un mensaje.
[`suppress the embeds of`](syntax:message#suppress-embeds) oculta las vistas previas de enlaces que Discord
generó para un mensaje. [`end the poll of`](syntax:message#end-poll) cierra la encuesta que lleva un
mensaje; las encuestas se explican en la página de [encuestas](doc:messages/polls).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!typing":
        show typing status in event-channel
    if discord content of event-message is "!no-previews":
        suppress the embeds of event-message
```

## Leer un mensaje {#reading-a-message}

Las propiedades de un mensaje se leen con `<property> of <message>`. Las que coinciden con un nombre de
Skript llevan el prefijo `discord`: Skript elige la primera sintaxis registrada cuyo patrón coincide, y
una variable sin tipo, como `{_msg}`, encaja en cualquier hueco, así que una sintaxis con la misma forma
de Skript o de un addon (extensión de Skript) ganaría en silencio a la de DiSky. `discord content`,
`discord author`, `discord attachments` y `discord components` evitan eso; escríbelas siempre con el
prefijo.

| Propiedad | Devuelve |
| --- | --- |
| [discord content](syntax:message#discord-content) | el texto original, sin formato |
| [discord author](syntax:message#discord-author) | el autor como usuario; ninguno para un webhook |
| [member author](syntax:message#member-author) | el autor como miembro; ninguno fuera de un servidor |
| [guild](syntax:message#guild) | el servidor; ninguno en mensajes directos |
| [jump url](syntax:message#jump-url) | el enlace que abre el mensaje en Discord |
| [referenced message](syntax:message#referenced-message) | el mensaje al que responde, si lo hay |
| [embeds](syntax:message#embeds) | los embeds que muestra |
| [discord attachments](syntax:message#discord-attachments) | sus archivos, como [archivos adjuntos](doc:messages/file-uploads) |
| [discord components](syntax:message#discord-components) | sus botones, menús desplegables y otros componentes, aplanados |
| [reactions](syntax:message#reactions) | sus [reacciones](doc:messages/reactions), con sus recuentos |
| [poll](syntax:message#poll) | su [encuesta](doc:messages/polls), si la tiene |
| [mentioned users](syntax:message#mentioned-users) | todos los usuarios mencionados en el texto |
| [mentioned members](syntax:message#mentioned-members) | lo mismo que los miembros; lista vacía fuera de un servidor |
| [mentioned roles](syntax:message#mentioned-roles) | todos los roles mencionados; lista vacía fuera de un servidor |
| [mentioned channels](syntax:message#mentioned-channels) | todos los canales de texto mencionados |
| [mentioned voice channels](syntax:message#mentioned-voice-channels) | todos los canales de voz mencionados |
| [mentioned emotes](syntax:message#mentioned-emotes) | todos los emojis personalizados usados; los emojis estándar no se incluyen |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!info":
        reply with "by %discord author of event-message%: %jump url of event-message%"
        reply with "%size of mentioned users of event-message% user(s) mentioned"
```

Diez condiciones describen el estado de un mensaje. Todas leen la copia que tienes, y Skript niega cada
una con `is not` (`if event-message is not pinned:`).

| Condición | Es verdadera cuando |
| --- | --- |
| [is edited](syntax:message#edited) | el mensaje se ha editado desde que se envió |
| [is pinned](syntax:message#pinned) | está fijado en su canal |
| [is ephemeral](syntax:message#ephemeral) | solo un usuario puede verlo (una respuesta de interacción) |
| [is tts](syntax:message#tts) | se envió con texto a voz |
| [is from a guild](syntax:message#from-a-guild) | se envió en un canal de servidor |
| [is from a dm](syntax:message#from-a-dm-private-message-direct-message) | se envió en un canal privado |
| [is a voice message](syntax:message#a-voice-message) | es un mensaje de voz; su adjunto tiene un `attachment duration` |
| [is forwarded](syntax:message#forwarded) | es una copia hecha con `forward` |
| [has a poll](syntax:message#a-poll) | tiene una encuesta adjunta |
| [is using components v2](syntax:message#using-components-v2) | está construido con contenedores, secciones y textos de visualización |

```skript
on message received seen by "my-bot":
    if event-message is from a dm:
        stop
    if event-message has a poll:
        reply with "%poll question of poll of event-message%"
```

## Errores que puedes ver {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *[50013] Missing Permissions* en `pin`, `unpin`, `destroy` o `publish` | El mensaje no es del bot y el bot no tiene **Manage Messages** en ese canal | Concede el permiso al rol del bot, o actúa solo sobre los mensajes propios del bot |
| *IllegalStateException: Attempted to update message that was not sent by this account. You cannot modify other User's messages!* | `edit` recibió un mensaje escrito por otra persona | Edita solo los mensajes que envió el bot; si no, usa `destroy` y publica uno nuevo |
| *InsufficientPermissionException: Cannot delete messages of other users* | `purge` recibió un mensaje escrito por otra persona y el bot no tiene **Manage Messages** | Concede el permiso, o filtra la lista por `discord author of` antes de purgar |
| *[10008] Unknown Message* | El mensaje se eliminó antes de que se ejecutara el efecto, o `message with id` recibió un id incorrecto | Comprueba el id, o envuelve la línea en un `try` y lee el [error](doc:concepts/errors) |

entity: message
