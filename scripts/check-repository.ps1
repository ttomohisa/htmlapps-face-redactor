param(
  [switch]$SkipSelfExtract
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Source = Join-Path $Root "src\index.template.html"
$Dist = Join-Path $Root "dist\index.html"
$SelfExtractDist = Join-Path $Root "dist\index.self-extract.html"
$BuildScript = Join-Path $Root "build-standalone.ps1"
$SelfExtractBuilder = Join-Path $Root "scripts\build-self-extract.ps1"
$SelfExtractVerifier = Join-Path $Root "scripts\verify-self-extract.ps1"
$AppConfig = Join-Path $Root "app.config.json"

foreach ($requiredFile in @($Source, $BuildScript, $SelfExtractBuilder, $SelfExtractVerifier, $AppConfig)) {
  if (-not (Test-Path $requiredFile)) { throw "Required file missing: $requiredFile" }
}

$legacyHashCommand = "Get" + "-FileHash"
$legacyNewSyntax = "::" + "new("
foreach ($scriptPath in @(Get-ChildItem -Path $Root -Filter "*.ps1" -Recurse | ForEach-Object { $_.FullName })) {
  $scriptText = [System.IO.File]::ReadAllText($scriptPath, [System.Text.Encoding]::UTF8)
  if ($scriptText.Contains($legacyHashCommand)) { throw "Unsupported PowerShell hash dependency detected in $scriptPath" }
  if ($scriptText.Contains($legacyNewSyntax)) { throw "Unsupported PowerShell constructor syntax detected in $scriptPath" }
}

$config = Get-Content -Raw -Encoding UTF8 $AppConfig | ConvertFrom-Json
if (-not $config.build.selfExtract.enabled) { throw "Self-extract build must be enabled." }
if ([string]::IsNullOrWhiteSpace([string]$config.build.selfExtract.output)) { throw "Self-extract output path is missing." }

$sourceHtml = [System.IO.File]::ReadAllText($Source, [System.Text.Encoding]::UTF8)
foreach ($item in @('Face Redactor', 'connect-src ''none''', '''unsafe-eval''', '''wasm-unsafe-eval''', 'YuNet', 'ORT_WASM_GZIP', 'DecompressionStream', 'id="helpToggle"', 'id="toast"', 'id="mobileDetectQuick"', 'id="mobileActionBar"', 'data-minface="12"', 'data-minface="24"', 'data-minface="48"', "addEventListener('paste'")) {
  if (-not $sourceHtml.Contains($item)) { throw "Required source content missing: $item" }
}
if ($sourceHtml -match '<script[^>]+src=["'']https?://') { throw "External script source detected in $Source" }
foreach ($debugText in @('app-config:', 'build-manifest:', 'embedded-assets:')) {
  if ($sourceHtml.Contains($debugText)) { throw "Debug banner text must not be visible in the app: $debugText" }
}

if ($SkipSelfExtract) {
  & $BuildScript -SkipSelfExtract
} else {
  & $BuildScript
}

if (-not (Test-Path $Dist)) { throw "Build output missing: $Dist" }
$distHtml = [System.IO.File]::ReadAllText($Dist, [System.Text.Encoding]::UTF8)
foreach ($item in @('Face Redactor', 'connect-src ''none''', '''unsafe-eval''', '''wasm-unsafe-eval''', 'YuNet', 'ORT_WASM_GZIP', 'DecompressionStream', 'id="helpToggle"', 'id="toast"')) {
  if (-not $distHtml.Contains($item)) { throw "Required build content missing: $item" }
}
if ($distHtml -match '<script[^>]+src=["'']https?://') { throw "External script source detected in $Dist" }

if (-not $SkipSelfExtract) {
  if (-not (Test-Path $SelfExtractDist)) { throw "Self-extract output missing: $SelfExtractDist" }
  $selfExtractHtml = [System.IO.File]::ReadAllText($SelfExtractDist, [System.Text.Encoding]::UTF8)
  foreach ($item in @('id="self-extract-payload"', 'DecompressionStream("gzip")', "connect-src 'none'", "'unsafe-eval'", "'wasm-unsafe-eval'")) {
    if (-not $selfExtractHtml.Contains($item)) { throw "Required self-extract content missing: $item" }
  }
}


& node (Join-Path $Root "tests\header-normalization.test.mjs")
if ($LASTEXITCODE -ne 0) { throw "Header normalization regression failed." }
Write-Host "Repository verification passed." -ForegroundColor Green
