# Mobile performance audit: yannis.dev

Analyzed on 2026-08-30 using the supplied PageSpeed Insights report for `https://yannis.dev/`. The report was captured on 2026-08-26 with Lighthouse 13.4.1 on its mobile profile.

## Baseline

The report contains lab data only; it says there is not enough real-user CrUX data for the page. INP is therefore unavailable and is not inferred from Total Blocking Time.

| Metric | Mobile lab result |
| --- | ---: |
| Performance | 88 |
| First Contentful Paint | 3.0 s |
| Largest Contentful Paint | 3.0 s |
| Speed Index | 3.1 s |
| Total Blocking Time | 0 ms |
| Cumulative Layout Shift | 0 |

## High-impact findings

1. Three stylesheets blocked the first render, with PageSpeed estimating 2,550 ms of FCP/LCP savings: the 20,031-byte site stylesheet, the 9,532-byte Devicon stylesheet, and the Google Fonts stylesheet.
2. Devicon loaded a 269,031-byte font for two social icons. Together with its stylesheet, that third-party dependency transferred 278,563 bytes and created the longest request chain.
3. Four 1280 px workflow logos transferred 164,584 bytes while rendering at roughly 34–60 px. PageSpeed estimated 160 KiB of image savings.

## Implemented fixes

- Replaced the two font-backed social icons with inline SVG, removing the Devicon stylesheet and font.
- Inlined Astro's generated CSS so the initial design no longer waits on a separate stylesheet request.
- Removed Google Fonts from the initial render path. Model-specific fonts now load only after a non-default skin is selected, or after the first paint when a saved skin is restored.
- Added 96×96 WebP variants for the four workflow logos and explicit intrinsic dimensions, lazy loading, asynchronous decoding, and low fetch priority.
- Added build-output regression tests for the render path and optimized assets.

## Verification

- `yarn astro build`: passed.
- `yarn vitest run`: 9 files and 104 tests passed.
- The built homepage contains no render-blocking stylesheet links.
- The built homepage HTML is 28,363 bytes when gzip-compressed, including the inlined site CSS.
- The four referenced workflow logos now total 5,404 bytes, down from 164,584 bytes.
- Based on the linked audit's resource list, the initial transfer is expected to fall from about 486 KiB to about 58 KiB, and initial third-party transfer from about 278 KiB to about 5 KiB. These are deterministic payload estimates, not a replacement Lighthouse score.

## Limitation

Google's PageSpeed API quota was exhausted during verification, and the changes are not deployed from this workspace. A post-fix live Lighthouse score must be measured after deployment; no post-fix score is claimed here.
