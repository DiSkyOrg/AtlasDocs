---
title: Listado y eventos
description: Interceptar cada comando antes de que se ejecuten sus comprobaciones, listar los que están cargados y registrar cada uso.
source-hash: 149c117bc14d
---

Esta página cubre `on discord command used`, el evento por el que pasa cada comando antes de sus
comprobaciones, y el listado de los [comandos](doc:chat-commands/declaring-a-command) cargados
actualmente. Se asume que tienes un bot llamado `"my-bot"` conectado.

## Interceptar un comando {#intercepting-a-command}

[`on discord command used`](event:events#discord-command-used) se dispara para cada comando, incluso
antes de que se [comprueben](doc:chat-commands/restricting-a-command) `executable in`, `roles`,
`permissions` y `cooldown`. `cancel event` dentro de él detiene el comando por completo, antes de
que se ejecute su trigger; es uno de los dos [eventos de DiSky que se pueden cancelar](doc:concepts/events).

```skript
discord command blocked:
    prefixes: "!"
    trigger:
        reply with "this should never run"

on discord command used:
    if name of event-discordcommand is "blocked":
        cancel event
        reply with "blocked by 'on discord command used'"
```

`event-discordcommand` es el comando, y `used prefix`, `used alias` y `used arguments` indican
exactamente cómo se escribió; las mismas tres expresiones funcionan dentro del propio `trigger` del
comando. Filtra por un solo bot de la forma habitual, con `on discord command used seen by "my-bot":`.

Registra cada uso de la misma forma, antes de que cualquier comprobación pueda rechazarlo:

```skript
on discord command used:
    send "%event-user% ran %name of event-discordcommand% (prefix=%used prefix%, alias=%used alias%, args='%used arguments%')" to console
```

event: events#discord-command-used compact

## Listar comandos {#listing-commands}

[`all discord commands`](syntax:core/expressions#expression-all-discord-commands) devuelve cada
comando cargado desde todos los scripts, como una lista de valores
[`discordcommand`](entity:discordcommand). Cada uno expone sus entradas declaradas, en modo solo
lectura:

| Propiedad | Devuelve |
| --- | --- |
| [name](syntax:discordcommand#name) | el nombre del comando |
| [description](syntax:discordcommand#description) | la entrada `description`, si está definida |
| [usage](syntax:discordcommand#usage) | la entrada `usage`, o una generada a partir del nombre y los argumentos |
| [category](syntax:discordcommand#category) | la entrada `category`, si está definida |
| [aliases](syntax:discordcommand#aliases) | los alias del comando, sin su nombre principal |
| [prefixes](syntax:discordcommand#prefixes) | los prefijos del comando; vacío cuando responde solo a su nombre |
| [cooldown](syntax:discordcommand#cooldown) | la entrada `cooldown`, si está definida |

```skript
discord command help:
    prefixes: "!"
    trigger:
        set {_lines::*} to ""
        loop all discord commands:
            add "%name of loop-value%: %usage of loop-value%" to {_lines::*}
        reply with join {_lines::*} with nl
```

Agrupa la respuesta por `category of loop-value` cuando tengas más de unos pocos comandos. La lista
siempre coincide con lo que está cargado: recargar un script añade o quita sus comandos de ella de
inmediato, sin reiniciar el bot.

syntax: core/expressions#expression-all-discord-commands compact

entity: discordcommand
