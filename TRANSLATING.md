# Translating the DiSky Atlas docs

This guide tells you how to translate one page of the hand-written documentation, what must never
change, and what to check before you push. Follow it literally: every rule below is enforced either
by the site loader or by the lint, and the examples are real pages of this repository.

## 1. Overview

### Layout

- `en/` is the source. Every page is written in English first.
- `<code>/` (for example `fr/`) is one translation. It holds a `locale.json` and the translated pages.
- A page is identified by its relative path. `en/getting-started/starting-a-bot.md` and
  `fr/getting-started/starting-a-bot.md` are the same page.
- Language codes are lowercase: `fr`, `de`, `pt-br`, `zh-hant`. The folder name is the code.
- `docs.json` lists the `untranslatable` sections. Currently only `contributing` is listed: those
  pages stay English-only, so never create a translation under `<code>/contributing/`.

```text
en/getting-started/starting-a-bot.md
fr/locale.json
fr/getting-started/starting-a-bot.md
```

### locale.json

Each `<code>/` folder needs a `locale.json`. Without it the folder is ignored. Example for French:

```json
{
  "name": "Français",
  "englishName": "French",
  "aiTranslated": true,
  "ui": {
    "index.title": "Documentation",
    "index.lead": "Guides rédigés à la main, en complément de la référence syntaxique générée."
  }
}
```

- `name` (required): the language name in that language. It is shown in the language menu.
- `englishName`: the English name of the language. Defaults to `name`.
- `aiTranslated`: `true` shows readers the banner "translated by AI, may contain mistakes". Set it to
  `false` only once a person has reviewed the whole translation.
- `ui` (optional): overrides of the site chrome strings. Only the keys you want to change are needed;
  a missing key falls back to the English default. A key that does not exist in the list of section 8
  is a lint warning.

### How readers see each page

| Situation | What the reader gets |
| --- | --- |
| Translation exists and its `source-hash` matches the English file | the translation (status *Translated*) |
| Translation exists but the English file changed since | the translation with the *outdated* banner (status *Outdated*) |
| No translation for this page | the English page with the *not translated* banner (status *Fallback*) |
| Page is in an untranslatable section | the English page, with the *English only* banner |

A translated file whose English counterpart does not exist is ignored, with a lint warning.

## 2. Workflow

1. Pick a page from `en/` that has no file under `<code>/` yet. `node scripts/stamp.mjs --check`
   lists the missing pages.
2. Copy the English file to the same relative path under `<code>/`. Do not write a page from scratch:
   the structure must match the English page.
3. Translate it, following sections 3 to 7.
4. Fix the frontmatter: keep only `title` and `description` (section 3).
5. Run `node scripts/stamp.mjs <code> <file>`, where `<file>` is the translated page, for example
   `node scripts/stamp.mjs fr fr/getting-started/starting-a-bot.md`. It writes `source-hash`, the hash
   of the English file. Add `--ids` to also write the English `{#id}` on each translated h2 and h3
   heading (section 5). Never type the hash by hand.
6. Run `node scripts/stamp.mjs --check`. It shows the coverage of each language and the outdated pages.
   The page you just translated must be listed as translated, not outdated.
7. Commit and push. The CI lint must pass: it reports every warning, and any warning fails it.

### Updating an outdated page

A page is outdated when the English file changed after the translation was made.

1. Find the English changes since the translation. The translation was made from the English version
   that existed when the translated file was last changed: `git log --oneline -- <code>/<page>.md` gives
   that commit, then `git diff <commit> HEAD -- en/<page>.md` shows what changed.
2. Update only the translated parts that correspond to those changes. Keep the rest of the page as is.
3. Run `node scripts/stamp.mjs <code> <file>` again. It updates `source-hash` to the current English
   file. Add `--ids` only when you added or changed a heading.

## 3. Frontmatter

A translation contains **only** these keys:

| Key | In the translation |
| --- | --- |
| `title` | translated |
| `description` | translated (if omitted, the English description is shown) |
| `source-hash` | written by `stamp.mjs`; required |

These keys are inherited from the English page. Never copy them into a translation (the lint warns
"inherited from the English page; remove it from the translation"):

- `icon`, `tags`, `syntaxes`, `order`, `hidden`

Example, from `en/getting-started/starting-a-bot.md`. English:

