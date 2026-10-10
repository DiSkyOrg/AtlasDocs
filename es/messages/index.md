---
title: Mensajes
description: Enviar, construir y gestionar mensajes de Discord, desde una publicación simple hasta archivos, reacciones y encuestas.
source-hash: cf275900196e
---

Esta sección cubre todo lo que un bot hace con los mensajes: enviarlos, construirlos con antelación,
adjuntar embeds y archivos, editarlos y fijarlos, reaccionar, y crear y leer encuestas. Ya tienes un
bot llamado `"my-bot"` conectado (consulta [Iniciar un bot](doc:getting-started/starting-a-bot)) y has
leído la [sección de conceptos](doc:concepts), en particular [caché y await](doc:concepts/cache-and-await)
y [builders](doc:concepts/builders).

## Tres formas de enviar {#three-ways-to-send}

`post` envía un texto, un embed o un componente a cualquier canal y se olvida de él. `reply with`
responde del mismo modo al mensaje o a la interacción actual, sin que tengas que indicar un canal. El
builder de mensajes (objeto de construcción) configura todo primero, y `the build result of` es la
única forma de recibir de vuelta el mensaje enviado para editarlo, fijarlo o referenciarlo más adelante.

| Necesidad | Usar |
| --- | --- |
| Enviar a un canal que ya tienes y seguir con lo demás | `post` |
| Responder al mensaje o a la interacción que causa el evento actual | `reply with` |
| Adjuntar archivos, añadir componentes o conservar el mensaje enviado después | el builder de mensajes |
| Responder con algo construido de antemano, sin conservarlo | `reply with {_builder}` |

## Orden de lectura {#reading-order}

1. [Enviar mensajes](sending-messages.md): `post`, `reply with`, el builder de mensajes y sus opciones.
2. [Embeds](embeds.md): todas las propiedades del embed y sus campos.
3. [Subida de archivos](file-uploads.md): adjuntar archivos y leerlos después.
4. [Gestionar mensajes](managing-messages.md): editar, fijar, publicar, reenviar, eliminar en masa y
   indicador de escritura.
5. [Reacciones](reactions.md): reaccionar, suprimir reacciones y eventos de reacción.
6. [Crear encuestas](creating-polls.md): construir una encuesta y enviarla sola o en un mensaje.
7. [Encuestas](polls.md): leer una encuesta, listar sus votantes, cerrarla y eventos de voto.

Para publicar con otro nombre y avatar, consulta la [sección de webhooks](doc:webhooks).
