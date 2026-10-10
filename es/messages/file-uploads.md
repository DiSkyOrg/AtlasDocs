---
title: Subida de archivos
description: Crea un archivo desde una ruta local, una url o un adjunto recibido, adjúntalo a un mensaje y lee los adjuntos después.
source-hash: fde9e2c311e4
---

Esta página explica cómo enviar archivos: crear una subida de archivo desde una ruta local, una url o
un adjunto recibido, adjuntarla a un builder de mensajes (objeto de construcción) y leer los adjuntos de un mensaje enviado. Se asume que tienes un bot llamado
`"my-bot"` conectado y que sabes [enviar un mensaje](doc:messages/sending-messages).

## Cómo funcionan las subidas {#how-uploads-work}

[Una nueva subida de archivo](syntax:core/expressions#expression-new-file-upload) envuelve un origen
en un objeto local, que se añade a los `attachments` de un [builder de mensajes](doc:concepts/builders)
antes de enviarlo. Cuatro orígenes la construyen, según la palabra que sigue a `from`:

| Origen | Patrón | Notas |
| --- | --- | --- |
| Archivo local | `from [local] file %string%` | La ruta se resuelve desde el directorio de trabajo del servidor; DiSky comprueba de inmediato que el archivo existe. |
| URL | `from ur(l|i) %string%` | Se descarga solo al enviar el mensaje, nunca al crearla. |
| Adjunto | `from attachment %attachment%` | Vuelve a subir un adjunto recibido; también se descarga en el momento del envío. |
| Imagen | `from image %image%` | Solo se registra si el addon (extensión de Skript) SkImage2 está instalado; la imagen se codifica a PNG de inmediato, porque solo existe en memoria. |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!file-local":
        set {_f} to a new file upload from file "plugins/DiSky/logo.png"
        set {_m} to a new message with content "here's the logo" in event-channel
        add {_f} to attachments of {_m}
        await set {_sent} to the build result of {_m}
```

Nada se lee del disco ni se descarga hasta que el mensaje que contiene la subida se envía de verdad,
salvo la comprobación de existencia del archivo local y la codificación de la imagen indicadas arriba,
que deben hacerse ahora porque no hay nada que aplazar.

syntax: core/expressions#expression-new-file-upload compact

## Nombres y spoilers {#naming-and-spoilers}

Cada constructor acepta un `named` (o `with the name`) opcional y `with spoiler`. Si se omiten, el
nombre toma el del propio origen: el nombre del archivo local o del adjunto, el último segmento de la
ruta de la url (o `"file"` si no tiene ninguno), o `image-<hex>.png` para una imagen.

```skript
set {_f} to a new file upload from url "https://example.com/logo.png" named "banner.png" with spoiler true
```

Tanto `with spoiler true` como [`set spoiler of {_f}`](syntax:fileupload#spoiler) funcionan añadiendo
el prefijo `SPOILER_` al nombre; asignar `false` vuelve a quitarlo. Como la comprobación mira el nombre
actual, renombra el archivo antes de asignar `spoiler`, no después, o el renombrado sobrescribe el
prefijo. [`file description`](syntax:fileupload#file-description) define el texto alternativo que leen
los lectores de pantalla y que se muestra al pasar el cursor; no tiene lectura, solo escritura.

```skript
set {_f} to a new file upload from file "plugins/DiSky/logo.png"
set file name of {_f} to "company-logo.png"
set spoiler of {_f} to true
set file description of {_f} to "the company logo"
```

## Adjuntar a un mensaje {#attaching-to-a-message}

[`attachments`](syntax:messageaction#attachments) de un [builder de mensajes](doc:concepts/builders)
acepta `set`, `add` y `remove`; leerlo devuelve los nombres de los archivos añadidos hasta el momento,
y `remove` recibe un nombre en lugar de la propia subida.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!file-list":
        set {_a} to a new file upload from file "plugins/DiSky/logo.png" named "a.png"
        set {_b} to a new file upload from file "plugins/DiSky/logo.png" named "b.png"
        set {_m} to a new message with content "one file" in event-channel
        set attachments of {_m} to {_a} and {_b}
        remove "a.png" from attachments of {_m}
        await set {_sent} to the build result of {_m}
```

Una url o un adjunto solo se descarga cuando se ejecuta `the build result of`, así que una url caída
falla ahí, no en la línea del `add`. `reply with {_m} with reference event-message` envía los adjuntos
de un builder igual que lo hace `the build result of`. Las galerías de medios y las visualizaciones de
archivos (componentes v2) también aceptan subidas de archivo de la misma manera.

syntax: messageaction#attachments compact

## Leer adjuntos {#reading-attachments}

[`discord attachments of`](syntax:message#discord-attachments) de un mensaje enviado devuelve sus
archivos como `attachment`, un tipo de solo lectura con sus propias propiedades y condiciones.

| Propiedad | Devuelve |
| --- | --- |
| [attachment url](syntax:attachment#attachment-url) | la URL de CDN del archivo |
| [file name](syntax:attachment#file-name) | el nombre del archivo, incluido el prefijo de spoiler |
| [file extension](syntax:attachment#file-extension) | la extensión, o nada si no tiene |
| [attachment duration](syntax:attachment#attachment-duration) | la duración de un adjunto de audio (mensaje de voz), o nada en otro caso |

Cuatro condiciones describen qué tipo de archivo es:

| Condición | Verdadera cuando |
| --- | --- |
| [is an image attachment](syntax:attachment#an-image-attachment) | el archivo es una imagen |
| [is a video attachment](syntax:attachment#a-video-attachment) | el archivo es un vídeo |
| [is an audio attachment](syntax:attachment#an-audio-attachment) | el archivo es un mensaje de voz; `attachment duration` funciona sobre él |
| [is a spoiler attachment](syntax:attachment#a-spoiler-attachment) | el nombre del archivo lleva el prefijo `SPOILER_` |

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!file-echo":
        set {_att} to first element of discord attachments of event-message
        if {_att} is set:
            set {_f} to a new file upload from attachment {_att} named "echo-%file name of {_att}%"
            set {_m} to a new message with content "re-uploaded" in event-channel
            add {_f} to attachments of {_m}
            await set {_sent} to the build result of {_m}
```

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *IllegalArgumentException: the file '\<path>' does not exist* | `a new file upload from file` recibió una ruta sin nada en ella | Comprueba que la ruta sea relativa al directorio de trabajo del servidor y que el archivo esté presente |
| *UncheckedIOException: could not download '\<url>'* | La url dada a `from url` no se pudo descargar al enviar el mensaje | Comprueba que la url sea accesible, o envuelve el envío en un `try` y lee el [error](doc:concepts/errors) |
| Un bloque *Discord error* que indica que el archivo es demasiado grande | El archivo supera el límite de Discord por subida para el servidor (normalmente 10 MB, más con mejoras del servidor) | DiSky no comprueba el tamaño por sí mismo; reduce o comprime el archivo antes de subirlo |

entity: fileupload
