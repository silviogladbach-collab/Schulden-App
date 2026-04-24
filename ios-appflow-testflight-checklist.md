# iOS mit Appflow, TestFlight und App Store Connect

Diese Datei ist die konkrete Start-Checkliste für deine App.

## Aktuelle Projektwerte

- App-Name: `SchuldenPlan`
- Bundle ID / App ID: `de.silviogladbach.schuldenapp`
- Appflow-App: `f2e5f1f9`
- Git-Branch: `main`

## Wichtig vorab

Für iOS in Appflow brauchst du am Ende zwei Dateien:

- ein iOS-Signing-Zertifikat als `.p12`
- ein Provisioning Profile als `.mobileprovision`

Appflow selbst erzeugt diese Dateien nicht, du lädst sie dort hoch.

Wichtiger Haken:

- Apple beschreibt die CSR-Erstellung offiziell über **Keychain Access auf einem Mac**
- ohne Mac kannst du trotzdem schon **App Store Connect** und die **Apple-Webseiten** vorbereiten
- für das eigentliche Zertifikat brauchst du sehr wahrscheinlich einmal:
  - einen geliehenen Mac
  - einen gemieteten Cloud-Mac
  - oder eine Person mit Mac, die das Zertifikat für dein Apple-Developer-Team erstellt

