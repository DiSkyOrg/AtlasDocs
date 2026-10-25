---
title: Statut bêta
description: Ce que la bêta de DiSky v5 implique pour vos scripts, et ce qui n'est pas encore disponible.
source-hash: c2ab8b73af34
---

DiSky v5 est en bêta publique. Cette page indique ce sur quoi vous pouvez compter aujourd'hui, ce qui
peut encore évoluer et ce qui n'est pas encore disponible, pour que vous puissiez décider de l'utiliser
ou non sur un bot en production.

## Ce que signifie la bêta {#what-beta-means}

La bêta couvre l'essentiel de ce qu'il faut pour écrire un bot Discord, mais le plugin est encore
jeune : vous pouvez rencontrer des bugs, des erreurs inattendues dans la console ou, dans de rares cas,
un crash. Chaque build de la bêta corrige ce qui a été signalé sur le précédent ; utilisez donc
toujours le dernier build.

Si quelque chose ne fonctionne pas, ouvrez une issue sur le
[dépôt DiSky5](https://github.com/DiSkyOrg/DiSky5/issues) en indiquant vos versions de DiSky, de Skript
et de Paper, le script qui provoque le problème et la sortie complète de la console.

## Stabilité des syntaxes {#syntax-stability}

Les syntaxes documentées dans cet atlas sont stables. Les patterns, les noms de propriétés et les types
de retour ne sont pas censés changer d'un build de la bêta à l'autre : un script écrit aujourd'hui
continuera d'être analysé correctement au prochain build.

Une syntaxe ne change que dans un cas extrême, par exemple quand Discord supprime la fonctionnalité
sur laquelle elle repose. Ces cas sont rares et se limitent aux syntaxes directement concernées.

## Modules {#modules}

Le système de modules n'est pas encore disponible en v5. Les modules conçus pour DiSky 4 ne se chargent
pas, et il n'est pas encore possible d'enregistrer un nouveau module. Les addons (extensions de Skript)
qui dépendent de DiSky comme d'un addon Skript classique ne sont pas concernés.

## Version de Skript {#skript-version}

DiSky v5 nécessite **Skript 2.16.1** ou plus récent (voir [ce dont vous avez besoin](index.md#what-you-need)),
mais la configuration recommandée est la **dernière version de Skript**. DiSky suit Skript de près, et
les versions récentes corrigent des problèmes d'analyse qui peuvent toucher les syntaxes des addons.

## Pas encore pris en charge {#not-supported-yet}

Quelques fonctionnalités de niche de DiSky 4 ne sont pas encore disponibles en v5. Tout le reste est
couvert, avec une syntaxe parfois légèrement différente : [Venir de DiSky 4](doc:migration) donne la
forme v5 des syntaxes qui ont changé, l'ordre dans lequel porter un script et la liste de ce que la v5
n'a pas.

Si une syntaxe de DiSky 4 n'a pas d'équivalent dans l'atlas, elle fait partie de ces fonctionnalités.
Ouvrez une issue si votre bot en dépend, pour qu'elle puisse être priorisée.
