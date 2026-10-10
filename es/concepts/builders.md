---
title: Builders
description: Configura un rol, canal, mensaje o invitación de forma local y créalo en Discord en una sola línea.
source-hash: 364a92d0c720
---

Esta página cubre el contrato que sigue todo builder (objeto de construcción) de DiSky: cómo se crea
un builder, por qué sus propiedades son de solo escritura y qué hace `the build result of`. Las
páginas de funciones solo listan los setters de su propio builder y se apoyan en esta página para el
resto. Se asume que tienes un bot llamado `"my-bot"` conectado y en marcha.

## Cómo funciona un builder {#how-a-builder-works}

Un builder es una petición pendiente a Discord. Crear uno con
[`a new role builder`](syntax:roleaction#new-role-builder) no cuesta nada y no habla con nadie;
establecer sus propiedades solo completa la petición de forma local. Leer
[`the build result of`](syntax:roleaction#result) del builder es la única línea que envía la petición
a Discord y devuelve la entidad creada. Como esa línea espera a la red, necesita `await` (consulta
[caché y await](doc:concepts/cache-and-await)).

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!make-role":
        set {_b} to a new role builder named "Moderator" in event-guild
        set color of {_b} to orange
        set hoisted of {_b} to true
        set mentionable of {_b} to false
        await set {_role} to the build result of {_b}
        reply with "created %name of {_role}%"
```

Nada existe en Discord hasta que se ejecuta la línea con `await`; las cuatro líneas anteriores nunca
salen del servidor. Cuando devuelve el valor, `{_role}` es un rol normal: todas las propiedades y
efectos de rol funcionan sobre él. `the built role from {_b}` es la misma expresión que
`the build result of {_b}`, escrita con el nombre de la entidad que produce; todos los builders tienen
ese alias (`the built guildchannel from`, `the built message from`, etc.).

Solo lo que Discord congela al crearse va en el constructor: un rol necesita un nombre y un servidor,
un hilo necesita un nombre y un canal o mensaje padre, un mensaje necesita su contenido o embed y un
canal. Todo lo demás es una propiedad que estableces después, o que dejas como está.

syntax: roleaction#new-role-builder compact
syntax: roleaction#result compact

## Lo que un builder no hace {#what-a-builder-does-not-do}

Las propiedades de un builder son **de solo escritura**. Leer `color of {_b}` no da nada: una petición
pendiente no tiene estado legible, así que el lado de lectura de cada propiedad es la entidad que
obtienes al construir. Lee `color of {_role}` después de la construcción.

Un builder es una **plantilla, no un resultado memorizado**. Leer `the build result of` del mismo
builder dos veces envía dos peticiones y crea dos entidades:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!twice":
        set {_b} to a new role builder named "Temp" in event-guild
        await set {_first} to the build result of {_b}
        await set {_second} to the build result of {_b}
        reply with "%discord id of {_first}% and %discord id of {_second}%"
```

La validación ocurre en el **momento de la construcción**, no cuando estableces una propiedad. Establecer
un tema en un builder de canal de voz, o una duración de archivado automático que Discord no acepta, se
guarda sin quejarse; la petición falla cuando se ejecuta `the build result of`, y el fallo te llega a
través de la [capa de errores](doc:concepts/errors) de DiSky como cualquier otro rechazo de Discord.
Algunas comprobaciones que DiSky puede hacer localmente (un servidor que ya alcanzó el límite de roles
o canales de Discord, un mensaje sin nada que enviar) fallan en esa misma línea, antes de que salga
ninguna petición.

!!! info "Builders y bots"
    El bot que envía la petición es aquel al que pertenece el ámbito del constructor: `event-guild` o
    `event-channel` en un manejador de eventos visto por `"my-bot"` construye con `"my-bot"`. Los
    builders no aceptan un argumento de bot.

## Los tipos de builder {#the-builder-kinds}

Todo builder de abajo sigue el contrato anterior; solo cambian el constructor y los setters. Los
patrones son la forma mínima: `named` también acepta `with the name`, e `in` acepta `in the guild` o
`in the channel` en todas partes.

| Builder | Crea | Patrón del constructor | Guía |
| --- | --- | --- | --- |
| [Rol](entity:roleaction) | un rol | `a new role builder named %string% in %guild%` | esta página |
| [Canal de texto](entity:channelaction) | un canal de texto | `a new text channel builder named %string% in %guild%` | más adelante |
| [Canal de voz](entity:channelaction) | un canal de voz | `a new voice channel builder named %string% in %guild%` | más adelante |
| [Canal de escenario](entity:channelaction) | un canal de escenario | `a new stage channel builder named %string% in %guild%` | más adelante |
| [Canal de anuncios](entity:channelaction) | un canal de anuncios | `a new news channel builder named %string% in %guild%` | más adelante |
| [Canal de foro](entity:channelaction) | un canal de foro | `a new forum channel builder named %string% in %guild%` | más adelante |
| [Canal multimedia](entity:channelaction) | un canal multimedia | `a new media channel builder named %string% in %guild%` | más adelante |
| [Categoría](entity:channelaction) | una categoría | `a new category builder named %string% in %guild%` | más adelante |
| [Hilo público](entity:threadaction) | un hilo público | `a new thread builder named %string% in %threadcontainer%` | más adelante |
| [Hilo privado](entity:threadaction) | un hilo privado | `a new private thread builder named %string% in %threadcontainer%` | más adelante |
| [Hilo desde un mensaje](entity:threadaction) | un hilo asociado a un mensaje | `a new thread builder named %string% from %message%` | más adelante |
| [Post de foro](entity:forumpostaction) | un post (hilo) en un canal de foro o multimedia | `a new post builder named %string% with message content %string% in %forumchannel/mediachannel%` | más adelante |
| [Invitación](entity:inviteaction) | una invitación | `a new invite builder in %guildchannel%` | más adelante |
| [Webhook](entity:webhookaction) | un webhook | `a new webhook builder named %string% in %guildchannel%` | [clientes de webhook](doc:webhooks/webhook-clients) |
| [Mensaje de webhook](entity:webhookmessageaction) | un mensaje enviado por un webhook | `a new webhook message with content %string% through %webhookclient%` | [publicar a través de un webhook](doc:webhooks/posting-through-webhooks) |
| [Regla de AutoMod](entity:automodrulebuilder) | una regla de AutoMod | `a new automod rule builder named %string% in %guild% for messages using %triggerconfig%` | [crear una regla](doc:automod/creating-rules) |
| [Evento programado (canal)](entity:scheduledeventaction) | un evento programado en un canal de voz o de escenario | `a new scheduled event builder named %string% in %guildchannel% starting at %date%` | más adelante |
| [Evento programado (externo)](entity:scheduledeventaction) | un evento programado en un lugar externo | `a new scheduled event builder named %string% at %string% starting at %date% ending at %date% in %guild%` | más adelante |
| [Mensaje](entity:messageaction) | un mensaje enviado | `a new message with content %string% in %messagechannel%` o `a new message with embed %embedbuilder% in %messagechannel%` | [enviar mensajes](doc:messages/sending-messages) |

Dos objetos parecen builders sin seguir este contrato. Una [encuesta](doc:messages/creating-polls) se
envía con `post` o `reply with` y no tiene `build result of`; un
[builder de pantalla de bienvenida](doc:guilds/welcome-screen) edita una pantalla que ya existe, así que
se envía con el efecto `update the welcome screen using`, que no devuelve nada. Las propiedades de una
encuesta también se leen de vuelta, a diferencia de todos los builders anteriores.

Todos los tipos exponen la misma expresión `the build result of %builder%`; una variable sin tipo que
contenga cualquiera de ellos se resuelve según su tipo en tiempo de ejecución, así que la cadena de
abajo no necesita conversión. La categoría vuelve como una categoría real, que es lo que espera la
propiedad `category` del builder de canal de texto:

```skript
on message received seen by "my-bot":
    if discord content of event-message is "!staff-area":
        set {_cat} to a new category builder named "Staff" in event-guild
        await set {_category} to the build result of {_cat}
        set {_b} to a new text channel builder named "staff-chat" in event-guild
        set category of {_b} to {_category}
        await set {_channel} to the build result of {_b}
        reply with "created %name of {_channel}% under %name of {_category}%"
```

!!! tip "Mantén un build en un solo bloque"
    Mantén juntos el constructor, sus setters y la línea con `await`. Un builder guardado en una
    variable es fácil de construir dos veces por error, y cada construcción crea una entidad nueva.

## Errores que puedes ver {#errors-you-may-see}

| Mensaje (consola) | Causa | Solución |
| --- | --- | --- |
| *building talks to Discord, so this requires 'await'* (error de análisis, el script no se carga) | Se leyó `the build result of` sin `await` delante de la línea. | Escribe `await set {_x} to the build result of {_b}`. |
| *IllegalStateException: this guild already has the maximum of 250 roles* (misma forma con *500 channels*) | El servidor alcanzó el límite de Discord; DiSky rechaza la petición antes de enviarla. | Elimina antes los roles o canales sin usar. |
| *IllegalStateException: this message has no content, no embed, no attachment and no component; Discord refuses an empty message* | Un builder de mensaje se construyó sin nada que enviar. | Dale un contenido, un embed, un adjunto o un componente antes de construirlo. |
| Un bloque *Discord error* que nombra un permiso que falta o un campo no válido | Discord rechazó la petición en el momento de la construcción (falta el permiso **Gestionar roles**, un tema en un canal de voz, un valor no válido). | Corrige la propiedad incorrecta; envuelve la construcción en `try` / `catch` para manejarla en el script, consulta [errores](doc:concepts/errors). |
| Sin mensaje; `color of {_b}` queda vacío | Las propiedades de un builder son de solo escritura. | Lee la propiedad de la entidad construida, no del builder. |
