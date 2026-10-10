---
title: Reacciones
description: Reacciona a un mensaje, quita una reacción y lee las reacciones que Discord registra en él.
source-hash: e5dfb6d479bd
---

Esta página cubre añadir una reacción a un mensaje, quitar una, los eventos que se activan cuando un
usuario reacciona y leer las reacciones que ya tiene un mensaje. Se asume que tienes un bot llamado
`"my-bot"` conectado y que sabes [enviar un mensaje](doc:messages/sending-messages).

## Cómo funcionan las reacciones {#how-reactions-work}

[`react to`](syntax:message#react) añade una o más reacciones a un mensaje, como el bot. Recibe una
lista de emojis unicode, valores de emote personalizado, o ambos mezclados.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!react":
        react to event-message with "✅"
```

Cada elemento de la lista es un texto o un valor `emote`. Un texto se lee como un carácter de emoji
unicode, o como la forma con formato `<:name:id>` (o `<a:name:id>` para uno animado) de un emote
personalizado; un valor `emote` reacciona directamente con ese emote personalizado, y es la opción más
segura, porque nunca depende de escribir bien el texto con formato. Obtén uno con `emojis of` de un
servidor (en caché) o con `mentioned emotes of` de un mensaje; usa `await set` con `emotes of` de un
servidor cuando necesites la lista actualizada (consulta [caché y await](doc:concepts/cache-and-await)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!react-emote":
        set {_emote} to first element of (emojis of event-guild)
        react to event-message with {_emote}
        react to event-message with ("👍" and {_emote})
```

syntax: message#react compact

## Quitar reacciones {#removing-reactions}

[`suppress`](syntax:emote#suppress-reactions) quita una reacción de un mensaje: usado solo con el emote,
quita la reacción del bot; con un usuario indicado, quita la de ese usuario.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!unreact":
        set {_emote} to first element of (emojis of event-guild)
        suppress {_emote} from event-message
        suppress {_emote} of event-user from event-message
```

!!! warning "Solo funciona un valor de emote personalizado"
    `suppress` recibe un valor `emote`, no un texto: no hay forma de pasarle un emoji unicode en bruto
    como `"✅"`. Obtén el emote con `emojis of` del servidor o con `mentioned emotes of` del mensaje,
    como arriba. Tampoco hay en v5 un efecto para quitar todas las reacciones de un mensaje de una vez;
    `suppress` siempre apunta a un emote (y opcionalmente a un usuario) por línea.

syntax: emote#suppress-reactions compact

## Eventos de reacción {#reaction-events}

[`on reaction add`](event:events#reaction-add) y [`on reaction remove`](event:events#reaction-remove)
se activan por cada reacción; `on reaction remove
all` se activa una sola vez, cuando se quitan todas las reacciones de un mensaje a la vez. `reaction message`
se obtiene de Discord antes de que empiece el trigger, así que nunca necesita `await` (consulta
[caché y await](doc:concepts/cache-and-await)).

| Evento | Valores |
| --- | --- |
| `on reaction add` | `event-channel`, `event-guild`, `event-member`, `event-user`, `reaction message` |
| `on reaction remove` | `event-channel`, `event-guild`, `event-member`, `event-user`, `reaction message` |
| `on reaction remove all` | `event-channel`, `event-guild`, `reaction message` |

```skript
on reaction add seen by "my-bot":
    send "%event-user% reacted to '%discord content of reaction message%'" to console
```

En v5 todavía no existe un tipo `Emote` para la propia reacción, así que ninguno de los tres eventos te
dice qué emoji se añadió o se quitó; solo quién reaccionó y en qué mensaje.

event: events#reaction-add compact

## Leer reacciones {#reading-reactions}

[`reactions of`](syntax:message#reactions) de un mensaje devuelve un elemento por cada emoji distinto con
el que se reaccionó. Ninguna de sus propiedades está expuesta en v5 (ni siquiera el emoji o el recuento),
así que la lista solo sirve por su tamaño.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!reaction-count":
        reply with "%size of reactions of event-message% distinct reaction(s)"
```

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *[10014] Unknown Emoji* | `react to` recibió un emote personalizado que ya no existe, o un id de emote sin formato | Usa un valor `emote` actualizado de `emojis of`/`mentioned emotes of`, no un id escrito a mano |
| *[50013] Missing Permissions* | El rol del bot no tiene **Add Reactions** en ese canal | Concede **Add Reactions** al rol del bot |
