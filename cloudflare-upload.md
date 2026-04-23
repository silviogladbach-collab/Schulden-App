# Cloudflare Upload

## Diese Dateien hochladen

- `index.html`
- kompletter Ordner `assets`
- kompletter Ordner `legal`

## Diese Dateien nicht fuer den neuen Stand verwenden

- `finance-app-fixed.html`
- `privacy-policy.html`
- `support.html`
- `delete-account.html`

## Reihenfolge

1. In Cloudflare Pages das bestehende Projekt oeffnen.
2. Die neue `index.html` verwenden.
3. Den kompletten Ordner `assets` mit hochladen.
4. Den kompletten Ordner `legal` mit hochladen.
5. Danach die Seite hart neu laden mit `Strg + F5`.

## Nach dem Upload testen

1. Login
2. Registrierung
3. Person anlegen
4. Person oeffnen
5. Mein Konto oeffnen
6. Datenschutz, Support und Kontoloeschung pruefen

## Wichtiger Hinweis

Der eingetragene Supabase-Key wurde aus deinem frueheren App-Stand uebernommen. Wenn Cloudflare danach einen `401`-Fehler von Supabase zeigt, dann muss in `assets/js/app.js` ein neuer aktueller Publishable Key aus Supabase eingetragen werden.
