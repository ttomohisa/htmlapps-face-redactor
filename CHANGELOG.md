# Changelog

## 1.0.2 - 2026-10-09

- Add a genuine English screenshot for the app catalog and documentation.

## 1.0.1 - 2026-10-07

- Normalize the header language switch to EN / JA with localized destination tooltips and accessible names.
- Keep Help labels localized and synchronize the three-part app version without changing local-processing behavior.

## Unreleased

- Added Enable all masks and enabled/disabled counts in the bilingual mask review pane. Stamps are excluded; counts do not certify complete coverage.
- Made individual checkbox and bulk enabled-state edits undoable in one step, while preserving Redo for no-ops.
- Clear previous-source history and pending gestures when accepting replacement media, and discard stale detector results/errors after replacement or session clear.
- Release a canceled pointer edit without leaving mask-state actions blocked.

- Rebalanced the desktop editing float into a fixed three-column layout.
- Restyled the fully-local indicator as a badge and added a concise app description to the header.
- Removed the duplicate language switch from Help and fixed the desktop More menu stacking order.

- Fixed the canvas floating editor so controls wrap within the available canvas width instead of being clipped, and widened the mask-shape selector.
- Rebuilt the top-left brand area to match the Browser Kitty app pattern with a 38 px app icon, app name, version badge, and compact local-processing subtitle.
- Renamed the prominent privacy label from “端末内処理” to “完全ローカル処理”.
- Fixed the Help & Notes dialog layout so its steps and notices remain vertically stacked on both desktop and mobile.
- Rebuilt the desktop floating editor as a single horizontal toolbar and separated zoom controls to prevent overlap.
- Matched the header language/help controls to the Browser-Kitty reference pattern with a direct language toggle and information icon.
- Added extra mobile end-of-page clearance so the final mask-review card remains fully visible above the fixed action bar, and moved toasts above the bar.
- Added an editable output filename to the save dialog with automatic extension updates when the export format changes.
- Replaced clipped inline info bubbles with viewport-aware tooltips and moved mask padding into the always-available canvas quick controls.
- Simplified the desktop header to Undo / Redo / Help / More / Save and moved mask, stamp, and effect controls into the canvas editing panel.
- Reworked face detection into simple face-size and confidence presets, with numeric/NMS options under Advanced settings.
- Reduced the mobile bottom action bar from six actions to four primary actions, moving Redo / Share / Clear into a compact More menu.
- Focused the right pane on mask review and moved shortcut/privacy reference information into Help instead of the main workspace.
- Consolidated export settings into the save dialog and added a required whole-image review checkbox before saving.
- Added workflow highlighting for Add media → Find faces → Edit → Review & save and refreshed the repository screenshot.
- Reduced the standalone HTML size by storing the embedded ONNX Runtime WASM as gzip-compressed Base64 and unpacking it locally at startup.
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

