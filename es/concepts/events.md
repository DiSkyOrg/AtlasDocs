---
title: Eventos
description: Qué compone un manejador de eventos de DiSky, qué valores expone y qué no puede hacer.
source-hash: b72eacb81599
---

Esta página cubre la forma de un manejador de eventos de DiSky: la línea `on ...:` y su filtro
`seen by`, los valores `event-` y las expresiones con nombre que cualquier manejador puede leer, cómo
llegan a tu código los valores obtenidos de Discord, y por qué los eventos de Discord no se pueden
cancelar. Se asume que tienes un bot conectado como `"my-bot"` (consulta
[Iniciar un bot](doc:getting-started/starting-a-bot)).

## Cómo funciona un manejador de eventos {#how-an-event-handler-works}

Un evento de DiSky es un evento normal de Skript: `on <event>:` seguido de un trigger. Cada patrón de
evento acepta un sufijo opcional `seen by "<bot name>"`, así que `on message received seen by "my-bot":`
solo se dispara para el bot conectado con ese nombre (consulta [múltiples bots](doc:getting-started/multiple-bots));
sin él, el manejador se dispara para cada bot. Sea cual sea el evento, el bot que lo vio es `event-bot`.

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!ping":
        reply with "Pong from %event-bot% in %event-channel%!"
```

DiSky recibe el evento en el hilo propio de Discord, lo filtra por bot, construye los valores del evento
y luego entrega el trigger al hilo principal del servidor: tu manejador se ejecuta en el hilo principal,
como cualquier evento de Bukkit, así que puede tocar jugadores, bloques y variables sin problemas. Los
efectos como [reply with](syntax:core/effects#effect-reply-with) bloquean el trigger hasta que Discord
confirma, lo que se explica en [caché y await](doc:concepts/cache-and-await).

syntax: core/effects#effect-reply-with compact
event: events#message-receive compact

## Valores del evento {#event-values}

Las entidades que participan en un evento se exponen al estilo de Skript, como `event-<type>`. Cuáles
existen depende del evento; la [referencia de eventos](/events) generada los enumera por evento. Un valor
que no aplica es none, no un error: `event-guild` y `event-member` son none cuando un mensaje o una
reacción viene de un canal privado.

| Valor | Tipo | Eventos habituales |
| --- | --- | --- |
| `event-bot` | bot | todos los eventos |
| `event-guild` | guild | cualquier cosa que ocurra en un servidor |
| `event-channel` | channel | mensajes, reacciones, cambios de canal, voz |
| `event-user` | user | mensajes, reacciones, baneos, actualizaciones de usuario |
| `event-member` | member | uniones, salidas, roles, apodos, voz |
| `event-message` | message | mensaje recibido o editado, componentes, encuestas |
| `event-role` | role | rol creado, eliminado o actualizado |
| `event-button` | button | botón pulsado |
| `event-dropdown` | dropdown | menú desplegable pulsado |

Un canal se registra una vez por tipo de canal, así que el mismo evento también responde a
`event-textchannel`, `event-voicechannel`, `event-threadchannel`, `event-forumchannel`, `event-category` y
los demás tipos de canal: la forma tipada se establece cuando el canal es realmente de ese tipo y es none
en caso contrario. Usa `event-channel` cuando el tipo no importa.

```skript
on message received seen by "my-bot":
    if event-threadchannel is set:
        reply with "This message was sent in a thread"
```

## Expresiones de evento con nombre {#named-event-expressions}

Algunos datos del evento no tienen forma `event-<type>`, porque son texto plano, una lista, o chocarían
con otro valor del mismo tipo. Se exponen como expresiones con su propio nombre, válidas solo dentro de su
evento: usarlas en cualquier otro lugar es un error de análisis que indica que la expresión solo puede
usarse en ese evento.

```skript
on button clicked seen by "my-bot":
    if click id is "confirm":
        reply with "Confirmed by %event-user%"
```

| Expresión | Evento | Devuelve |
| --- | --- | --- |
| `click id` | `on button clicked` | el ID personalizado del botón pulsado |
| `selected values` | `on dropdown clicked` | las opciones elegidas, como lista de textos |
| `execute command` | `on slash command received` | el nombre completo del comando |
| `added roles` | `on role added` | los roles concedidos a `event-member`, como lista |
| `reaction message` | `on reaction add` | el mensaje que recibió la reacción |

event: events#button-click compact

## Valores anteriores y nuevos {#old-and-new-values}

Los eventos de actualización se disparan después del cambio y exponen ambos lados: el valor actual con un
nombre simple, y el anterior con el mismo nombre precedido de `old` (también se aceptan `past` y
`previous`). La entidad ya está actualizada, así que `nickname of event-member` lee el valor nuevo; solo la
expresión `old` conoce el anterior.

```skript
on guild member nickname change seen by "my-bot":
    send "%event-member%: '%old member nickname%' -> '%member nickname%'" to console
