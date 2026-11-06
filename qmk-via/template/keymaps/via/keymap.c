// Copyright 2026 Jiajian (Felix) Ji
// SPDX-License-Identifier: GPL-2.0-or-later
//
// VIA keymap for the Thunderobot ZERO98 template. VIA stores remaps in EEPROM,
// so this only sets the starting layout. Four layers are what VIA expects.

#include QMK_KEYBOARD_H

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
    [0] = LAYOUT(KC_ESC,  KC_F1,   KC_TAB,  KC_Q),
    [1] = LAYOUT(QK_BOOT, KC_TRNS, KC_TRNS, KC_TRNS),
    [2] = LAYOUT(KC_TRNS, KC_TRNS, KC_TRNS, KC_TRNS),
    [3] = LAYOUT(KC_TRNS, KC_TRNS, KC_TRNS, KC_TRNS)
};
