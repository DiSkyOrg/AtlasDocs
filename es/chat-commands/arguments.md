---
title: Argumentos
description: La gramática de argumentos en el encabezado de un comando, cómo se resuelve cada tipo y cómo leer los valores en el trigger.
source-hash: a5d6f7564d0e
---

Esta página cubre la especificación de argumentos que escribes en el encabezado de un
[comando](doc:chat-commands/declaring-a-command), los tipos que acepta, cómo DiSky resuelve cada
uno y las expresiones que devuelven los valores en el trigger. Se asume que tienes un comando
declarado y un bot llamado `"my-bot"` conectado.

## Cómo funcionan los argumentos {#how-arguments-work}

Todo lo que sigue al nombre del comando en `discord command <name> <arguments>:` es una lista de
huecos `<type>`. Las entidades de Discord (un usuario, un rol, un canal...) se resuelven a partir
de una mención, un id o un nombre **antes de que se ejecute el trigger**, en un hilo de trabajo,
así que `arg-1` ya contiene un valor real cuando empieza tu código; solo la resolución en sí puede
bloquearse, nunca el trigger.

```skript
discord command hello <user> [<n: number = 1>]:
    prefixes: "!"
    usage message: "Usage: %usage of event-discordcommand%"
    trigger:
        reply with "Hello %arg-1% x%{_n}%"
```

| Forma | Significado | Ejemplo |
| --- | --- | --- |
| `<type>` | obligatorio, sin nombre; solo se lee por posición | `<user>` |
| `<name: type>` | obligatorio, también legible como `{_name}` | `<amount: number>` |
| `<name: type = default>` | opcional; `{_name}` contiene `default` cuando se omite | `<n: number = 1>` |
| `[<...>]` | opcional, sin valor por defecto; se lee `none` cuando se omite | `[<who: member>]` |
| tipo plural | coincide con una secuencia de tokens; `{_name::*}` (o `arg-N`) contiene todos los valores resueltos | `<users>` |
| `<text>` al final | voraz: el resto de la línea tal cual, incluidas las comillas | `<text>` |

