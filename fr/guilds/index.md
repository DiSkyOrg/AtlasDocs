---
title: Serveurs
description: Fonctionnalités à l'échelle du serveur qu'un bot peut lire et configurer, de l'écran d'accueil aux permissions, émojis personnalisés et stickers.
source-hash: 7387a6d31671
---

Cette section couvre les paramètres qui appartiennent à un serveur dans son ensemble, plutôt qu'à un
salon, un membre ou un message. Vous devez avoir un bot nommé `"my-bot"` connecté (voir
[Démarrer un bot](doc:getting-started/starting-a-bot)) et connaître
[cache (copie en mémoire) et await](doc:concepts/cache-and-await).

## Ordre de lecture {#reading-order}

1. [Écran d'accueil](welcome-screen.md) : l'écran qu'un serveur communautaire affiche aux nouveaux
   membres, lu et modifié depuis un script.
2. [Permissions](permissions.md) : ce qu'un rôle donne dans tout le serveur, ce qu'un membre peut
   faire, et les surcharges qu'un salon ajoute par-dessus.
3. [Émojis personnalisés et stickers](emotes-and-stickers.md) : créer des émojis personnalisés et
   des stickers à partir d'une image, réserver un émoji à certains rôles, et les supprimer.

Les règles qui filtrent les messages publiés par les membres sont traitées dans la
[section AutoMod](doc:automod).
