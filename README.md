# Formkurve – Ganzkörper-Training

Webapp (PWA) für einen 8-Wochen-Ganzkörperplan: geführtes Training mit Timern, Lauf-Modus mit Sprachansagen und dauerhaft gespeicherter Fortschritt mit Kurven. Gebaut für das iPhone als App auf dem Home-Bildschirm, funktioniert komplett offline.

- **Vanilla HTML/CSS/JS** – kein Framework, keine Bibliothek, kein Build-Schritt, keine externen Requests
- Alle Daten bleiben auf dem Gerät (`localStorage`, Schlüssel `gkt.v1`)

## Dateien

| Datei | Inhalt |
| --- | --- |
| `index.html` | Die komplette App (CSS + JS). Der Trainingsplan steht zentral im Objekt `PLAN`. |
| `manifest.webmanifest` | PWA-Manifest (Name, Icons, `display: standalone`) |
| `sw.js` | Service Worker: speichert alle Dateien für den Offline-Betrieb |
| `icons/` | App-Icons (PNG) und die Vorlage `icon.svg` |
| `tools/make-icons.mjs` | Erzeugt die PNG-Icons neu aus `icons/icon.svg` (nur nötig, wenn du das Icon änderst) |

## Lokal testen

Der Service Worker braucht `http://localhost` oder HTTPS – ein Doppelklick auf `index.html` (`file://`) reicht dafür nicht. Im Projektordner:

```bash
python3 -m http.server 8000
```

Dann <http://localhost:8000> öffnen. In Chrome/Safari die Entwicklertools auf eine iPhone-Ansicht stellen (ca. 390 × 844).

Zum Test auf dem iPhone im selben WLAN: `python3 -m http.server 8000 --bind 0.0.0.0` und auf dem iPhone `http://<IP-deines-Rechners>:8000` öffnen. Ohne HTTPS gibt es dort aber keinen Service Worker (also kein Offline-Modus) – dafür die App online stellen (siehe unten).

## Kostenlos online stellen (GitHub Pages)

1. Repository auf GitHub öffnen → **Settings → Pages**.
2. Unter **Build and deployment**: Source **Deploy from a branch**, Branch **main**, Ordner **/ (root)** → **Save**.
3. Nach ca. einer Minute ist die App erreichbar unter `https://<dein-name>.github.io/ganzkoerper-training/` – mit HTTPS, das der Service Worker braucht.

Alle Pfade sind relativ, die App funktioniert deshalb auch in diesem Unterordner. Bei privaten Repositories ist GitHub Pages nur mit einem bezahlten Plan verfügbar; alternativ das Repository öffentlich machen oder z. B. Netlify/Cloudflare Pages (ebenfalls kostenlos) verwenden.

**Updates:** Nach einer Änderung in `sw.js` die Konstante `VERSION` erhöhen. Die neue Version ist dann beim übernächsten Öffnen der App aktiv (beim ersten Öffnen wird sie im Hintergrund geladen).

## Auf dem iPhone zum Home-Bildschirm hinzufügen

1. Die Adresse in **Safari** öffnen.
2. Unten auf **Teilen** (Quadrat mit Pfeil) tippen.
3. **„Zum Home-Bildschirm“** wählen, Namen bestätigen (**Formkurve**) → **Hinzufügen**.
4. Ab jetzt über das Icon starten: Die App öffnet sich im Vollbild ohne Safari-Leisten und funktioniert offline.

Tipps für das Training:

- **Stummschalter aus**, sonst sind die Töne nicht zu hören (Sprachansagen meist schon).
- Der Bildschirm bleibt während Training und Lauf an (Screen Wake Lock, ab iOS 16.4; in der Home-Bildschirm-App zuverlässig ab iOS 18.4). Geht er bei dir trotzdem aus: *Einstellungen → Anzeige & Helligkeit → Automatische Sperre* fürs Training hochsetzen.
- Bei gesperrtem Bildschirm pausiert iOS Web-Apps: Timer laufen über Zeitstempel korrekt weiter, Töne und Ansagen kommen aber erst, wenn die App wieder sichtbar ist.

## Warum regelmäßig ein Backup?

Deine Daten liegen ausschließlich im Speicher dieser App auf deinem iPhone – es gibt keinen Server und kein Konto. Sie gehen verloren, wenn du

- die App vom Home-Bildschirm löschst (das löscht auch ihren Speicher),
- in iOS „Verlauf und Websitedaten löschen“ wählst,
- das iPhone wechselst oder zurücksetzt (Web-App-Daten werden nicht zuverlässig per iCloud-Backup übertragen),
- iOS bei vollem Speicher Website-Daten aufräumt.

Darum: **Einstellungen → Daten exportieren** – das öffnet das Teilen-Menü, dort **„In Dateien sichern“** (z. B. iCloud Drive). Die App erinnert dich nach 14 Tagen ohne Backup. Wiederherstellen über **Einstellungen → Daten importieren**.

## Anpassen

- **Name:** `APP_NAME` in `index.html`, `name`/`short_name` in `manifest.webmanifest`, `<title>` und `apple-mobile-web-app-title`.
- **Trainingsplan:** alles im Objekt `PLAN` in `index.html` (Übungen, Varianten, Technik-Hinweise, Phasen, Jogging, Dehnen).
- **Datenformat:** `{ version, settings, sessions, activeWorkout }`. Bei Strukturänderungen `SCHEMA_VERSION` erhöhen und eine Funktion in `MIGRATIONS` ergänzen; ein neuer Speicher-Schlüssel kommt mit dem alten in `LEGACY_KEYS`.
