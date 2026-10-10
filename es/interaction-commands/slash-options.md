---
title: Opciones de comandos de barra
description: Tipos de argumento, descripciones y opciones fijas, autocompletado, opciones tipadas, límites y lectura del valor de una opción en cualquier lugar.
source-hash: 3fa7a293c0c6
---

Esta página cubre lo que va dentro de los huecos `<name: type>` del encabezado de un
[comando de barra](doc:interaction-commands/slash-commands): las palabras de tipo que entiende Discord,
cómo describir una opción y darle opciones fijas, el autocompletado, y los límites que solo puede definir
una opción de builder. Se asume que tienes un bot llamado `"my-bot"` conectado y un encabezado
`slash command` delante de ti.

## Cómo funcionan las opciones {#how-options-work}

Cada `<name: type>` en un encabezado `slash command <path> <arguments>:` es una opción. Discord la muestra
como un campo con tipo en el cliente y la valida antes de que la interacción llegue al bot, así que
`{_name}` ya contiene un valor real (un miembro, un rol, un número), nunca texto sin procesar que haya que
analizar.

```skript
slash command mod ban <target: member> [<reason: string>]:
    description: Ban a member
    trigger:
        reply with hidden "Would ban %{_target}% for %{_reason}%"
```

`<target: member>` es obligatorio; `[<reason: string>]` es opcional y `{_reason}` vale `none` cuando el
usuario lo omite. Una opción obligatoria nunca puede ir detrás de una opcional, la misma regla que impone
el propio encabezado (consulta [Comandos de barra](doc:interaction-commands/slash-commands)). Una opción
admite exactamente un valor: no existe forma plural, y Discord no tiene el concepto de valor por defecto,
así que `<name: type = x>` no es válido aquí como sí lo es para un
[`discord command`](doc:chat-commands/arguments).

## Tipos de opción {#option-types}

La palabra de tipo determina tanto la opción de Discord que envía Skript como lo que `{_name}` recibe de vuelta.

