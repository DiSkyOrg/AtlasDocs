---
title: Comandos de interacción
description: Comandos de barra y comandos contextuales del clic derecho, declarados con una estructura o un builder y enviados a Discord por el script.
source-hash: 5e0612dbf4f7
---

Un *comando de interacción* se registra en Discord y lo muestra el propio cliente: un `/command` en el selector, o una entrada del menú **Apps** del clic derecho sobre un usuario o un mensaje. Discord tipa y valida sus argumentos antes de que el bot los vea. Se asume que tienes un bot llamado `"my-bot"` conectado (consulta [Iniciar un bot](doc:getting-started/starting-a-bot)).

```skript
slash command ping:
    description: Pong!
    trigger:
        reply with hidden "Pong! (%used slash command%)"

on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

La estructura declara el comando y su trigger; el bloque `on guild ready` es el que lo envía a Discord. Nada llega a Discord por sí solo, ni al cargar, recargar o descargar el script.

## Estructura o builder {#structure-or-builder}

| Necesidad | Qué usar |
| --- | --- |
| Un `/command` con su propio trigger, conocido al cargar el script | una [estructura de comando de barra](slash-commands.md) |
| Un `/command` armado en tiempo de ejecución, a partir de datos o por servidor | un [builder (objeto de construcción) de comandos](command-builders.md) |
| Una entrada del menú **Apps** del clic derecho | un [comando contextual](context-commands.md), estructura o builder |
| Un comando que responde a texto escrito, sin registro en Discord | un [comando de chat](doc:chat-commands) |

Ambas formas producen los mismos objetos de comando y se pueden enviar en la misma llamada. Una
estructura conserva su propio `trigger`; un builder se responde en el evento genérico `on slash command`.

## Orden de lectura {#reading-order}

1. [Comandos de barra](slash-commands.md): la estructura, su ruta, descripción y trigger, y qué cambió desde la v4.
2. [Opciones de comandos de barra](slash-options.md): tipos de argumento, opciones fijas, autocompletado y opciones tipadas.
3. [Comandos contextuales](context-commands.md): `user command` y `message command`, y sus objetivos.
4. [Builders de comandos](command-builders.md): construir un comando como objeto y combinarlo con estructuras.
5. [Registrar comandos](registering-commands.md): `update`, `register`, `unregister` y recarga.
6. [Configuración de comandos](command-settings.md): permisos, contextos, localización y tiempos de espera.
