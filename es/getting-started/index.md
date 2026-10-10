---
title: Primeros pasos
description: Qué es DiSky v5, qué necesitas antes de escribir un bot y adónde ir después.
source-hash: 9ac23e9890d3
---

DiSky v5 es un addon (extensión de Skript) que te permite escribir bots de Discord directamente en
Skript. Se ejecuta en un servidor Paper y usa [JDA](https://jda.wiki) para la conexión con Discord,
así que cada bot que creas se comporta por debajo como un bot de JDA normal.

## Lo que necesitas {#what-you-need}

- Un **servidor Paper** con **1.21** o posterior.
- **Java 21** o posterior.
- **Skript 2.16.1** o posterior, con `use type properties: true` en el `config.sk` de Skript. Esta
  opción está activada por defecto en las versiones recientes de Skript; las sintaxis compartidas de
  DiSky (propiedades como `name of {_bot}`) dependen de ella y no se analizarán si está desactivada.
- Una **aplicación de Discord** con un token de bot, creada en el
  [Discord Developer Portal](https://discord.com/developers/applications).

## Orden de lectura {#reading-order}

1. [Instalación](installation.md): instalar el plugin y comprobar que se cargó.
2. [Iniciar un bot](starting-a-bot.md): crear un bot, conectarlo y apagarlo correctamente.
3. [Opciones del bot](bot-options.md): cada opción de conexión, desde los intents hasta el número de
   shards.
4. [Varios bots](multiple-bots.md): ejecutar varios bots y buscarlos por nombre.

!!! tip "Solo API imperativa"
    Todos los ejemplos de esta sección usan la API imperativa de bots: `a new discord bot`, después
    `set` sobre sus propiedades y después `login`. Es la única forma que se cubre aquí y en el resto
    del atlas.