```yaml
---
title: Starting a bot
icon: play
description: Create a bot, give it a token, log in, and shut it down cleanly.
tags: [bot, getting-started]
syntaxes:
  - core/expressions#expression-new-discord-bot
  - core/effects#effect-login-bot
  - core/effects#effect-shutdown-bot
order: 2
---
```

French, after translating (before `stamp.mjs`):

```yaml
---
title: Démarrer un bot
description: Créer un bot, lui donner un token, le connecter puis l'arrêter proprement.
---
```

French, after `node scripts/stamp.mjs fr fr/getting-started/starting-a-bot.md` (the hash below is an
example; the script writes the real one):

```yaml
---
title: Démarrer un bot
description: Créer un bot, lui donner un token, le connecter puis l'arrêter proprement.
source-hash: 0123456789ab
---
```

Section index pages (`en/<section>/index.md`) are translated the same way. Their translated `title`
is the section name shown in the sidebar.

## 4. Never translate, never change

### 4.1 Fenced code blocks

Translate nothing inside a fence, including strings and comments. Keep the fence line as is.

````markdown
```skript
command /startbot:
    trigger:
        send "&7Logging in 'my-bot'..."
```
````

The string `"&7Logging in 'my-bot'..."` stays English even though the surrounding prose is French.
Code comments follow the same rule. Console output in a `text` fence (for example the
`[DiSky] DiSky5 enabled: ...` line on the installation page) is copied verbatim.

### 4.2 Inline code

Keep every `code span` unchanged, including words that are also English prose: `"my-bot"`,
`{_bot}`, `token`, `/startbot`, `text`.

### 4.3 Console messages

Italic text that quotes a message printed by DiSky (`*IllegalStateException: ...*`) is copied
verbatim, in prose and in tables: readers search the console for that exact text. Everything else in
an error table is translated, including the column headers (`Message (console)`, `Cause`, `Fix`) and
plain, non-italic cells such as "No message; the effect does nothing", which describe a situation
rather than quote the console.

### 4.4 Directive lines

A directive is a line of its own that starts with a name and a colon. The grammar, from the components
page:

| Directive | Grammar | Example | What you may translate |
| --- | --- | --- | --- | --- | --- |
| `syntax:` | `syntax: <ref> [compact\|standard\|full]` | `syntax: core/effects#effect-login-bot compact` | nothing |
| `event:` | `event: <ref> [compact\|standard\|full]` | `event: events#bot-ready-event compact` | nothing |
| `entity:` | `entity: <name>` | `entity: bot` | nothing |
| `doc:` | `doc: <slug>` | `doc: contributing/writing-pages` | nothing |
| `toggle:` | `toggle: <id> "<label>"` | `toggle: use-cache "Use the cache"` | the quoted label only: `toggle: use-cache "Utiliser le cache"` |

Keep each directive alone on its line. Prose on the same line turns the whole line into a paragraph and
the card disappears. Never translate the name (`syntax:` is not `syntaxe:`).

### 4.5 Link targets

Only the label of a link is translated. The target stays exactly as written:

| English | French |
| --- | --- |
| `[Starting a bot](doc:getting-started/starting-a-bot)` | `[Démarrer un bot](doc:getting-started/starting-a-bot)` |
| `[Components](components.md)` | `[Composants](components.md)` |
| `[login](syntax:core/effects#effect-login-bot)` | `[login](syntax:core/effects#effect-login-bot)` |
| `[Intents](#intents)` | `[Intents](#intents)` |

- Relative `.md` targets and `#anchor` targets keep the English form, even when the translated heading
  has a different text. The anchor is the English id (section 5).
- A link label that is a Skript keyword or a property name stays English (`login`, `the build result
  of`, `name`). Labels that are prose are translated.
- Relative links must stay inside the page's own language folder. A link to a file outside `<code>/`
  (for example a file at the repository root) is reported as broken. Use plain text for those.
- External URLs are never changed.
- Images: translate the alt text only. The path (`![alt](../../assets/...)`) stays exactly as in the
  English page; images are shared by every language.

### 4.6 Containers and admonitions

| Syntax | Translate | Keep |
| --- | --- | --- |
| `::: steps`, `::: when use-cache`, `::: when !use-cache`, `::: when advanced && use-cache`, closing `:::` | nothing | the container name, the toggle ids, the operators |
| `!!! warning "Configure before login"` | the quoted title: `!!! warning "Attention : configurer avant `login`"` | the kind (`warning`), `!!!`, `???`, `???+` |
| `??? question "Collapsed by default (click me)"` | the quoted title | the kind |
| `=== "With embed"` | the tab title: `=== "Avec embed"` | `===` |

