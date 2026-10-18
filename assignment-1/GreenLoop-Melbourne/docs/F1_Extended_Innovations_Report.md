# F.1 Extended Innovations Report

## Introduction and selection rationale

GreenLoop Melbourne already provides authentication, role-based access, ratings, interactive tables, CSV export, email sharing and a map. The four F.1 innovations were therefore selected to add distinct value rather than repeat D.1–D.4 or E.1–E.4:

1. a Firestore-backed community-rating analytics view alongside clearly labelled educational analytics;
2. an administrator-only user and role dashboard;
3. a transparent environmental-impact learning tool; and
4. an installable, deliberately privacy-conscious offline experience.

No project rubric text was available in the repository. The mapping below is limited to the supplied F.1 requirement for substantial, independent and demonstrable innovations; it does not claim marks or criteria that could not be verified.

## Innovation 1 — Interactive Recycling Analytics Dashboard

### Background and implementation

`AnalyticsView.vue` now contains two deliberately separated sources. A realtime chart subscribes to the existing Firestore `locations/{locationId}/ratings/{uid}` collections and exposes only per-location average and count. Users can switch between rating-count and average-rating measures. Loading, empty and permission/network failure states are explicit, and the chart has a semantic table equivalent. `src/utils/communityAnalytics.js` combines existing rating snapshot listeners without retaining or exposing user identifiers.

The existing Chart.js bar and doughnut charts remain as **Educational guide coverage**. Category checkboxes update both static charts, the visible record count, and an accessible HTML summary. Those calculations are isolated in `src/utils/analytics.js`.

The live source is user-submitted Firestore location ratings, limited to the verified locations bundled in `src/data/recyclingLocations.js`. The static source is GreenLoop's small `src/data/recyclingItems.js` dataset. Neither source measures recycling tonnage, participation or Melbourne-wide environmental performance.

Chart.js renders charts on `canvas`, so each chart has an accessible text alternative and the same values are exposed in a semantic HTML table. This follows Chart.js guidance that authors must provide accessibility content themselves.

### User benefit and limitations

Users can quickly inspect what guidance the application covers and identify content gaps. The dashboard is interactive and responsive, but its conclusions are restricted to the small demonstration dataset. A future version would require an appropriately governed and documented public dataset before presenting municipal trends.

## Innovation 2 — Administrator role dashboard

### Background and implementation

`AdminDashboardView.vue` uses the existing `getAllUserProfiles()` Firestore query only after the asynchronous router guard confirms an authenticated profile with `role === "admin"`. The dashboard reports the exact number of returned profiles and groups them into administrator and standard-user counts. Those three account KPIs precede a compact Chart.js role-distribution chart; its accessible table appears beside it on desktop and below it on smaller screens. Loading, empty, network and permission-denied states are distinct.

Authorization remains defense in depth: navigation visibility is not authority; the router protects `/admin`, and `firestore.rules` restricts the user-profile list operation to administrators. This work does not grant or change any role.

### User benefit and limitations

Administrators gain a quick account/role summary without exposing it to ordinary users. Profile email addresses remain visible only inside the existing authorised admin table. The dashboard depends on valid deployed rules and cannot prove production access from a local build alone.

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

`vite-plugin-pwa` generates a web app manifest and Workbox service worker during a production build. The user-facing `/offline-guide` page provides a **Save for offline use** workflow: it waits for the production worker, verifies the static application shell, JavaScript and CSS are present, and records the successful save time locally. A verified saved guide can be refreshed with **Update saved guide**.

The public `/offline-recycling-guide` route renders only bundled Recycling Guide descriptions and disposal instructions. It bypasses authentication initialization specifically so a saved direct URL or offline refresh does not require a new Firebase session. All normal application pages retain their existing authentication guards. Workbox's cached navigation fallback serves the application shell for this route, while the bundled guide data is contained in the cached application code.

Runtime API caching is deliberately disabled. Firebase Authentication/profile restoration, Firestore favourites and ratings, administrator data, Cloud Functions/SendGrid, OpenStreetMap tiles and OSRM route responses require connectivity. Authentication tokens, personal records, email requests, map tiles and route responses are not added to the Workbox runtime cache.

