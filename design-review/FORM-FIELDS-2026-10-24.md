# Shared form-field corrections — 24 October 2026

User confirmed +91-8457125489 is also the WhatsApp number. Contact and footer now link to https://wa.me/918457125489, without sending a message.

The reported country-code/input mismatch came from legacy theme-wide input styles: a 14px bottom margin enlarged the flex wrapper while leaving the input shorter. Contact fields also used different grid row counts and stretched rows, putting adjacent fields out of alignment.

`web/form-fields.css`, loaded last, resets inherited margins on the modern customer surfaces, constrains fields within their containers, preserves select-arrow space, and uses readable mobile control text. Country codes and inputs share consistent borders and focus states. The Contact helper renders hint text after its control; fields align at the start rather than stretching to match unrelated hint/error rows. Labels, hint/error associations, native types and validation behaviour are retained.

Verification used a separate disposable local server/database on port 4186, without modifying records in the normal preview:

- 152 route/viewport/theme combinations covering 442 visible fields passed geometry, margin, label, select-padding and mobile checks.
- Variant A checked at 1440, 768, 390 and 320px: Contact, Help, Learn/search, guide, Reports, Shop, Search, product forms, sign-in/OTP, Settings, bag, checkout and signed-in addresses/profile/preferences.
- B–H checked at 1440 and 390px on shared form surfaces.
- Contact mobile/email tops and overall heights match. Country-code and input edges match.
- Contact/sign-in invalid-value feedback, focus indication, typed-value retention and global Search passed at 1440 and 390px.
- Corrected Contact and mobile address layouts visually inspected. JavaScript syntax, diff checks and hosted-preview checks passed. Static export rebuilt; no deployment.

Local scripts, results and screenshots: `.local/forms-20261024/` (ignored by Git).
