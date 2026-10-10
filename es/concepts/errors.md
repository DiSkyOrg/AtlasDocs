---
title: Errores
description: Qué ocurre cuando Discord rechaza una acción, y cómo try/catch y the last discord error permiten a un script reaccionar ante ella.
source-hash: 24cac615bff2
---

Esta página explica qué hace DiSky cuando una acción falla, ya sea en el lado de Discord o en tu script, y las dos herramientas para reaccionar ante ello: la sección (bloque sangrado) `try` / `catch` y `the last discord error`. Se asume que tienes un bot llamado `"my-bot"` conectado y un servidor donde pueda actuar.

## Qué ocurre sin try {#what-happens-without-a-try}

Todo efecto que se comunica con Discord puede ser rechazado: al bot le falta un permiso, el objetivo fue eliminado, el valor está fuera de rango. Un valor obligatorio que se resuelve en nada (una variable sin asignar pasada a `kick`) falla de la misma forma, antes de enviar nada. En ambos casos DiSky muestra en la consola un bloque *Discord error* legible y el trigger (bloque de código) sigue ejecutándose: la línea que falla no hace nada, las líneas siguientes se ejecutan con normalidad y nada se rompe.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-nobody":
        discord kick {_nobody}
        reply with "still running: %the last discord error%"
```

El bloque de la consola tiene la forma que se muestra a continuación. Su primera línea contiene el error en sí: `[code] meaning` para un error devuelto por Discord, `Exception: message` para uno lanzado antes de que la petición saliera; la línea `at` apunta a la línea del script que falló y después viene la traza de pila de la excepción subyacente.

```text
[DiSky] ---------------- Discord error ----------------
[DiSky] IllegalArgumentException: the member of 'kick' is not set
[DiSky] at discord kick {_nobody} (errors.sk, line 3)
[DiSky] -----------------------------------------------
```

El error también se guarda en [the last discord error](syntax:core/expressions#expression-last-discord-error), para que la línea siguiente al fallo pueda leerlo. Esa expresión es global: guarda el error más reciente de cualquier bot, capturado o no, y es `<none>` hasta que ocurre uno.

## Capturar errores con try {#catching-errors-with-try}

Envuelve las líneas que pueden fallar en [`try`](syntax:core/sections#section-try-catch) y sigue con un `catch` que nombre una variable de lista. Cuando termina el cuerpo del `try`, los errores que produjo se guardan en esa variable y se ejecuta el cuerpo del `catch`; si nada falló, el `catch` se omite. El prefijo `discord` de `kick` se explica [más abajo](#kick-and-skripts-own-kick).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick":
        try:
            discord kick event-member because of "try/catch demo"
        catch {_errors::*}:
            reply with "Could not kick: %{_errors::*}%"
```

Tres reglas hacen que la sección sea predecible:

- Una línea que falla no interrumpe el cuerpo del `try`. El error se guarda en el búfer y se ejecuta la línea siguiente, así que una variable asignada por un builder (objeto de construcción) o un getter que falló simplemente queda sin valor; compruébala antes de usarla.
- Varios fallos en un mismo cuerpo llegan juntos a un único `catch`, en orden, con un elemento por fallo: `%number of {_errors::*}%` indica cuántos son.
- El búfer pertenece al evento que se está manejando, no a un hilo. Los efectos se ejecutan en un hilo de trabajo y el trigger continúa en el hilo principal; el `catch` aun así ve todos los errores, y dos triggers que se ejecutan al mismo tiempo nunca ven los errores del otro.

