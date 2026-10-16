# F.1 Extended Innovations Report

## Introduction and selection rationale

GreenLoop Melbourne already provides authentication, role-based access, ratings, interactive tables, CSV export, email sharing and a map. The four F.1 innovations were therefore selected to add distinct value rather than repeat D.1–D.4 or E.1–E.4:

1. an analytics view of the application's recycling-guide content;
2. a persistent, personal recycling workflow;
3. a transparent environmental-impact learning tool; and
4. an installable, deliberately privacy-conscious offline experience.

No project rubric text was available in the repository. The mapping below is limited to the supplied F.1 requirement for substantial, independent and demonstrable innovations; it does not claim marks or criteria that could not be verified.

## Innovation 1 — Interactive Recycling Analytics Dashboard

### Background and implementation

`AnalyticsView.vue` uses Chart.js through `vue-chartjs` to render a bar chart of guide entries by category and a doughnut chart of disposal pathways. Category checkboxes update both charts, the visible record count, and an accessible HTML summary. The calculations are isolated in `src/utils/analytics.js` and tested independently.

The source is GreenLoop's bundled `src/data/recyclingItems.js` dataset. At implementation time it contains eight educational entries. This is application-content analytics only. It is not a sample of household behaviour, tonnage or recycling performance, and it must not be interpreted as Melbourne-wide statistics.

Chart.js renders charts on `canvas`, so each chart has an accessible text alternative and the same values are exposed in a semantic HTML table. This follows Chart.js guidance that authors must provide accessibility content themselves.

### User benefit and limitations

Users can quickly inspect what guidance the application covers and identify content gaps. The dashboard is interactive and responsive, but its conclusions are restricted to the small demonstration dataset. A future version would require an appropriately governed and documented public dataset before presenting municipal trends.

## Innovation 2 — Personalised Recycling Favourites

### Background and implementation

`FavouritesView.vue` lets an authenticated user save or remove guide items. `src/utils/favourites.js` stores one document per favourite at:

`users/{uid}/favourites/{itemId}`

The page subscribes with a Firestore snapshot listener, so saved state is restored from the user's account and updates without a page refresh. Loading, empty, success and error states are visible and announced. The implementation uses Firebase Authentication only for identity; it does not use an email address or client-side role as authorization evidence.

`firestore.rules` contains the complete retrieved-and-merged ruleset, including the owner-only favourites rule and the existing user, administrator and rating protections. It is wired into `firebase.json` for an explicit rules-only deployment but has not been deployed.

### User benefit and limitations

The feature provides a simple personal shortlist that follows the authenticated user across sessions and devices. It requires network access and a published owner-only rule. The service worker does not cache Firestore responses or private favourite data.

## Innovation 3 — Environmental Impact Calculator

### Background and implementation

The calculator accepts a material and weight in kilograms and validates finite positive input up to 10,000 kg. It now supports the EPA mixed-recyclables comparison plus four precisely defined WARM Version 16 material categories: **Aluminum Cans**, **Glass**, **Corrugated Containers**, and **PET**. The interface labels these for Australian users as aluminium cans, glass containers, corrugated cardboard and PET plastic bottles. It does not treat these factors as applicable to ceramics, non-corrugated paperboard or unidentified/mixed plastics.

For individual materials, the application uses the recycling factors in WARM Version 16 Exhibit 2-2 and the default US national-average landfill factors in Exhibit 6-18 (metric tonnes CO2e per US short ton):

| GreenLoop material | WARM material | Recycling | Landfill | Avoided (landfill − recycling) |
| --- | --- | ---: | ---: | ---: |
| Aluminium cans | Aluminum Cans | -9.13 | 0.02 | 9.15 |
| Glass containers | Glass | -0.28 | 0.02 | 0.30 |
| Corrugated cardboard | Corrugated Containers | -3.14 | 0.18 | 3.32 |
| PET plastic bottles | PET | -1.04 | 0.02 | 1.06 |

WARM instructs users to compare management pathways: the avoided result is the default landfill factor minus the recycling factor. Parenthesised values in the EPA tables are negative; these represent net reductions or credits, not zero emissions. The application converts one US short ton as 907.18474 kg and one metric tonne CO2e as 1,000 kg CO2e:

`weight kg × [(landfill MTCO2e/short ton − recycling MTCO2e/short ton) × 1,000 / 907.18474]`

