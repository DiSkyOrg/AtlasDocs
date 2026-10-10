---
title: Instalación
description: Instalar el plugin de DiSky, su dependencia de Skript y comprobar que se cargó.
source-hash: 31045b05db37
---

Esta página explica cómo poner DiSky en marcha en un servidor Paper. Se asume que ya tienes Skript
instalado; consulta [lo que necesitas](index.md#what-you-need) para ver los requisitos de versión.

## Cómo funciona la instalación {#how-installation-works}

::: steps
1. Copia el jar de DiSky en la carpeta `plugins/` de tu servidor. Skript debe estar instalado y
   activado antes: DiSky es un addon de Skript, no un plugin independiente.

2. Asegúrate de que `use type properties: true` esté establecido (o simplemente no esté sobrescrito)
   en el `config.sk` de Skript. Las sintaxis compartidas de DiSky, como `name of {_bot}`, se registran
   como propiedades de tipo y dependen de ello.

3. Inicia (o reinicia) el servidor.
:::

Si Skript no está instalado o no logra activarse, DiSky registra *"Skript is not installed or failed
to enable; cannot start DiSky."* y se desactiva. En la v5 no hay ningún archivo de configuración que
editar: DiSky no tiene `config.yml`, solo el manifiesto descrito más abajo.

## Una carga correcta {#a-successful-load}

En una carga correcta, la consola muestra cómo DiSky registra su sintaxis y termina con:

```text
[DiSky] DiSky5 enabled: types, properties, bot lifecycle and error layer registered.
```

Si `use type properties` está desactivado, DiSky sigue cargándose pero muestra una advertencia:

*"Skript's 'use type properties' option is DISABLED in your config.sk. DiSky's shared
syntaxes (e.g. "name of %member%") rely on it and will NOT parse. It is ON by default in
Skript 2.15+, remove the override or set 'use type properties: true'."*

## El manifiesto de sintaxis {#the-syntax-manifest}

En cada arranque, DiSky escribe `plugins/DiSky/disky-syntax.json`: un manifiesto legible por máquina
de cada entidad, sintaxis y elemento del núcleo que registró, junto con la versión del plugin y una
marca de tiempo. Es a partir de él como se genera el propio atlas; no necesitas editarlo ni leerlo
para usar DiSky, pero es útil si construyes herramientas para una instalación concreta.

Cuando el plugin esté cargado, ve a [iniciar un bot](starting-a-bot.md) para crear tu primer bot.
Necesitarás un token de bot del
[Discord Developer Portal](https://discord.com/developers/applications).

## Errores que puedes encontrar {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *Skript is not installed or failed to enable; cannot start DiSky.* | Skript no está instalado, está desactivado o no se activó antes que DiSky. | Instala o repara Skript y después reinicia el servidor. |
| *Skript's 'use type properties' option is DISABLED in your config.sk...* | `use type properties: false` está establecido en el `config.sk` de Skript. | Quita la sobrescritura o establece `use type properties: true`, y después reinicia. |
