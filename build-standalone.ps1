param(
  [switch]$SkipSelfExtract,
  [string]$OutputPath = ""
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Source = Join-Path $Root "src\index.template.html"
$AppConfigPath = Join-Path $Root "app.config.json"
$SelfExtractBuilderPath = Join-Path $Root "scripts\build-self-extract.ps1"

function Get-Sha256Hex([string]$Path) {
  $stream = [System.IO.File]::OpenRead($Path)
  try {
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    try {
      $hashBytes = $sha256.ComputeHash($stream)
      return (($hashBytes | ForEach-Object { $_.ToString("x2") }) -join "")
    } finally {
      $sha256.Dispose()
    }
  } finally {
    $stream.Dispose()
  }
}

if (-not (Test-Path $Source)) { throw "Source file not found: $Source" }
if (-not (Test-Path $AppConfigPath)) { throw "App config not found: $AppConfigPath" }

$appConfig = Get-Content -Raw -Encoding UTF8 $AppConfigPath | ConvertFrom-Json
$outputPathWasSpecified = -not [string]::IsNullOrWhiteSpace($OutputPath)

if (-not $outputPathWasSpecified) {
  $configuredOutput = [string]$appConfig.build.output
  if ([string]::IsNullOrWhiteSpace($configuredOutput)) { $configuredOutput = "dist/index.html" }
  $OutputPath = $configuredOutput
}

if (-not [System.IO.Path]::IsPathRooted($OutputPath)) { $OutputPath = Join-Path $Root $OutputPath }

$OutDir = Split-Path -Parent $OutputPath
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

$html = [System.IO.File]::ReadAllText($Source, [System.Text.Encoding]::UTF8)
$required = @('Face Redactor', 'connect-src ''none''', '''unsafe-eval''', '''wasm-unsafe-eval''', 'YUNET', 'ONNX Runtime Web', 'id="canvas"', 'id="toast"')
foreach ($item in $required) {
  if (-not $html.Contains($item)) { throw "Required content missing: $item" }
}
if ($html -match '<script[^>]+src=["'']https?://') { throw "External script source detected." }

[System.IO.File]::WriteAllText($OutputPath, $html, (New-Object System.Text.UTF8Encoding($false)))
[System.IO.File]::WriteAllText((Join-Path $OutDir ".nojekyll"), "", (New-Object System.Text.UTF8Encoding($false)))

$size = [Math]::Round((Get-Item $OutputPath).Length / 1MB, 2)
$hash = Get-Sha256Hex $OutputPath
Write-Host "Built Face Redactor 1.0" -ForegroundColor Green
Write-Host "Output: $OutputPath"
Write-Host "Size: $size MB"
Write-Host "SHA-256: $hash"

$selfExtractEnabled = $false
if (-not $SkipSelfExtract -and ($appConfig.build.PSObject.Properties.Name -contains "selfExtract")) {
  $selfExtractConfig = $appConfig.build.selfExtract
  if ($selfExtractConfig -and ($selfExtractConfig.PSObject.Properties.Name -contains "enabled")) {
    $selfExtractEnabled = [bool]$selfExtractConfig.enabled
  }
}

if ($selfExtractEnabled) {
  if (-not (Test-Path $SelfExtractBuilderPath)) { throw "Self-extract builder not found: $SelfExtractBuilderPath" }

  if ($outputPathWasSpecified) {
    $customDirectory = Split-Path -Parent $OutputPath
    $customBaseName = [System.IO.Path]::GetFileNameWithoutExtension($OutputPath)
    $selfExtractOutputPath = Join-Path $customDirectory ($customBaseName + ".self-extract.html")
  } else {
    if (-not ($selfExtractConfig.PSObject.Properties.Name -contains "output")) {
      throw "app.config.json: build.selfExtract.output is required when self-extract output is enabled."
    }
    $configuredSelfExtractOutput = [string]$selfExtractConfig.output
    if ([string]::IsNullOrWhiteSpace($configuredSelfExtractOutput)) {
      throw "app.config.json: build.selfExtract.output cannot be empty."
    }
    if ([System.IO.Path]::IsPathRooted($configuredSelfExtractOutput)) {
      $selfExtractOutputPath = $configuredSelfExtractOutput
    } else {
      $selfExtractOutputPath = Join-Path $Root $configuredSelfExtractOutput
    }
  }

  Write-Host "Building self-extracting HTML..." -ForegroundColor Cyan
  & $SelfExtractBuilderPath `
    -InputPath $OutputPath `
    -OutputPath $selfExtractOutputPath `
    -AppName ([string]$appConfig.name) `
    -AppNameJa ([string]$appConfig.nameJa)
}
