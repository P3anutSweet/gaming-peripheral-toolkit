# QMK and VIA templates for Thunderobot keyboards

Thunderobot keyboards don't ship with QMK or VIA support today. These templates give anyone who wants to add it a starting point with the file layout, naming and keymaps already in place, so the remaining work is the hardware data rather than guessing the structure.

> Unofficial and incomplete. Flashing third-party firmware can brick a keyboard and void its warranty. Only flash a board you have confirmed uses a QMK-supported MCU and bootloader.

## Target boards

| Board | Layout | Status |
|---|---|---|
| ZERO98 | 98-key (1800 compact) | Template only. MCU, matrix and pins to be confirmed |
| ZERO87 8K | 87-key TKL, 8,000 Hz | Template only. 8K polling needs MCU and USB high-speed support |

## Files

```
qmk-via/
  template/                      QMK keyboard folder; copy to qmk_firmware/keyboards/thunderobot/<board>/
    keyboard.json                hardware description (data-driven QMK)
    keymaps/default/keymap.c     default keymap
    keymaps/via/keymap.c         VIA-enabled keymap
    keymaps/via/rules.mk         turns VIA on
  via/
    zero98.json                  VIA definition, loaded in VIA's Design tab until it is merged upstream
```

## How to fill a template

1. Open the board and note the MCU part number. QMK supports most STM32, RP2040 and several WCH chips; check the [QMK compatible MCU list](https://docs.qmk.fm/compatible_microcontrollers).
2. Read the USB vendor and product ID from the stock firmware (Windows Device Manager > Details > Hardware Ids, or `lsusb` on Linux). Put them in `keyboard.json` and `zero98.json`.
3. Trace the key matrix: which row and column pin each switch sits on. Fill `matrix_pins` and replace the example `LAYOUT` entries.
4. Build with `qmk compile -kb thunderobot/zero98 -km via` and test on a spare board first.
5. Load `via/zero98.json` in [usevia.app](https://usevia.app) (Settings > Show Design tab > Load) to remap keys live.

Every value marked `TODO` is a placeholder. Pull requests with confirmed data are welcome.
