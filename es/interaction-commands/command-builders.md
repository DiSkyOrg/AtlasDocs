---
title: Builders de comandos
description: Crear comandos de barra, de usuario y de mensaje como objetos simples en lugar de estructuras, y combinar ambos.
source-hash: 4b7a917b71c3
---

Esta página cubre la ruta de los builders hacia un comando de aplicación: objetos simples que armas en Skript, como alternativa a [`slash command`](doc:interaction-commands/slash-commands) y a [`user command` / `message command`](doc:interaction-commands/context-commands). Se asume que tienes un bot llamado `"my-bot"` conectado.

## Cómo funcionan los builders {#how-builders-work}

Un builder (objeto de construcción) es un objeto de comando con propiedades configurables: un nombre, una descripción, opciones, subcomandos. No tiene `trigger`, y nada llega a Discord hasta que un script lo envía con `update` o `register`, los mismos efectos que usa una estructura.

```skript
on guild ready:
    set {_roll} to a new slash command named "roll" with description "Roll a dice"
    set {_sides} to a new integer option named "sides" with description "How many sides"
    set min value of {_sides} to 2
    set max value of {_sides} to 100
    add {_sides} to options of {_roll}

    register the discord command {_roll} in event-guild
```

A diferencia de los builders de entidades de DiSky en otras partes, no existe un "resultado de la construcción" aparte: los efectos anteriores envían el propio objeto, y `command id of {_roll}` solo se establece después, cuando Discord responde.

syntax: slashcommand#new-slash-command compact

## Responder a un comando construido {#answering-a-built-command}

