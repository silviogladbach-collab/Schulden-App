# Schulden App

Saubere Projektstruktur fuer die statische Cloudflare-Pages-Version.

## Wichtige Dateien

- `index.html`
  - Hauptseite der App
- `assets/css/app.css`
  - Styles fuer die App
- `assets/js/app.js`
  - App-Logik, Routing und Supabase-Anbindung
- `legal/privacy-policy/index.html`
  - Datenschutz-Seite
- `legal/support/index.html`
  - Support-Seite
- `legal/delete-account/index.html`
  - Seite zur Kontoloeschung

## Weitere Dateien

- `supabase-schema-update.sql`
  - SQL fuer benoetigte Tabellen und Zusatzspalten in Supabase
- `package.json`
  - Mobile Basis mit Capacitor fuer Android und iOS
- `capacitor.config.json`
  - Grundkonfiguration fuer die mobile App
- `ionic.config.json`
  - Projektdatei fuer den Ionic-CLI- und Appflow-Link
- `scripts/prepare-web.js`
  - kopiert die Web-App plattformunabhaengig in den mobilen Web-Ordner
- `mobile-setup.md`
  - Schritt-fuer-Schritt fuer iPhone und Android
- `appflow-setup.md`
  - Schritt-fuer-Schritt fuer den Appflow-Weg ohne Mac
- `mobile-release-plan.md`
  - Fahrplan fuer iOS/Android und Store-Release
- `store-launch-checklist.md`
  - Checkliste fuer spaetere Veroeffentlichung

## Alte Einzeldateien

Diese Dateien liegen noch im Ordner, sind aber nicht mehr die Hauptstruktur:

- `finance-app-fixed.html`
- `privacy-policy.html`
- `support.html`
- `delete-account.html`

Wenn du auf Cloudflare Pages hochlaedst, nutze fuer die neue Struktur:

- `index.html`
- kompletten Ordner `assets`
- kompletten Ordner `legal`

## Hinweis

Der Supabase Publishable Key ist bereits in `assets/js/app.js` eingetragen.
