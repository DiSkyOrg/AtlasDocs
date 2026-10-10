---
title: Installation
description: Installer le plugin DiSky, sa dépendance Skript, et vérifier qu'il est bien chargé.
source-hash: 31045b05db37
---

Cette page explique comment faire fonctionner DiSky sur un serveur Paper. Elle suppose que Skript
est déjà installé ; consultez [ce dont vous avez besoin](index.md#what-you-need) pour les versions
requises.

## Fonctionnement de l'installation {#how-installation-works}

::: steps
1. Déposez le jar de DiSky dans le dossier `plugins/` de votre serveur. Skript doit déjà être
   installé et activé : DiSky est un addon Skript, et non un plugin autonome.

2. Vérifiez que `use type properties: true` est défini (ou simplement non remplacé) dans le
   `config.sk` de Skript. Les syntaxes partagées de DiSky, comme `name of {_bot}`, sont enregistrées
   comme propriétés de type et en dépendent.

3. Démarrez (ou redémarrez) le serveur.
:::

Si Skript n'est pas installé ou ne parvient pas à s'activer, DiSky affiche *"Skript is not installed
or failed to enable; cannot start DiSky."* et se désactive. Il n'existe pas de fichier de
configuration à modifier en v5 : DiSky n'a pas de `config.yml`, seulement le manifeste décrit plus
bas.

## Un chargement réussi {#a-successful-load}

Lors d'un chargement réussi, la console affiche l'enregistrement de la syntaxe de DiSky, puis se
termine par :

```text
[DiSky] DiSky5 enabled: types, properties, bot lifecycle and error layer registered.
```

Si `use type properties` est désactivé, DiSky se charge quand même mais affiche un avertissement :

*"Skript's 'use type properties' option is DISABLED in your config.sk. DiSky's shared
syntaxes (e.g. "name of %member%") rely on it and will NOT parse. It is ON by default in
Skript 2.15+, remove the override or set 'use type properties: true'."*

## Le manifeste de syntaxe {#the-syntax-manifest}

À chaque démarrage, DiSky écrit `plugins/DiSky/disky-syntax.json` : un manifeste lisible par machine
de chaque entité, syntaxe et élément de base qu'il a enregistré, avec la version du plugin et un
horodatage. C'est à partir de lui que l'atlas est généré. Vous n'avez pas besoin de l'éditer ni de le
lire pour utiliser DiSky, mais il est utile si vous développez un outillage pour une installation
donnée.

Une fois le plugin chargé, rendez-vous sur [Démarrer un bot](starting-a-bot.md) pour créer votre
premier bot. Vous aurez besoin d'un token de bot, obtenu depuis le
[Discord Developer Portal](https://discord.com/developers/applications).

## Erreurs que vous pouvez rencontrer {#errors-you-may-see}

| Message (console) | Cause | Solution |
| --- | --- | --- |
| *Skript is not installed or failed to enable; cannot start DiSky.* | Skript est absent, désactivé, ou n'a pas pu s'activer avant DiSky. | Installez ou corrigez Skript, puis redémarrez le serveur. |
| *Skript's 'use type properties' option is DISABLED in your config.sk...* | `use type properties: false` est défini dans le `config.sk` de Skript. | Supprimez le remplacement ou définissez `use type properties: true`, puis redémarrez. |