The separate EPA equivalencies-calculator mixed-recyclables factor remains 2.83 metric tonnes CO2e avoided per US short ton recycled instead of landfilled. It is converted as follows:

`2.83 × (1000 kg / 907.18474 kg) = 3.1195 kg CO2e avoided per kg`

The displayed result is:

`weight in kg × 3.1195 = indicative kg CO2e avoided`

For the four individual materials, an accessible Chart.js bar chart compares the calculated recycling and landfill net emissions. A semantic table exposes the same values without relying on canvas or colour. Mixed recyclables displays its published avoided-emissions result but not a fabricated pathway chart because the cited equivalencies source publishes the comparison factor rather than the component values used by this interface. Other or unidentified plastic remains explicitly unavailable.

### User benefit and limitations

The calculator turns documented lifecycle comparisons into an interactive learning exercise while exposing factors, formula, units, material definitions and assumptions. WARM is a US national-average model from the point of waste generation, including assumptions about recovery, manufacturing, landfill gas and energy systems. The result is not a Melbourne-specific carbon-accounting tool, must not support formal reporting, and does not predict an individual's actual impact. Local contamination, transport, facilities, energy mix and recovery rates may materially change outcomes.

## Innovation 4 — Offline Recycling Guide / PWA

### Background and implementation

`vite-plugin-pwa` generates a web app manifest and Workbox service worker during a production build. The manifest supplies application metadata plus 192×192, 512×512 and scalable icons. The service worker precaches the application shell and bundled static files, allowing previously visited static guidance to be reopened after a successful online load. `NetworkStatus.vue` listens for browser `online` and `offline` events and announces state changes.

Runtime API caching is deliberately disabled. Firebase Authentication/profile restoration, Firestore favourites and ratings, administrator data, Cloud Functions/SendGrid, OpenStreetMap tiles and OSRM route responses require connectivity. Authentication tokens, personal records, email requests, map tiles and route responses are not added to the Workbox runtime cache.

Installability and service workers require a production build served over HTTPS, or `localhost` during development/preview. The development service worker is disabled to avoid stale-cache surprises while coding.

### User benefit and limitations

Core static sustainability guidance remains useful through intermittent connectivity, and users receive clear connection feedback. First load, authentication-dependent operations and live external services still require the internet. Browser install prompts and offline behaviour vary, so they need manual browser/device verification.

## Technologies and integration

- Vue 3 Composition API and Vue Router for views, state and protected routes.
- Bootstrap 5 for responsive cards, forms and navigation.
- Chart.js and `vue-chartjs` for charts.
- Firebase Authentication and Cloud Firestore for user-scoped favourites.
- `vite-plugin-pwa` and Workbox for the manifest, install assets and static precache.
- Node's built-in test runner plus the project's existing Vitest/axe accessibility suite.

All four routes use the existing `requiresAuth` navigation guard and appear under an **Innovations** navigation menu. Existing authentication, role checks, email sharing, ratings, tables, CSV export and map routes were retained.

## Security and privacy review

- Favourite document paths are derived from the authenticated Firebase UID.
- The merged rules allow only the path owner to read, create, update or delete favourites and restrict written fields and types.
- The checked-in file retains the complete rules retrieved from Firebase before adding the favourites match block.
- No secret, API key or `.env` value was added.
- The PWA has no runtime caching rule for Firebase or other remote APIs.
- Numerical environmental claims are limited to one cited factor and clearly qualified.

## Testing evidence

Automated verification performed on 16 October 2026:

- `npm test`: 15 tests passed in total — nine Node tests (including four F.1 analytics/calculator tests and five existing map tests) and six existing Vitest/axe accessibility tests.
- `npm run build`: passed with Vite 8.2.2; 105 modules transformed. The PWA build generated `manifest.webmanifest`, `sw.js` and Workbox support code, with nine precache entries.
- Generated-manifest inspection confirmed the 192×192, 512×512 and SVG icons.
- Generated service-worker inspection found no configured Firebase, SendGrid, OpenStreetMap or OSRM runtime URLs.

The build reports a non-fatal large JavaScript chunk warning. This is a performance-improvement opportunity, not a compilation failure. `npm audit --omit=dev` reported seven high-severity findings in the production dependency tree (`@grpc/grpc-js` through Firebase/Firestore, `@vue/server-renderer`, and `source-map-js`). The suggested complete audit remediation would force a breaking Firebase downgrade, so no automated rewrite was applied; dependency upgrades must be reviewed and regression-tested separately.

