Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$brandingDir = Join-Path $root "branding"
$androidRes = Join-Path $root "android\\app\\src\\main\\res"
$masterIcon = Join-Path $brandingDir "icon-master.png"
$splashPreview = Join-Path $brandingDir "android-splash-preview.png"

if (-not (Test-Path $masterIcon)) {
  throw "Master-Icon nicht gefunden: $masterIcon"
}

$iconBackground = [System.Drawing.ColorTranslator]::FromHtml("#07162E")
$splashBackground = [System.Drawing.ColorTranslator]::FromHtml("#07162E")

function New-ResizedBitmap {
  param(
    [System.Drawing.Image]$Source,
    [int]$Width,
    [int]$Height
  )

  $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear($iconBackground)
  $graphics.DrawImage($Source, 0, 0, $Width, $Height)
  $graphics.Dispose()
  return $bitmap
}

function Save-Png {
  param(
    [System.Drawing.Image]$Image,
    [string]$Target
  )

  $dir = Split-Path -Parent $Target
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }
  $Image.Save($Target, [System.Drawing.Imaging.ImageFormat]::Png)
}

function New-SplashBitmap {
  param(
    [System.Drawing.Image]$Source,
    [int]$Width,
    [int]$Height
  )

  $bitmap = New-Object System.Drawing.Bitmap($Width, $Height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $graphics.Clear($splashBackground)

  $iconSize = [Math]::Round([Math]::Min($Width, $Height) * 0.36)
  $x = [Math]::Round(($Width - $iconSize) / 2)
  $y = [Math]::Round(($Height - $iconSize) / 2)

  $glowRect = New-Object System.Drawing.Rectangle(
    [int]($x - ($iconSize * 0.08)),
    [int]($y - ($iconSize * 0.08)),
    [int]($iconSize * 1.16),
    [int]($iconSize * 1.16)
  )
  $glowBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(42, 51, 209, 242))
  $graphics.FillEllipse($glowBrush, $glowRect)

  $graphics.DrawImage($Source, $x, $y, $iconSize, $iconSize)
  $glowBrush.Dispose()
  $graphics.Dispose()
  return $bitmap
}

$iconSizes = @{
  "mipmap-mdpi\\ic_launcher.png" = @(48, 48)
  "mipmap-hdpi\\ic_launcher.png" = @(72, 72)
  "mipmap-xhdpi\\ic_launcher.png" = @(96, 96)
  "mipmap-xxhdpi\\ic_launcher.png" = @(144, 144)
  "mipmap-xxxhdpi\\ic_launcher.png" = @(192, 192)
  "mipmap-mdpi\\ic_launcher_round.png" = @(48, 48)
  "mipmap-hdpi\\ic_launcher_round.png" = @(72, 72)
  "mipmap-xhdpi\\ic_launcher_round.png" = @(96, 96)
  "mipmap-xxhdpi\\ic_launcher_round.png" = @(144, 144)
  "mipmap-xxxhdpi\\ic_launcher_round.png" = @(192, 192)
  "mipmap-mdpi\\ic_launcher_foreground.png" = @(108, 108)
  "mipmap-hdpi\\ic_launcher_foreground.png" = @(162, 162)
  "mipmap-xhdpi\\ic_launcher_foreground.png" = @(216, 216)
  "mipmap-xxhdpi\\ic_launcher_foreground.png" = @(324, 324)
  "mipmap-xxxhdpi\\ic_launcher_foreground.png" = @(432, 432)
}

$splashSizes = @{
  "drawable\\splash.png" = @(480, 320)
  "drawable-port-mdpi\\splash.png" = @(320, 480)
  "drawable-port-hdpi\\splash.png" = @(480, 800)
  "drawable-port-xhdpi\\splash.png" = @(720, 1280)
  "drawable-port-xxhdpi\\splash.png" = @(960, 1600)
  "drawable-port-xxxhdpi\\splash.png" = @(1280, 1920)
  "drawable-land-mdpi\\splash.png" = @(480, 320)
  "drawable-land-hdpi\\splash.png" = @(800, 480)
  "drawable-land-xhdpi\\splash.png" = @(1280, 720)
  "drawable-land-xxhdpi\\splash.png" = @(1600, 960)
  "drawable-land-xxxhdpi\\splash.png" = @(1920, 1280)
}

$source = [System.Drawing.Image]::FromFile($masterIcon)

foreach ($entry in $iconSizes.GetEnumerator()) {
  $target = Join-Path $androidRes $entry.Key
  $size = $entry.Value
  $bitmap = New-ResizedBitmap -Source $source -Width $size[0] -Height $size[1]
  Save-Png -Image $bitmap -Target $target
  $bitmap.Dispose()
}

foreach ($entry in $splashSizes.GetEnumerator()) {
  $target = Join-Path $androidRes $entry.Key
  $size = $entry.Value
  $bitmap = New-SplashBitmap -Source $source -Width $size[0] -Height $size[1]
  Save-Png -Image $bitmap -Target $target
  $bitmap.Dispose()
}

$preview = New-SplashBitmap -Source $source -Width 1600 -Height 900
Save-Png -Image $preview -Target $splashPreview
$preview.Dispose()

$source.Dispose()

Write-Output "Branding-Assets wurden aktualisiert."
