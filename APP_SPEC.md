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
- Mobile editing surface is shown before secondary settings.
- Japanese/English switch is available without reloading.
- Destructive clear action requires confirmation.
- Save flow reminds the user to review for missed faces.
- Status feedback is visible as a toast on small screens.
