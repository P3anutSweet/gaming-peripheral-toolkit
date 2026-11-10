# Gaming Peripheral Toolkit

Small, practical projects for gaming mice, keyboards and controllers, with a focus on Thunderobot and Machenike products.
Maintained by [Jiajian (Felix) Ji](https://portfolio.sunsetboulevard.ca/).

> **Unofficial.** This is a personal project. It is not an official Thunderobot or Machenike release, and nothing here is endorsed or supported by either brand.

游戏鼠标、键盘和手柄的小工具与模板，重点是雷神、机械师产品。个人项目，非雷神或机械师官方发布。

## What's here

| Folder | What it is | Status |
|---|---|---|
| [`qmk-via/`](qmk-via/) | QMK keyboard and VIA definition templates for Thunderobot keyboards, so support can be added without reverse engineering the layout | Templates; hardware details still to fill in |
| [`tools/polling-rate-tester/`](tools/polling-rate-tester/) | Browser page that measures your mouse's real polling rate (1K, 4K, 8K) | Works in Chromium browsers |
| [`tools/gamepad-stick-tester/`](tools/gamepad-stick-tester/) | Browser page that shows stick position, rest drift and circularity for any controller | Works in browsers with the Gamepad API |
| [`tools/peripheral-lab/`](tools/peripheral-lab/) | Sensitivity conversion, manual correction, firmware file inspection and stereo playback | Local browser tools; [setup and limits](tools/peripheral-lab/README.md) |
| [`portfolio-template/`](portfolio-template/) | The bilingual one-page portfolio template behind portfolio.sunsetboulevard.ca, ready to fill with your own work | Usable |

The polling-rate and gamepad testers are standalone HTML files. The peripheral lab is a multi-file static application: preserve its HTML, JS and CSS paths. There is no runtime package installation or tracking.

## Run and requirements

Clone or download this repository. For the standalone testers, open their `index.html` in a current browser. For the peripheral lab, serve the repository on localhost (Python 3 is optional development tooling):

```sh
python -m http.server 8000 --bind 127.0.0.1
```

Open `http://localhost:8000/tools/peripheral-lab/`. Use HTTPS on a remote static host for secure-context features. No credentials or environment variables are required. Node.js is needed only for lab development checks: `node tools/peripheral-lab/test.cjs`; see the lab README for the HTML regeneration command.

## Limits and troubleshooting

- Polling-rate figures count browser pointer events, not USB bus traffic. Browser scheduling, event coalescing, CPU load and display behavior can affect results; a 4K/8K reading is not hardware certification. Use current Chrome/Edge and move the mouse continuously in the test area.
- For the gamepad tester, connect the controller and press a button to expose it through the Gamepad API. Browser/OS mappings vary.
- Firmware inspection reads a selected local file, never flashes hardware and never proves compatibility. Hashing needs Web Crypto; missing capabilities are explained in the interface.
- Stereo playback starts only after a user action and needs Web Audio. Check the selected OS output, start at a low level and use Stop to end playback.
- Sensitivity conversion assumes a linear hipfire yaw factor; correction trials use your own ruler measurements. These tools do not change drivers or game settings.
- QMK/VIA content is a template: supply and verify the actual matrix/pins before building or flashing. Follow each subfolder's instructions.

The lab's documented release checks cover 15 core and 20 Chromium groups; physical hardware and Firefox/Safari compatibility are not inferred from those checks.

## Contributing

Issues and pull requests are welcome, especially keyboard matrix and pin data for the QMK templates, and test results from different mice and controllers.

## License

GPL-3.0. See [LICENSE](LICENSE).
