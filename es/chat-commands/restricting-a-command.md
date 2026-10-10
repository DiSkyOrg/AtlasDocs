---
title: Restringir un comando
description: Limitar dónde se ejecuta un comando y quién puede ejecutarlo, añadir un tiempo de espera y reaccionar cuando una comprobación lo rechaza.
source-hash: 5a7066979be2
---

Esta página cubre las entradas que restringen un [comando declarado](doc:chat-commands/declaring-a-command):
dónde se ejecuta, quién puede ejecutarlo, su tiempo de espera y cómo reaccionar cuando una
comprobación lo rechaza. Se asume que tienes un bot llamado `"my-bot"` conectado.

## Cómo funcionan las comprobaciones {#how-checks-work}

[`on discord command used`](doc:chat-commands/listing-and-events) se dispara primero, antes de
cualquier comprobación de abajo; cancelarlo detiene el comando por completo. A partir de ahí, las
comprobaciones se ejecutan en un orden fijo, y la primera que falla detiene las demás:

| Paso | Comprobación | Motivo del fallo | Mensaje configurado |
| --- | --- | --- | --- |
| 1 | `bots` | `wrong bot` | ninguno |
| 2 | `executable in` | `wrong channel` | ninguno |
| 3 | `roles` | `missing role` | ninguno |
| 4 | `permissions` | `missing permission` | `permission message` |
| 5 | `cooldown` | `cooldown` | `cooldown message` |
| 6 | análisis de argumentos | `invalid arguments` | `usage message` |

Una entrada que no defines se omite, no se aplica como "ninguno permitido": sin `roles`, cualquier
rol vale; sin `executable in`, cualquier tipo de canal vale. `permission message`, `cooldown message`
y `usage message` son las únicas entradas que envían una respuesta por sí solas; los otros tres
motivos no envían nada, salvo que [`on discord command failed`](#reacting-to-a-refusal) responda
también.

```skript
discord command admin:
    prefixes: "!"
    permissions: administrator
    permission message: "You need to be an administrator, %event-user%."
    trigger:
        reply with "you are an admin"
```

## Dónde se ejecuta un comando {#where-a-command-runs}

`executable in` acepta una lista de palabras y restringe los tipos de canal en los que el comando
responde. Si lo omites, equivale a listar todas las palabras de abajo.

| Palabra | Canales |
| --- | --- |
| `guild`, `server` | cualquier tipo de canal de servidor: de texto, de anuncios, de voz, de escenario y los tres tipos de hilo |
| `dm`, `pm`, `private message`, `direct message`, `private` | mensajes directos |
| `thread`, `threads` | hilos públicos, privados y de anuncios |
| `voice` | canales de voz y de escenario |
| `text` | canales de texto y de anuncios |

```skript
discord command dmonly:
    prefixes: "!"
    executable in: dm
    trigger:
        reply with "this only works in DMs"
```

## Quién puede ejecutarlo {#who-can-run-it}

`roles`, `permissions` y `bots` restringen cada uno quién puede ejecutar el comando; define los que
necesites, todos tienen que cumplirse. `roles` acepta una lista separada por comas de nombres o ids
de roles:

```skript
discord command vip:
    prefixes: "!"
    roles: VIP, 1335575588307734528
    trigger:
        reply with "you have the role"
```

`permissions` acepta los literales de permiso de Skript, el mismo `administrator` usado arriba;
lista varios separados por comas: `permissions: kick members, ban members`. Un nombre de permiso no
reconocido es un error de carga, no de ejecución (consulta [Errores más abajo](#errors-you-may-see)).

`bots` limita el comando a uno o varios [bots](doc:getting-started/multiple-bots) por nombre; en
cualquier otro bot, el comando se rechaza con `wrong bot` en lugar de ejecutarse:

```skript
discord command onlyminimal:
    prefixes: "!"
    bots: my-bot
    trigger:
        reply with "handled by %event-bot%"
```

## Tiempos de espera {#cooldowns}

`cooldown` acepta un timespan (intervalo de tiempo) y bloquea su reutilización hasta que transcurra;
`cooldown scope` decide quién comparte ese temporizador, y por defecto es `user`.

| Ámbito | Compartido entre |
| --- | --- |
| `user`, `member` | el mismo usuario, en todos los servidores y canales |
| `guild`, `server` | todos los miembros de ese servidor |
| `channel` | todos los usuarios de ese canal |

Un uso solo se marca cuando todas las comprobaciones anteriores han pasado, incluido el análisis de
argumentos: una llamada rechazada por `invalid arguments` nunca inicia el tiempo de espera.

```skript
discord command slow:
    prefixes: "!"
    cooldown: 10 seconds
    cooldown message: "Wait %remaining cooldown% before using %name of event-discordcommand% again."
    trigger:
        reply with "slow command used"
```

```skript
discord command guildslow:
    prefixes: "!"
    cooldown: 10 seconds
    cooldown scope: guild
    trigger:
        reply with "guild-wide cooldown started"
```

syntax: discordcommand#cooldown compact

## Reaccionar a un rechazo {#reacting-to-a-refusal}

[`on discord command failed`](event:events#discord-command-failed) se dispara en cada llamada
rechazada, sea cual sea la comprobación que la detuvo. `failure reason` indica cuál fue:

| Motivo | Cuándo | Tiene un mensaje configurado |
| --- | --- | --- |
| `invalid arguments` | falta un argumento o no se analiza | `usage message` |
| `wrong channel` | `executable in` rechazó el canal | ninguno |
| `missing role` | `roles` rechazó al miembro | ninguno |
| `missing permission` | `permissions` rechazó al miembro | `permission message` |
| `cooldown` | el tiempo de espera aún no ha pasado | `cooldown message` |
| `wrong bot` | `bots` no incluye este bot | ninguno |

`remaining cooldown` solo se define para un fallo de `cooldown`; es un timespan, listo para usarse
en `%remaining cooldown%`. Usa este evento para responder en los tres motivos que no tienen un
mensaje configurado:

```skript
on discord command failed:
    send "[CMD] failed %name of event-discordcommand%: %failure reason% (remaining %remaining cooldown%)" to console
    if failure reason is "wrong channel":
        reply with "wrong channel for %name of event-discordcommand%"
    if failure reason is "missing role":
        reply with "you lack the role for %name of event-discordcommand%"
    if failure reason is "wrong bot":
        reply with "not for %event-bot%"
```

event: events#discord-command-failed compact

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *Unknown permission 'x' in the discord command 'name'* | una entrada `permissions` no es un literal de permiso válido | usa un nombre de permiso que Discord reconozca, canónico (`kick members`) o alias (`manage messages`) |
| *'x' is not a valid place for 'executable in' (expected guild, dm, threads, voice or text)* | una palabra de `executable in` está mal escrita | usa una de las palabras de la [tabla de arriba](#where-a-command-runs) |
| *'x' is not a valid cooldown scope (expected user, guild or channel)* | `cooldown scope` no es ninguno de `user`, `guild` o `channel` | usa uno de los tres ámbitos |
