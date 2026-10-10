---
title: Comandos contextuales
description: Las estructuras y builders de comandos del menú contextual del clic derecho para usuarios y mensajes, y lo que puede leer su trigger.
source-hash: dfc6f4ec35c2
---

Esta página cubre `user command` y `message command`: las estructuras detrás del menú **Apps**
del clic derecho de Discord, y sus equivalentes en builder (objeto de construcción). Se asume que tienes
un bot llamado `"my-bot"` conectado y que has leído [Comandos de barra](doc:interaction-commands/slash-commands).

## Cómo funcionan los comandos contextuales {#how-context-commands-work}

Al hacer clic derecho sobre un usuario o un mensaje en Discord se abre un submenú **Apps**; cada
entrada de ahí es un comando contextual. Una estructura `user command` responde a un clic sobre un
usuario, y una `message command` responde a un clic sobre un mensaje. Ambas son modelos, igual que
`slash command`, con un `trigger` que se ejecuta cuando alguien elige la entrada.

```skript
user command Report user:
    trigger:
        reply with hidden "Reported %target user%"

message command Quote this:
    trigger:
        reply with hidden "> %discord content of target message%"
```

Un nombre tiene de 1 a 32 caracteres y, a diferencia del de un comando de barra, puede contener espacios
y mayúsculas: "Report user" y "Quote this" son entradas válidas en el menú de Discord. `trigger` es la
única entrada obligatoria.

Nada llega a Discord hasta que un script lo envía, igual que con un comando de barra: `update the
discord commands (all structured application commands) in event-guild` desde `on guild ready` envía
todas las estructuras, incluidos los comandos contextuales. Consulta
[Registrar comandos](doc:interaction-commands/registering-commands) para `register`, `unregister` y la
división entre comandos globales y por servidor. Los comandos contextuales cambiaron de v4 a v5 de la
misma forma que los comandos de barra; la advertencia de [Comandos de barra](doc:interaction-commands/slash-commands)
explica qué cambió.

syntax: core/structures#structure-context-command-structure compact

## Entradas {#entries}

| Entrada | Por defecto | Valores aceptados |
| --- | --- | --- |
| [name](syntax:applicationcommand#name-localizations) | el nombre del propio encabezado | una sección de nombres traducidos `locale: text` |
| `trigger` | *(obligatorio)* | una sección de código Skript |

`enabled for`, `disabled`, `nsfw`, `contexts`, `integration types`, `cooldown`, `cooldown scope` y
`on cooldown` funcionan igual que en un comando de barra; consulta
[Configuración de comandos](doc:interaction-commands/command-settings).

## Dentro del trigger {#inside-the-trigger}

| Valor | Contiene |
| --- | --- |
| `target user` | el usuario pulsado, en un trigger de `user command` |
| `target message` | el mensaje pulsado, en un trigger de `message command` |
| `used user command` / `used message command` | el nombre del comando |
| `event-user`, `event-member`, `event-guild`, `event-channel`, `event-bot` | el contexto de la invocación |
| `event-message` | el mensaje pulsado, con el mismo valor que `target message` (solo comandos de mensaje) |

event: events#user-command compact

event: events#message-command compact

## Construir uno con un builder {#building-one-instead}

Un builder de comando contextual es un objeto simple con un nombre y nada más: sin ruta, sin `trigger`.
Nada llega a Discord hasta que se envía, y un comando declarado con builder se responde en el evento
genérico en lugar de ejecutar un trigger propio.

```skript
on guild ready:
    set {_report} to a new user command named "Report user"
    register the discord command {_report} in event-guild

on user command:
    if used user command is "Report user":
        reply with hidden "Reported %target user%"
```

```skript
on guild ready:
    set {_quote} to a new message command named "Quote this"
    register the discord command {_quote} in event-guild

on message command:
    if used message command is "Quote this":
        reply with hidden "> %discord content of target message%"
```

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *A context command name is 1 to 32 characters long* | el nombre del encabezado está vacío o es demasiado largo | acórtalo o alárgalo hasta que cumpla el límite |
| *Unexpected entry 'x' in a context command. Known entries: name, enabled for, disabled, nsfw, contexts, integration types, cooldown, cooldown scope, on cooldown, trigger.* | una entrada está mal escrita, o pertenece solo a `slash command` | usa una de las entradas listadas |

entity: usercommand
