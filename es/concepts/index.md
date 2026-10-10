---
title: Conceptos
description: La mecánica común a todas las funciones de DiSky, antes de tocar mensajes, interacciones o servidores.
source-hash: 9a7beeb6cfaa
---

Esta sección cubre la mecánica que se repite en todo el atlas: entidades y sus propiedades, esperar a
Discord, buscar entidades por ID, builders, errores y eventos. Ya tienes un bot conectado como
`"my-bot"` (consulta [Iniciar un bot](doc:getting-started/starting-a-bot)).

## Qué cubre una página de conceptos {#what-a-concept-page-covers}

Una guía de funcionalidad (trabajar con mensajes, interacciones, servidores...) te muestra *qué*
construir. Una página de conceptos muestra el patrón en el que se apoya esa guía sin volver a
explicarlo: cómo se diferencia una lectura de una escritura de propiedad, cuándo una línea necesita
`await`, cómo un builder se convierte en un objeto real de Discord, cómo se ve un error en la consola y
cómo se dispara un evento. Una vez que conoces un patrón de aquí, cada guía que lo usa se lee como una
aplicación directa de ese patrón, no como algo nuevo que aprender.

## Orden de lectura {#reading-order}

1. [Entidades y propiedades](entities-and-properties.md): cada objeto de Discord es una entidad;
   las propiedades se leen y escriben como `X of %entity%`.
2. [Caché y await](cache-and-await.md): las tres reglas de `await`, y por qué algunas lecturas lo
   necesitan.
3. [Obtener entidades por ID](getting-by-id.md): la familia `X with id "..."`, caché frente a REST.
4. [Builders](builders.md): el contrato del builder y `the build result of`.
5. [Errores](errors.md): `try`/`catch`, `the last discord error`, el formato de error en la consola.
6. [Eventos](events.md): anatomía de un evento, `event-bot`, `seen by`, valores del evento.
