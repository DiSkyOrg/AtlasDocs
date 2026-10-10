---
title: Clientes de webhook
description: Crea un webhook en un canal, recupera los existentes o crea un cliente a partir de una URL de webhook.
source-hash: 0e65abfff670
---

Esta página cubre las tres formas de obtener algo a través de lo que se puede publicar: crear un
webhook, recuperar los webhooks que ya tiene un canal o un servidor, y crear un cliente a partir
de una URL de webhook. Se asume que tienes un bot llamado `"my-bot"` conectado y que conoces el
[contrato del builder](doc:concepts/builders) (objeto de construcción).

## Crear un webhook {#creating-a-webhook}

[`a new webhook builder named %string% in %guildchannel%`](syntax:webhookaction#new-webhook-builder)
prepara un webhook en un canal; como todo builder, no existe nada en Discord hasta que lees
`the build result of` con `await`. El bot necesita **Manage Webhooks** en ese canal.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!hook":
        set {_b} to a new webhook builder named "Announcer" in event-channel
        set webhook avatar of {_b} to "https://example.com/avatar.png"
        await set {_hook} to the build result of {_b}
        make {_hook} post "Hello from a fresh webhook"
```

`webhook avatar` es la única propiedad que se puede asignar en el builder (una URL de imagen o una
ruta de archivo local): el nombre y el canal se pasan al constructor. Un canal admite como máximo
15 webhooks; Discord rechaza la construcción si se supera ese número.

syntax: webhookaction#new-webhook-builder compact

## Recuperar webhooks existentes {#retrieving-existing-webhooks}

[`webhooks of %guild%`](syntax:guild#webhooks) lista cada webhook de un servidor, y
[`channel webhooks of %standardguildmessagechannel%`](syntax:standardguildmessagechannel#channel-webhooks)
los de un solo canal. Ambas consultan a Discord, así que ambas requieren `await` (consulta
[caché (copia en memoria) y await](doc:concepts/cache-and-await)), y ambas necesitan
**Manage Webhooks**.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!hooks":
        await set {_hooks::*} to channel webhooks of event-channel
        loop {_hooks::*}:
            reply with "%name of loop-value% (%webhook type of loop-value%)"
```

syntax: guild#webhooks compact

## Crear un cliente a partir de una URL {#building-a-client-from-a-url}

[`a new webhook client from url %string%`](syntax:webhookclient#new-webhook-client) convierte una
URL de webhook (la que Discord muestra en **Integrations → Webhooks → Copy Webhook URL**) en un
cliente. No necesita ningún permiso en el servidor, y el bot no tiene que estar en él: el bot solo
transporta las peticiones HTTP. Sin `using bot`, se usa el único bot cargado.

```skript
options:
    hook-url: "https://discord.com/api/webhooks/123/abc"

on message received seen by "my-bot":
    if discord content of event-message is "!url-hook":
        set {_client} to a new webhook client from url {@hook-url} using bot "my-bot"
        make {_client} post "Posted through a URL"
```

Un cliente creado así solo puede publicar, editar y eliminar sus propios mensajes, nada más: no
tiene nombre, canal ni propietario que leer, y `destroy` no lo acepta.

!!! danger "La URL es un secreto"
    Cualquiera que tenga una URL de webhook, o su [token de webhook](syntax:webhookclient#webhook-token),
    puede publicar a través de ella. Guárdala en un bloque `options:` o en un archivo fuera de los
    scripts que compartas.

syntax: webhookclient#new-webhook-client compact

## Propiedades del webhook {#webhook-properties}

Un webhook recuperado o creado expone su estado en Discord. `name`, `webhook avatar` y
`webhook channel` se pueden escribir y cambian el webhook en Discord; antepón `await` para esperar
al cambio antes de la línea siguiente.

| Propiedad | Devuelve | Modificable |
| --- | --- | --- |
| [name](syntax:webhook#name) | su nombre visible | sí |
| [webhook avatar](syntax:webhook#webhook-avatar) | la URL de su avatar | sí, desde una URL de imagen o una ruta de archivo local |
| [webhook channel](syntax:webhook#webhook-channel) | el canal en el que publica | sí, a un canal de texto (lo mueve) |
| [webhook url](syntax:webhook#webhook-url) | la URL a partir de la que se puede crear un cliente | no |
| [webhook token](syntax:webhookclient#webhook-token) | su token secreto, ninguno para un webhook seguidor | no |
| [webhook owner](syntax:webhook#webhook-owner) | el miembro que lo creó, ninguno si se desconoce | no |
| [webhook type](syntax:webhook#webhook-type) | `INCOMING`, o `CHANNEL_FOLLOWER` para un webhook que retransmite un canal de anuncios | no |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!rename-hooks":
        await set {_hooks::*} to channel webhooks of event-channel
        loop {_hooks::*}:
            await set name of loop-value to "Renamed"
```

## Eliminar un webhook {#deleting-a-webhook}

[`destroy`](syntax:core/effects#destroy) elimina un webhook; todos los clientes creados a partir
de su URL dejan de funcionar al mismo tiempo.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!clear-hooks":
        await set {_hooks::*} to channel webhooks of event-channel
        loop {_hooks::*}:
            destroy loop-value
```

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *a webhook client needs a running bot to carry its requests* | `a new webhook client from url` se ejecutó sin ningún bot conectado, o con varios y ninguno indicado | Conecta primero un bot, o añade `using bot "my-bot"` |
| A *Discord error* naming **Missing Permissions** | Al bot le falta **Manage Webhooks** en el canal | Concédeselo en el canal o en el servidor |
| *[10015] Unknown Webhook* | El webhook fue eliminado, o la URL es incorrecta | Crea un webhook nuevo, o comprueba la URL |

entity: webhook