### Manual verification still required

1. Review and publish the merged rules in a non-production review workflow, then verify two separate Firebase users cannot read or write each other's favourites.
2. Sign in, save favourites, sign out/in and confirm restoration from Firestore.
3. Test chart controls and summaries with keyboard and screen-reader software.
4. Serve `dist` on localhost or HTTPS, install the PWA, load Recycling Guide/Resources/Analytics once, switch the browser offline, and verify cached static navigation.
5. Confirm Firebase, ratings, favourites, email, map tiles and routing show their expected offline failures rather than stale private data.
6. Test install/offline behaviour on the target Chrome/Edge/Safari device set; an automated build cannot prove browser install prompts.

## Screenshot placeholders

These are intentionally placeholders. Genuine screenshots must be captured from the running application and must not be replaced by fabricated images.

- **Screenshot 1:** `[Insert genuine Analytics Dashboard screenshot with active category filters]`
- **Screenshot 2:** `[Insert genuine Favourites screenshot showing saved and unsaved items]`
- **Screenshot 3:** `[Insert genuine Impact Calculator screenshot showing formula and result]`
- **Screenshot 4:** `[Insert genuine installed/offline PWA screenshot with offline status]`

## F.1 requirement mapping

| F.1 evidence requested | Implemented evidence |
| --- | --- |
| Four independent innovations | Analytics, personal favourites, impact calculator and offline/PWA functionality have separate routes, logic and user outcomes. |
| Substantial technical implementation | Chart rendering/filtering, realtime user-scoped Firestore persistence, sourced numerical calculation/validation, and manifest/service-worker generation. |
| Demonstrable behaviour | Each innovation has a defined demonstration sequence below and visible loading/result/error or status output. |
| Testing | Business-logic tests, existing automated accessibility tests, production build verification and documented manual checks. |
| Research documentation | Sources, formula, scope, privacy decisions and limitations are documented in this report and the relevant UI. |

## Demonstration sequence

1. **Analytics:** open **Innovations → Analytics**, toggle categories, compare the changing charts, result count and accessible summary table, then explain the eight-entry dataset disclaimer.
2. **Favourites:** open **My GreenLoop → My Favourites**, save two items, remove one, refresh and sign out/in to demonstrate Firestore persistence after the merged rule has been reviewed and published.
3. **Impact:** open **Insights → Environmental Impact Calculator**, enter 10 kg for aluminium cans, glass, corrugated cardboard and PET bottles; compare the chart and accessible table; show the formula/source; try zero and over 10,000 kg; then choose other/unidentified plastic to demonstrate that unsupported estimates are not invented.
4. **Offline/PWA:** run a production preview on localhost, install GreenLoop, visit the static guidance pages once, use browser DevTools to go offline, show the connection banner and reopen cached static guidance. Then demonstrate that live Firebase/email/map operations are correctly described as internet-dependent.

## References

- Chart.js. *Accessibility*. https://www.chartjs.org/docs/latest/general/accessibility.html
- Chart.js. *Responsive Charts*. https://www.chartjs.org/docs/latest/configuration/responsive.html
- Firebase. *Securely validate data*. https://firebase.google.com/docs/firestore/security/rules-fields
- Firebase. *Writing conditions for Cloud Firestore Security Rules*. https://firebase.google.com/docs/firestore/security/rules-conditions
- Firebase. *Authentication state persistence*. https://firebase.google.com/docs/auth/web/auth-state-persistence
- MDN Web Docs. *Making PWAs installable*. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- MDN Web Docs. *Offline and background operation*. https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation
- United States Environmental Protection Agency. *Greenhouse Gas Equivalencies Calculator — Calculations and References*. https://www.epa.gov/energy/greenhouse-gas-equivalencies-calculator-calculations-and-references
- United States Environmental Protection Agency. *Documentation for Greenhouse Gas Emission and Energy Factors Used in the Waste Reduction Model (WARM), Version 16 — Management Practices Chapters*. https://www.epa.gov/system/files/documents/2024-01/warm_management_practices_v16_dec.pdf
- United States Environmental Protection Agency. *Versions of the Waste Reduction Model*. https://www.epa.gov/waste-reduction-model/versions-waste-reduction-model