Un comando declarado con un builder no tiene trigger propio, así que se responde en el evento genérico [`on slash command`](event:events#slash-command), buscando por nombre. Lee una opción con [`slash option "name"`](doc:interaction-commands/slash-options); una opción opcional omitida `is not set`.

```skript
on slash command:
    if used slash command is "roll":
        set {_sides} to slash option "sides"
        if {_sides} is not set:
            set {_sides} to 6
        reply with hidden "You rolled %random integer between 1 and {_sides}%"
```

## Propiedades {#properties}

Todos los tipos de builder comparten las propiedades de `applicationcommand` siguientes; `slashcommand` y `slashoption` añaden las suyas.

| Propiedad | Por defecto | Valores aceptados |
| --- | --- | --- |
| [name](syntax:applicationcommand#name) | el nombre dado al crearlo | texto, con las mismas reglas de nombrado que la estructura que replica |
| [command id](syntax:applicationcommand#command-id) | sin establecer | solo lectura, se establece al registrar el comando |
| [command type](syntax:applicationcommand#command-type) | fijado por cómo se creó | `"slash"`, `"user"` o `"message"`, solo lectura |

`enabled for`, `disabled`, `nsfw`, `contexts` e `integration types` también se aplican a todos los builders; consulta [Configuración de comandos](doc:interaction-commands/command-settings).

| Propiedad (slashcommand) | Por defecto | Valores aceptados |
| --- | --- | --- |
| [description](syntax:slashcommand#description) | el texto dado al crearlo | cualquier texto |
| [options](syntax:slashcommand#options) | vacía | una lista de `slashoption` |
| [subcommands](syntax:slashcommand#subcommands) | vacía | una lista de `subcommand` |
| [subcommand groups](syntax:slashcommand#subcommand-groups) | vacía | una lista de `subcommandgroup` |

| Propiedad (slashoption) | Por defecto | Valores aceptados |
| --- | --- | --- |
| [description](syntax:slashoption#description) | el texto dado al crearlo | cualquier texto |
| [option type](syntax:slashoption#option-type) | fijado por cómo se creó | solo lectura |
| [required](syntax:slashoption#required) | `false` | `true` / `false` |
| [auto complete](syntax:slashoption#auto-complete) | `false` | `true` / `false`; solo opciones de texto, enteras y numéricas |
| [choices](syntax:slashoption#choices) | ninguna | hasta 25 `slashchoice`; solo opciones de texto, enteras y numéricas |
| [min value](syntax:slashoption#min-value) | ninguno | un número; solo opciones enteras y numéricas |
| [max value](syntax:slashoption#max-value) | ninguno | un número; solo opciones enteras y numéricas |
| [min length](syntax:slashoption#min-length) | ninguno | de `0` a `6000`; solo opciones de texto |
| [max length](syntax:slashoption#max-length) | ninguno | de `1` a `6000`; solo opciones de texto |
| [channel types](syntax:slashoption#channel-types) | vacía (cualquier canal) | una lista de tipos de canal; solo opciones de canal |

syntax: slashoption#new-slash-option compact

## Subcomandos y grupos {#subcommands-and-groups}

Un `subcommand` es una entrada `/root sub` con su propia descripción y opciones; un `subcommandgroup` agrupa varios subcomandos bajo `/root group sub`. Un comando de barra tiene opciones o subcomandos (con o sin grupos), nunca ambas cosas.

```skript
on guild ready:
    set {_mod} to a new slash command named "mod" with description "Moderation tools"

    set {_ban} to a new subcommand named "ban" with description "Ban a member"
    add a new user option named "target" with description "Who to ban" to options of {_ban}
    add {_ban} to subcommands of {_mod}

    set {_kick} to a new subcommand named "kick" with description "Kick a member"
    add a new user option named "target" with description "Who to kick" to options of {_kick}
    add {_kick} to subcommands of {_mod}

    register the discord command {_mod} in event-guild
```

`/mod ban` y `/mod kick` de arriba coinciden con la misma forma declarada por estructura de
[Comandos de barra](doc:interaction-commands/slash-commands). Un grupo de subcomandos añade un nivel
más: constrúyelo con `a new subcommand group named ... with description ...`, añádele subcomandos y
después agrega el grupo a `subcommand groups of` del comando.

syntax: subcommand#new-subcommand compact

## Mezclar estructuras y builders {#mixing-structures-and-builders}

`structured slash command "mod"` lee un comando declarado por estructura como el mismo tipo de objeto
que crea un builder: editable y separado del archivo `.sk` que lo declaró. Localízalo, añádele una
opción y después envíalo como cualquier otro objeto.

```skript
on guild ready:
    set {_mod} to structured slash command "mod"
    localize the description of {_mod} in "fr" to "Outils de modération"
    register the discord command {_mod} in event-guild
```

Una estructura y un builder también se pueden enviar uno al lado del otro, en una sola llamada:
`update the discord commands (all structured application commands) and {_roll} in event-guild`
reemplaza todos los comandos declarados por estructura y añade `{_roll}` en el mismo PUT. Un comando
declarado por estructura sigue ejecutando su propio `trigger`; uno declarado por builder solo responde
en el evento genérico. Ambos disparan primero el evento genérico, sin importar cómo se declararon.

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *'sub_command' is not an option type; use a subcommand or a subcommand group instead* (el mismo texto para `'sub_command_group'`) | se creó una opción nueva con un tipo estructural en lugar de un `subcommand` / `subcommand group` real | crea un objeto `subcommand` o `subcommand group`, no una opción |
| *a \<type\> option cannot have autocomplete* | se estableció `auto complete` en `true` en una opción booleana, de usuario, de canal, de rol, mencionable o de adjunto | solo las opciones de texto, enteras y numéricas admiten autocompletado |
| *only integer and number options have a minimum value* (el mismo texto para el máximo) | se estableció `min value` / `max value` en una opción no numérica | solo las opciones enteras y numéricas aceptan límites |
| *the choice 'x' has a text value but its option is an integer option* (o *a number option*) | el valor de una `slashchoice` no coincide con el tipo de su opción | dale a la opción fija un valor numérico, o cambia la opción a `string` |
| *a \<type\> option cannot have choices* | se estableció `choices` en una opción booleana, de usuario, de canal, de rol, mencionable o de adjunto | solo las opciones de texto, enteras y numéricas aceptan opciones fijas |

entity: applicationcommand
