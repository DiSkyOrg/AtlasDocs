---
title: Installation
description: Installation des DiSky-Plugins, seiner Skript-Abhängigkeit und Prüfung, ob es geladen wurde.
source-hash: 31045b05db37
---

Diese Seite erklärt, wie DiSky auf einem Paper-Server läuft. Sie setzt voraus, dass Skript bereits
installiert ist; die Versionsanforderungen stehen unter [Was du brauchst](index.md#what-you-need).

## So funktioniert die Installation {#how-installation-works}

::: steps
1. Lege die DiSky-JAR-Datei in den Ordner `plugins/` deines Servers. Skript muss bereits
   installiert und aktiviert sein: DiSky ist ein Skript-Addon und kein eigenständiges Plugin.

2. Stelle sicher, dass `use type properties: true` gesetzt ist (oder schlicht nicht überschrieben
   wird) in der `config.sk` von Skript. Die gemeinsamen Syntaxen von DiSky, etwa
   `name of {_bot}`, sind als Typ-Eigenschaften registriert und hängen davon ab.

3. Starte den Server (oder starte ihn neu).
:::

Wenn Skript nicht installiert ist oder nicht aktiviert werden kann, protokolliert DiSky
*"Skript is not installed or failed to enable; cannot start DiSky."* und deaktiviert sich selbst.
Für v5 gibt es keine Konfigurationsdatei: DiSky besitzt keine `config.yml`, sondern nur das weiter
unten beschriebene Manifest.

## Ein erfolgreicher Start {#a-successful-load}

Bei einem erfolgreichen Start registriert DiSky seine Syntaxen und endet mit der Konsolenmeldung:

```text
[DiSky] DiSky5 enabled: types, properties, bot lifecycle and error layer registered.
```

Wenn `use type properties` deaktiviert ist, lädt DiSky trotzdem, gibt aber eine Warnung aus:

*"Skript's 'use type properties' option is DISABLED in your config.sk. DiSky's shared
syntaxes (e.g. "name of %member%") rely on it and will NOT parse. It is ON by default in
Skript 2.15+, remove the override or set 'use type properties: true'."*

## Das Syntax-Manifest {#the-syntax-manifest}

Bei jedem Start schreibt DiSky `plugins/DiSky/disky-syntax.json`: ein maschinenlesbares Manifest
aller Entitäten, Syntaxen und Kernelemente, die es registriert hat, zusammen mit der Plugin-Version
und einem Zeitstempel. Daraus wird der Atlas selbst generiert. Du musst die Datei weder bearbeiten
noch lesen, um DiSky zu nutzen; sie ist aber nützlich, wenn du Tooling für eine bestimmte
Installation baust.

Sobald das Plugin geladen ist, geht es weiter mit [Einen Bot starten](starting-a-bot.md), um deinen
ersten Bot zu erstellen. Du brauchst dafür einen Bot-Token aus dem
[Discord Developer Portal](https://discord.com/developers/applications).

## Mögliche Fehler {#errors-you-may-see}

| Meldung (Konsole) | Ursache | Behebung |
| --- | --- | --- |
| *Skript is not installed or failed to enable; cannot start DiSky.* | Skript fehlt, ist deaktiviert oder konnte nicht aktiviert werden, bevor DiSky startet. | Installiere oder repariere Skript und starte den Server neu. |
| *Skript's 'use type properties' option is DISABLED in your config.sk...* | `use type properties: false` ist in der `config.sk` von Skript gesetzt. | Entferne die Überschreibung oder setze `use type properties: true`, dann starte neu. |
