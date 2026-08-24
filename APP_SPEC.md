# App specification

- **Name:** Face Redactor / 顔ぼかし
- **Version:** 1.0
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