Admonitions without a quoted title show a default title taken from the `ui` keys `adm.<kind>` (section 8).

### 4.7 Indentation

The body of an admonition (`!!!`, `???`) and of a tab (`===`) is indented by exactly 4 spaces. Keep the
indentation of the English page, line for line. A `::: ` container body is not indented and ends with a
line that holds only `:::`. Do not mix tabs and spaces.

### 4.8 Structure

The translation has the same structure as the English page:

- the same number, level and order of h2 and h3 headings (apart from the text, which is translated);
- the same number and order of code blocks, of list items and of table rows;
- the same number of columns in each table, with the same column order;
- the same directive lines, in the same order.

Do not add a section, a sentence in a code block or a row to a table, and do not remove any. If the
French needs an extra sentence, put it in the prose of the same paragraph.

### 4.9 Other things that stay as they are

- Placeholders in code such as `%name of event-bot%` or `{_bot}`.
- Heading ids: `{#english-id}` (section 5).
- The names of the `event-` values (`event-bot`, `event-guild`) and of every Skript syntax.
- Discord product and application names are fixed by the glossary (section 6).

## 5. Headings

Every translated h2 and h3 must end with `{#english-id}`. The id is what anchors and deep links use:
`[Errors](#errors-you-may-see)` and `doc:...#...` links resolve against it. The lint lists every
mismatch as `h2/h3 ids differ from the English page (missing #...; unexpected #...)`.

How the English id is derived (the site uses the GitHub-style rule):

1. Take the English heading text. Remove the inline code markup but keep the text inside it.
2. Lowercase everything.
3. Remove punctuation (apostrophes, commas, question marks, colons, backticks).
4. Replace each space with a hyphen.
5. If the English heading has an explicit `{#id}`, use that id instead.
6. If the same heading text occurs twice on the page, the second one ends with `-1`, the third with `-2`.

Examples from the repository:

| English heading | English id | French heading |
| --- | --- | --- |
| `## How logging in works` | `how-logging-in-works` | `## Fonctionnement de la connexion {#how-logging-in-works}` |
| `## Errors you may see` | `errors-you-may-see` | `## Erreurs que vous pouvez rencontrer {#errors-you-may-see}` |
| `` ## `kick` and Skript's own `kick` `` | `kick-and-skripts-own-kick` | `` ## `kick` et le `kick` de Skript {#kick-and-skripts-own-kick} `` |

Only the id is fixed. The heading text is translated freely. When unsure, run the lint: it names the
missing ids, and `stamp.mjs --ids` writes them.

## 6. Glossary

Use this table for every recurring term. Look up the term in the first column, apply the rule, and
use the column of your language (`fr`, `de`, `es`). A language without a column yet: add one before
translating, following the same rules.

Rules:

- **keep in English**: write the English term unchanged, in translated prose too.
- **translate**: use your language's column.
- **keep + explain on first use**: the first time the term appears on a page, write it with the short
  explanation in parentheses given in your column (`builder (objet de construction)`); later uses are
  the bare term.

German capitalizes every noun: an English term kept in German prose is capitalized too (`der Bot`,
`das Embed`, `der Webhook`), but code stays exactly as written.

Code identifiers (`guild`, `event-bot`, `on ready`, `discord command`, `login`) are never translated
by this table: it only governs prose.

