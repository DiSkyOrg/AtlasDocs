---
title: Servidores
description: Funciones de todo el servidor que un bot puede leer y configurar, empezando por la pantalla de bienvenida.
source-hash: 9c4da41ddf57
---

Esta sección cubre los ajustes que pertenecen a un servidor en su conjunto y no a un canal, miembro o
mensaje concreto. Se asume que tienes un bot llamado `"my-bot"` conectado (consulta
[Iniciar un bot](doc:getting-started/starting-a-bot)) y que conoces
[caché (copia en memoria) y await](doc:concepts/cache-and-await).

## Orden de lectura {#reading-order}

1. [Pantalla de bienvenida](welcome-screen.md): la pantalla que un servidor comunitario muestra a los
   nuevos miembros, que se lee y se edita desde un script.

Las reglas que filtran lo que publican los miembros se explican en la sección de
[AutoMod](doc:automod).
