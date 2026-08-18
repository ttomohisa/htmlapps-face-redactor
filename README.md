# Face Redactor

[![Build standalone HTML](https://github.com/ttomohisa/htmlapps-face-redactor/actions/workflows/build-standalone.yml/badge.svg)](https://github.com/ttomohisa/htmlapps-face-redactor/actions/workflows/build-standalone.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Single HTML](https://img.shields.io/badge/distribution-single%20HTML-0ea5e9)](https://browser-kitty.com/)

[日本語版 README](README.ja.md)

A privacy-focused, single-HTML face redaction tool that detects faces locally in the browser and hides them with pixelation, blur, solid fill, eye bars, emoji, or custom images.

Face detection and image processing run on your device. The selected photo is not uploaded by the app.

## Features

- Local face detection with **YuNet + ONNX Runtime Web**
- Quick **smallest face** presets for small/distant faces: **12 / 24 / 48 px**
- Adjustable detection confidence with easy presets and detailed settings
- Automatic detection plus manual masks for missed faces or other private areas
- Move, resize, enable/disable, and delete individual masks
- Pixelation, blur, solid fill, eye bar, emoji, and custom-image redaction
- Emoji, text, and image stamps
- Undo and redo
- Zoom, pan, mouse, touch, and mobile-friendly editing
- Load images by file picker, drag and drop, or clipboard paste
- Export as JPEG / PNG / WebP with quality and scale controls
- Estimated output size before saving
- Share through the Web Share API on supported devices
- Japanese and English UI in the same HTML
- Responsive mobile UI with a compact sticky header and bottom action bar
- Runtime network access blocked by Content Security Policy
- Self-extracting HTML output for a smaller portable file

> Face detection is not perfect. Always review the entire image before exporting and add manual masks when needed.

## Quick start

### Build the standalone files

1. Download or clone this repository.
2. On Windows, run `build-standalone.bat`.
3. Open `dist/index.html` in a current browser.
4. If you prefer the compressed portable version, open `dist/index.self-extract.html`.

Python, Node.js, and a local web server are not required. The build uses Windows PowerShell.

### Generated files

A normal build creates:

```text
dist/
├─ index.html
├─ index.self-extract.html
├─ self-extract-manifest.json
└─ .nojekyll
```

Generated HTML files are intentionally not committed to this repository.

## Usage

1. Add an image with the file picker, drag and drop, or clipboard paste.
2. Run face detection and review the detected masks.
3. If small or distant faces are missed, lower **Smallest face** — try **12 px** first.
4. Adjust detection confidence if you want to find more faces or reduce false positives.
5. Add manual masks for anything the detector missed.
6. Choose a redaction style and adjust its strength or appearance.
7. Review the whole image and export it.

### Smallest face

The **Smallest face** setting controls how small a face can be before the detector ignores it.

| Preset | Value | Best for |
| --- | ---: | --- |
| Small faces | 12 px | Group photos, crowds, distant faces |
| Standard | 24 px | Most photos |
| Large faces only | 48 px | Close-up portraits and faster detection |

A smaller value can detect more distant faces, but it can also increase processing time and false positives.

### Keyboard shortcuts

| Shortcut | Action |
| --- | --- |
| `D` | Detect faces again |
| `M` | Add a manual mask |
| `Delete` | Delete the selected mask |
| `Space` | Play / pause video preview |

## Development and build layout

```text
.
├─ src/index.template.html          # Application source template
├─ app.config.json                  # App metadata and build settings
├─ dependencies.json                # External build dependencies (currently none)
├─ build-standalone.bat             # Windows build entry point
├─ build-standalone.ps1             # Standalone HTML builder
├─ scripts/
│  ├─ build-self-extract.ps1        # Self-extracting HTML builder
│  ├─ verify-self-extract.ps1       # Self-extract verification
│  └─ check-repository.ps1          # Repository/build validation
├─ dist/                            # Generated output; not committed
└─ .github/workflows/
   └─ build-standalone.yml          # CI build validation
```

### Build

Run:

```bat
build-standalone.bat
```

or:

```powershell
.\build-standalone.ps1
```

To build only `dist/index.html` and skip the self-extracting version:

```powershell
.\build-standalone.ps1 -SkipSelfExtract
```

The application source already contains ONNX Runtime Web and the YuNet model, so the normal build does not need to download JavaScript libraries or model files. To reduce the standalone file size, the ONNX Runtime WASM is embedded as gzip-compressed Base64 and unpacked locally at startup with the browser `DecompressionStream` API.

## Privacy and runtime network protection

The generated app is designed to process selected files locally in the browser.

- The image or video you select is not uploaded by the app.
- ONNX Runtime Web and the YuNet face-detection model are embedded in the HTML.
- Content Security Policy includes `connect-src 'none'`, blocking runtime network connections.
- `wasm-unsafe-eval` / `unsafe-eval` are allowed only so ONNX Runtime Web can compile and execute its embedded WebAssembly backend; they do not enable network access.
- The self-extracting version restores the embedded app locally with the browser's `DecompressionStream` API.

If the app is hosted on a website, the initial HTML still has to be downloaded from that site. After loading, the selected media remains on the device unless you explicitly use a browser sharing feature.

## Limitations

- Face detection can miss faces or produce false positives.
- Very small, heavily occluded, blurred, rotated, or unusual-angle faces can be harder to detect.
- Lowering the smallest-face size can increase processing time and false positives.
- Video files can be loaded and previewed, but redacted video export is not available in the current version.
- Large images can use substantial device memory and take longer on lower-powered devices.
- Web Share API availability depends on the browser and operating system.
- `index.self-extract.html` requires a browser with `DecompressionStream` support.

## Dependencies

| Library / model | Version | License | Purpose |
| --- | ---: | --- | --- |
| ONNX Runtime Web | 1.27.0 | MIT | Local neural-network inference in the browser |
| YuNet face detection model | OpenCV Zoo | MIT | Face detection |

See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for third-party license details.

## Contributing

Bug reports and feature proposals are welcome through GitHub Issues. When reporting a bug, include reproduction steps and browser/device information when possible.

## License

Copyright © 2026 ttomohisa

Licensed under the [MIT License](LICENSE).