| English term | Meaning in DiSky | Rule | fr | de | es |
| --- | --- | --- | --- | --- | --- |
| DiSky | the plugin and the atlas | keep in English | DiSky | DiSky | DiSky |
| DiSky Atlas | this documentation site | keep in English | DiSky Atlas | DiSky Atlas | DiSky Atlas |
| Skript | the scripting language DiSky extends | keep in English | Skript | Skript | Skript |
| addon | a Skript extension; DiSky is one | keep + explain on first use | addon (extension de Skript) | Addon (Skript-Erweiterung) | addon (extensión de Skript) |
| Paper | the Minecraft server software | keep in English | Paper | Paper | Paper |
| JDA | the Java library DiSky builds on | keep in English | JDA | JDA | JDA |
| syntax | a pattern registered by DiSky (effect, expression, condition...) | translate | syntaxe (plural: syntaxes) | Syntax (Plural: Syntaxen) | sintaxis (plural: sintaxis) |
| effect | a statement that does something (`kick`, `post`) | translate | effet | Effekt | efecto |
| expression | a value (`name of {_bot}`) | translate | expression | Ausdruck | expresión |
| condition | a yes or no test (`if ... is connected`) | translate | condition | Bedingung | condición |
| event | something Discord sends, handled by an `on ...` line | translate | événement | Event | evento |
| event value | a value of the current event (`event-bot`) | translate in prose; keep identifiers | valeur de l'événement | Event-Wert | valor del evento |
| section (Skript block) | an indented block (`try`, `catch`, `loop`) | keep + explain on first use | section (bloc indenté) | Section (eingerückter Block) | section (bloque sangrado) |
| section (page) | a part of a page under a heading | translate | section | Abschnitt | sección |
| structure | a top-level declaration (`discord command`, `slash command`) | translate | structure | Struktur | estructura |
| type | a Skript type (`member`, `guild`) | translate | type | Typ | tipo |
| property | a value read or set with `X of Y` | translate | propriété | Eigenschaft | propiedad |
| builder | an object configured, then sent to Discord | keep + explain on first use | builder (objet de construction) | Builder (Bauobjekt) | builder (objeto de construcción) |
| build result | the entity a builder creates (`the build result of`) | translate in prose; keep the expression | résultat de la construction | Build-Ergebnis | resultado de la construcción |
| bot | a Discord bot logged in with DiSky | keep in English | bot | Bot | bot |
| token | the secret that logs a bot in | keep in English | token | Token | token |
| log in (login) | to connect a bot to Discord | translate in prose ("connecter"); keep the `login` effect | connecter | anmelden | conectar |
| shut down (shutdown) | to disconnect a bot | translate in prose ("arrêter"); keep the `shutdown` effect | arrêter | herunterfahren | apagar |
| guild | a Discord server | translate | serveur (see note below) | Server | servidor |
| member | a user inside a guild | translate | membre | Mitglied | miembro |
| user | a Discord account | translate | utilisateur | Benutzer | usuario |
| role | a role of a guild | translate | rôle | Rolle | rol |
| channel | a Discord channel | translate | salon | Kanal | canal |
| text channel | a channel for text messages | translate | salon textuel | Textkanal | canal de texto |
| voice channel | a channel for voice | translate | salon vocal | Sprachkanal | canal de voz |
| stage channel | a channel for a live talk | translate | salon de conférence | Stage-Kanal | canal de escenario |
| news channel | an announcement channel | translate | salon d'annonces | Ankündigungskanal | canal de anuncios |
| forum channel | a channel made of posts | translate | salon de forum | Forumkanal | canal de foro |
| category | a group of channels | translate | catégorie | Kategorie | categoría |
| thread | a sub-conversation of a channel | translate | fil | Thread | hilo |
| message | a Discord message | translate | message | Nachricht | mensaje |
| embed | a rich block inside a message | keep in English | embed | Embed | embed |
| component | a button, a dropdown, a text input... | translate | composant | Komponente | componente |
| button | a clickable component | translate | bouton | Button | botón |
| dropdown (select menu) | a menu of choices | translate | menu déroulant | Auswahlmenü | menú desplegable |
| modal | a pop-up form | translate | fenêtre modale | Modal | modal |
| text input | a field inside a modal | translate | champ de texte | Textfeld | campo de texto |
| slash command | a `/name` command registered on Discord | translate | commande slash | Slash-Befehl | comando de barra |
| chat command | a command typed as `!name` in a channel | translate | commande textuelle | Chat-Befehl | comando de chat |
| interaction | a click or a command sent to the bot | translate | interaction | Interaktion | interacción |
| context command | an entry of the right-click menu | translate | commande contextuelle | Kontextbefehl | comando contextual |
| context menu | the right-click menu | translate | menu contextuel | Kontextmenü | menú contextual |
| Apps (menu) | the Discord submenu holding context commands | keep in English (Discord UI label) | Apps | Apps | Apps |
| reply | a message sent as an answer (noun) | translate | réponse (verb: répondre) | Antwort (Verb: antworten) | respuesta (verbo: responder) |
| defer | to acknowledge an interaction early | translate | différer la réponse | Antwort verzögern | diferir la respuesta |
| ephemeral | seen only by the user who triggered it | translate | éphémère | flüchtig (nur für dich sichtbar) | efímero |
| webhook | an object that posts under a custom name | keep in English | webhook | Webhook | webhook |
| AutoMod | Discord's moderation filter | keep in English | AutoMod | AutoMod | AutoMod |
| automod rule | a rule made of a trigger and actions | translate | règle AutoMod | AutoMod-Regel | regla de AutoMod |
| automod trigger (triggerconfig) | what an AutoMod rule looks for | translate | déclencheur | Auslöser | activador |
| automod response | what an AutoMod rule does (block, alert, timeout) | translate | action | Aktion | acción |
| trigger (Skript block) | the code block of a command or event (`trigger:`) | keep + explain on first use | trigger (bloc de code) | Trigger (Codeblock) | trigger (bloque de código) |
| permission | a Discord permission (Manage Server...) | translate | permission | Berechtigung | permiso |
| intent | the events a bot subscribes to | keep + explain on first use | intent (abonnement aux événements) | Intent (Event-Abonnement) | intent (suscripción a eventos) |
| privileged intent | an intent that needs approval on the Developer Portal | translate | intent privilégié | privilegierter Intent | intent privilegiado |
| gateway | the connection to Discord | translate | passerelle | Gateway | gateway |
| shard | one gateway connection | keep + explain on first use | shard (connexion à la passerelle) | Shard (Gateway-Verbindung) | shard (conexión al gateway) |
| sharding | splitting a bot over several shards | translate | découpage en shards | Sharding | sharding |
| cache | the bot's copy of data kept in memory | keep + explain on first use | cache (copie en mémoire) | Cache (Kopie im Speicher) | caché (copia en memoria) |
| await | the Skript keyword that waits for Discord | keep in English | await | await | await |
| snowflake | a Discord identifier | keep + explain on first use | snowflake (identifiant Discord) | Snowflake (Discord-ID) | snowflake (identificador de Discord) |
| id | an identifier (`discord id`) | translate | identifiant | ID | ID |
| mention | a `<@id>` ping | translate | mention | Erwähnung | mención |
| emote (DiSky type) | a custom server emoji | translate in prose; keep `emote` in code | émoji personnalisé | Server-Emoji | emoji personalizado |
| emoji | a standard emoji | keep in English | emoji | Emoji | emoji |
| reaction | an emoji added to a message | translate | réaction | Reaktion | reacción |
| poll | a vote held in a message | translate | sondage | Umfrage | encuesta |
| vote | one choice made in a poll | translate | vote | Stimme | voto |
| attachment | a file attached to a message | translate | pièce jointe | Anhang | archivo adjunto |
| file upload | a file prepared by DiSky to send | translate | envoi de fichier | Datei-Upload | subida de archivo |
| spoiler | a hidden image or file | keep in English | spoiler | Spoiler | spoiler |
| welcome screen | the screen shown to new members of a community | translate | écran d'accueil | Willkommensbildschirm | pantalla de bienvenida |
| scheduled event (Discord) | an event planned on a server | translate | événement programmé | geplantes Event | evento programado |
| audit log | the log of moderator actions | translate | journal d'audit | Audit-Log | registro de auditoría |
| invite | an invitation link | translate | invitation | Einladung | invitación |
| ban | removing a user from a guild for good | translate | bannissement (verb: bannir) | Bann (Verb: bannen) | baneo (verbo: banear) |
| member timeout | a temporary restriction of a member | translate | exclusion temporaire | Timeout | aislamiento temporal |
| cooldown | the wait before a command can run again | translate | temps de recharge | Abklingzeit | tiempo de espera |
| choice (slash) | a fixed answer of an option | translate | choix | Auswahlmöglichkeit | opción fija |
| autocomplete | suggestions while the user types | translate | saisie semi-automatique | Autovervollständigung | autocompletado |
| option (slash) | an argument of a slash command | translate | option | Option | opción |
| argument (chat) | a value typed after a chat command | translate | argument | Argument | argumento |
| subcommand | a `/name sub` entry | translate | sous-commande | Unterbefehl | subcomando |
| localize | to give a translated name or description | translate | localiser | lokalisieren | localizar |
| locale | a Discord language code (`fr`, `en-GB`) | keep in English | locale | Locale | locale |
| nickname | a name specific to a guild | translate | pseudo | Nickname | apodo |
| online status | the presence dot (online, idle, dnd, invisible) | translate | statut en ligne | Online-Status | estado en línea |
| activity | the "Playing..." text of a bot | translate | activité | Aktivität | actividad |
| pin | to keep a message at the top of a channel | translate | épingler | anheften | fijar |
| publish (crosspost) | to send an announcement to followers | translate | publier | veröffentlichen | publicar |
| forward | to copy a message to another channel | translate | transférer | weiterleiten | reenviar |
| purge | to delete a list of messages | translate | supprimer en masse | massenhaft löschen | eliminar en masa |
| typing indicator | the "is typing..." status | translate | saisie en cours | Tipp-Anzeige | indicador de escritura |
| admonition | a boxed note (`!!!`) | translate | encadré | Hinweisbox | recuadro |
| tab | one panel of `===` content | translate | onglet | Tab | pestaña |
| toggle | an on or off switch of a page | translate | bascule | Schalter | interruptor |
| event line (`on ready`) | the trigger line of an event | keep in English, never translate | on ready | on ready | on ready |
| console message | a line printed by DiSky | keep in English, verbatim | message de la console | Konsolenmeldung | mensaje de consola |
| Developer Portal | Discord's dashboard for applications | keep in English (the portal is English-only) | Discord Developer Portal | Discord Developer Portal | Discord Developer Portal |
| Developer Mode | Discord's setting that shows ids | keep in English (Discord UI label) | Developer Mode | Developer Mode | Developer Mode |
| manifest | the `disky-syntax.json` file | translate | manifeste | Manifest | manifiesto |
| getter | an expression that reads a value | keep in English | getter | Getter | getter |
| buffer | memory holding data before it is sent | translate | tampon | Puffer | búfer |
| main thread | the server thread Skript runs on | translate | thread principal | Haupt-Thread | hilo principal |
| worker thread | a background thread | translate | thread de travail | Worker-Thread | hilo de trabajo |
| parse error | an error Skript reports while loading a script | translate | erreur d'analyse | Parse-Fehler | error de análisis |
| direct message (DM) | a private message to a user | translate | message privé | Direktnachricht | mensaje directo |
| leaf command | a command entry that runs code (no subcommands) | translate | commande finale | ausführbarer Befehl | comando final |
| registry | the name to bot map of DiSky | translate | registre | Registry | registro |
| payload | the data sent to Discord | translate | contenu envoyé | Payload | carga |
| rate limit | Discord's limit on requests | keep + explain on first use | rate limit (limite de requêtes) | Rate Limit (Anfragelimit) | rate limit (límite de peticiones) |

