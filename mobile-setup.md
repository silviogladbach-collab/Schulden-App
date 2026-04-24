# Mobile Basis fuer iPhone und Android

Diese Projektbasis nutzt Capacitor, damit deine bestehende Web-App als iOS- und Android-App weiterverwendet werden kann.

## Was jetzt schon vorbereitet ist

- `package.json`
- `capacitor.config.json`
- `scripts/prepare-web.js`
- `cloudflare-pages-upload`

Capacitor verwendet als Web-Quelle den Ordner `cloudflare-pages-upload`.

## Naechste Schritte auf deinem Rechner

1. `npm install`
2. `npm run build:web`
3. `npx cap add android`
4. `npx cap add ios`
5. `npx cap sync`

## Apps oeffnen

- Android Studio: `npx cap open android`
- Xcode: `npx cap open ios`

## Wichtige Hinweise

- Fuer Android brauchst du Android Studio.
- Fuer iOS brauchst du Xcode und damit praktisch einen Mac.
- Wenn du Inhalte der Web-App aenderst, danach immer:
  - `npm run build:web`
  - `npx cap sync`

## Store-Vorbereitung spaeter

Als Naechstes brauchen wir danach noch:

- App-Icon
- Splash Screen
- Datenschutz final ausfuellen
- Support-Kontakt final ausfuellen
- Kontoloeschung final pruefen
- echte Tests auf Handy
