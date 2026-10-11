# App specification

- **Name:** Face Redactor / 顔ぼかし
- **Version:** 1.0.3
- **Primary artifact:** `dist/index.html`
- **Runtime model:** fully client-side; no application-server upload
- **Network policy:** `connect-src 'none'`
- **Supported input:** JPEG, PNG, WebP, and preview-only video input
- **Supported image export:** JPEG, PNG, WebP
- **Core requirement:** automatic detection must always be presented as fallible; manual masks remain available.

## UX rules

- Light theme only.
- The workflow is presented as four steps: Add media → Find faces → Edit → Review & save.
- Common editing actions live beside the canvas; duplicate effect controls are not shown in the header or side panels.
- Face detection exposes simple face-size and confidence presets first; numeric/NMS controls remain under Advanced settings.
- The right pane is dedicated to reviewing faces and masks.
- Mobile editing surface is shown before secondary settings, with four primary bottom-bar actions and overflow for Redo / Share / Clear.
- Japanese/English switch is available without reloading.
- Destructive clear action requires confirmation.
- Save requires an explicit whole-image review acknowledgement before export.
- Status feedback is visible as a toast on small screens.

## Header normalization (1.0.1)

- The language button shows EN in Japanese and JA in English. Its title and accessible name describe the destination in the current UI language.
- Help retains its localized title and accessible name; the header version matches the app configuration.

## Responsive Help, Clear and Save overlays

Help and Clear session sit above the header and mobile actions, isolate the background with its prior inert and scroll-lock states restored afterward, confine Tab/Shift+Tab, and dismiss on Escape or a direct backdrop press. Help returns to its trigger; Clear returns to the current visible More trigger when its closed-menu item cannot receive focus. Newer modal ownership suppresses stale focus return. The narrow header keeps the version visible.

Save shares the same focus, background-isolation and dismissal lifecycle, returning to the visible export trigger or a visible fallback. Its title and actions stay outside a viewport-bounded scrolling body so review and output settings remain reachable at high zoom. The explicit whole-image acknowledgement and filename, format, quality and scale controls are preserved.

Each render starts from a cleared canvas before the source and masks are redrawn. Repeated previews, size estimates and exports preserve unmasked source transparency without accumulating old mask paint.