**Guild and server.** The English docs say *guild* for the Discord object, and reserve *server* for
Discord's own UI. Translate *guild* with the word Discord's client uses: **serveur** (fr), **Server**
(de), **servidor** (es). The Minecraft server is then always written with its name (**serveur
Minecraft**, **Minecraft-Server**, **servidor de Minecraft**, or the Paper equivalents), so the two
never look alike on a page. The code `guild` and every `guild#...` link stay as they are.

**Discord UI labels.** Labels that name a button, a menu, a permission, a setting or a page of
Discord's interface or of the Developer Portal always stay in English, exactly as in the English page:
`**Manage Server**`, `**Manage Messages**`, `**Apps**`, `**Community**`, `**Developer Mode**`,
`**Copy ID**`, `**Integrations → Webhooks → Copy Webhook URL**`, `**Bot → Privileged Gateway Intents**`,
the activity display `*Playing <text>*`. Only the sentence around them is translated.

## 7. Style per language

### French (fr)

- Tone: direct, technical, short sentences, present tense, as in the English. No filler, no
  "il est important de noter".
- Address the reader with **vous** (never *tu*). Imperatives in steps use the **vous** form: *Ouvrez*,
  *Écrivez*, *Créez*.
- Common English phrases:
  - "You're assumed to have ..." becomes "Vous devez déjà avoir ...".
  - "Pair every `login` with a `shutdown`" becomes "Associez chaque `login` à un `shutdown`".
  - "A bot starts as ..." becomes "Un bot commence comme ...".
