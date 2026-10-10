---
title: Erste Schritte
description: Was DiSky v5 ist, was du vor dem Schreiben eines Bots brauchst und wo es weitergeht.
source-hash: 9ac23e9890d3
---

DiSky v5 ist ein Addon (Skript-Erweiterung), mit dem du Discord-Bots direkt in Skript schreiben
kannst. Es läuft auf einem Paper-Server und baut für die Discord-Verbindung auf
[JDA](https://jda.wiki) auf, sodass sich jeder Bot, den du erstellst, darunter wie ein normaler
JDA-Bot verhält.

## Was du brauchst {#what-you-need}

- Einen **Paper-Server** mit **1.21** oder neuer.
- **Java 21** oder neuer.
- **Skript 2.16.1** oder neuer, mit `use type properties: true` in der `config.sk` von Skript.
  Diese Option ist in aktuellen Skript-Versionen standardmäßig aktiviert; die gemeinsamen Syntaxen
  von DiSky (Eigenschaften wie `name of {_bot}`) sind darauf angewiesen und lassen sich nicht
  parsen, wenn sie deaktiviert ist.
- Eine **Discord-Anwendung** mit einem Bot-Token, erstellt im
  [Discord Developer Portal](https://discord.com/developers/applications).

## Lesereihenfolge {#reading-order}

1. [Installation](installation.md): Installation des Plugins und Prüfung, ob es geladen wurde.
2. [Einen Bot starten](starting-a-bot.md): einen Bot erstellen, anmelden und sauber herunterfahren.
3. [Bot-Optionen](bot-options.md): jede Verbindungsoption, von Intents bis zur Shard-Anzahl.
4. [Mehrere Bots](multiple-bots.md): mehrere Bots betreiben und sie nachschlagen.

!!! tip "Nur die imperative API"
    Jedes Beispiel in diesem Abschnitt verwendet die imperative Bot-API: `a new discord bot`,
    danach `set` für die Eigenschaften und anschließend `login`. Nur diese Form wird hier und im
    restlichen Atlas behandelt.
