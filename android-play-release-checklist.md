# Android Release mit Google Play

Diese Checkliste ist für **SchuldenPlan**.

## Aktueller Stand

- App-Name: `SchuldenPlan`
- Paketname: `de.silviogladbach.schuldenapp`
- Android Build über Appflow: funktioniert
- AAB-Export über Appflow: funktioniert
- Datenschutz-Seite vorhanden
- Kontolöschung in der App vorhanden
- Kontolöschung außerhalb der App als Web-Seite vorhanden

## Wichtige aktuelle Google-Play-Punkte

1. Für neue persönliche Entwicklerkonten gilt vor Production ein **Closed Test mit mindestens 12 Testern über 14 Tage**.
2. Google Play verlangt für alle Apps eine **Privacy Policy**.
3. Wenn Nutzer in der App ein Konto erstellen können, muss es auch eine **Kontolöschung in der App** und **außerhalb der App** geben.
4. Für neue Apps ist **Play App Signing** der empfohlene Standard.

Quellen:

- [Create and set up your app](https://support.google.com/googleplay/android-developer/answer/9859152?hl=en)
- [Use Play App Signing](https://support.google.com/googleplay/android-developer/answer/9842756?hl=en)
- [App testing requirements for new personal developer accounts](https://support.google.com/googleplay/android-developer/answer/14151465?hl=en)
- [User Data policy](https://support.google.com/googleplay/android-developer/answer/10144311?hl=en)
- [Data safety](https://support.google.com/googleplay/android-developer/answer/10787469?hl=en-EN)

## Reihenfolge

1. Play Console App anlegen
2. App Content ausfüllen
3. Closed Test vorbereiten
4. Release-Signing in Appflow anlegen
5. ersten Release-Build als AAB erzeugen
6. Closed Test starten
7. später Production beantragen

## 1. Play Console App anlegen

In der Play Console:

1. `Create app`
2. Name: `SchuldenPlan`
3. App oder Game: `App`
4. Kostenlos oder kostenpflichtig: nach deinem Plan
5. Support-E-Mail eintragen
6. Developer Program Policies bestätigen
7. Play App Signing Terms akzeptieren

## 2. App Content ausfüllen

Du brauchst mindestens:

- Datenschutz-URL
- Kontolöschungs-URL
- Data Safety Formular
- Altersfreigabe / Content Rating
- Zielgruppe / Target Audience
- Kategorie
- Kontaktangaben

Für dein Projekt passen voraussichtlich:

- Kategorie: `Finance`
- Target Audience: Erwachsene
- Keine Werbung, wenn du keine Ads einbaust

## 3. Closed Test

Wenn dein Entwicklerkonto ein neues persönliches Konto ist:

- mindestens **12 Tester**
- mindestens **14 Tage**
- danach erst Antrag auf Production

Praktisch heißt das:

1. Closed Testing Track anlegen
2. Tester-E-Mail-Adressen sammeln
3. AAB hochladen
4. Opt-in-Link teilen
5. 14 Tage laufen lassen

## 4. Release-Signing in Appflow

Für Android Release in Appflow brauchst du ein Keystore.

Du hast zwei Wege:

### Option A: eigenen Upload-Keystore erzeugen

Das ist der normale Weg.

Beispielbefehl:

```bash
keytool -genkeypair -v -keystore schuldenplan-upload.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload
```

Danach in Appflow unter Android Signing hinterlegen:

- Keystore `.jks`
- Alias
- Keystore Password
- Key Password

### Option B: später direkt über lokalen Release-Prozess arbeiten

Für deinen aktuellen Weg ist **Option A mit Appflow** die bessere Wahl.

## 5. Appflow Release-Build

Wenn das Signing drin ist:

1. Appflow öffnen
2. neuesten Commit wählen
3. Zielplattform `Android`
4. Build Type: `Release`
5. Signing: dein Android-Release-Signing auswählen
6. AAB erzeugen

Für Google Play ist das **AAB** wichtig, nicht die Debug-APK.

## 6. URLs für Play Console

Diese Links solltest du verwenden, sobald die Platzhalter ersetzt sind:

- Datenschutz:
  - `/legal/privacy-policy/`
- Kontolöschung:
  - `/legal/delete-account/`

Wenn deine Cloudflare-Domain z. B. `https://schulden-app.pages.dev` ist, wären das:

- `https://schulden-app.pages.dev/legal/privacy-policy/`
- `https://schulden-app.pages.dev/legal/delete-account/`

## 7. Vor dem Closed Test prüfen

- Registrierung funktioniert
- Login funktioniert
- Konto anlegen / nutzen / löschen funktioniert
- keine Platzhalter mehr in Datenschutz und Support
- App-Name und Icon stimmen
- Support-E-Mail ist echt

## 8. Production erst danach

Erst wenn der Closed Test sauber war:

1. Production Access beantragen
2. Store Listing finalisieren
3. Production Release bauen

## Mein Rat für deinen nächsten konkreten Schritt

Jetzt am sinnvollsten:

1. Datenschutz-Seite mit echten Daten füllen
2. Support-E-Mail festlegen
3. Android Upload-Keystore erzeugen
4. Appflow Android Release-Signing anlegen
5. ersten Closed-Test-Build erstellen
