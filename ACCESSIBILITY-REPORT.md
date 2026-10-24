# Accessibility audit and remediation report — barcoms.co.il

Date: 2026-10-24. Scope: every public page in this repository, tested on a local copy. Nothing was deployed, and no real contact form was submitted.

> **Automated scans and scripted browser checks do not establish full accessibility or legal compliance.** The site has **not** been tested with a screen reader or any other assistive technology. See [Remaining issues](#7-remaining-issues-and-checks-requiring-human-review).

## 1. Requirements basis (verified against primary sources)

| Source | What it says |
|---|---|
| תקנות שוויון זכויות לאנשים עם מוגבלות (התאמות נגישות לשירות), התשע"ג-2013, reg. 35–35ו (text read on he.wikisource) | **35א(א):** internet services must provide accessibility adjustments "לפי תקן נגישות אינטרנט … ברמה AA". **Reg. 35** defines the standard as ת"י 5568 "על חלקיו … כתיקונם מזמן לזמן". **35ה:** an accessibility statement must be displayed in a prominent place. It must describe the adjustments made, give the coordinator's details (only where a coordinator must be appointed), and give contact details for reporting accessibility problems. **35ו:** exemptions, including (ז) for an עוסק פטור or turnover ≤ ₪100,000, and (ט) a time-limited exemption for turnover ≤ ₪1,000,000. |
| Same regulations, other provisions (he.wikisource, read directly) | **34(א):** the accessibility adjustments must be published, including on the website, and **on request by phone, fax, mail, email, SMS or another digital means** (34(א)(3)). **35א(ד):** a deviation counts as a breach only if the operator was notified and did not fix it within a reasonable time, **no later than 60 days**; meanwhile alternative adjustments must be given. **91(א):** an accessibility coordinator is required only for a business that **employs 25 or more people**. **91(ה):** the coordinator's name and contact details are published as set out in reg. 34. **93(א):** the check must be done on the **form published by the Commissioner**. |
| Commission guide "נגישות אתרי אינטרנט" on gov.il (updated 16.03.2026) and its FAQ (updated 24.12.2025) | **Exemptions:** an עוסק פטור, or a business with turnover **below ₪120,000**, is fully exempt (a self-issued exemption). The regulation text on wikisource still says ₪100,000; the Commission's figure is the newer one. Turnover up to ₪1M gives a self-exemption only for a site **first operated before 26.10.2017**. A newer site with turnover above ₪120k must apply to the Commission. **FAQ:** test with at least one of JAWS, NVDA, VoiceOver or TalkBack (preferably all), and **name in the statement which screen readers the site works with**. An accessibility toolbar does not exempt a site from the standard and is not required. No accessibility mark is issued. |
| Kol Zchut, "הנגשת אתרי אינטרנט ואפליקציות לאנשים עם מוגבלות" and "פטור מחובת הנגשה…" | Summarises the above. The statement should give information about how the site is made accessible, **how to operate it**, **services that were not made accessible and alternative ways to get the information**, and contact details for accessibility problems. Sanctions: a criminal fine of about ₪150,000; up to ₪50,000 compensation without proof of damage; Commission accessibility orders (₪7,500 per day); class actions. |
| Commission website checklist "טופס בדיקות נגישות לאתר אינטרנט" (xlsx, updated 12.01.2026) | Filling it in is mandatory (reg. 93(א)). It is based on WCAG 2.0 with the SI 5568 levels, and is done per page template. It notes that items such as reading order (1.3.2) must be checked with a screen reader. |
| ת"י 5568 חלק 1, September 2023 (official PDF on gov.il, read directly) | **Replaces the May 2021 edition.** Identical to **WCAG 2.0 (11 December 2008)**, except for national changes: **1.2.1, 1.2.2, 1.2.3** move from A to **AA**. **1.2.4 and 1.2.5** move from AA to **AAA**. **2.4.10 Section Headings** moves from AAA to **AA**. **3.1.2 Language of Parts** does not apply. Digital documents are excluded; they are covered by Part 2. |

**What this means for this audit:**
- The **legal technical baseline** is WCAG 2.0 A + AA with the SI national changes, which adds 2.4.10.
- **WCAG 2.1 / 2.2 AA** is an *additional* target the client asked for. The standard does **not** require it. Criteria first introduced in 2.1/2.2 are marked "2.1+" or "2.2" in the table below.
- **Owner's information (2026-10-24):** עוסק מורשה, turnover about ₪120,000 (below ₪1M), fewer than 25 employees. So no automatic 35ו exemption applies (see section 7) and no coordinator is required. The repository's first commit is dated 2024-08-30, so if the site first went live then, it is a **"new" site** (after 26.10.2017). In that case the ₪1M existing-site exemption does not apply, and only the עוסק פטור / below-₪120,000 exemption could.
- The Commission's FAQ answer on statements asks for "פרטי רכז הנגישות שמונה על פי חוק". Under reg. 91(א), that applies only to a business with 25 or more employees.
- A vendor page (EqualWeb) claims the 2023 edition moved closer to WCAG 2.1. The official PDF does not say so; it references WCAG 2.0 only.

## 2. Pages and states tested

**Pages (7):**
- `index.html`
- `about.html`
- `phone-systems.html`
- `infrastructure.html`
- `security-cameras.html`
- `intercom.html`
- `accessibility.html` (new)
- `sitemap.html` (new; added for 2.4.5 Multiple Ways)

**Viewports:**
- Desktop 1280×720 (Playwright "Desktop Chrome")
- Mobile Pixel 7 emulation, 412×839 with touch
- 320×640 for reflow
- 320×256, equivalent to 400% zoom on 1280×1024
- 640×450, equivalent to 200% zoom

**States checked on every page:**
- Initial load
- Accessibility toolbar open
- Keyboard-shortcuts dialog open
- High contrast with the largest text size
- Contact form error state (empty and partially invalid)
- Contact form success state (mail client stubbed)
- Text-spacing override (WCAG 1.4.12)

**Additional states on specific pages or viewports:**
- Mobile menu open, on all 7 pages (mobile only)
- Each of the 3 carousel slides
- Carousel paused by the user and then hovered
- Carousel with focus inside it
- Carousel with `prefers-reduced-motion`

## 3. How it was tested

1. **Automated (axe-core 4.10 via `@axe-core/playwright`).** Tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`, `best-practice`. No rules or elements are disabled or excluded.
2. **Scripted browser checks (Playwright, local Google Chrome).** These cover:
   - Tab order walk, with checks that each focus indicator is visible, on screen and not covered
   - Skip link
   - Dialog focus trap, Escape, and focus return
   - `aria-expanded` / `aria-pressed` state
   - Form error linkage and focus
   - Carousel timing, run with a fake clock
   - Scroll width at 320 px
   - Text-spacing overrides
3. **Manual browser review.** I looked at screenshots of headless Chrome at the viewports above. I also measured caption contrast over the carousel photos with a pixel-sampling script, because axe cannot judge text over images.

## 4. Defects found and fixed

Each row lists the success criterion, the source of the requirement (SI = ת"י 5568 / WCAG 2.0; 2.1+ / 2.2 = additional target) and how the defect was found.

| # | Defect | SC | Req. | Found by | Fix |
|---|---|---|---|---|---|
| 1 | The closed accessibility toolbar was only moved off-screen. Its 11 buttons stayed in the tab order. Tabbing into it trapped focus in invisible controls. | 2.1.2, 2.4.3, 2.4.7 | SI | Tab walk | The toolbar is now `visibility:hidden` when closed. `aria-expanded`/`aria-controls` were added to the toggle. Focus returns to the toggle on close. |
| 2 | The skip link had no CSS (removed in commit 534d934). When focused it stayed at `top:-100px`, under the navbar, so it was invisible. | 2.4.1, 2.4.7 | SI | Tab walk + hit test | Restored the styles. It now appears instantly above the navbar. `<main tabindex="-1">` lets focus land on main. |
| 3 | Carousel prev/next, indicators, form fields, CTA buttons and the menu toggle had no visible focus indicator: `outline:none` with only a faint shadow. | 2.4.7 | SI | Tab walk | Added a site-wide 3px `--focus-ring` (#facc15) using `:focus-visible`. Text fields show it on any focus. |
| 4 | The carousel's pause button had lost its CSS. The prev control covered it, so it could not be clicked. | 2.2.2 | SI | Hit test | Restored the styles and gave the button a 44px target. |
| 5 | The carousel ignored the user's pause. Bootstrap restarts rotation on mouseleave and 5.5 s after any touch, including a tap on "pause". | 2.2.2 | SI | Fake-clock test (mobile) | Guarded `cycle()` in `js/site.js` so it respects the user's pause. |
| 6 | A slide containing the focused CTA rotated away under keyboard focus, and focus fell back to `<body>`. | 2.2.2, 2.4.3 | SI | Focus + timer probe | Rotation pauses on `focusin` and resumes on `focusout`. |
| 7 | The carousel ignored `prefers-reduced-motion`. Animations on captions and hover transforms also ignored it. | 2.2.2 / 2.3.3 (AAA, advisory) | SI / extra | Code review | Reduced motion now starts the carousel paused. A global media query disables animations. |
| 8 | Hero caption text over photos measured **1.5–2.9:1** on slides 2–3. | 1.4.3 | SI | Pixel sampling | Darkened the image filter from 0.5 to 0.3 and lightened the heading gradient. The worst case is now **6.26:1**. |
| 9 | White text on the hero button's cyan end measured 2.43:1. | 1.4.3 | SI | Calculation | Changed the gradient end to #0e7490, giving ≥ 4.5:1. |
| 10 | Outline buttons (#0d6efd on #020b1c) measured 4.37:1. Error text (#dc3545) measured 3.94:1. Toolbar sub-headings (#64748b) measured 3.75:1. | 1.4.3 | SI | Calculation | Changed them to #93c5fd, #fca5a5 and #94a3b8. |
| 11 | Form field borders (10% white) were invisible against the form background. | 1.4.11 | 2.1+ | Visual | The border is now 45% white, giving ≥ 3:1. |
| 12 | Form errors relied on Bootstrap colour only. The error text was not linked to its field, the error state was not exposed, nothing was announced on submit and focus stayed on the button. | 3.3.1, 1.3.1, 4.1.2 / 4.1.3 | SI / 2.1+ | Scripted test | Added `aria-describedby` to the error text and `aria-invalid` to fields. A `role="status"` summary appears on submit and focus moves to the first invalid field. The email error gives an example. |
| 13 | The form gave no success or fallback message (it uses mailto). | 3.3.1 / 4.1.3 | SI / 2.1+ | Code review | A status message now says the mail client should open, and gives the direct email and phone. |
| 14 | No `autocomplete` on name, email or phone. | 1.3.5 | 2.1+ | Code review | Added `autocomplete` to name, email and phone. Email and phone are also set to `dir="ltr"`. |
| 15 | The text-size control changed `body` font-size in px. Bootstrap uses rem, so most text did not grow. | (widget function) | — | Scripted test | The control now scales `<html>` (87.5 / 125 / 150%). |
| 16 | High contrast mode made gradient-clipped headings invisible (transparent text fill). | 1.4.3 (in the mode) | — | Screenshot | `-webkit-text-fill-color: currentColor` in high contrast. The same fix is applied under `forced-colors`. |
| 17 | Alt shortcuts used `e.key`, which macOS Option changes (Option+A gives "å"), so the shortcuts never fired on Mac. Alt+C did not save state. | 2.1.1 (widget) | SI | Code review | Shortcuts now use `e.code`. Toggle state is saved. |
| 18 | Toolbar toggles exposed state only by colour. Dialog titles were not headings that the dialog's name pointed to. The `<h4>` headings broke the hierarchy. The shortcuts dialog was not modal and Escape did nothing. | 4.1.2, 1.3.1, 2.1.1 | SI | Code review + tests | Added `aria-pressed`, `aria-labelledby` and `aria-modal`, made the dialog headings real `h2`/`h3`, and added a focus trap, Escape handling and focus return. |
| 19 | Heading order: the footer used `h4`/`h5` directly after `h2` (axe `heading-order`, all 5 service pages). The home page had **three `h1`s**, one per slide. | 1.3.1, 2.4.6, **2.4.10** | SI (2.4.10 is AA in SI) | axe + structure test | Footer headings are now `h2`/`h3`. The home page has one `h1` and the slides use `h2`. |
| 20 | Slides were not exposed as slides. | 1.3.1 | SI | Code review | Added `role="group"`, `aria-roledescription="שקופית"` and `aria-label="N מתוך 3"`. |
| 21 | Image alternatives didn't match the images. The abstract light-trail photo was described as a "team" or "network" photo, and the phone photo as "cables" or "cameras". | 1.1.1 | SI | Image review | The light-trail photo now has `alt=""` because it's decorative. The phone and server-rack photos have accurate descriptions. The logo link is now named "…לדף הבית". |
| 22 | The H1 on every inner page sat under the fixed navbar and was visually hidden. | 1.4.10 / 2.4.11 | SI / 2.2 | Screenshot | Inner pages now start below the navbar. `scroll-padding` keeps focused elements clear of the bars. |
| 23 | At 320×256 (400% zoom), the opened mobile menu ran past the viewport and couldn't be scrolled. The toolbar was clipped. The floating button covered menu items and the toolbar. | 1.4.10, 2.4.11 | SI / 2.2 | Screenshot + test | Added a scrollable collapse with `max-height`. The toggle moved to the bottom corner and the toolbar fits above it. |
| 24 | At short heights, the hero caption overflowed and its heading hid under the navbar. | 1.4.10 | SI | Screenshot | On viewports ≤ 560px high, the slide height now follows its content. |
| 25 | A redundant `aria-label` on the "שלחו פנייה" mailto links hid the "(יפתח תוכנית דוא"ל)" hint. Home nav "ראשי" pointed to `#`. | 2.4.4 | SI | Code review | Removed the `aria-label`, which also fixes the name for 2.5.3. "ראשי" now points to `index.html`. |
| 26 | Carousel indicators were 3px tall, so their target was smaller than 24px. | 2.5.8 | 2.2 | Code review | Indicators now have a 24px-tall hit area. |
| 27 | There was no accessibility statement. | Reg. 35ה | Legal | — | Added `accessibility.html` in Hebrew. It's linked from every footer, from the toolbar and from `sitemap.xml`. |
| 28 | Each page could be reached only from the navbar. There was no second way, such as a site map or search. | 2.4.5 | SI | Official checklist review | Added `sitemap.html`, linked from every footer. The "\|" separator between the footer links is `aria-hidden`. A test checks that the site map links to every page. |
| 29 | The statement did not explain how to operate the site, or the alternative ways to get service and information (reg. 34, Kol Zchut summary). | Reg. 34, 35ה | Legal | Legal review | Added the sections "איך משתמשים באתר" and "דרכים חלופיות לקבלת שירות ומידע". Owner notes in HTML comments cover reg. 91 (coordinator), 35א(ד) (60 days) and screen-reader testing. |

Other refactors:
- The contact-form and carousel scripts were duplicated inline on all six pages. They are now in a single shared file, `js/site.js`.
- `alert()` was replaced with an `aria-live` announcement.

## 5. Test commands and results

```bash
npm install                 # installs @playwright/test, @axe-core/playwright, http-server (dev only)
npx playwright test         # starts http-server on :4173, runs desktop + mobile projects
npx playwright test tests/axe.spec.js            # axe scans only
npx playwright test -g "contact form"            # one area
PW_CHANNEL= npx playwright test                  # use Playwright's bundled Chromium instead of local Chrome (requires: npx playwright install chromium)
```

The repo had no build step and no tests before this work, so "build" means the static files served as they are.

**Final run, after remediation:** `npx playwright test` → **280 passed, 8 skipped, 0 failed (≈1.6 min).** It passed on three consecutive full runs. The 8 skipped tests are the mobile-menu tests in the desktop project, where the menu is not collapsed.

**After the legal review (site map + statement update):** the suite covers 8 pages, 328 tests in total. `npx playwright test` → **319 passed, 9 skipped, 0 failed (≈1.9 min).** Both changed pages pass the W3C Nu HTML Checker with no errors.

One full run before the last test change had a single intermittent failure, in the mobile-menu test: it measured link positions while Bootstrap's open animation was still running. The test now waits for the animation to finish. It then passed 36 times when run on its own, including 30 runs in parallel, and on every later full run.

**Baseline:** the same suite, run against the original `HEAD` files (with the new statement page copied in), gives **50 passed / 230 failed.** So the tests detect the original defects instead of passing vacuously. The baseline axe "on load" scan reported only `heading-order`. Almost every defect above was found by the browser checks, not by axe.

## 6. Official checklist

`docs/accessibility-checklist.xlsx` is the Commission's website checklist (downloaded from gov.il), filled in from this audit. Column F holds the result and column I holds notes. Every page shares one template, so the checklist is filled in once for the template. Items that need a screen reader (1.3.2, 4.1.2) are marked "תקין" for the code, and the note says the screen-reader check is still pending. **Update the checklist once human / screen-reader testing has been done.**

## 7. Remaining issues and checks requiring human review

**Owner must supply or confirm before publishing the statement:**
- ~~Accessibility coordinator~~ **Resolved (owner, 2026-10-24):** fewer than 25 employees, so no coordinator is required (reg. 91(א)) and the statement needs no coordinator details (reg. 35ה). Revisit this if headcount reaches 25.
- **Exemption: resolved (owner, 2026-10-24). None applies, and none is claimed.** The business is an עוסק מורשה with average turnover of about ₪120,000, below ₪1M.
  - The full exemption (35ו(ז)) covers only an עוסק פטור or turnover below ₪120,000 (the Commission's figure; the regulation text says ₪100,000). It does not apply unless the exact 3-year average is below that line.
  - The ₪1M exemption (35ו(ט)) covers only a site first operated before 26.10.2017. The repository starts in August 2024, so it is treated as a new site.
  - A new site with turnover above ₪120,000 can only apply to the Commission for an exemption.
  - So the site must meet SI 5568 AA, which is what this remediation targets.
- Physical-service accessibility (reg. 34): if customers are received at any premises, or installations are done on site, the accessibility of that service should be published. None was invented.
- Whether to commit to a response time for accessibility reports. The legal ceiling for fixing a reported defect is 60 days (35א(ד)).
- **Screen-reader testing.** The Commission's FAQ asks for testing with at least one of JAWS, NVDA, VoiceOver or TalkBack, and for the statement to name them. Until that is done, the statement says no screen-reader testing has been done.
- The statement date, kept up to date on each change.
- Any physical-premises accessibility information. I added none and invented none.

**Requires human / assistive-technology testing (not performed):**
- Screen readers: NVDA + Firefox/Chrome, JAWS, VoiceOver (macOS and iOS), TalkBack (Android). Hebrew pronunciation, the reading order of the RTL layout, slide announcements, and how form errors are announced all need checking.
- Real browser zoom at 200% and 400% on a desktop screen. I emulated these with the viewport size; real zoom can behave differently.
- Windows High Contrast / forced-colors mode. CSS was added but not verified on Windows.
- Speech input (Voice Control, Dragon), switch access, and real mobile devices (iOS Safari, Android Chrome).
- Firefox and Safari. I tested only Chromium/Chrome.
- Cognitive and readability review of the Hebrew content.

**Known limitations and design decisions:**
- **The toolbar is optional.** The floating toolbar is a convenience. The site is designed to be accessible without it, and its features don't replace the fixes above.
- **Text-to-speech depends on the browser.** It uses `speechSynthesis`, and some browsers have no Hebrew voice.
- **The contact form opens the mail client.** It hands the message to the visitor's email program (`mailto:`) instead of sending it. This is stated in the form's status message and in the accessibility statement.
- **Third-party assets weren't audited.** Bootstrap 5.0.2 and Google Fonts load from CDNs.
- **The images are generic stock photos.** The owner may want photos that match each service. The alt text describes what is actually shown.
- **Hidden-text check needs a human.** Text inside the carousel's three slides is all in the DOM, and hidden slides are `display:none` in Bootstrap. A screen-reader pass should confirm that only the active slide is read.
