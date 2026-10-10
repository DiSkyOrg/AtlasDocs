---
title: Comandos de chat
description: Comandos que se detectan por lo que el usuario escribe en un canal, declarados por completo en Skript y nunca registrados en Discord.
source-hash: 54267789640b
---

Un *comando de chat* se detecta por el texto de los mensajes: el bot observa cada mensaje que
recibe y, cuando el texto coincide con `<prefix><name> <arguments>`, ejecuta el `trigger`
(bloque de código) del comando. No se registra nada en Discord. Se asume que tienes un bot
llamado `"my-bot"` conectado (consulta [Iniciar un bot](doc:getting-started/starting-a-bot)).

```skript
discord command ping:
    prefixes: "!"
    trigger:
        reply with "pong"
```

Enviar `!ping` en cualquier canal que el bot pueda ver ejecuta el trigger y responde `pong`.

## Comandos de chat o de interacción {#chat-or-interaction-commands}

| Necesidad | Qué usar |
| --- | --- |
| Responder al texto escrito, sin registro en Discord, en cualquier cliente | un comando de chat, esta sección |
| Un `/command` que muestra el selector propio de Discord, o una entrada del menú contextual **Apps** | un [comando de interacción](doc:interaction-commands) |

Ambas familias pueden convivir en el mismo script: un comando de chat lee sus argumentos del
texto del mensaje, mientras que un comando de interacción recibe esos argumentos ya tipados y
validados por Discord antes de que el bot los vea.

## Orden de lectura {#reading-order}

1. [Declarar un comando](declaring-a-command.md): la estructura, los prefijos, los alias y lo
   que puede leer el trigger.
2. [Argumentos](arguments.md): la gramática de argumentos, los tipos, la resolución y los
   locales con nombre.
3. [Restringir un comando](restricting-a-command.md): canales, roles, permisos, bots y tiempos
   de espera.
4. [Listado y eventos](listing-and-events.md): `on discord command used`, cada comando cargado y
   un comando de ayuda.
