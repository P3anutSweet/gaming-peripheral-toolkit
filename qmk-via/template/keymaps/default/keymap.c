// Copyright 2026 Jiajian (Felix) Ji
// SPDX-License-Identifier: GPL-2.0-or-later
//
// Default keymap for the Thunderobot ZERO98 template.
// TODO: replace the example keys with the full 98-key layout once the matrix is traced.

#include QMK_KEYBOARD_H

const uint16_t PROGMEM keymaps[][MATRIX_ROWS][MATRIX_COLS] = {
    [0] = LAYOUT(
        KC_ESC, KC_F1,
        KC_TAB, KC_Q
    ),
    [1] = LAYOUT(
        QK_BOOT, KC_TRNS,
        KC_TRNS, KC_TRNS
    )
};