| Palabra(s) de tipo | Tipo de Discord | Qué contiene `{_name}` | Notas |
| --- | --- | --- | --- |
| `string`, `text` | STRING | el texto escrito | |
| `integer` | INTEGER | un número entero | |
| `number` | NUMBER | un número decimal | |
| `boolean` | BOOLEAN | `true` o `false` | |
| `user` | USER | el usuario de Discord | |
| `member` | USER | el miembro del servidor | la misma opción USER, resuelta como miembro; no disponible fuera de un servidor |
| `role` | ROLE | el rol | |
| `mentionable` | MENTIONABLE | un usuario, miembro o rol | lo que el usuario haya elegido |
| `attachment` | ATTACHMENT | el archivo subido | |
| `channel`, o un tipo concreto (`textchannel`, `voicechannel`, `stagechannel`, `newschannel`, `forumchannel`, `mediachannel`, `threadchannel`, `category`, `privatechannel`) | CHANNEL | el canal | un tipo concreto restringe qué canales puede elegir el usuario en Discord; consulta [Límites y tipos de canal](#bounds-and-channel-kinds) |
| `color` | STRING | un color de Skript | autocompletado integrado sobre los nombres de color |
| `player`, `offlineplayer` | STRING | un jugador en línea (o sin conexión) | autocompletado integrado sobre los nombres de los jugadores en línea |
| cualquier enum de Skript (`gamemode`, y los propios de DiSky) | STRING | la constante del enum | sus constantes se vuelven opciones fijas (25 o menos), o autocompletado si son más |

Las mismas palabras también crean una [opción de barra tipada](syntax:core/expressions#expression-new-typed-slash-option)
en un builder, fuera del encabezado de una estructura:

```skript
set {_target} to a new typed member option named "target" with description "Who"
```

syntax: core/expressions#expression-new-typed-slash-option compact

## Describir las opciones {#describing-options}

Una sección `arguments:` de la estructura describe cada opción por nombre: una línea simple para una
descripción de una línea, o una subsección cuando una opción también necesita opciones fijas.

```skript
slash command mod ban <target: member> [<reason: string>]:
    description: Ban a member
    arguments:
        target: Who to ban
        reason:
            description: Why
            choices:
                Spam: spam
                Rude: rude
    trigger:
        reply with hidden "Would ban %{_target}% for %{_reason}%"
```

Una opción que no aparece en `arguments:`, o que no tiene línea `description:`, conserva el texto de
marcador de Discord: *No description provided*. `choices:` es una sección de líneas `Name: value`, de hasta
25, y solo es válida en una opción `string`, `integer` o `number`; el valor de la derecha debe poder
analizarse como el tipo de esa opción (un número para `integer` o `number`, cualquier cosa para `string`).
Cuando una opción tiene opciones fijas, Discord solo deja al usuario elegir de esa lista.

## Autocompletado {#autocomplete}

Un argumento con una sección `on completion request:` en lugar de `choices:` se marca con autocompletado:
la sección se ejecuta en cada pulsación de tecla, y [`return choices`](syntax:core/effects#effect-return-slash-choices)
la responde y detiene el trigger ahí, con hasta 25 sugerencias.

```skript
slash command fruit <name: string>:
    description: Pick a fruit
    arguments:
        name:
            description: The fruit
            on completion request:
                send "[CMD] completion for %current argument%" to console
                return choices "apple", "banana" and "cherry"
    trigger:
        reply with hidden "You picked %{_name}%"
```

`current argument` indica la opción sobre la que pregunta Discord (útil cuando un comando tiene más de una
opción con autocompletado); `return choices` acepta textos o números simples, que se usan tanto como
etiqueta como valor, o `a new choice named "..." with value ...` cuando deben diferir.

Sin una sección `on completion request:`, una opción tipada (`color`, `player`, `offlineplayer`, o un enum
de más de 25 constantes) sigue autocompletándose por sí sola, desde su lista integrada. Una opción no puede
tener a la vez `choices:` y `on completion request:` (consulta [Errores más abajo](#errors-you-may-see)).

Una opción declarada en un builder con `auto complete` activado no tiene una sección de estructura donde
responderla: lo hace el evento genérico [`on slash completion`](event:events#slash-command-completion-event)
junto con `return choices`, igual que los [builders de comandos](doc:interaction-commands/command-builders)
responden a sus comandos de forma genérica.

syntax: core/effects#effect-return-slash-choices compact

## Leer opciones en cualquier lugar {#reading-options-anywhere}

[`slash option "name"`](syntax:core/expressions#expression-slash-option-value) lee cualquier opción por
nombre, de estructura o de builder, en cualquier lugar donde una interacción de barra esté en el alcance.

| Expresión | Devuelve |
| --- | --- |
| `{_name}` | el valor de una opción con nombre, solo para un comando declarado con un encabezado `slash command` |
| `arg-1` / `member argument` | lecturas posicionales o por tipo, con las mismas formas que en un [`discord command`](doc:chat-commands/arguments), solo para un comando declarado por estructura |
| `slash option "name"` | el valor, con el tipo que envió Discord |
| `slash option "name" as member` | el mismo valor de la opción, resuelto como miembro del servidor |
| `slash option "name" as <optiontype>` | el mismo valor, leído como un tipo concreto de Discord (`string`, `integer`, `number`, `boolean`, `user`, `channel`, `role`, `mentionable`, `attachment`) |

```skript
on slash command:
    set {_target} to slash option "target"
    send "%used slash command% option target=%{_target}%" to console
```

`slash option` solo se resuelve dentro de [`on slash command`](event:events#slash-command),
[`on slash completion`](event:events#slash-command-completion-event) o
[`on slash command cooldown`](event:events#application-command-cooldown); usado en otro lugar es un
error de carga. Funciona igual si el comando detrás viene de una estructura `slash command` o de un
builder, por eso los eventos genéricos ven ambos.

syntax: core/expressions#expression-slash-option-value compact

## Límites y tipos de canal {#bounds-and-channel-kinds}

El `<name: type>` del encabezado de un `slash command` no tiene entrada para los límites: un rango numérico,
una longitud de texto o un conjunto restringido de tipos de canal solo existen en una opción de builder,
`a new <type> slash option` o `a new typed ... slash option`.

```skript
set {_sides} to a new integer option named "sides" with description "How many sides"
set min value of {_sides} to 2
set max value of {_sides} to 100
```

| Propiedad | Por defecto | Valores aceptados |
| --- | --- | --- |
| [min value](syntax:slashoption#min-value) | ninguno | cualquier número, solo opciones `integer` y `number` |
| [max value](syntax:slashoption#max-value) | ninguno | cualquier número, solo opciones `integer` y `number` |
| [min length](syntax:slashoption#min-length) | ninguno | de `0` a `6000`, solo opciones `string` |
| [max length](syntax:slashoption#max-length) | ninguno | de `1` a `6000`, solo opciones `string` |
| [channel types](syntax:slashoption#channel-types) | vacía (cualquier tipo) | uno o más tipos de canal, solo opciones `channel` |

`set channel types of {_opt} to text and voice` restringe una opción `channel` del mismo modo que
declararla como `textchannel`, pero le permite aceptar más de un tipo. Consulta
[Builders de comandos](doc:interaction-commands/command-builders) para construir y enviar la propia opción.

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *Unknown type 'x' for an argument of the slash command* | una palabra de tipo en `<...>` no es un tipo conocido de Skript ni de DiSky | revisa las palabras de [Tipos de opción](#option-types) |
| *The argument 'x' has more than 25 choices; use 'on completion request' instead* | una subsección `choices:` lista más de 25 líneas | cambia a [autocompletado](#autocomplete) |
| *The argument 'x' cannot have both choices and an 'on completion request' section* | la subsección de un argumento tiene ambas cosas | deja solo una |
| *The argument 'x' is a \<type> option, which cannot have choices* | `choices:` está definido en un argumento `boolean`, `user`, `member`, `role`, `mentionable`, `attachment` o `channel` | solo las opciones `string`, `integer` y `number` aceptan opciones fijas |
| *'x' is not a valid \<type> for the choice 'y'* | el valor de una opción fija no se puede analizar como el tipo de su opción | da a una opción fija `integer`/`number` un número, y a una `string` cualquier texto |
| *a \<type> option cannot have choices* / *a \<type> option cannot have autocomplete* | `choices` o `auto complete` de una opción de builder está definido en un tipo que no lo admite | la misma restricción, desde el lado del builder |
| *only integer and number options have a minimum value* (el mismo texto para el máximo) | `min value` o `max value` está definido en una opción de builder no numérica | solo las opciones `integer` y `number` aceptan límites |
| *A slash option can only be read in a slash command, slash completion or slash command cooldown event* | `slash option "..."` se usa fuera de esos tres eventos | mueve la lectura a uno de ellos |

entity: slashoption