Un argumento obligatorio nunca puede ir después de uno opcional: DiSky rechaza el comando completo
al cargarse (consulta [Errores que puedes encontrar](#errors-you-may-see)).

## Tipos de argumentos {#argument-types}

Las entidades de Discord se resuelven mediante la búsqueda propia de DiSky; el resto recurre al
analizador de Skript para ese tipo. Un argumento plural resuelve cada token por separado, y un
token que no se resuelve se descarta de la lista en lugar de hacer fallar todo el comando.

| Palabra de tipo | Se resuelve a partir de | Notas |
| --- | --- | --- |
| `user` | mención, id o nombre | un id consulta Discord (REST) si el usuario no está en caché; un nombre se busca entre los miembros del servidor |
| `member` | mención, id o nombre | solo en servidor; se lee `none` en un mensaje directo |
| `role` | mención, id o nombre | solo en servidor, solo caché |
| `guild` | id o nombre | se busca en todos los servidores en los que está el bot, no solo en el actual |
| `message` | un id (se busca en el canal actual) o un enlace de salto | siempre consulta Discord (REST) |
| `emote` | un emoji personalizado como `<:name:id>` | un emoji Unicode estándar no se resuelve |
| `bot` | el nombre indicado en `login ... as` | el registro de bots propio de DiSky, no una cuenta de Discord |
| `channel` | `<#id>`, un id o un nombre | solo en servidor, solo caché; coincide con cualquier tipo de canal |
| `textchannel`, `voicechannel`, `stagechannel`, `newschannel`, `forumchannel`, `mediachannel`, `threadchannel`, `category`, `privatechannel` | igual que `channel` | se resuelven de la misma forma y solo se conservan si el resultado es ese tipo concreto |

Cualquier otro tipo que Skript analiza en contexto de comando (`number`, `text`, `timespan`,
`boolean` y los demás) funciona igual, mediante el analizador propio de Skript para ese tipo.

## Leer los argumentos {#reading-arguments}

Dentro del trigger, y dentro de `on discord command used` / `on discord command failed`, lee un
argumento por posición, por tipo o por nombre si tiene uno.

| Expresión | Devuelve |
| --- | --- |
| [`arg-1`](syntax:core/expressions#expression-discord-command-argument) | el valor o valores del primer argumento |
| `the 2nd argument` | lo mismo, por ordinal |
| `last argument` | el último argumento declarado |
| `arguments` | los valores de todos los argumentos, aplanados en una sola lista |
| `user argument` | el primer argumento cuyo tipo es `user` |
| `text argument-2` | el segundo argumento cuyo tipo es `text` |
| `{_name}` / `{_name::*}` | el local de un argumento con nombre: un valor único, o una lista para un tipo plural |
| `used arguments` | el texto tal cual escrito tras el nombre del comando, sin analizar |

```skript
discord command entities <role> <textchannel> [<who: member>]:
    prefixes: "!"
    trigger:
        reply with "role=%arg-1% channel=%arg-2% member=%{_who}%"
```

```skript
discord command many <users>:
    prefixes: "!"
    trigger:
        reply with "%size of arguments% users: %arg-1%"
```

syntax: core/expressions#expression-discord-command-argument compact

## Argumentos opcionales y valores por defecto {#optional-arguments-and-defaults}

El valor por defecto tras `=` puede ser un literal (`= 1`) o una expresión completa; se evalúa de
nuevo cada vez que se omite el argumento. Un argumento opcional sin valor por defecto simplemente
se lee como `none`.

`!entities @role #general` (sin tercera palabra) responde `role=... channel=... member=<none>`,
porque `{_who}` nunca se asignó.

## Comillas y texto voraz {#quoting-and-greedy-text}

Todo lo que sigue al nombre del comando se divide por espacios en tokens; un grupo entre comillas
dobles (`"two words"`) se convierte en un solo token, sin las comillas. Un argumento `<text>` único
al final es la excepción: al ser voraz, toma el resto de la línea sin tocar, incluidas las comillas
y los espacios extra.

```skript
discord command echo <text>:
    prefixes: "!"
    trigger:
        reply with "you said: %arg-1%"
```

`!echo a b  "c"` responde `you said: a b  "c"`: el doble espacio y las comillas se conservan.

## Cuando los argumentos no son válidos {#when-arguments-are-invalid}

El análisis se ejecuta al final, después de todas las comprobaciones de quién y dónde (consulta
[restringir un comando](doc:chat-commands/restricting-a-command) para el orden completo): un
argumento obligatorio que falta, o uno cuyos tokens no se resuelven, falla con `invalid
arguments`.
Define un [`usage message`](syntax:discordcommand#usage) para responder automáticamente; sin él,
DiSky no envía nada y solo lo ve `on discord command failed`.

```skript
discord command hello <user> [<n: number = 1>]:
    prefixes: "!"
    usage message: "Usage: %usage of event-discordcommand%"
    trigger:
        reply with "Hello %arg-1% x%{_n}%"
```

`!hello` solo responde `Usage: hello <user> [<n: number>]` (el valor por defecto se omite en la
forma generada) y dispara `on discord command failed` con `failure reason` igual a `invalid
arguments`.

syntax: discordcommand#usage compact

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *Unknown type 'x' for an argument of the discord command* | una palabra de tipo en `<...>` no es un tipo conocido de Skript ni de DiSky | revisa las palabras de [Tipos de argumentos](#argument-types) |
| *A required argument cannot follow an optional one in a discord command* | un `<...>` obligatorio aparece después de `[<...>]` o de `<... = default>` | pon primero los argumentos obligatorios, o hazlos opcionales también |
| *'x' is not a valid argument name (it becomes the local variable {_x})* | el `name:` antes del tipo está vacío, o contiene `{`, `}` o `::` | usa una palabra simple como nombre |
| *'x' is not a valid default value for a Y argument* | el texto tras `=` no se analiza como el tipo de ese argumento | indica un valor que acepte el tipo, o quita el valor por defecto |

!!! info "Los argumentos fuera de rango muestran el mensaje propio de Skript"
    Pedir un índice que el comando no tiene (`arg-3` en un comando de dos argumentos), o un tipo
    que no tiene (`text argument` sin ningún argumento de texto), falla al analizarse: el
    `arg-1` propio de Skript coincide antes con el mismo patrón y lo rechaza con *"only in the on
    command event"*, en lugar del error propio y más preciso de DiSky.