Service-worker saving requires HTTPS or localhost production preview. Development mode deliberately does not register a worker. Technical diagnostics stay out of the public UI; users see only Not saved, Saving, Ready, update-preserved failure, connection-required or unsupported-browser states.

### User benefit and limitations

Residents receive a single clear save/open/update workflow and can reopen common recycling guidance without signing in again. The saved timestamp is written only after cache verification. First save still requires internet, and local council requirements may change; the static guide tells users to reconfirm current rules when connected.

## Technologies and integration

- Vue 3 Composition API and Vue Router for views, state and protected routes.
- Bootstrap 5 for responsive cards, forms and navigation.
- Chart.js and `vue-chartjs` for charts.
- Firebase Authentication and Cloud Firestore for user-scoped favourites.
- `vite-plugin-pwa` and Workbox for the manifest, install assets and static precache.
- Node's built-in test runner plus the project's existing Vitest/axe accessibility suite.

All four pages retain the existing authenticated routing model; `/admin` additionally requires an administrator role. Navigation uses the current **Discover**, **Recycle**, and Account menus rather than the obsolete “Innovations” menu described in an earlier report revision.

## Security and privacy review

- Live analytics exposes location-level aggregates only; no rating UID is copied into chart state or rendered.
- Admin user listing is protected by both the Firebase-aware router guard and Firestore administrator rule.
- No secret, API key or `.env` value was added.
- The PWA has no runtime caching rule for Firebase or other remote APIs.
- Numerical environmental claims are limited to one cited factor and clearly qualified.

## Testing evidence

Automated verification performed on 18 October 2026:

- `npm test`: 20 Node tests and 54 Vitest tests passed. This includes realtime analytics aggregation, exact administrator role totals, dated-event expiry, required PWA precache assets, saved-time restoration, save/update/failure/offline guide UI, the public offline route, impact formulas, map logic, accessibility preferences, expanded axe component scans, navigation, exports and existing feature regressions.
- `npm run build`: passed with Vite 8.2.2; 2,234 modules transformed. The PWA build generated `manifest.webmanifest`, `sw.js` and Workbox support code with 15 precache entries (about 2.24 MiB).
- Generated-manifest inspection confirmed the 192×192, 512×512 and SVG icons.
- Generated service-worker inspection found no configured Firebase, SendGrid, OpenStreetMap or OSRM runtime URLs.
- `npm run test:rules`: six Firestore emulator tests passed. The added authorization case proves an administrator can list user profiles, a standard user and signed-out visitor cannot, an authenticated user can read location-rating aggregates, and a signed-out visitor cannot.

### Final end-to-end verification pass — 18 October 2026

| Area | Evidence obtained | Limitation |
| --- | --- | --- |
| Firestore rating chart | Source trace confirms `AnalyticsView.vue` creates one realtime `onSnapshot` listener per verified location through `observeLocationRatings()`. The tested aggregator preserves Firestore average/count values, removes user-level fields, and unsubscribes all listeners. Firestore emulator rules allow authenticated rating reads and deny signed-out reads. | No authorised browser credentials were supplied, so production ratings were neither read nor modified and live chart switching was not claimed. |
| Administrator dashboard | Pure aggregation tests confirm total = administrator + standard users. Router source requires both authentication and an `admin` Firestore profile. Emulator tests prove list access is admin-only. Loading, empty, permission and general failure UI paths are present. | No authorised administrator test account was supplied; production counts and `/admin` rendering were not inspected. |
| Offline/PWA | A production build and preview were used. After the updated worker activated, `/offline-recycling-guide` rendered directly without authentication. The preview server was then stopped completely and the browser successfully reloaded the same direct URL from the service-worker precache, with all bundled guidance visible. The generated precache contains no Firebase, email, mapping, geocoding or routing runtime URL. | Browser automation did not expose an operating-system network toggle, so the global connection banner could not be validated against a true device-offline event. The save/update controls remain covered by automated state tests because `/offline-guide` is authenticated. |
| Impact calculator | Node and view tests cover default 10 kg results, supported WARM categories, formula outputs, invalid weight limits, comparison chart/table, and explicit unsupported-material handling. | Local educational estimates retain the WARM scope limitations documented above. |