`await` funciona como de costumbre dentro de un `try`: una lectura de solo recuperación o un resultado de builder que Discord rechaza llega al `catch`, igual que lo haría un efecto (consulta [caché (copia en memoria) y await](doc:concepts/cache-and-await)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-many":
        try:
            discord kick {_nobody}
            unmute {_nobody2}
        catch {_errors::*}:
            reply with "%number of {_errors::*}% error(s): %{_errors::*}%"
```

Anidar un `try` dentro de otro no está soportado: la sección interna reemplaza el búfer del evento, así que los errores que se producen en el cuerpo externo antes o después de la interna se imprimen en la consola en lugar de llegar al `catch` externo. Mantén un `try` por cada bloque de líneas relacionadas.

!!! warning "Un catch debe seguir directamente a su try"
    `catch` tiene que ser la sección inmediatamente posterior al `try` al que pertenece; cualquier línea intermedia es un error de análisis (*A 'catch' section must directly follow a 'try' section.*). Un `catch` escrito sin `try` se acepta y nunca se ejecuta.

### Detener el trigger {#stopping-the-trigger}

Añade `and stop` a la línea del `catch` para terminar el trigger una vez ejecutado su cuerpo. Sin ello, el trigger continúa después del `catch` como si el `try` hubiera tenido éxito.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-or-stop":
        try:
            discord kick event-member
        catch {_errors::*} and stop:
            reply with "Could not kick, giving up."
        reply with "Kicked %event-member%."
```

syntax: core/sections#section-try-catch compact

## Leer un error {#reading-an-error}

Ya sea que venga de una variable de `catch` o de `the last discord error`, un error es un `discorderror` con tres propiedades.

| Propiedad | Si Discord lo rechaza | Si falla el script |
| --- | --- | --- |
| [`error code`](syntax:discorderror#error-code) | El código numérico de Discord (`50013`) | `-1` |
| [`error meaning`](syntax:discorderror#error-meaning) | La etiqueta corta de Discord (`Missing Permissions`) | El nombre de la excepción (`IllegalArgumentException`) |
| [`error message`](syntax:discorderror#error-message) | La misma etiqueta que el significado; para un `50035`, los campos que Discord rechazó | El mensaje completo (`the member of 'kick' is not set`) |

Mostrado como texto (`%{_errors::*}%`, `%loop-value%`, `%the last discord error%`), un error se imprime como `[50013] Missing Permissions` cuando Discord lo rechazó, y como `IllegalArgumentException: the member of 'kick' is not set` cuando lo produjo el script. Usa el código para dar una respuesta precisa:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick":
        try:
            discord kick event-member
        catch {_errors::*}:
            if error code of {_errors::1} is 50013:
                reply with "I'm missing the Kick Members permission."
            else:
                reply with "Kick failed: %error meaning of {_errors::1}%"
```

Fuera de un `try`, [the last discord error](syntax:core/expressions#expression-last-discord-error) entrega el mismo objeto para el fallo más reciente. Como es global y nunca se limpia, compáralo con lo que esperas en lugar de comprobar si está definido.

```skript
on ready seen by "my-bot":
    discord kick {_nobody}
    send "code %error code of the last discord error%: %the last discord error%" to console
```

syntax: core/expressions#expression-last-discord-error compact

## Códigos de error comunes de Discord {#common-discord-error-codes}

Los códigos siguientes son los que más encuentra un script de moderación o de mensajería; la columna de significado es el texto exacto que devuelve `error meaning` para ellos.

| Código | Significado | Causa habitual |
| --- | --- | --- |
| `10003` | Unknown Channel | El canal fue eliminado, o el id es incorrecto |
| `10007` | Unknown Member | El usuario abandonó el servidor antes de que se ejecutara la acción |
| `10008` | Unknown Message | El mensaje fue eliminado, o el id es incorrecto |
| `10011` | Unknown Role | El rol fue eliminado, o el id es incorrecto |
| `10013` | Unknown User | Ninguna cuenta de Discord tiene este id |
| `10026` | Unknown Ban | `unban` sobre un usuario que no está baneado |
| `10062` | Unknown Interaction | La interacción expiró (3 segundos para confirmarla, 15 minutos para enviar un seguimiento) |
| `40060` | Interaction has already been acknowledged | Una segunda respuesta o un diferimiento sobre la misma interacción |
| `50001` | Missing Access | El bot no puede ver el canal o el servidor |
| `50006` | Cannot send an empty message | Un mensaje sin contenido, embed, componente ni archivo |
| `50007` | Cannot send messages to this user | El usuario tiene desactivados los mensajes directos de este servidor, o bloqueó al bot |
| `50013` | Missing Permissions | El rol del bot no tiene el permiso, o está por debajo del rol más alto del objetivo |
| `50034` | A Message provided to bulk_delete was older than 2 weeks | Borrado masivo de mensajes con más de 14 días |
| `50035` | Invalid Form Body | Un valor supera los límites de Discord (texto demasiado largo, formato de id incorrecto, una segunda regla de un tipo de AutoMod que solo admite una por servidor); el mensaje de error nombra cada campo rechazado como `field: reason` |

Discord documenta la lista completa en [Opcodes and Status Codes](https://discord.com/developers/docs/topics/opcodes-and-status-codes#json).

## `kick` y el `kick` propio de Skript {#kick-and-skripts-own-kick}

Skript incluye un efecto `kick %players%`, registrado antes que el `kick %member%` de DiSky. Cuando el operando es una variable sin tipo como `{_target}`, el efecto de Skript gana el análisis y no hace nada en tiempo de ejecución, en silencio: sin línea en la consola, sin error que capturar. Escribe [`discord kick`](syntax:member#kick) cuando el miembro viene de una variable; con un valor tipado como `event-member`, ambas formas llegan a DiSky.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!kick-var":
        set {_target} to event-member
        try:
            discord kick {_target} because of "spam"
        catch {_errors::*}:
            reply with "%{_errors::*}%"
```

!!! tip "Pon el prefijo a los efectos de moderación por costumbre"
    `discord kick` siempre se acepta, así que usar el prefijo en todas partes no cuesta nada y elimina el único caso en que un fallo no deja rastro. Otros efectos de moderación (`ban`, `unban`, `mute`, `time out`) no tienen equivalente en Skript y no necesitan prefijo.

entity: discorderror
