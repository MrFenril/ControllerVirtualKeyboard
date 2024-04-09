const { Key } = require("@nut-tree/nut-js");
const { VKeyboard } = require("./VKeyboard");

class KeyboardTest extends VKeyboard {

    data = {
        selectedRowIdx: 0,
        selectedInputIdx: 0,
        selectedBtn: -1,
        selectedChar: 0,
        upperCase: false
    };

    keyboardInput = [
        [ ['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i'], ['j', 'k', 'l'] ],
        [ ['m', 'n', 'o'], ['p', 'q', 'r'], ['s', 't', 'u', 'v'], ['w', 'x', 'y', 'z'] ]
    ];

    constructor(gamepad, keyboard) {
        super(gamepad, keyboard);
    }

    handleInput() {
        const btn0Released = this.gamepad.onButtonRelease('cross');
        const btn1Released = this.gamepad.onButtonRelease('square');
        const btn2Released = this.gamepad.onButtonRelease('circle');
        const btn3Released = this.gamepad.onButtonRelease('triangle');

        const btn0Press = this.gamepad.onButtonPress('cross');
        const btn1Press = this.gamepad.onButtonPress('square');
        const btn2Press = this.gamepad.onButtonPress('circle');
        const btn3Press = this.gamepad.onButtonPress('triangle');

        const btnR1Pressed = this.gamepad.onButtonPressed('r1');
        const btnL1Pressed = this.gamepad.onButtonPressed('l1');
        const dPadLeftPressed = this.gamepad.onButtonPressed('dPadLeft');
        const dPadRightPressed = this.gamepad.onButtonPressed('dPadRight');

        const btnR2Pressed = this.gamepad.onTriggerPressed('r2');

        const nothingPressed = [ btn0Press, btn1Press, btn2Press, btn3Press ].every((btnState) => !btnState);

        if (btn0Released
                || btn1Released
                || btn2Released
                || btn3Released) {

            const { selectedRowIdx, selectedBtn, selectedChar, upperCase } = this.data;
            const char = this.keyboardInput[selectedRowIdx][selectedBtn][selectedChar];

            this.keyboard.type(upperCase ? char.toUpperCase() : char);
            this.data.selectedChar = 0;
        }

        if (btn0Press) this.data.selectedBtn = 0;
        else if (btn1Press) this.data.selectedBtn = 1;
        else if (btn2Press) this.data.selectedBtn = 2;
        else if (btn3Press) this.data.selectedBtn = 3;
        else this.data.selectedBtn = -1;

        if (btnR1Pressed) this.keyboard.pressKey(Key.Space);
        if (btnL1Pressed) this.keyboard.pressKey(Key.Backspace);

        if (dPadLeftPressed && !nothingPressed) this.data.selectedChar = this.data.selectedChar <= 0 ? this.keyboardInput[this.data.selectedRowIdx][this.data.selectedBtn].length - 1 : this.data.selectedChar - 1;
        else if (dPadRightPressed && !nothingPressed) this.data.selectedChar = this.data.selectedChar >= this.keyboardInput[this.data.selectedRowIdx][this.data.selectedBtn].length - 1 ? 0 : this.data.selectedChar + 1;

        if (this.gamepad.onButtonPressed('l3')) {
            this.data.upperCase = !this.data.upperCase;
        }

        if (btnR2Pressed) this.data.selectedChar = this.data.selectedRowIdx = this.data.selectedRowIdx >= 1 ? 0 : 1;
    }
}

module.exports = {
    KeyboardTest,
    Serializer: () => {},
    Template: "./test.js"
}