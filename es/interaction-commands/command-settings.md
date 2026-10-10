---
title: Configuración de comandos
description: Permisos, contextos, nombres y descripciones localizados, y tiempos de espera, compartidos por todos los comandos de barra, de usuario y de mensaje.
source-hash: 4cae79bb39b7
---

Esta página cubre la configuración que comparten los comandos [de barra](doc:interaction-commands/slash-commands), [contextuales](doc:interaction-commands/context-commands) y [builder (objeto de construcción)](doc:interaction-commands/command-builders): quién los ve, dónde funcionan, sus nombres y descripciones traducidos, y su tiempo de espera. Se asume que tienes un bot llamado `"my-bot"` conectado y un comando, estructura o builder al que asignarle la configuración.

## Cómo funciona la configuración {#how-settings-work}

Cada uno de estos ajustes existe por duplicado: como entrada de estructura, junto a `description` y `trigger`, y como propiedad del objeto builder. Ambos terminan en el mismo comando; usa la forma que corresponda a cómo se declaró el comando.

| Ajuste | Entrada de estructura | Propiedad de builder | Por defecto | Valores aceptados |
| --- | --- | --- | --- | --- |
| Permisos necesarios | `enabled for` | [enabled for](syntax:applicationcommand#enabled-for) | ninguno: todos | nombres de permiso separados por comas |
| Oculto por defecto | `disabled` | `disabled` | `false` | `true`, `false` |
| Restringido por edad | `nsfw` | `nsfw` | `false` | `true`, `false` |
| Dónde funciona | `contexts` | [contexts](syntax:applicationcommand#contexts) | solo servidor | `guild`/`server`, `bot dm`/`dm`/`private message`, `group dm` |
| Cómo se instala | `integration types` | `integration types` | `guild install` | `guild install`/`server install`, `user install` |
| Espera antes de reutilizarlo | `cooldown` | no disponible en un builder | ninguno | una duración, p. ej. `10 seconds` |
| Quién comparte el tiempo de espera | `cooldown scope` | no disponible en un builder | `user` | `user`, `guild`, `channel` |
| Nombre traducido | sección `name:` | `localize the name of ...` | nombre del encabezado o del builder | líneas `locale: text` |
| Descripción traducida | sección `description:` | `localize the description of ...` | ninguna | líneas `locale: text` |

```skript
slash command roll <sides: integer>:
    description: Roll a dice
    enabled for: manage server
    contexts: guild, bot dm
    cooldown: 5 seconds
    trigger:
        reply with hidden "You rolled between 1 and %{_sides}%"
```

## Quién ve un comando {#who-sees-a-command}

`enabled for` indica los permisos que necesita un miembro para ver y usar el comando por defecto; los
administradores siempre pueden usarlo, y una lista vacía significa que todos pueden. `disabled` oculta
el comando a todos menos a los administradores, sin importar `enabled for`. Ambos son solo valores por
defecto: la configuración de integración propia de cada servidor, que un miembro con **Manage Server**
puede cambiar, todavía puede sobrescribirlos del lado de Discord.

```skript
set {_ban} to a new slash command named "ban" with description "Ban a member"
set enabled for of {_ban} to ban members
```

Una raíz `slash command mod` formada a partir de subcomandos (consulta
[Comandos de barra](doc:interaction-commands/slash-commands)) sin su propio descriptor hereda
`enabled for` como la intersección de lo que permiten sus subcomandos: un permiso tiene que estar en
todos los subcomandos para acabar en la raíz.

## Dónde está disponible un comando {#where-a-command-is-available}

`contexts` restringe las superficies desde las que se puede usar el comando: `guild` (el valor por
defecto de Discord, y el único definido si omites esta entrada), `bot dm` y `group dm`.
`integration types` restringe cómo se instaló: `guild install`, el valor por defecto, o `user install`,
que coloca el comando en la lista de comandos del propio usuario, utilizable en servidores donde nunca
se instaló el bot.

```skript
set {_roll} to a new slash command named "roll" with description "Roll a dice"
set contexts of {_roll} to guild and bot dm
```

## Traducciones {#translations}

Las secciones `name:` y `description:` de una estructura contienen una línea `locale: text` por idioma;
una sección `description:` necesita una línea `en-US` (o `en`) como valor por defecto que se muestra en
todos los demás idiomas. `name:` nunca la necesita, ya que el encabezado ya define el nombre por defecto.

```skript
slash command greet <who: user>:
    description:
        en-US: Greet someone
        fr: Saluer quelqu'un
    name:
        fr: saluer
    arguments:
        who: Who to greet
    trigger:
        reply with hidden "Hello %{_who}%!"
```

Un builder, sus opciones, subcomandos, grupos y opciones fijas (solo el nombre) usan en su lugar
[`localize the name/description of`](syntax:core/effects#effect-localize-command), una llamada por idioma:

```skript
set {_cmd} to a new slash command named "ban" with description "Ban a member"
localize the name of {_cmd} in "fr" to "bannir"
localize the description of {_cmd} in "fr" to "Bannir un membre"
```

Lee las traducciones con `name localizations of {_cmd}` y `description localizations of {_cmd}`, ambas
una lista de líneas `"locale: text"`. Los idiomas son los códigos propios de Discord (`fr`, `en-GB`,
`pt-BR`...); también funciona un nombre de idioma simple, como `"french"`.

syntax: core/effects#effect-localize-command compact

## Tiempos de espera {#cooldowns}

`cooldown` bloquea la reutilización durante una duración; `cooldown scope` decide quién comparte ese temporizador.

| Ámbito | Compartido entre |
| --- | --- |
| `user` (por defecto) | el mismo usuario, en todos los servidores y canales |
| `guild` | todos los miembros de ese servidor |
| `channel` | todos los presentes en ese canal |

Una sección `on cooldown:` reacciona a una llamada bloqueada, con `remaining cooldown` establecido:

```skript
slash command slow:
    description: 10 seconds cooldown
    cooldown: 10 seconds
    cooldown scope: user
    on cooldown:
        reply with hidden "Wait %remaining cooldown%"
    trigger:
        reply with hidden "Not on cooldown!"
```

Sin una sección `on cooldown:`, DiSky responde por sí mismo: un mensaje efímero *"You can use this
command again in \<time\>."*, de modo que la interacción nunca queda sin confirmar. El evento genérico
[`on slash command cooldown`](event:events#application-command-cooldown) (también `on user command cooldown`,
`on message command cooldown`, `on application command cooldown`) se dispara igualmente, y se puede
cancelar: [cancelarlo](doc:concepts/events) hace que el comando se ejecute de todas formas y deja que el
trigger responda a la interacción. Una recarga restablece todos los tiempos de espera, ya que parte de
un modelo nuevo; consulta [Registrar comandos](doc:interaction-commands/registering-commands).

event: events#application-command-cooldown compact

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *Unknown permission 'x' in the slash command 'name'* | una palabra de `enabled for` no es un permiso que Discord reconozca | usa un nombre de permiso que Discord reconozca, canónico o con alias |
| *'x' is not an interaction context (expected guild, bot dm or group dm)* | una palabra de `contexts` está mal escrita | usa una de las palabras de [Dónde está disponible un comando](#where-a-command-is-available) |
| *'x' is not an integration type (expected guild install or user install)* | una palabra de `integration types` está mal escrita | usa `guild install` (o `server install`) / `user install` |
| *'x' is not a Discord locale (available: ...)* | un código de idioma antes de `localize` o en una sección `name:`/`description:` no se reconoce | usa un código de idioma de Discord o un nombre de idioma |
| *A localized description needs a default 'en-US' (or 'en') line* | una sección `description:` no tiene línea `en-US`/`en` | añade una; se convierte en el valor de respaldo para todos los demás idiomas |
| *The slash command 'name' has an 'on cooldown' section but no 'cooldown' entry* | se definió `on cooldown:` sin `cooldown` | añade una entrada `cooldown`, o elimina la sección |
| *'x' is not a valid cooldown scope (expected user, guild or channel)* | `cooldown scope` no es una de las tres palabras | usa `user`, `guild` o `channel` |
