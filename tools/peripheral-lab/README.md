# Peripheral tools integration · 2026-11-10

Public source: https://github.com/P3anutSweet/gaming-peripheral-toolkit/tree/main/tools/peripheral-lab

Copy the entire tools/peripheral-lab directory to the destination site's /tools/peripheral-lab/ directory. Retain all relative links and deploy as static files with JavaScript enabled. Add a navigation link to /tools/peripheral-lab/index.html from the portfolio tools section and the company catalog Support section. The same neutral index contains no personal references. No dependencies, build step, API keys, server, device permissions or third-party requests are required. Serve over HTTPS for Web Crypto support. Do not replace existing /tools or support indexes; add a link in the parent's source generator. Parent owns integration and deployment; this thread did not modify either current website or shared website source.

Pages: index.html, sensitivity.html, calibration.html, firmware.html, stereo.html; sources.html documents assumptions. style.css and app.js are required assets. test.cjs is a Node-only verification script and may be omitted from website delivery.

Validation: Node tests pass for DPI conversion, known cm/360 example, manual correction, nonpositive/nonfinite input rejection, trial count rejection, empty binary and synthetic UF2 header recognition. No physical headset, hearing, firmware compatibility, real-game yaw or browser rendering verification is claimed. Browser listening and desktop/mobile visual review remain integration acceptance checks. Audio is limited to short user-triggered low-gain tones. Firmware parsing reads only bounded local files and does not establish valid firmware or compatibility. Hashing requires Web Crypto. No existing website deployment was performed.

Research: Valve Source SDK mouse input source, Microsoft UF2 specification, QMK flashing docs and MDN StereoPannerNode (linked on sources.html). Original implementation, no copied upstream source. Only the Source SDK default yaw 0.022 is supplied; unsupported game factors are not invented.
