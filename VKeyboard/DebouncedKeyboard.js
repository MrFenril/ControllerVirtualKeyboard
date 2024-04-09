const { Key } = require("@nut-tree/nut-js");
const { VKeyboard } = require("./VKeyboard");

class DebouncedKeyboard extends VKeyboard {

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

    debouncedInput = debounce(() => {
        this.validateInput();
    });

    get LockedCursor() {
        return !this.gamepad.onButtonPress('r2')
    }

    constructor(gamepad, keyboard) {
        super(gamepad, keyboard);
    }

  handleInput() {
    console.log(this.LockedCursor);
        if (this.LockedCursor) return;

        const btnR1Pressed = this.gamepad.onButtonPressed('r1');
        const btnL1Pressed = this.gamepad.onButtonPressed('l1');
        const btn0Pressed = this.gamepad.onButtonPressed('cross');
        const btn1Pressed = this.gamepad.onButtonPressed('square');
        const btn2Pressed = this.gamepad.onButtonPressed('circle');
        const btn3Pressed = this.gamepad.onButtonPressed('triangle');
        const dPadLeftPressed = this.gamepad.onButtonPressed('dPadLeft');
        const dPadRightPressed = this.gamepad.onButtonPressed('dPadRight');
        const dPadUpPressed = this.gamepad.onButtonPressed('dPadUp');
        const dPadDownPressed = this.gamepad.onButtonPressed('dPadDown');

        // TODO: Find a better way to handle inputs
        if (btn0Pressed) this.setInputValue(0, 0)
        if (btn1Pressed) this.setInputValue(0, 1)
        if (btn2Pressed) this.setInputValue(0, 2)
        if (btn3Pressed) this.setInputValue(0, 3)

        if (dPadDownPressed) this.setInputValue(1, 0);
        if (dPadLeftPressed) this.setInputValue(1, 1);
        if (dPadRightPressed) this.setInputValue(1, 2);
        if (dPadUpPressed) this.setInputValue(1, 3);

        if (btnR1Pressed) this.keyboard.pressKey(Key.Space);
        if (btnL1Pressed) this.keyboard.pressKey(Key.Backspace);

        if (this.gamepad.onButtonPressed('l3')) {
            this.data.upperCase = !this.data.upperCase;
        }

    }

    setInputValue(rowidx, btnidx) {
        if (this.data.selectedBtn !== btnidx && this.data.selectedBtn !== -1) {
            this.validateInput();
        }

        this.data.selectedBtn = btnidx;
        this.data.selectedRowIdx = rowidx;
        this.data.selectedChar = this.data.selectedChar >= this.keyboardInput[this.data.selectedRowIdx][this.data.selectedBtn].length - 1 ? 0 : this.data.selectedChar + 1;

        this.debouncedInput();
    }

    validateInput() {
        const { selectedRowIdx, selectedBtn, selectedChar, upperCase } = this.data;
        const char = this.keyboardInput[selectedRowIdx][selectedBtn][selectedChar];

        this.keyboard.type(upperCase ? char.toUpperCase() : char);
        this.data.selectedChar = -1;
    }
}

function debounce(func, timeout = 500){
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

module.exports = {
    DebouncedKeyboard,
    Serializer: () => {},
    Template: "./test.js"
}