---
title: AutoMod
description: Crea, edita y observa las reglas de AutoMod de Discord desde un script.
source-hash: c6d3e1a63126
---

AutoMod es el filtro integrado de Discord: una regla busca algo en los mensajes o en los perfiles
de los miembros y responde por sí sola, incluso cuando el bot está desconectado. Esta sección cubre
la creación de reglas, la edición de las que ya tiene un servidor y la reacción cuando una se
activa. Se asume que tienes un bot llamado `"my-bot"` conectado (consulta
[Iniciar un bot](doc:getting-started/starting-a-bot)) con **Manage Server** en el servidor, y que
conoces el [contrato del builder](doc:concepts/builders) (objeto de construcción).

## De qué se compone una regla {#what-a-rule-is-made-of}

Una regla tiene tres partes, cada una es una entidad independiente:

| Parte | Entidad | Responde a |
| --- | --- | --- |
| Activador | [triggerconfig](entity:triggerconfig) | qué busca la regla: palabras clave, patrones, una lista predefinida, spam de menciones, spam |
| Acciones | [automodresponse](entity:automodresponse) | qué hace: bloquear el mensaje, enviar una alerta, aislar temporalmente al miembro, bloquear interacciones |
| Regla | [automodrule](entity:automodrule) | su nombre, cuándo se comprueba, y a quién y dónde ignora |

Primero construyes el activador y las acciones, se los pasas a un
[builder de reglas de AutoMod](entity:automodrulebuilder), y lees `the build result of` del builder para
crear la regla.

## Orden de lectura {#reading-order}

1. [Crear una regla](creating-rules.md): el builder de reglas, desde la regla mínima hasta una
   completamente configurada.
2. [Activadores y acciones](triggers-and-responses.md): cada tipo de activador y sus opciones, y
   cada acción.
3. [Gestionar reglas](managing-rules.md): listar las reglas de un servidor, editarlas en vivo,
   eliminarlas y el evento de ejecución.
