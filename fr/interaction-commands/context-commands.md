---
title: Commandes contextuelles
description: Les structures et builders de commandes du menu contextuel utilisateur et message, et ce que leur trigger peut lire.
source-hash: dfc6f4ec35c2
---

Cette page couvre `user command` et `message command` : les structures à l'origine du menu
**Applications** du clic droit de Discord, et leurs équivalents en builders. Vous devez déjà avoir un
bot nommé `"my-bot"` connecté et avoir lu [Commandes slash](doc:interaction-commands/slash-commands).

## Fonctionnement des commandes contextuelles {#how-context-commands-work}

Un clic droit sur un utilisateur ou un message dans Discord ouvre un sous-menu **Applications** ; chaque
entrée de ce sous-menu est une commande contextuelle. Une structure `user command` répond à un clic sur
un utilisateur, une `message command` à un clic sur un message ; toutes deux sont des modèles, exactement
comme `slash command`, avec un `trigger` qui s'exécute dès qu'on choisit l'entrée.

```skript
user command Report user:
    trigger:
        reply with hidden "Reported %target user%"

message command Quote this:
    trigger:
        reply with hidden "> %discord content of target message%"
```

Un nom fait de 1 à 32 caractères et, contrairement à celui d'une commande slash, peut contenir des
espaces et des majuscules : "Report user" et "Quote this" sont des entrées valides dans le menu de
Discord. `trigger` est la seule entrée obligatoire.

Rien n'atteint Discord tant qu'un script ne l'envoie pas, comme pour une commande slash : `update the
discord commands (all structured application commands) in event-guild` depuis `on guild ready` envoie
chaque structure, commandes contextuelles comprises. Voir
[Enregistrer des commandes](doc:interaction-commands/registering-commands) pour `register`,
`unregister` et la répartition entre commandes globales et par serveur. Les commandes contextuelles ont
changé de la v4 à la v5 de la même façon que les commandes slash ; voir l'encadré sur
[Commandes slash](doc:interaction-commands/slash-commands) pour le détail.

syntax: core/structures#structure-context-command-structure compact

## Entrées {#entries}

| Entrée | Par défaut | Valeurs acceptées |
| --- | --- | --- |
| [name](syntax:applicationcommand#name-localizations) | le nom de l'en-tête | une section de noms traduits `locale: text` |
| `trigger` | *(obligatoire)* | une section de code Skript |

`enabled for`, `disabled`, `nsfw`, `contexts`, `integration types`, `cooldown`, `cooldown scope` et
`on cooldown` fonctionnent de la même façon que sur une commande slash ; voir
[Réglages des commandes](doc:interaction-commands/command-settings).

## Dans le trigger {#inside-the-trigger}

| Valeur | Contient |
| --- | --- |
| `target user` | l'utilisateur cliqué, dans un trigger de `user command` |
| `target message` | le message cliqué, dans un trigger de `message command` |
| `used user command` / `used message command` | le nom de la commande |
| `event-user`, `event-member`, `event-guild`, `event-channel`, `event-bot` | le contexte de l'invocation |
| `event-message` | le message cliqué, même valeur que `target message` (commandes message uniquement) |

event: events#user-command compact

event: events#message-command compact

## Construire une commande à la place {#building-one-instead}

Un builder de commande contextuelle est un objet simple dont seul le nom est défini : ni chemin, ni
`trigger`. Rien n'atteint Discord tant qu'il n'est pas envoyé, et une commande déclarée par builder
reçoit sa réponse dans l'événement générique au lieu d'exécuter un trigger propre.

```skript
on guild ready:
    set {_report} to a new user command named "Report user"
    register the discord command {_report} in event-guild

on user command:
    if used user command is "Report user":
        reply with hidden "Reported %target user%"
```

```skript
on guild ready:
    set {_quote} to a new message command named "Quote this"
    register the discord command {_quote} in event-guild

on message command:
    if used message command is "Quote this":
        reply with hidden "> %discord content of target message%"
```

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Correction |
| --- | --- | --- |
| *A context command name is 1 to 32 characters long* | le nom de l'en-tête est vide ou trop long | raccourcissez-le ou allongez-le pour respecter la limite |
| *Unexpected entry 'x' in a context command. Known entries: name, enabled for, disabled, nsfw, contexts, integration types, cooldown, cooldown scope, on cooldown, trigger.* | une entrée est mal orthographiée, ou n'appartient qu'à `slash command` | utilisez l'une des entrées listées |

entity: usercommand
