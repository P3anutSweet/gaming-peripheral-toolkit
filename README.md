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
| [`portfolio-template/`](portfolio-template/) | The bilingual one-page portfolio template behind portfolio.sunsetboulevard.ca, ready to fill with your own work | Usable |

All browser tools are single HTML files with no build step and no tracking. Open them locally or with GitHub Pages.

## Contributing

Issues and pull requests are welcome, especially keyboard matrix and pin data for the QMK templates, and test results from different mice and controllers.

## License

GPL-3.0. See [LICENSE](LICENSE).
