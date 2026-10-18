# GreenLoop Melbourne WCAG 2.1 AA Accessibility Audit

Date: 18 October 2026

Scope: all registered routes, with focused browser and source review of Login, Register, navigation, Accessibility Preferences, Recycling Analytics, Admin Dashboard, Offline Guide, Impact Calculator, data tables, Share Email, Recycling Location Finder, and shared forms/cards.

This review targets WCAG 2.1 Level A and AA. Automated checks can identify only a subset of accessibility problems, so a passing axe result is not a claim of complete WCAG conformance.

## Issues and remediation

| Area and issue | WCAG 2.1 criterion | Fix | Verification evidence |
| --- | --- | --- | --- |
| Keyboard users had no direct way to bypass the repeated navbar. | 2.4.1 Bypass Blocks (A) | Added a visible-on-focus “Skip to main content” link and a stable `main` target. | Verified in the local browser: first Tab focuses the skip link and Enter moves focus to `main`. |
| Route changes did not move focus to the newly displayed page. | 2.4.3 Focus Order (A) | The application shell now focuses the main landmark after route navigation without adding it to the normal tab order. | Source inspection; manual SPA navigation test required. |
| Focus visibility depended on Bootstrap defaults and varied by component/background. | 2.4.7 Focus Visible (AA), 1.4.11 Non-text Contrast (AA) | Added a consistent two-colour focus indicator: a white inner outline and dark-green outer ring, visible on both green and light surfaces. | CSS inspection; manual browser contrast/keyboard test still required. |
| Default Bootstrap dark-navbar links could render as translucent white with insufficient contrast. | 1.4.3 Contrast (Minimum) (AA) | Navbar links now use opaque white and retain an underline on hover/focus. | CSS inspection; final rendered contrast should be checked in target browsers. |
| Authentication promotional copy used translucent white over a varying green gradient. | 1.4.3 Contrast (Minimum) (AA) | Removed translucent text and darkened the lightest gradient colour while preserving the GreenLoop palette. | CSS inspection; automated colour checks are not reliable in jsdom. |
| Rating stars used low-contrast gold on white. | 1.4.3 Contrast (Minimum) (AA), 1.4.11 Non-text Contrast (AA) | Replaced the gold with darker amber colours; rating state remains exposed with `aria-pressed` and accessible button names. | Source inspection and axe component scan. |
| Several card titles used `h2` even though they were children of page-section `h2` headings. | 1.3.1 Info and Relationships (A), 2.4.6 Headings and Labels (AA) | Recycling, resource, and rating card headings now use semantic `h3` elements while preserving visual sizing. | Source inspection and axe heading checks. |
| Field error IDs were referenced even when no error element existed, and errors were not consistently announced. | 1.3.1 Info and Relationships (A), 3.3.1 Error Identification (A), 3.3.2 Labels or Instructions (A), 4.1.3 Status Messages (AA) | Login, registration, event registration, and email-sharing fields now conditionally associate help/error text, expose `aria-invalid`, and announce errors. Help text remains associated at all times. | axe scans for Login, Register, and Share Email; manual screen-reader test required for timing. |
| Submitting an invalid form left keyboard focus at the submit button. | 2.4.3 Focus Order (A), 3.3.1 Error Identification (A) | Invalid submissions move focus to the first invalid input or checkbox group. | Source inspection; keyboard test required for each validation path. |
| Loading controls did not consistently expose busy state. | 4.1.2 Name, Role, Value (A), 4.1.3 Status Messages (AA) | Forms and geolocation/routing/social-login controls expose `aria-busy`, retain descriptive button text, and disable duplicate submission. | axe scans plus source inspection. |
| Filter result counts, table pagination, sorting, selection counts, and route results were not consistently announced. | 4.1.3 Status Messages (AA) | Added polite status regions for changing counts, current page, sort direction, selected-item totals, location success, and routing results. Errors use assertive alerts. | axe scans and source inspection; live screen-reader timing requires manual testing. |
| Sort controls relied partly on symbols and did not provide an explicit action name. | 1.3.1 Info and Relationships (A), 2.1.1 Keyboard (A), 4.1.2 Name, Role, Value (A) | Sort buttons now have action-specific accessible names, headers retain `aria-sort`, and a live region reports the applied sort. | Interactive table axe scan and keyboard-operable native buttons. |
| Wide data tables required horizontal scrolling without an explicit keyboard-scrollable region. | 1.4.10 Reflow (AA), 2.1.1 Keyboard (A) | Each responsive table wrapper is now a labelled, focusable region so keyboard users can scroll it at narrow widths or high zoom. | axe scan; manual 320px/200% scrolling test required. |
| The map’s markers are pointer-oriented and Leaflet is a third-party widget. | 1.1.1 Non-text Content (A), 2.1.1 Keyboard (A), 2.4.6 Headings and Labels (AA) | Added map instructions for assistive technology. Every location, selection action, accepted-material list, source link, geolocation action, route action, distance and duration is also available in normal keyboard-accessible HTML outside the map. | Location Finder axe scan uses the text-equivalent interface; real Leaflet keyboard testing remains required. |
| A newly opened event form was scrolled into view but did not receive focus. | 2.4.3 Focus Order (A) | The registration section receives programmatic focus after opening, and smooth scrolling respects reduced-motion preference. | Source inspection; keyboard test required. |
| Small-screen spacing and result-header wrapping could cause avoidable crowding. | 1.4.10 Reflow (AA) | Reduced mobile section padding, allowed result headers to wrap, retained Bootstrap responsive grids, and kept tables in labelled horizontal-scroll regions. | Login was checked at a 320 CSS-pixel viewport with no document-level horizontal overflow. Authenticated pages and 200% zoom still require manual checks. |
| Opening Accessibility Preferences left the application and an open Account menu keyboard-accessible behind the modal. | 2.1.1 Keyboard (A), 2.4.3 Focus Order (A), 4.1.2 Name, Role, Value (A) | After focus enters the teleported dialog, the `#app` root is made `inert` and removed from the accessibility tree. Closing removes both states before restoring focus to the opener. Reset remains inside the modal. | New regression test verifies inert/`aria-hidden`, dialog focus, restoration, persistence, Escape and Save behaviour. |
| Canvas charts did not all expose equivalent live data. | 1.1.1 Non-text Content (A), 1.3.1 Info and Relationships (A) | Firestore rating and admin role charts now include concise text alternatives plus semantic data tables; existing analytics and impact charts retain numerical summaries. | Source review and component/business-logic tests; screen-reader timing remains manual. |
| Event registration buttons referenced a conditional form that was absent from the accessibility tree. | 4.1.2 Name, Role, Value (A) | Removed the premature `aria-controls` relationship. Buttons retain event-specific accessible names and the created registration region receives focus. Past events are labelled and their controls are disabled. | Expanded axe scan for Community Events passes; event-expiry tests cover past, current-day and future dates. |

