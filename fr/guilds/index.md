---
title: Serveurs
description: Fonctionnalités à l'échelle du serveur qu'un bot peut lire et configurer, à commencer par l'écran d'accueil.
source-hash: 9c4da41ddf57
---

Cette section couvre les paramètres qui appartiennent à un serveur dans son ensemble, plutôt qu'à un
salon, un membre ou un message. Vous devez avoir un bot nommé `"my-bot"` connecté (voir
[Démarrer un bot](doc:getting-started/starting-a-bot)) et connaître
[cache (copie en mémoire) et await](doc:concepts/cache-and-await).

## Ordre de lecture {#reading-order}

1. [Écran d'accueil](welcome-screen.md) : l'écran qu'un serveur communautaire affiche aux nouveaux
   membres, lu et modifié depuis un script.

Les règles qui filtrent les messages publiés par les membres sont traitées dans la
[section AutoMod](doc:automod).
