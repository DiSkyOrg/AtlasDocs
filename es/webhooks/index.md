---
title: Webhooks
description: Publica mensajes con un nombre y un avatar propios, desde un webhook que crea el bot o solo desde una URL de webhook.
source-hash: 235a155d065d
---

Un webhook publica mensajes en un canal con su propio nombre y avatar, sin ser miembro del
servidor. Esta sección explica cómo obtener un webhook y publicar a través de él. Se asume que
tienes un bot llamado `"my-bot"` conectado (consulta [Iniciar un bot](doc:getting-started/starting-a-bot))
y que sabes cómo funciona [enviar mensajes](doc:messages/sending-messages).

## Webhooks y clientes de webhook {#webhooks-and-webhook-clients}

DiSky tiene dos entidades para esto. Un [webhook](entity:webhook) es el objeto de Discord en sí:
el bot lo creó o lo leyó de un servidor, así que tiene nombre, canal y propietario, y puede
renombrarse o eliminarse. Un [cliente de webhook](entity:webhookclient) es cualquier objeto que
puede publicar a través de un webhook, incluido un cliente creado solo a partir de una URL de
webhook. Todo webhook es también un cliente de webhook, así que cualquier efecto de publicación
acepta ambos.

| Tienes | Obtienes | Puede publicar | Puede renombrar, mover o eliminar |
| --- | --- | --- | --- |
| Un canal donde el bot tiene **Manage Webhooks** | un `webhook` (créalo o recupéralo) | sí | sí |
| Solo una URL de webhook | un `webhookclient` | sí | no |

## Orden de lectura {#reading-order}

1. [Clientes de webhook](webhook-clients.md): cómo crear un webhook, recuperar los existentes,
   crear un cliente a partir de una URL y las propiedades del webhook.
2. [Publicar mediante un webhook](posting-through-webhooks.md): el efecto `make ... post`, el
   builder de mensajes de webhook, editar y eliminar lo que envió un webhook, y los hilos.