## Automated verification

- `axe-core` is run through Vitest and Vue Test Utils against:
  - Login
  - Register
  - AppNavbar
  - InteractiveDataTable
  - ShareEmailView
  - the keyboard-accessible text interface surrounding the map
- The test configuration checks rules tagged WCAG 2 A and AA.
- Colour contrast is disabled in the jsdom axe run because jsdom does not calculate rendered colours and layout reliably. Contrast therefore remains a manual verification item.
- Existing Haversine, filtering, sorting, and OSRM response tests continue to run before axe tests.
- Current run on 18 October 2026: 20 Node tests and 54 Vitest tests passed. Axe coverage now also includes Community Events and the administrator dashboard. The axe suite remains a jsdom component check, not a substitute for a rendered-browser audit.

## Rendered-browser evidence (18 October 2026)

- The production build was served locally and inspected in the available in-app Chromium surface at `1280px` wide.
- The Login page exposed a `main` landmark, skip link, labelled email/password fields, native buttons, an accessible social-login name, Register link, navbar and Guide launcher in the browser accessibility tree.
- A rendered screenshot confirmed that the form, illustration and actions were not clipped at that viewport.
- The available automation surface did not provide script injection, viewport emulation, zoom controls or an authenticated Firebase session. Consequently, real-browser axe, dark/high-contrast, 320px, 200% zoom, protected-route and admin checks were **not** performed and are not claimed.

## Remaining manual checks

The following must be completed before claiming WCAG 2.1 AA conformance:

1. Test complete workflows with current VoiceOver/Safari and NVDA/Firefox or NVDA/Chrome, including Firebase and Google popup errors.
2. Keyboard-test every page, Bootstrap mobile menu, Leaflet zoom controls/popups, rating buttons, modal-style Google popup return focus, table scrolling, and validation recovery.
3. Verify every foreground/background and focus-indicator state with a browser contrast analyser, including Bootstrap disabled, hover, active, alert, badge, and Leaflet-generated styles.
4. Test every route at a 320 CSS-pixel viewport and at 200% browser zoom in normal, dark, high-contrast and Extra Large Text combinations. Confirm no two-dimensional scrolling except intentionally scrollable tables and the map.
5. Check browser text-spacing overrides against WCAG 1.4.12 and confirm no clipping.
6. Confirm route changes and dynamic status messages are announced once, in a useful order, across supported screen readers.
7. Test geolocation permission denied/unavailable/timeout and OSRM failure states with assistive technology.
8. Re-run axe against the deployed HTTPS application. Local component tests stub network-dependent map and Firebase behaviour and cannot validate third-party popup or map DOM completely.

## Commands

```sh
npm test
npm run build
```
