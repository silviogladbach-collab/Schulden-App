$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$target = Join-Path $projectRoot "cloudflare-pages-upload"

if (Test-Path $target) {
  Remove-Item -LiteralPath $target -Recurse -Force
}

New-Item -ItemType Directory -Path $target | Out-Null
New-Item -ItemType Directory -Path (Join-Path $target "assets") | Out-Null
New-Item -ItemType Directory -Path (Join-Path $target "legal") | Out-Null

Copy-Item -LiteralPath (Join-Path $projectRoot "index.html") -Destination (Join-Path $target "index.html")
Copy-Item -LiteralPath (Join-Path $projectRoot "assets\\*") -Destination (Join-Path $target "assets") -Recurse
Copy-Item -LiteralPath (Join-Path $projectRoot "legal\\*") -Destination (Join-Path $target "legal") -Recurse

Write-Output "Web-Dateien wurden nach cloudflare-pages-upload kopiert."
