# Branding

Dieser Ordner ist die Basis für Name, Farben und Bild-Assets der App.

## Dateien

- `app-brand.json`: zentrale Werte für Name, Farben und Paket-ID
- `icon-master.png`: Master-Icon in hoher Auflösung
- `android-splash-preview.png`: Vorschau der Splash-Basis

## Android-Assets neu erzeugen

Wenn du später ein neues `icon-master.png` verwendest, kannst du die Android-Dateien neu erzeugen mit:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/generate-brand-assets.ps1
```

Der Befehl aktualisiert:

- `android/app/src/main/res/mipmap-*/ic_launcher*.png`
- `android/app/src/main/res/drawable*/splash.png`

Danach:

1. `npm run build:web`
2. `git add .`
3. `git commit -m "Branding aktualisiert"`
4. `git push origin main`