- Gender: *le bot*, *le token*, *le serveur*, *la commande*, *la propriété*, *l'événement*, *l'embed*
  (masculine), *le webhook* (elision with an apostrophe).
- Typography:
  - Use a normal space before `:`, `;`, `?` and `!`. A non-breaking space is not required here.
  - Use straight double quotes `"` and straight apostrophes `'` in prose, the same as the English
    pages and the code. Do not use the French guillemets.
  - Never use the em dash character (U+2014). Use a colon, a semicolon, parentheses or a new sentence.
- Numbers in prose: a space for thousands (`1 000`) and a comma for decimals (`0,5`), as in
  `les 1 000 premiers bannissements`. Numbers inside code, Discord error codes (`50013`) and limits
  written in code are not changed.
- Units: keep `ms`, `MB`, `KB` as they are. Write durations in words: `10 secondes`, `24 heures`,
  `7 jours` (the English `24 hours` becomes `24 heures`).

### German (de)

- Tone: direct, technical, short sentences, as in the English. No filler ("Es ist wichtig zu
  beachten, dass...").
- Address the reader with **du** (as Discord's German client does), never *Sie*. Imperatives in steps
  use the *du* form: *Öffne*, *Schreibe*, *Erstelle*. Capitalize *du*/*dein* only at the start of a
  sentence.
- Common English phrases:
  - "You're assumed to have ..." becomes "Du solltest bereits ... haben".
  - "Pair every `login` with a `shutdown`" becomes "Kombiniere jedes `login` mit einem `shutdown`".
- Gender: *der Bot*, *der Token*, *der Server*, *der Befehl*, *die Eigenschaft*, *das Event*, *das
  Embed*, *der Webhook*, *die Nachricht*, *der Kanal*.
- Compounds with a code or English term use a hyphen: `Slash-Befehl`, `Event-Wert`, `Webhook-Client`,
  `login`-Effekt. Never glue code into a word.
- Typography: straight double quotes `"` and straight apostrophes `'` (no „German" quotes), no em dash
  (U+2014).
- Numbers in prose: a period for thousands (`1.000`) and a comma for decimals (`0,5`). Numbers in code
  are not changed.
- Units: keep `ms`, `MB`, `KB`. Durations in words: `10 Sekunden`, `24 Stunden`, `7 Tage`.

### Spanish (es)

- Tone: direct, technical, short sentences, as in the English. Neutral Spanish (no regional slang).
- Address the reader with **tú** (as Discord's Spanish client does), never *usted*. Imperatives in
  steps use the *tú* form: *Abre*, *Escribe*, *Crea*.
- Common English phrases:
  - "You're assumed to have ..." becomes "Se asume que ya tienes ...".
  - "Pair every `login` with a `shutdown`" becomes "Acompaña cada `login` con un `shutdown`".
- Gender: *el bot*, *el token*, *el servidor*, *el comando*, *la propiedad*, *el evento*, *el embed*,
  *el webhook*, *el mensaje*, *el canal*.
- Typography: opening marks are required (`¿Por qué?`, `¡Listo!`). Straight double quotes `"` and
  straight apostrophes `'` (no «comillas»), no em dash (U+2014).
- Numbers in prose: a space or a period for thousands (`1000`, `10 000`), a comma for decimals
  (`0,5`). Numbers in code are not changed.
- Units: keep `ms`, `MB`, `KB`. Durations in words: `10 segundos`, `24 horas`, `7 días`.

## 8. UI strings

These are the keys of `locale.json` `ui`, with the English default. Override a key only when the
French needs something different; a missing key uses the English default.

Placeholders: `{0}` is replaced by the value the site passes in. Keep `{0}` exactly as written, in its
position or moved within the sentence, never translated or removed.

| Key | English default | Notes |
| --- | --- | --- |
| `index.title` | Documentation | title of the docs index |
| `index.lead` | Hand-written guides that complement the generated syntax reference. | lead sentence of the docs index |
| `index.pages.one` | `{0} page` | singular count; `{0}` is the number |
| `index.pages.other` | `{0} pages` | plural count; `{0}` is the number |
| `index.languages` | Languages | heading of the language list |
| `crumb.docs` | Docs | first breadcrumb item |
| `badge.guide` | guide | badge on atlas cards that link to a guide |
| `related.title` | Related syntaxes | heading of the cards at the end of a page |
| `nav.label` | Previous and next page | accessible label of the page navigation |
| `nav.previous` | Previous | previous page link |
| `nav.next` | Next | next page link |
| `feedback.helpful` | Was this page helpful? | question under each page |
| `toc.jump` | Jump to {0} | tooltip of a table of contents chip; `{0}` is the heading text |
| `banner.fallback` | This page isn't translated into {0} yet; you're reading the English version. | `{0}` is the language name |
| `banner.ai` | This page was translated by AI and may contain mistakes. | shown when `aiTranslated` is true |
| `banner.outdated` | The English page changed since this translation was made; it may be out of date. | outdated pages |
| `banner.englishOnly` | This section is only available in English. | untranslatable sections |
| `banner.showOriginal` | Show the English original | link in the banners |
| `banner.showTranslation` | Show the translation | link in the banners |
| `lang.menu` | Documentation language | label of the language menu |
| `lang.auto` | Auto (browser) | the automatic choice |
| `lang.ai` | AI | marker of AI-translated languages in the menu |
| `lang.outdated` | {0} outdated | `{0}` is the number of outdated pages of the language |
| `adm.note` | Note | default title of `!!! note` |
| `adm.tip` | Tip | default title of `!!! tip` |
| `adm.hint` | Hint | default title of `!!! hint` |
| `adm.info` | Info | default title of `!!! info` |
| `adm.abstract` | Abstract | default title of `!!! abstract` |
| `adm.summary` | Summary | default title of `!!! summary` |
| `adm.success` | Success | default title of `!!! success` |
| `adm.check` | Check | default title of `!!! check` |
| `adm.done` | Done | default title of `!!! done` |
| `adm.warning` | Warning | default title of `!!! warning` |
| `adm.caution` | Caution | default title of `!!! caution` |
| `adm.attention` | Attention | default title of `!!! attention` |
| `adm.danger` | Danger | default title of `!!! danger` |
| `adm.error` | Error | default title of `!!! error` |
| `adm.failure` | Failure | default title of `!!! failure` |
| `adm.bug` | Bug | default title of `!!! bug` |
| `adm.example` | Example | default title of `!!! example` |
| `adm.question` | Question | default title of `??? question` |
| `adm.faq` | FAQ | default title of `!!! faq` |
| `adm.help` | Help | default title of `!!! help` |
| `adm.quote` | Quote | default title of `!!! quote` |
| `adm.cite` | Cite | default title of `!!! cite` |

The `adm.*` keys are the titles of admonitions written without a quoted title. The kind name in the
markdown (`!!! tip`) stays in English.

A French `locale.json` example for the same keys (the values are a suggestion, not a requirement):

```json
{
  "name": "Français",
  "englishName": "French",
  "aiTranslated": true,
  "ui": {
    "index.title": "Documentation",
    "crumb.docs": "Docs",
    "badge.guide": "guide",
    "related.title": "Syntaxes liées",
    "feedback.helpful": "Cette page vous a-t-elle été utile ?",
    "toc.jump": "Aller à {0}",
    "banner.fallback": "Cette page n'est pas encore traduite en {0} ; vous lisez la version anglaise.",
    "banner.ai": "Cette page a été traduite par une IA et peut contenir des erreurs.",
    "banner.outdated": "La page anglaise a changé depuis cette traduction ; elle peut être obsolète.",
    "banner.englishOnly": "Cette section n'est disponible qu'en anglais.",
    "lang.menu": "Langue de la documentation",
    "lang.outdated": "{0} obsolète(s)",
    "adm.note": "Note",
    "adm.tip": "Astuce",
    "adm.warning": "Attention",
    "adm.danger": "Danger"
  }
}
```

## 9. Checklist before you push

- [ ] The file is at the same relative path as the English page, under `<code>/`, and `<code>/locale.json` exists.
- [ ] The frontmatter holds only `title`, `description` and `source-hash`.
- [ ] Every translated h2 and h3 ends with the English `{#id}`; `stamp.mjs --ids` was run or the ids were checked.
- [ ] The headings, code blocks, list items, table rows and table columns match the English page in number and order.
- [ ] Code fences, inline code, placeholders, directive lines, link targets and container names are unchanged.
- [ ] Console messages and the `Message (console)` column are verbatim.
- [ ] The glossary terms are applied, and the first use of a "keep + explain" term has its explanation.
- [ ] French: `vous` throughout, straight quotes, a normal space before `:`, `;`, `?`, `!`, no em dash character (U+2014).
- [ ] `node scripts/stamp.mjs --check` lists the page as translated, not outdated.
- [ ] The lint reports no warning.
- [ ] `aiTranslated` in `locale.json` is set as intended.
