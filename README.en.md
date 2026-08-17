# Face Redactor

A single-file browser tool that detects faces locally and redacts them with pixelation, blur, solid fill, eye bars, emoji, or custom overlays. The repository follows the structure and UI conventions of `htmlapps-template` and is ready to integrate into Browser-Kitty.

## Highlights

- Local YuNet + ONNX Runtime Web face detection
- One-tap Smallest face presets for 12 / 24 / 48 px (small faces / standard / large faces only)
- Mobile quick detection card for Smallest face, confidence, and immediate re-detection
- Manual masks for missed faces and other sensitive regions
- Move, resize, enable/disable, delete, undo and redo
- Pixelate, blur, fill, eye bar, emoji and custom image effects
- Text/image stamps
- Zoom, pan and touch controls
- JPEG, PNG and WebP export with quality/scale controls
- Drag & drop, file picker and clipboard image paste
- Japanese / English UI switch
- Mobile-first card layout with a compact sticky header and bottom editing action bar
- Runtime network blocked with CSP (`connect-src 'none'`)

Always review the entire image before sharing. Automatic face detection can miss faces.

## Build

Run `build-standalone.bat` or `.\build-standalone.ps1` on Windows. The build verifies `src/index.template.html`, writes `dist/index.html`, and then creates `dist/index.self-extract.html`. Runtime assets are already embedded in the HTML. Pass `-SkipSelfExtract` when the self-extracting build is not needed.

Generated HTML under `dist/` is not committed to the source package; build it locally when needed.

## License

MIT. See `THIRD_PARTY_NOTICES.md` for ONNX Runtime Web and YuNet notices.
