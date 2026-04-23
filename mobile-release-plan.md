# Mobile Release Plan

## Ziel

Die Schulden App soll:

- als Web-App stabil laufen
- als iOS-App und Android-App verpackt werden
- im Apple App Store und im Google Play Store veröffentlicht werden

## Aktueller Stand

- Web-App mit Supabase-Login, Registrierung, Personen, Schulden, Tilgung und Raten
- Datenschutz-, Support- und Kontolösch-Seiten vorbereitet
- Kontolösch-Anfrage in der App vorbereitet

## Phase 1: Veröffentlichungs-Basis

1. Echte Kontaktdaten einsetzen
   - `privacy-policy.html`
   - `support.html`
   - `delete-account.html`

2. Supabase aktualisieren
   - `supabase-schema-update.sql` ausführen
   - prüfen, ob die neue Tabelle `deletion_requests` vorhanden ist

3. Live-Test im Browser
   - Registrierung
   - Login
   - Person anlegen
   - Schuld anlegen
   - Tilgung anlegen
   - Rate anlegen
   - Kontolösch-Anfrage absenden

## Phase 2: App Store Pflichtpunkte

1. Datenschutzerklärung öffentlich verfügbar halten
2. Support-Seite öffentlich verfügbar halten
3. Kontolöschung in der App testen
4. Kontolöschung außerhalb der App über `delete-account.html` anbieten
5. App-Icon, Screenshots und Beschreibung vorbereiten

## Phase 3: Mobile App bauen

Empfohlener Weg für den aktuellen Stand:

1. Web-App in ein kleines Frontend-Projekt überführen
2. Danach mit Capacitor für iOS und Android verpacken
3. App auf echten Geräten testen

Warum dieser Weg:

- passt gut zu deiner bestehenden HTML/JS-App
- ist deutlich schneller als ein kompletter Neubau
- wir können dieselbe Logik für Web, iPhone und Android weiterverwenden

## Phase 4: Apple

1. Apple Developer Account einrichten
2. App in Xcode/TestFlight testen
3. Datenschutzangaben in App Store Connect ausfüllen
4. Review-Infos und Testzugang hinterlegen
5. App einreichen

## Phase 5: Google

1. Play Console einrichten
2. App Bundle hochladen
3. Data Safety ausfüllen
4. Closed Test durchführen
5. Danach Production beantragen und veröffentlichen

## Was wir als Nächstes konkret machen sollten

1. Die vorbereiteten HTML-Seiten mit echten Kontaktdaten füllen
2. Die neue SQL ausführen
3. Kontolösch-Anfrage im Browser testen
4. Danach die App in ein kleines Projekt mit sauberer Dateistruktur umziehen
5. Anschließend iOS/Android-Verpackung starten
