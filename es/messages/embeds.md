---
title: Embeds
description: Construye un embed de Discord en local, define todas sus propiedades y sus campos, y envíalo con post, reply with o un builder de mensajes.
source-hash: ccb478d348a6
---

Esta página cubre cómo construir un embed de Discord: todas las propiedades que puedes definir en él, sus
campos y lo que obtienes al leer los embeds que ya tiene un mensaje. Se asume que tienes un bot llamado
`"my-bot"` conectado y que sabes [enviar un mensaje](doc:messages/sending-messages).

## Cómo funcionan los embeds {#how-embeds-work}

[A new discord embed](syntax:core/expressions#expression-new-embed) crea un embed vacío, por completo en
memoria; cada línea `set <property> of {_e}` solo lo completa un poco más, sin llamar a Discord. No se envía
nada hasta que entregas el embed a algo que habla con un canal: `post` o `reply with`, o asignarlo como
`embed` de un [builder de mensajes](doc:concepts/builders) y leer `the build result of` ese builder. Un
embed es más simple que el contrato completo de los builders de esa página: no tiene `await` ni
`build result` propio, porque por sí solo nunca habla con Discord.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!embed":
        set {_e} to a new discord embed
        set title of {_e} to "DiSky V5"
        set description of {_e} to "An embed built entirely in Skript."
        set color of {_e} to orange
        post {_e} to event-channel
```

syntax: core/expressions#expression-new-embed compact

## Opciones {#options}

Cada propiedad se define con `set <property> of {_e} to <value>`. DiSky aplica de inmediato, en la propia
línea `set`, los límites de longitud y de url de `EmbedBuilder` de JDA; el límite de campos y el de
longitud total solo se aplican cuando el embed se adjunta a algún sitio (ver
[Errores que puedes ver](#errors-you-may-see)).

| Propiedad | Valor por defecto | Valores aceptados |
| --- | --- | --- |
| [title](syntax:embedbuilder#title) | ninguno | texto, hasta 256 caracteres |
| [title url](syntax:embedbuilder#title-url) | ninguno | una url `http(s)://` o `attachment://` |
| [description](syntax:embedbuilder#description) | ninguno | texto, hasta 4096 caracteres |
| [color](syntax:embedbuilder#color) | ninguno | un color |
| [discord author](syntax:embedbuilder#discord-author) | ninguno | texto, hasta 256 caracteres |
| [author icon](syntax:embedbuilder#author-icon) | ninguno | una url `http(s)://` o `attachment://` |
| [author url](syntax:embedbuilder#author-url) | ninguno | una url `http(s)://` o `attachment://` |
| [footer](syntax:embedbuilder#footer) | ninguno | texto, hasta 2048 caracteres |
| [footer icon](syntax:embedbuilder#footer-icon) | ninguno | una url `http(s)://` o `attachment://` |
| [image](syntax:embedbuilder#image) | ninguno | una url `http(s)://` o `attachment://` |
| [thumbnail](syntax:embedbuilder#thumbnail) | ninguno | una url `http(s)://` o `attachment://` |
| [timestamp](syntax:embedbuilder#timestamp) | ninguno | una fecha |
| [fields](syntax:embedbuilder#fields) | ninguno | solo añadir, ver [Campos](#fields) más abajo; 25 como máximo |

Solo se puede leer de vuelta una propiedad de dos: `description of {_e}` devuelve lo que definiste, y
`fields of {_e}` devuelve la lista a la que añadiste. Todas las demás propiedades, incluidas `title` y
`color`, no devuelven nada al leerlas, ni siquiera justo después de definirlas: `EmbedBuilder` de JDA no
tiene getter para ellas, así que DiSky no tiene qué devolver.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!embed-full":
        set {_e} to a new discord embed
        set title of {_e} to "DiSky V5"
        set title url of {_e} to "https://disky.me"
        set description of {_e} to "An embed built entirely in Skript."
        set color of {_e} to orange
        set discord author of {_e} to "DiSky"
        set author icon of {_e} to "https://disky.me/icon.png"
        set footer of {_e} to "Powered by DiSky"
        set image of {_e} to "https://disky.me/banner.png"
        set thumbnail of {_e} to "https://disky.me/thumb.png"
        set timestamp of {_e} to now
        post {_e} to event-channel
```

## Campos {#fields}

Un campo es un objeto propio, que se construye por separado y se añade a `fields` del embed. Tres formas de
escribirlo crean uno: la básica (`inline` vale `false` por defecto), con un valor explícito de `inline`, o
con `inline` forzado mediante la forma `new inline field`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!embed-fields":
        set {_e} to a new discord embed
        set title of {_e} to "Ping results"
        add (a new embed field named "Region" with value "eu-west") to fields of {_e}
        add (a new embed field named "Status" with value "OK" inline true) to fields of {_e}
        loop fields of {_e}:
            send "%name of loop-value% = %value of loop-value% (inline: %inline of loop-value%)" to console
        post {_e} to event-channel
```

Las tres formas verificadas:

```skript
set {_f1} to a new embed field named "Region" with value "eu-west"
set {_f2} to a new embed field named "Status" with value "OK" inline true
set {_f3} to a new inline embed field named "Latency" with value "42ms"
```

`add {_f1} to fields of {_e}` adjunta uno a un embed; un campo solo se puede leer mediante `name of`,
`value of` e `inline of` (como se usa en `loop-value` arriba). Un nombre de campo de más de 256 caracteres,
o un valor de más de 1024, falla de inmediato, al crear el campo y no al añadirlo.

syntax: core/expressions#expression-new-embed-field compact

## Leer embeds {#reading-embeds}

[`embeds of`](syntax:message#embeds) de un mensaje enviado devuelve sus embeds; un mensaje construido con
DiSky lleva un único embed, así que la lista suele tener un elemento. Cada uno se devuelve como el
`MessageEmbed` propio de JDA, un tipo de solo lectura sin tipo propio en Skript, pero DiSky lo convierte en
un `embedbuilder` allí donde se espere uno: guárdalo en una variable, define más propiedades y vuelve a
publicarlo como un embed nuevo.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!requote":
        set {_e} to first element of embeds of event-message
        set footer of {_e} to "requoted by DiSky"
        post {_e} to event-channel
```

Esto nunca edita el mensaje original: el conversor copia el contenido del embed enviado en un
`EmbedBuilder` nuevo, así que `post`, `reply with` o un builder de mensajes siguen siendo lo que pone el
resultado en Discord. Para cambiar directamente el embed que muestra un mensaje existente, usa `edit` sobre
ese mensaje con el nuevo embed (ver [gestionar mensajes](doc:messages/managing-messages)).

## Errores que puedes ver {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *IllegalArgumentException: Title cannot be longer than 256 characters.* | A `title` se le asignaron más de 256 caracteres | Acorta el título, o pasa el resto a `description` |
| *IllegalArgumentException: URL must be a valid http(s) or attachment url.* | A `title url`, `author icon`, `author url`, `footer icon`, `image` o `thumbnail` se le asignó algo que no es un enlace `http://`, `https://` o `attachment://` válido | Corrige la url, o deja la propiedad sin definir |
| *IllegalArgumentException: Name cannot be longer than 256 characters* (o *Value cannot be longer than 1024 characters*) | El nombre o el valor de un campo es demasiado largo | Acórtalo antes de crear el campo |
| *IllegalStateException: Cannot build an empty embed!* | El embed no tenía nada definido (ni título, descripción, campos, autor, pie, imagen o miniatura) al adjuntarlo a un mensaje | Define al menos una propiedad antes de `set embed of` o `a new message with embed` |
| *IllegalStateException: Cannot build an embed with more than 25 embed fields set!* | Se añadieron más de 25 campos | Mantén el número de campos en 25 o menos, o reparte el contenido en varios embeds |

entity: embedbuilder
