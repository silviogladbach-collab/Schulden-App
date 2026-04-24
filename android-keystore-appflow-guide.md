# Android Keystore und Appflow Release-Signing

Diese Anleitung ist für **SchuldenPlan**.

## Ziel

Am Ende hast du:

- einen Upload-Keystore als `.jks`
- die nötigen Daten für Appflow
- die Basis für dein erstes echtes Google-Play-`AAB`

## 1. Keystore erzeugen

Wenn `keytool` auf deinem Rechner verfügbar ist, nutze genau diesen Befehl:

```bash
keytool -genkeypair -v -keystore schuldenplan-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Dann wirst du nach diesen Werten gefragt:

- Keystore-Passwort
- Vorname/Nachname oder Organisationsname
- Organisationseinheit
- Organisation
- Ort
- Bundesland
- Ländercode

Für einen einfachen Start kannst du dort deine echten Daten oder einen passenden Projektwert eintragen.

## 2. Diese vier Werte gut notieren

Die brauchst du später in Appflow:

- Keystore-Datei: `schuldenplan-upload.jks`
- Alias: `upload`
- Keystore Password
- Key Password

## 3. Datei sicher ablegen

Lege den Keystore nicht offen im Projekt ab.

Empfohlen:

- in einen sicheren privaten Ordner
- zusätzlich Backup an einem zweiten sicheren Ort

Wenn du den Keystore verlierst, wird das spätere Aktualisieren schwieriger.

## 4. In Appflow hinterlegen

In Appflow:

1. App öffnen
2. `Build`
3. `Signing Certificates`
4. Android
5. neues Release-Signing anlegen

Eintragen:

- Keystore File: `schuldenplan-upload.jks`
- Keystore Password
- Key Alias: `upload`
- Key Password

## 5. Danach Release-Build bauen

Wenn das Signing gespeichert ist:

1. `Builds`
2. `New Build`
3. Plattform: `Android`
4. Build Type: `Release`
5. neuesten Commit wählen
6. dein Android-Release-Signing auswählen
7. Build starten

## 6. Ergebnis

Für Google Play ist das Ergebnis wichtig:

- **AAB** hochladen, nicht die Debug-APK

## Hinweis zu Play App Signing

In Google Play solltest du für eine neue App den normalen Weg mit **Play App Signing** nutzen.

Quelle:

- [Use Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en)
