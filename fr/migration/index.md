---
title: Venir de DiSky 4
description: Porter des scripts DiSky 4 vers DiSky 5 : ce qui a changé, dans quel ordre le corriger, et ce qui n'existe plus.
source-hash: 6f531d5a73d8
---

Cette section est pour vous si vous avez des scripts DiSky 4 qui fonctionnent aujourd'hui et que
vous voulez les faire tourner sur DiSky 5. Elle liste ce qui a changé, propose un ordre pour
corriger un script, et dit clairement ce qui a été abandonné. Vous devez déjà connaître les bases
de DiSky 5 (voir [Démarrer un bot](doc:getting-started/starting-a-bot) et
[Concepts](doc:concepts)).

## Ce qui a changé globalement {#what-changed-overall}

La plupart des problèmes viennent de six changements. Chacun a une page détaillée, liée dans la
section suivante.

- **Les lectures en ligne utilisent `await`.** DiSky 4 avait une famille d'effets
  `retrieve ... and store it in {_x}`. Dans DiSky 5, les mêmes données sont une expression
  ordinaire, et vous demandez la version en ligne en plaçant `await` devant la ligne. Voir
  [Cache et await](doc:concepts/cache-and-await).
- **La création passe par des builders (objets de construction).** Les effets
  `create ... and store it in` et les sections de création ont disparu. Vous construisez un
  `new ... builder`, vous définissez ses propriétés une ligne chacune, puis vous lisez
  `the build result of` ce builder. Voir [Builders](doc:concepts/builders).
- **Un préfixe `discord` là où Skript possède déjà le mot.** Skript enregistre ses syntaxes avant
  tout addon (extension de Skript), donc une syntaxe DiSky de même forme perdrait en silence sur une
  variable sans type. Ces propriétés portent désormais un `discord` obligatoire :
  `discord content`, `discord author`, `discord colors`, `discord location`, `discord owner`,
  `discord attachments`, `discord permissions`.
- **Les commandes sont enregistrées explicitement auprès de Discord.** Les structures de commandes
  slash et contextuelles sont de simples modèles ; rien n'atteint Discord tant qu'un effet ne les
  envoie pas.
- **Les événements exposent leurs valeurs différemment.** La plupart des événements de changement
  donnent leurs anciennes et nouvelles valeurs sous la forme `past event-X` / `event-X`,
  `event-author` a disparu, et quelques événements ont été renommés ou supprimés.
- **Pas de fichier de configuration.** Voir la dernière section.

```skript
# DiSky 4
retrieve member with id "123" from event-guild and store it in {_m}

# DiSky 5
await set {_m} to member with id "123" in event-guild
```

La structure `define bot` se charge toujours, mais l'API impérative (`a new discord bot`, puis
`login`) est la référence et celle qu'utilise cette documentation.

## Porter un script {#porting-a-script}

Travaillez dans cet ordre ; chaque étape supprime toute une classe d'erreurs et rend la suivante
lisible.

1. Chargez le script sur un serveur Minecraft avec DiSky 5 et laissez Skript afficher chaque
   erreur d'analyse.
2. Lisez les erreurs de haut en bas. Une seule erreur provoque souvent plusieurs lignes de bruit
   en dessous ; corrigez la première et rechargez avant de traiter les autres.
3. Corrigez d'abord la lecture et la création : chaque ligne `retrieve ... and store it in` et
   `create ... and store it in`. Voir [Lire et créer](doc:migration/retrieve-and-create).
4. Corrigez les syntaxes qui ont été renommées ou qui ont gagné un mot obligatoire. Voir
   [Syntaxes renommées](doc:migration/renamed-syntaxes).
5. Portez les commandes, boutons, menus déroulants et fenêtres modales. Voir
   [Commandes et composants](doc:migration/commands-and-components).
6. Portez les gestionnaires d'événements en dernier, une fois que tout ce qu'ils contiennent est
   analysé correctement. Voir [Événements](doc:migration/events).
7. Exécutez le script sur un serveur de test. L'analyse ne prouve rien : vérifiez que chaque
   syntaxe fait ce qu'elle faisait avant.

## Ce que DiSky 5 n'a pas {#what-disky-5-does-not-have}

Certaines fonctionnalités de DiSky 4 ont été supprimées ou remplacées plutôt que renommées. Tout ce
qui n'est pas dans ce tableau existe sous un nouveau nom (voir les pages ci-dessus) ou n'a jamais
été dans DiSky 4.

| Fonctionnalité de DiSky 4 | Statut | Que faire à la place |
| --- | --- | --- |
| `find members with roles` / `with nickname`, la section `find member` | Non disponible | Parcourez `members of {_guild}` avec une boucle et filtrez avec un `if` |
| `react to %message% with %emote% to run` (section) | Non disponible | Utilisez l'effet `react to`, et gérez le clic dans `on reaction add` |
| `listen once to event` et la section `once` | Non disponible | Gardez un indicateur dans une variable et vérifiez-le dans un gestionnaire d'événement normal |
| Section `create rich message` (contenu, embeds, pièces jointes, rangées) | Remplacé | Un builder de message ; `embeds of` accepte plusieurs embeds |
| Sections d'embed et `register embed template` | Remplacé | Des builders d'embed ; il n'y a pas de modèles, utilisez une fonction qui renvoie un builder |
| Embed depuis et vers JSON | Non disponible | Définissez les propriétés de l'embed une par une |
| `and store it in` sur `post`, `reply with` et les envois de webhook | Remplacé | Construisez le message avec un builder de message et lisez `the build result of` |
| `edit` avec un builder de message | Non disponible | `edit` accepte du texte, un builder d'embed ou un composant |
| Envoi d'un sticker avec `post` | Non disponible | Aucune ; `post` accepte du texte, des embeds, des composants et des sondages |
| `destroy %guild%` | Non disponible | Aucune ; le serveur ne peut pas être supprimé depuis un script |
| `on disky command` | Remplacé | `on discord command used` |
| Registre nommé de clients webhook | Remplacé | Stockez le client dans une variable |
| `retrieve event-value` et `apply replacement` | Abandonné | Lisez la valeur avec `await` ; reconstruisez plutôt le composant |
| `config.yml`, la commande `/disky` et `plugins/DiSky/modules` | Abandonné | Voir ci-dessous ; les modules tiers doivent être des addons Skript qui dépendent de DiSky |
| Voix et audio avancés | Non disponible | Seul `connect` permet de connecter un bot à un salon audio |

!!! info "Ce qui semble manquer mais ne manque pas"
    Le renommage et la modification en direct des salons, serveurs, émojis personnalisés et
    événements programmés, le mode lent, la position des salons, les propriétés `archived` et
    `locked` des fils, `channel of %message%`, la famille `channel with id`, et les activités
    (`watching`, `listening to`, `streaming ... with the url`, `competing in`, `custom status`)
    existent tous. Une `discord command !ping` textuelle sans entrée `prefixes:` répond toujours à
    `!ping`. Se connecter sous un nom déjà utilisé arrête désormais le bot précédent au lieu de le
    laisser fuir.

## Pas de fichier de configuration {#no-config-file}

DiSky 5 ne lit aucun fichier de configuration et n'écrit que `plugins/DiSky/disky-syntax.json`, une
description des syntaxes installées que lit l'Atlas. Les options de DiSky 4 se traduisent en
scripts : faire taire un code d'erreur devient `on disky exception:` avec `cancel event`, et gérer
un échec attendu se fait avec un bloc `try` / `catch`. Voir [Erreurs](doc:concepts/errors).

```skript
on disky exception:
    if error code of event-discorderror is 50006:
        cancel event
```
