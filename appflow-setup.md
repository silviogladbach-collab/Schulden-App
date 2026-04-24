# Appflow Setup

Diese Datei beschreibt den praktischen Weg, wie du deine Schulden App ohne Mac über Appflow zu Android und iPhone bringst.

## Was schon vorbereitet ist

- `package.json` hat jetzt einen echten `build`-Script-Eintrag fuer Appflow.
- `npm run build` und `npm run build:web` kopieren deine Web-App nach `cloudflare-pages-upload`.
- `capacitor.config.json` zeigt auf `cloudflare-pages-upload` als `webDir`.
- Das Web-Build laeuft ueber `scripts/prepare-web.js` und funktioniert deshalb auch auf Linux-Runnern von Appflow.

## Wichtiger Hinweis

Laut aktueller Appflow-Doku ist Appflow ideal fuer Entwickler ohne Mac-Hardware.
Es gibt aber auch den Hinweis, dass der Verkauf von Appflow-Enterprise-Plaenen eingestellt wurde.
Wenn du also bei Appflow keinen passenden Zugang mehr bekommst, wechseln wir direkt auf EAS Build.

## Appflow erwartet bei Capacitor

Appflow fuehrt bei Capacitor-Projekten diese Schritte aus:

1. `npm install`
2. `npm run build`
3. `npx cap sync [ios|android]`

Darum war der `build`-Script in `package.json` wichtig.

## Ganz praktisch: dein Weg

### 1. Projekt in ein Git-Repository bringen

Appflow arbeitet ueber dein Git-Repository.
Am einfachsten ist GitHub.

### 2. Lokal einmal die Basis installieren

Fuehre in deinem Projektordner aus:

```powershell
npm install
```

### 3. Android-Plattform lokal erzeugen

```powershell
npx cap add android
```

Das erzeugt den Ordner `android/`.

### 4. iOS-Plattform lokal erzeugen

```powershell
npx cap add ios
```

Das erzeugt den Ordner `ios/`.

Wichtig:
Capacitor behandelt diese nativen Plattformen als Teil des Projekts.
Sie sollen mit ins Repository.

### 5. Alles committen und zu GitHub pushen

Danach sollten mindestens diese Dinge im Repository liegen:

- `index.html`
- `assets/`
- `legal/`
- `cloudflare-pages-upload/`
- `package.json`
- `capacitor.config.json`
- `android/`
- `ios/`

### 6. Neue App in Appflow anlegen

In Appflow:

1. Neue App anlegen
2. GitHub-Repository verbinden
3. den Branch auswaehlen

### 7. Erst Android-Debug-Build machen

Das ist der leichteste erste Test.

In Appflow:

1. Commit auswaehlen
2. Plattform `Android`
3. Build Type `Debug`
4. neuesten Build Stack waehlen
5. Build starten

Danach kannst du die `apk` oder `aab` herunterladen.

### 8. Danach iOS Development Build

Fuer iOS brauchst du:

- Apple Developer Account
- iOS Signing Certificate (`.p12`)
- Provisioning Profile (`.mobileprovision`)

Diese Daten laedst du in Appflow unter:

- `Build > Signing Certificates`

Danach baust du:

1. Commit auswaehlen
2. Plattform `iOS`
3. Build Type `Development`
4. neuesten Build Stack waehlen
5. dein Signing Profile auswaehlen

## Mein Rat fuer dich

1. Erst `npm install`
2. Dann `npx cap add android`
3. Dann `npx cap add ios`
4. Dann alles committen
5. Dann Appflow mit Android Debug testen
6. Danach iOS Signing machen

## Wenn `npx cap add ios` auf Windows scheitert

Dann stoppen wir kurz und pruefen den genauen Fehler.
Falls Appflow fuer dich organisatorisch nicht mehr verfuegbar ist oder iOS lokal auf Windows zickt, wechseln wir direkt auf den EAS-Build-Weg.
