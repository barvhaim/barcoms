# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static marketing site for "בר התקנות תקשורת" (Bar Communications Installations), served at https://barcoms.co.il (see `CNAME`; GitHub Pages). Plain HTML/CSS/JS with no build step. Node is used only for the accessibility test suite.

- `npm install`, then `npx playwright test`. This starts `http-server` on :4173 and runs the desktop and mobile projects with the local Google Chrome. Set `PW_CHANNEL=` to use the bundled Chromium instead.
- To run one area: `npx playwright test -g "contact form"`. To run axe only: `npx playwright test tests/axe.spec.js`.
- To preview: `npm run serve`.
- `tests/pages.js` lists every public page. Add new pages there.
- `ACCESSIBILITY-REPORT.md` records the SI 5568 / WCAG audit and the items still open.

## Architecture

- **Pages are standalone and duplicated.** Each of the seven top-level `.html` files (`index`, `about`, `phone-systems`, `infrastructure`, `security-cameras`, `intercom`, `accessibility`) has its own full copy of the `<head>`, the navbar and the footer. The `<head>` holds the SEO meta, Open Graph, canonical URL and JSON-LD. The footer holds the contact form and the accessibility-statement link. There are no templates or includes — a change to shared markup (nav links, phone/email, footer, form) must be applied to every page by hand. Copies are not byte-identical (e.g. some footers carry `itemprop`/schema.org microdata), so edit each file rather than blindly copy-pasting.
- **Navigation:** each page marks its own nav item with `nav-link active` + `aria-current="page"` (`accessibility.html` marks its footer link instead).
- **Shared behaviour** lives in `js/site.js`, which every page loads. It handles the contact form and the home carousel.
- **Contact form:** has no backend. It validates, sets `aria-invalid`, writes to `#contactFormStatus` (`role="status"`) and moves focus to the first invalid field. It then passes a `mailto:` URL to `window.barcomsContact.send`, which tests stub so no mail client opens.
- **Carousel:** wraps Bootstrap's `cycle()` so a user pause, focus inside the carousel, or `prefers-reduced-motion` keeps it stopped. This matters for WCAG 2.2.2, so don't revert it to `data-bs-ride`.
- **Hebrew / RTL:** every page is `<html lang="he" dir="rtl">` and uses the RTL Bootstrap build (`bootstrap.rtl.min.css` 5.0.2 from jsDelivr with SRI hashes) plus `bootstrap.bundle.min.js`. All user-facing text, `alt`, `aria-label`, and `title` strings are in Hebrew.
- **Styling:** `css/style.css` is a single dark "telecom" theme layered on top of Bootstrap, driven by CSS custom properties in `:root` (colors, gradients, glassmorphism, fonts Heebo/Assistant, radii, glows). It also contains the styles for the accessibility widget (`.accessibility-toggle`, `.accessibility-toolbar`, `.high-contrast`, `.enhanced-focus`, `font-*` body classes).
- **Accessibility widget:** `js/accessibility.js` (loaded on every page) injects a floating button and toolbar at runtime via the `AccessibilityTools` class — font sizing, high contrast, enhanced focus, text-to-speech, and Alt-key shortcuts (Alt+A toolbar, Alt+M main content, Alt+±, Alt+C, Alt+S/X). Preferences persist in `localStorage` under `accessibilityPreferences`. Pages must keep `<main id="main-content" tabindex="-1">` and the skip link for it to work. The closed toolbar uses `visibility:hidden` so it stays out of the tab order.

## Accessibility constraints

- **Legal baseline:** ת"י 5568 Part 1 (2023) at AA, which is WCAG 2.0 plus national changes, as required by reg. 35א. WCAG 2.2 AA is an extra target.
- **Statement page:** `accessibility.html` is the statement required by reg. 35ה. Don't add an accessibility coordinator, an exemption or a compliance claim unless the owner confirms it.
- **Focus styling:** uses `--focus-ring`. Don't add `outline: none` without a replacement.
- **Text over carousel photos:** contrast depends on the image `brightness()` filter. axe can't check text over images, so re-measure if you change the filter or the photos.

## SEO files

When adding, renaming, or removing a page, update `sitemap.xml` (and its `lastmod` dates), the page's canonical/`og:url`, and the navbar on all pages. `robots.txt` points to the sitemap.