In production, **Save for offline use** obtains or registers the worker, awaits activation with a timeout, and reports Ready only after the precache contains `index.html`, a JavaScript application bundle and a CSS bundle. A failed update does not discard or mislabel a previously verified guide. No success state is inferred from connection status alone.

The build reports a non-fatal large JavaScript chunk warning. This is a performance-improvement opportunity, not a compilation failure. `npm audit --omit=dev` reported seven high-severity findings in the production dependency tree (`@grpc/grpc-js` through Firebase/Firestore, `@vue/server-renderer`, and `source-map-js`). The suggested complete audit remediation would force a breaking Firebase downgrade, so no automated rewrite was applied; dependency upgrades must be reviewed and regression-tested separately.

### Manual verification still required

1. With deployed production rules, verify a standard user cannot list profiles or open `/admin`, while an authorised administrator can load exact role counts.
2. Submit/update ratings with two test users and confirm the realtime aggregate chart updates without exposing identity.
3. Test chart controls and summaries with keyboard and screen-reader software.
4. Repeat the verified direct offline reload on the tutor's target browser and also toggle its explicit DevTools Offline setting to demonstrate the connection banner.
5. Confirm Firebase, ratings, favourites, email, map tiles and routing show their expected offline failures rather than stale private data.
6. Test install/offline behaviour on the target Chrome/Edge/Safari device set; an automated build cannot prove browser install prompts.

## Screenshot placeholders

These are intentionally placeholders. Genuine screenshots must be captured from the running application and must not be replaced by fabricated images.

- **Screenshot 1:** `[Insert genuine Analytics Dashboard screenshot with active category filters]`
- **Screenshot 2:** `[Insert genuine authorised Admin Dashboard screenshot showing aggregate role counts]`
- **Screenshot 3:** `[Insert genuine Impact Calculator screenshot showing formula and result]`
- **Screenshot 4:** `[Insert genuine installed/offline PWA screenshot with offline status]`

## F.1 requirement mapping

| F.1 evidence requested | Implemented evidence |
| --- | --- |
| Four independent innovations | Firestore rating analytics, administrator role dashboard, impact calculator and offline/PWA functionality have separate logic and user outcomes. |
| Substantial technical implementation | Realtime Firestore aggregation, admin-only role summaries, sourced numerical calculation/validation, and manifest/service-worker generation. |
| Demonstrable behaviour | Each innovation has a defined demonstration sequence below and visible loading/result/error or status output. |
| Testing | Business-logic tests, existing automated accessibility tests, production build verification and documented manual checks. |
| Research documentation | Sources, formula, scope, privacy decisions and limitations are documented in this report and the relevant UI. |

## Demonstration sequence

1. **Analytics:** open **Discover → Recycling Analytics**, switch the live Firestore chart between rating count and average, then toggle educational guide categories and explain the separate source/scope labels.
2. **Admin Dashboard:** sign in with an already-authorised administrator, open the Account menu and Admin Dashboard, compare total profiles with administrator/standard-user totals and the accessible role table; repeat `/admin` as a normal user to demonstrate denial.
3. **Impact:** open **Recycle → Environmental Impact Calculator**, enter 10 kg for aluminium cans, glass, corrugated cardboard and PET bottles; compare the chart and accessible table; show the formula/source; try zero and over 10,000 kg; then choose other/unidentified plastic to demonstrate that unsupported estimates are not invented.
4. **Offline/PWA:** run a production preview on localhost, choose **Save for offline use**, show the verified Ready state and saved time, open `/offline-recycling-guide`, switch DevTools offline, directly reload that route, then restore connectivity and use **Update saved guide**. Explain that live accounts, ratings, favourites, email and maps remain online-only.

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
