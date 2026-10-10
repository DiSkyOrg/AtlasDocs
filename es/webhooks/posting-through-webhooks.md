---
title: Publicar mediante un webhook
description: Publica, edita y elimina mensajes como un webhook, con nombre y avatar propios por mensaje, en un canal o en un hilo.
source-hash: 881cb4db772a
---

Esta página explica qué hace un cliente de webhook una vez que lo tienes: publicar un mensaje,
cambiar su nombre y su avatar solo para ese mensaje, conservar el mensaje enviado para editarlo
o eliminarlo más tarde, y publicar en un hilo. Se asume que tienes un
[cliente de webhook](doc:webhooks/webhook-clients) en `{_hook}` y un bot llamado `"my-bot"` conectado.

## Cómo funciona la publicación {#how-posting-works}

[`make %webhookclient% post %content%`](syntax:webhookclient#webhook-post) envía un texto, un
[embed](doc:messages/embeds), un componente o un [builder](doc:messages/sending-messages)
(objeto de construcción) de mensajes a través del webhook. `send` y `speak` son el mismo efecto
con otros nombres. Igual que `post`, olvida el mensaje que envió.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!announce":
        set {_b} to a new webhook builder named "Announcer" in event-channel
        await set {_hook} to the build result of {_b}
        make {_hook} post "Server restart in 5 minutes"
        make {_hook} post "Restarted" with username "Status" and avatar "https://example.com/up.png"
```

`with username` y `and avatar` cambian cómo aparece el webhook solo en este mensaje; su propio
nombre y avatar no cambian. Un builder de mensajes pasado como contenido se usa como plantilla:
se envían su contenido, sus embeds, sus archivos adjuntos y sus componentes, y el resto del
builder se ignora.

syntax: webhookclient#webhook-post compact

## Conservar el mensaje enviado {#keeping-the-sent-message}

[`a new webhook message with content %string% through %webhookclient%`](syntax:webhookmessageaction#new-webhook-message-with-content)
y `a new webhook message with embed %embedbuilder% through %webhookclient%` crean un builder de
mensaje de webhook. Sigue el [contrato del builder](doc:concepts/builders): no se envía nada
hasta que se lee `the build result of` con `await`, y esa lectura devuelve el mensaje enviado.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!status":
        set {_m} to a new webhook message with content "Checking..." through {_hook}
        set webhook username of {_m} to "Status"
        await set {_sent} to the build result of {_m}
        edit webhook message {_sent} of {_hook} to show "All systems up"
```

syntax: webhookmessageaction#result compact

## Opciones {#options}

Todas las propiedades siguientes son de solo escritura en el builder.

| Propiedad | Valor por defecto | Valores aceptados |
| --- | --- | --- |
| [webhook username](syntax:webhookmessageaction#webhook-username) | el nombre del webhook | cualquier texto |
| [webhook avatar url](syntax:webhookmessageaction#webhook-avatar-url) | el avatar del webhook | una URL de imagen |
| [webhook thread](syntax:webhookmessageaction#webhook-thread) | ninguno, el canal del webhook | un hilo del canal del webhook |
| [webhook thread id](syntax:webhookmessageaction#webhook-thread-id) | ninguno | un id de hilo |
| [discord content](syntax:webhookmessageaction#discord-content) | el texto del constructor | cualquier texto |
| [embed](syntax:webhookmessageaction#embed) | el embed del constructor | un embed |
| [attachments](syntax:webhookmessageaction#attachments) | ninguno | [subidas de archivos](doc:messages/file-uploads) |
| [components](syntax:webhookmessageaction#components) | ninguno | componentes |
| [tts](syntax:webhookmessageaction#tts) | `false` | `true`, `false` |
| [suppressed embeds](syntax:webhookmessageaction#suppressed-embeds) | `false` | `true`, `false` |
| [suppressed notifications](syntax:webhookmessageaction#suppressed-notifications) | `false` | `true`, `false` |

```skript
set {_m} to a new webhook message with content "Patch notes" through {_hook}
set webhook username of {_m} to "Changelog"
set webhook avatar url of {_m} to "https://example.com/log.png"
add (a new file upload from file "plugins/notes.txt") to attachments of {_m}
set suppressed notifications of {_m} to true
await set {_sent} to the build result of {_m}
```

## Editar y eliminar {#editing-and-deleting}

[`edit webhook message %string/message% of %webhookclient% to show %content%`](syntax:core/effects#webhook-edit)
y [`delete webhook message %string/message% of %webhookclient%`](syntax:core/effects#webhook-delete)
reciben el mensaje enviado o su id. Un webhook solo puede editar y eliminar sus propios mensajes,
y un cliente creado a partir de una URL funciona igual que el webhook al que apunta.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!cleanup":
        set {_m} to a new webhook message with content "temporary" through {_hook}
        await set {_sent} to the build result of {_m}
        delete webhook message (discord id of {_sent}) of {_hook}
```

syntax: core/effects#webhook-edit compact

## Hilos {#threads}

Un webhook publica en su propio canal o en un hilo de ese canal. Añade `in thread %threadchannel%`
a cualquiera de los tres efectos, o asigna `webhook thread` en el builder. Un mensaje enviado en
un hilo debe editarse y eliminarse con el mismo `in thread`; de lo contrario, Discord responde
que el mensaje no existe.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!thread-post":
        set {_tb} to a new thread builder named "Logs" from event-message
        await set {_thread} to the build result of {_tb}
        make {_hook} post "first entry" in thread {_thread}
```

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *this message has no content, no embed, no attachment and no component; Discord refuses an empty message* | Se construyó un builder de mensaje de webhook sin nada que enviar | Define un contenido, un embed, un archivo adjunto o un componente |
| *[10008] Unknown Message* | El mensaje no lo envió este webhook, o está en un hilo y falta `in thread` | Edítalo a través del webhook que lo envió, indicando el hilo |
| *[10015] Unknown Webhook* | El webhook fue eliminado | Crea o recupera un webhook nuevo |

entity: webhookmessageaction
