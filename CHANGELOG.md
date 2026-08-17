# Changelog

## Unreleased

- Removed the leftover build/debug banner from the top of the application UI.
- Completed Japanese localization across controls, dialogs, status messages, tooltips, face lists, and mobile actions.
- Reworked the smartphone layout using the htmlapps-template mobile visual language: light cards, compact sticky header, and a bottom editing action bar.
- Added quick face-detection controls with Smallest face presets (12 / 24 / 48 px), confidence presets, and one-tap re-detection.

## 1.0.0

- Fixed self-extract CSP so ONNX Runtime Web can compile WebAssembly while runtime network access remains blocked.
- Made the self-extract loading screen safe for Windows PowerShell 5.1 by removing non-ASCII literals from the PowerShell source.
- Stopped shipping generated `dist/index.html` and `dist/index.self-extract.html` in the source archive; build them locally instead.
- Restored template-compatible self-extract output (`dist/index.self-extract.html`) from the standard build command.
- Kept the self-extract build compatible with older Windows PowerShell by avoiding `Get-FileHash` and `::new()`.
- Replaced the build-time `Get-FileHash` dependency with a .NET SHA-256 implementation for older Windows PowerShell environments.
- Reworked Private Face Redactor as Face Redactor for Browser-Kitty.
- Preserved automatic/local face detection, manual masks, effects, stamps, undo/redo, zoom/pan, sharing and export.
- Rebuilt the UI around the light `htmlapps-template` style.
- Added Japanese/English switching, help/notes, mobile toast feedback and clipboard image paste.
- Added an explicit pre-save missed-face review reminder.