```

| Evento | Valor nuevo | Valor anterior |
| --- | --- | --- |
| `on guild member nickname change` | `member nickname` | `old member nickname` |
| `on discord user name change` | `name` | `old name` |
| `on discord user online status change` | `online status` | `old online status` |
| `on discord scheduled event name change` | `scheduled event name` | `old scheduled event name` |

event: events#member-nickname-event compact

## Valores obtenidos de Discord {#values-fetched-from-discord}

Algunos valores no forman parte de lo que Discord envía con el evento: el mensaje detrás de una reacción,
o el usuario y el miembro detrás de un voto de encuesta. DiSky los obtiene de Discord en un hilo de
segundo plano antes de que empiece el trigger y los guarda en el evento, así que dentro del manejador son
valores normales.

```skript
on reaction add seen by "my-bot":
    send "%event-user% reacted to '%discord content of reaction message%'" to console
```

Las [reglas de await](doc:concepts/cache-and-await) se aplican a lo que haces dentro del manejador, nunca a
los valores propios del evento: un valor de evento nunca necesita `await`.

## Los eventos no son cancelables {#events-are-not-cancellable}

Un evento que llega desde Discord no se puede cancelar: Discord ya aplicó el cambio cuando se ejecuta tu
manejador. Escribir `cancel event` en ese manejador no se carga; Skript lo indica al analizar que el evento
no se puede cancelar. Reacciona en lugar de cancelar: borra el mensaje, quita el rol, expulsa al miembro.

```skript
on message received seen by "my-bot":
    if discord content of event-message contains "spam":
        destroy event-message
```

Las excepciones son los eventos que DiSky dispara por sí mismo, antes de ejecutar un comando que declaró:
[`on discord command used`](event:events#discord-command-used), donde cancelar detiene el comando (consulta
[listado y eventos](doc:chat-commands/listing-and-events)), y
[`on slash command cooldown`](event:events#application-command-cooldown), donde cancelar deja que el comando
se ejecute aunque esté en tiempo de espera (consulta [ajustes del comando](doc:interaction-commands/command-settings)).

## Familias de eventos {#event-families}

DiSky dispara 123 eventos, generados a partir de los mismos descriptores que la
[referencia de eventos](/events), que sigue siendo la lista completa. Se agrupan en una docena de familias;
los valores mencionados son los que más comparte cada familia.

| Familia | Ejemplos | Valores habituales |
| --- | --- | --- |
| Ciclo de vida del bot | `on ready`, `on guild ready`, `on bot shutdown` | `event-bot`, `event-guild` |
| Mensajes | `on message received`, `on message edited`, `on message deleted` | `event-message`, `event-channel`, `event-user` |
| Reacciones y encuestas | `on reaction add`, `on message poll vote added` | `reaction message`, `event-user`, `event-member` |
| Comandos | `on slash command received`, `on user command received` | `execute command`, `event-user`, `event-channel` |
| Componentes | `on button clicked`, `on dropdown clicked`, `on modal clicked` | `click id`, `selected values`, `event-message` |
| Miembros | `on member joined guild`, `on role added`, `on member timeout` | `event-member`, `event-guild` |
| Usuarios | `on discord user name change`, `on discord user typing` | `event-user`, `old name` |
| Servidor | `on discord guild ban`, `on discord guild name update` | `event-guild`, `event-user` |
| Canales e hilos | `on discord channel create`, `on discord thread join` | `event-channel`, `event-guild` |
| Roles | `on discord guild role created`, `on discord guild role permissions update` | `event-role`, `event-guild` |
| Voz | `on member voice join`, `on discord guild voice muted` | `event-member`, `event-guild` |
| Recursos del servidor | `on discord emoji added`, `on discord guild sticker added`, `on discord scheduled event create` | `event-guild` |

!!! tip "Registrar mientras exploras"
    Una función normal de Skript permite comprobar a bajo coste qué eventos se disparan y qué valores
    contienen; no es algo propio de DiSky, y puedes eliminarla cuando el script esté terminado.

```skript
function writeDebug(event: text, data: text):
    send "[DiSky-evt] %{_event}% -> %{_data}%" to console

on member joined guild seen by "my-bot":
    writeDebug("member join", "member=%event-member% guild=%event-guild%")
```
