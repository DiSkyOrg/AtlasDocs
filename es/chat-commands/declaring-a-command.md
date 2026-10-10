---
title: Declarar un comando
description: La estructura discord command, sus entradas, prefijos y alias, y lo que puede leer el trigger.
source-hash: 03af4ec23806
---

Esta página cubre la estructura `discord command` en sí: su encabezado, sus entradas, cómo se
compara un mensaje con ella y lo que puede leer el trigger (bloque de código del comando). Se
asume que tienes un bot llamado `"my-bot"` conectado (consulta
[Iniciar un bot](doc:getting-started/starting-a-bot)) y que has leído la
[visión general de los comandos](doc:chat-commands).

## Cómo funciona un comando {#how-a-command-works}

Un `discord command` es una estructura de nivel superior, que se declara junto a los bloques
`on ready` y `options:` de tu bot, no dentro de ellos. Su encabezado nombra el comando; su
`trigger` se ejecuta cuando un mensaje coincide. El bot observa cada mensaje que recibe y lo
compara con cada comando cargado.

```skript
discord command ping:
    prefixes: "!"
    trigger:
        reply with "pong"
```

Enviar `!ping` ejecuta el trigger de arriba. La comparación funciona así: el nombre del comando se
compara sin distinguir mayúsculas, el mensaje debe empezar por `<prefix><name>` (en ese orden), y
lo que siga, separado por espacios, pasa a ser los argumentos sin procesar. Un mensaje enviado por
otro bot o por un webhook nunca activa un comando. Sin una entrada `executable in` (consulta
[Restringir un comando](doc:chat-commands/restricting-a-command)), un comando funciona tanto en
mensajes directos como en los canales de un servidor.

syntax: core/structures#structure-discord-command compact

## Entradas {#entries}

Todas las entradas siguientes son opcionales, salvo `trigger`.

| Entrada | Por defecto | Valores aceptados |
| --- | --- | --- |
| [prefixes](syntax:discordcommand#prefixes) | ninguno: coincide el nombre sin más | una expresión de texto, uno o más valores |
| [aliases](syntax:discordcommand#aliases) | ninguno | nombres separados por comas |
| [description](syntax:discordcommand#description) | ninguno | cualquier texto |
| [usage](syntax:discordcommand#usage) | generado a partir del nombre y los argumentos | cualquier texto |
| [category](syntax:discordcommand#category) | ninguno | cualquier texto |
| `trigger` | *(obligatorio)* | una section (bloque sangrado) de código Skript |

`roles`, `permissions`, `bots`, `executable in`, `cooldown` y `cooldown scope` restringen quién
puede ejecutar el comando; consulta [Restringir un comando](doc:chat-commands/restricting-a-command). `usage
message` se explica junto con el resto de la gramática de argumentos en
[Argumentos](doc:chat-commands/arguments).

## Prefijos y alias {#prefixes-and-aliases}

Un comando declarado sin `prefixes:` responde a su nombre sin más, sin nada delante:

```skript
discord command hello <user>:
    trigger:
        reply with "Hello %arg-1%!"
```

`prefixes` acepta más de un valor, así que un comando puede responder a varios:

```skript
discord command ping:
    prefixes: "!", "?"
    trigger:
        reply with "pong"
```

`prefixes` es una expresión, evaluada de nuevo para cada mensaje entrante, y no una lista fija
leída una sola vez al cargar. Un prefijo guardado en una variable puede cambiar, por tanto, mientras
el script se ejecuta:

```skript
discord command ping:
    prefixes: "%{prefix}%"
    trigger:
        reply with "pong"
```

La entrada se analiza antes de que exista el evento del comando, así que los valores del evento,
como `event-guild`, no se pueden usar dentro de ella; un prefijo por servidor no es posible solo
con `prefixes`.

Una vez que un mensaje coincide, `used prefix` y `used alias` indican exactamente qué coincidió,
el nombre o el alias:

```skript
discord command ping:
    prefixes: "!"
    aliases: p, pong
    trigger:
        reply with "matched with '%used prefix%%used alias%'"
```

!!! tip "Los nombres sin prefijo son muy charlatanes"
    Un comando sin `prefixes:` reacciona a cualquier mensaje que empiece por su nombre, sin nada
    delante. Reserva la forma sin prefijo para uno o dos comandos que quieras que parezcan una
    conversación; pon prefijo al resto.

## Dentro del trigger {#inside-the-trigger}

El `trigger` de un `discord command` es en sí un evento: todo lo siguiente se puede leer ahí, y
también en [`on discord command used`](doc:chat-commands/listing-and-events) y en
[`on discord command failed`](doc:chat-commands/restricting-a-command).

| Valor | Contiene |
| --- | --- |
| `event-discordcommand` | el comando que coincidió |
| `event-message` | el mensaje de Discord que lo activó |
| `event-user` | el autor del mensaje |
| `event-member` | el autor como miembro del servidor; sin valor en un mensaje directo |
| `event-guild` | el servidor donde se envió el mensaje; sin valor en un mensaje directo |
| `event-channel` | el canal donde se envió el mensaje |
| `event-bot` | el bot que recibió el mensaje |
| `used prefix` | el prefijo que coincidió |
| `used alias` | el nombre o alias que coincidió |
| `used arguments` | el texto tras el nombre, antes de analizarlo |

Los argumentos declarados se leen con `arg-1` y similares; consulta
[Argumentos](doc:chat-commands/arguments). [`reply with`](doc:messages/sending-messages) publica en
`event-channel`, el canal propio del comando, y cualquier efecto normal de DiSky funciona en el
trigger exactamente igual que en `on message received`.

## Recarga y conflictos {#reloading-and-clashes}

Los comandos se registran por identidad, no por nombre: recargar un script elimina solo los
comandos que él declaró, y nunca toca los de otro script. Dos comandos que comparten un nombre (o
un alias) con prefijos que se solapan se cargan igualmente, con una advertencia:

*The discord command '\<name>' is already declared in \<file>; both will run on the same
message.*

!!! warning "Un conflicto no es un fallo de carga"
    Ambos comandos siguen registrados y se ejecutan los dos para un mensaje que coincida con
    cualquiera de ellos; DiSky no elige un ganador. Renombra uno de ellos, o separa sus prefijos
    para que no se solapen, para resolverlo.

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *Unexpected entry '\<key>' in a discord command. Known entries: prefixes, aliases, description, usage, category, roles, permissions, bots, executable in, cooldown, cooldown scope, permission message, cooldown message, usage message, trigger.* | un nombre de entrada está mal escrito o no existe | usa una de las entradas listadas |
| *Required entry 'trigger' is missing* | la estructura no tiene un bloque `trigger:` | añade un bloque `trigger:` |

Declarar un comando nunca se comunica con Discord, así que no tiene errores propios de Discord;
estos aparecen cuando un mensaje llega de verdad al trigger (consulta [Errores](doc:concepts/errors)).

entity: discordcommand
