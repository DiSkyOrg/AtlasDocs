---
title: Comandos de barra
description: La estructura del comando de barra, su ruta, descripción y trigger, y cómo enviarlo a Discord.
source-hash: 83dbe60b030a
---

Esta página cubre la estructura `slash command`: su encabezado, sus entradas, el trigger y cómo un script la envía a Discord. Se asume que tienes un bot llamado `"my-bot"` conectado y que has leído la [visión general de los comandos](doc:interaction-commands).

## Cómo funciona un comando de barra {#how-a-slash-command-works}

Una estructura `slash command` es un **modelo**, que se declara junto al bloque `on ready` del bot y no dentro de él. Su encabezado nombra el comando y sus opciones; su `trigger` (bloque de código) se ejecuta cuando un usuario usa realmente `/name` en Discord. Nada llega a Discord al cargarse, recargarse o descargarse; un script lo envía de forma explícita, normalmente desde `on guild ready`.

```skript
slash command ping:
    description: Pong!
    trigger:
        reply with hidden "Pong! (%used slash command%)"
```

```skript
on guild ready:
    update the discord commands (all structured application commands) in event-guild
```

`/ping` ahora ejecuta el trigger anterior y responde con un `Pong! (ping)` efímero.

syntax: core/structures#structure-slash-command-structure compact

!!! warning "Viene de la v4"
    En la v4 la estructura se registraba sola en Discord, con las entradas `bot:` y `guilds:`; en la v5 la estructura no registra nada, y un script llama a `update the discord commands ...` desde `on guild ready` (o `on ready` para los comandos globales). Tampoco se elimina nada de Discord al descargar o apagar: volver a enviar los comandos es lo que elimina uno. Las opciones se declaran en el encabezado como `<name: type>` en lugar de una lista `arguments:`, y no pueden tener valor por defecto, ya que Discord no tiene ninguno. Cancelar `on cooldown` sigue permitiendo que el comando se ejecute.

## Entradas {#entries}

Cada entrada siguiente es opcional; `description` toma por defecto "No description provided".

| Entrada | Por defecto | Valores aceptados |
| --- | --- | --- |
| [description](syntax:slashcommand#description) | "No description provided" | texto, o un bloque sangrado de líneas `locale: text` con una línea `en-US` obligatoria |
| [name](syntax:applicationcommand#name-localizations) | el nombre del propio encabezado | un bloque sangrado de nombres traducidos `locale: text` |
| arguments | ninguno | un bloque sangrado: por cada opción, `name: description` o un subbloque (`description`, `choices`, `on completion request`) |
| `trigger` | ninguno para una raíz o un grupo | un bloque sangrado de código Skript |

`enabled for`, `disabled`, `nsfw`, `contexts`, `integration types`, `cooldown`, `cooldown scope` y `on cooldown` restringen y localizan el comando; consulta [Configuración de comandos](doc:interaction-commands/command-settings).

## Subcomandos y grupos {#subcommands-and-groups}

Una ruta tiene de una a tres palabras en minúscula: un comando, un grupo opcional y un subcomando opcional. Dos estructuras que comparten la primera palabra se fusionan en un único comando de Discord:

```skript
slash command mod ban <target: member> [<reason: string>]:
    description: Ban a member
    trigger:
        reply with hidden "Would ban %{_target}%"

slash command mod kick <target: member>:
    description: Kick a member
    trigger:
        reply with hidden "Would kick %{_target}%"
```

`mod ban` y `mod kick` se convierten en un único `/mod` con dos subcomandos. Una ruta sin `trigger` describe la raíz o un grupo en lugar de un comando final:

```skript
slash command mod:
    description: Moderation tools
    enabled for: manage server

slash command settings color:
    description: Colour settings

slash command settings color set <color: color>:
    description: Set the colour
    trigger:
        reply with hidden "Colour %{_color}%"
```

`settings color` agrupa `settings color set` bajo `/settings color`. Sin descriptor de raíz, la raíz hereda sus permisos de la intersección de sus subcomandos. Declarar la misma raíz en dos scripts distintos también las fusiona, pero registra una advertencia; mantén un script por raíz.

## Dentro del trigger {#inside-the-trigger}

| Valor | Contiene |
| --- | --- |
| `{_name}` | el valor de una opción con nombre, tal como se declara en el encabezado |
| `arg-1` | la misma opción, por posición |
| `member argument` | la primera opción cuyo tipo es `member` |
| `used slash command` | la ruta completa que se ejecutó, por ejemplo `mod ban` |
| `event-user`, `event-member`, `event-guild`, `event-channel`, `event-bot` | el contexto de la invocación |

[`reply with hidden`](doc:messages/sending-messages) responde solo al usuario que ejecutó el comando; `defer the interaction` difiere la respuesta antes de tiempo cuando el trigger es lento, antes del límite de 3 segundos de Discord. Consulta [Opciones de comandos de barra](doc:interaction-commands/slash-options) para los tipos de opciones, las opciones fijas y el autocompletado.

## Enviar a Discord {#pushing-to-discord}

`update the discord commands (all structured application commands) in event-guild` desde `on guild ready` envía todos los comandos declarados con estructura a ese servidor; la variante global lee `update the discord commands {_ping} globally in event-bot` desde `on ready`. Una recarga nunca toca Discord por sí sola. Consulta [Registro de comandos](doc:interaction-commands/registering-commands) para `register`, `unregister` y los tiempos de los comandos globales frente a los de servidor.

syntax: core/expressions#expression-structured-discord-commands compact

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *'x' is not a valid slash command name (lowercase, 1 to 32 letters, digits, - or _)* | una palabra de la ruta incumple las reglas de nombres de Discord | usa solo letras minúsculas, dígitos, `-` o `_` |
| *A slash command argument needs a name: \<user\> should be \<name: user\>* | una opción del encabezado no tiene `name:` | escribe `<name: type>`, no un `<type>` suelto |
| *A slash command argument cannot have a default value* | se usó `<name: type = default>` | haz la opción opcional (`[<name: type>]`) y comprueba `{_name}` en el trigger |
| *A required argument cannot follow an optional one in a slash command* | una `<...>` obligatoria aparece después de una `[<...>]` | mueve las opciones obligatorias al principio |
| *The slash command has arguments but no trigger* | hay opciones declaradas pero falta `trigger:` | añade una sección `trigger:`, o quita las opciones para describir una raíz o un grupo |

entity: slashcommand