Quelle:
- Apple CSR: [Create a certificate signing request](https://developer.apple.com/help/account/create-certificates/create-a-certificate-signing-request)
- Apple Certificates Overview: [Certificates overview](https://developer.apple.com/help/account/certificates/certificates-overview/)
- Appflow iOS Signing: [Native Builds With Signing Certificates](https://ionic.io/docs/appflow/tutorial/ios)

## Reihenfolge

1. Apple Developer vorbereiten
2. App Store Connect App anlegen
3. App ID im Apple Developer Portal prüfen/anlegen
4. Distribution-Zertifikat und Provisioning Profile erzeugen
5. Signing in Appflow hinterlegen
6. App Store Destination in Appflow anlegen
7. iOS App-Store-Build bauen
8. Build zu TestFlight hochladen
9. Tester in TestFlight einladen

## 1. Apple Developer vorbereiten

Du brauchst:

- aktives Apple Developer Program
- Zugriff auf App Store Connect
- Rolle `Account Holder`, `Admin` oder mindestens genug Rechte für Apps und TestFlight

Prüfen:

- Sind in App Store Connect alle Verträge akzeptiert?

Quelle:
- [Add a new app](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app)

## 2. App Store Connect App anlegen

In App Store Connect:

1. `Apps`
2. `+`
3. `New App`

Empfohlene Werte:

- Platforms: `iOS`
- Name: `SchuldenPlan`
- Primary Language: `German (Germany)` oder dein gewünschtes Hauptland
- Bundle ID: `de.silviogladbach.schuldenapp`
- SKU: `schuldenplan-ios-001`

Quelle:
- [Add a new app](https://developer.apple.com/help/app-store-connect/create-an-app-record/add-a-new-app)

## 3. App ID im Apple Developer Portal

Im Apple Developer Portal:

1. `Certificates, Identifiers & Profiles`
2. `Identifiers`
3. neue App ID anlegen oder prüfen, dass diese existiert:
   - `de.silviogladbach.schuldenapp`

Die Bundle ID in Apple muss zu deiner App passen.

Quelle:
- [Generating Certificates](https://ionic.io/docs/appflow/package/credentials/)

## 4. Distribution-Zertifikat und App-Store-Profil

Für TestFlight und den App Store brauchst du:

- `Apple Distribution` Zertifikat
- `App Store Connect` Provisioning Profile

### 4a. Zertifikat

Apple sagt offiziell:

1. CSR auf dem Mac mit Keychain Access erzeugen
2. daraus ein Distribution-Zertifikat erzeugen
3. Zertifikat in Keychain importieren
4. als `.p12` exportieren

Quellen:
- [Create a certificate signing request](https://developer.apple.com/help/account/create-certificates/create-a-certificate-signing-request)
- [Certificates overview](https://developer.apple.com/help/account/certificates/certificates-overview/)

### 4b. Provisioning Profile

Im Apple Developer Portal:

1. `Profiles`
2. `+`
3. unter Distribution `App Store Connect`
4. App ID `de.silviogladbach.schuldenapp`
5. Distribution-Zertifikat wählen
6. Profil generieren und herunterladen

Quelle:
- [Create an App Store Connect provisioning profile](https://developer.apple.com/help/account/provisioning-profiles/create-an-app-store-provisioning-profile)

## 5. Signing in Appflow hinterlegen

In Appflow:

1. `Build`
2. `Signing Certificates`
3. `Add certificate`

Für iOS hochladen:

- `.p12`
- `.mobileprovision`
- Passwort der `.p12`

Wichtig:

- Für TestFlight/App Store brauchst du in Appflow ein **Production**-Signing-Setup

Quellen:
- [Adding Certificates](https://ionic.io/docs/appflow/package/adding-credentials)
- [Native Build Types](https://ionic.io/docs/appflow/package/build-types)

## 6. Apple App Store Destination in Appflow

In Appflow:

1. `Deploy`
2. Destination hinzufügen
3. `Apple App Store`

Du brauchst dort:

- Apple ID
- App-spezifisches Passwort
- Apple ID der App aus App Store Connect
- Team ID

Hinweis:

- Die **Apple ID der App** ist eine numerische Kennung in App Store Connect
- Die **Team ID** findest du in deinem Apple-Developer-Konto

Quelle:
- [Apple App Store destination in Appflow](https://ionic.io/docs/appflow/destinations/apple)

## 7. iOS-Build in Appflow

Wenn das Signing drin ist:

1. Commit wählen
2. Zielplattform `iOS`
3. Build Stack: neuesten Standard
4. Build Type: `App Store`
5. dein Production-Signing wählen
6. optional direkt Apple-App-Store-Destination anhaken

Quellen:
- [Native Builds With Signing Certificates](https://ionic.io/docs/appflow/tutorial/ios)
- [Deploying to the App Stores](https://ionic.io/docs/appflow/tutorial/dtas)

## 8. TestFlight

Nach erfolgreichem Upload:

1. App Store Connect öffnen
2. App wählen
3. `TestFlight`

Dann:

- internen Test starten
- später externe Tester hinzufügen

Wichtig:

- interne Tester: bis zu 100
- externe Tester: bis zu 10.000
- für externe Tester kann Review nötig sein, besonders beim ersten Build

Quellen:
- [Add internal testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/add-internal-testers/)
- [Invite external testers](https://developer.apple.com/help/app-store-connect/test-a-beta-version/invite-external-testers/)
- [TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview)

## 9. Was du jetzt sofort ohne Mac machen kannst

Diese drei Dinge kannst du direkt vorbereiten:

1. App Store Connect App anlegen
2. Apple Developer Identifiers prüfen
3. Appflow-Ziel `Apple App Store` vorbereiten, soweit die Daten schon da sind

## Empfohlener Start jetzt

Wenn du sofort weitermachen willst, arbeite in genau dieser Reihenfolge:

1. App Store Connect öffnen und App `SchuldenPlan` anlegen
2. Bundle ID `de.silviogladbach.schuldenapp` bestätigen
3. prüfen, ob du Zugriff auf einen Mac für das Zertifikat organisieren kannst
4. danach `.p12` und `.mobileprovision` erzeugen
5. in Appflow hochladen

## Daten, die du dir notieren solltest

- Apple Team ID
- numerische Apple App ID aus App Store Connect
- Apple ID für Upload
- App-spezifisches Passwort
- Name des iOS-Production-Signing-Profils in Appflow
