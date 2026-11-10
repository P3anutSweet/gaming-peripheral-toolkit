# Peripheral lab · browser tools

Four static, local-only tools: sensitivity conversion, manual sensitivity correction, firmware file metadata inspection, and stereo channel/balance playback. No account, dependencies, uploads, tracking, device APIs or system-setting changes.

Open `index.html` on an HTTPS static host or localhost. GitHub renders HTML as source; use the website integration bundle for a runnable deployment. This addition does not configure GitHub Pages or change the existing websites.

## Tools

- **Sensitivity converter:** DPI, sensitivity, editable yaw factors, cm/360 and eDPI. The one included reference is Source SDK 2013's default 0.022, not a verified factor for arbitrary current games. Matches linear hipfire turn distance; no ADS/FOV/acceleration matching.
- **Mouse correction:** three ruler-measured trials, mean, spread warning and sensitivity adjustment. Apply and retest manually. No sensor measurement or native driver correction.
- **Firmware file inspector:** bounded local files up to 16 MiB, size, SHA-256, expected-hash comparison and first bytes. Basic all-block UF2 checks; Intel HEX record/checksum/address checks. Unknown raw binaries remain unknown. Never reads from a device, executes, flashes or infers keyboard compatibility/version. Supported subsets and boundaries are on `sources.html`.
- **Stereo check:** short user-triggered tones, left/center/right, balance, level, frequency, automatic end, Stop and Reset. Local demo only; no hearing/HRTF/acoustic measurement or systemwide adjustment.

The first three tools download JSON reports on request. Reports include input values or selected file name/hash; review before sharing. File contents are never exported.

## Source and validation

`core.js` contains calculations and bounded container readers; `app.js` contains the interface and audio lifecycle. `style.css` is shared. Six complete HTML pages are included. `build.cjs` regenerates HTML without dependencies (`node build.cjs --dry-run`, then `node build.cjs`); it leaves authored JS/CSS unchanged.

Run `node test.cjs`: 15 check groups cover numerical examples, round-trip conversion, invalid input, manual correction, UF2 truncation/second-block corruption/duplicate numbering and Intel HEX checksums/addresses/EOF.

Release browser validation: 20 groups pass in Chromium 158.0.8127.18. All six pages checked at 1440, 390 and 320 CSS pixels; labels, local links, overflow, keyboard skip link, form submission, actual JSON download, file uploads/hash comparison, unavailable capabilities and async cancellation. Offline rendering of the actual audio graph confirms left-only/right-only routing and equal center PCM amplitudes. No application errors or third-party requests observed during tests. Physical headset/game/keyboard validation and Firefox/Safari validation are not claimed.

## Integration

Copy only these nine runtime files into `/tools/peripheral-lab/` in each destination site's source/output, preserving their relative paths:

```
index.html
sensitivity.html
calibration.html
firmware.html
stereo.html
sources.html
style.css
core.js
app.js
```

Add a link to `/tools/peripheral-lab/index.html` in the portfolio Tools section and company catalog Support section. Use the neutral link label `Peripheral setup tools`. The runtime pages contain no owner identity, portfolio links or personal project references. Third-party method credits are retained. Parent website work owns source-generator integration and deployment; do not replace existing tools/support indexes. All routes are self-contained `.html` files, with no client-side routing or redirect rules. Retain the repo's GPL-3.0 license when distributing source; place LICENSE beside the bundle as appropriate for your distribution.

Use HTTPS for Web Crypto. Unsupported Web Crypto leaves metadata available and explains that hashing is unavailable. Unsupported Web Audio disables playback and explains the missing capability. JavaScript-disabled browsers show an explanation; methods remain readable. No secrets or internal product data are needed.

Sources and scope: [methods page](sources.html). Original code, GPL-3.0 under the repository license. Interface polish workflow: [Unslop by Damir Sokolovsky](https://heydamir.design/unslop), CC BY 4.0. No upstream application code copied.
