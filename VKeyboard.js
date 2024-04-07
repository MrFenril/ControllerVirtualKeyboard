// const { Key, keyboard } = require("@nut-tree/nut-js");

function VKeyboard(container, mode) {

    const KeyCodeMapping = {

    };

    function pressKey(keycode) {
        // keyboard.pressKey(keycode);

    }

    const _mode = mode;
    let _display = false;
    let _controller = null;
    let _container = container;

    function Display() {
        if (_display) {
            ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].forEach((letter) => {
                const element = document.createElement('p');
                element.innerText = letter;
                _container.appendChild(element);
            })
        }
    }

    function Update (controller) {
        _container.innerHTML = '';

        if (_mode !== "toggle") {
            _display = false;
        }
        _controller = controller;

        if (vkeyboard.ControllerBtnPressed(7)) {
            if (_mode === "toggle") _display = !_display
            else _display = true;
        }

    }

    function SetDisplay(isDisplayed) {
        _display = isDisplayed;
    }

    function SetController(controller) {
        _controller = controller
    }

    function ControllerBtnPressed(idx) {
        return _controller.buttons[idx].pressed;
    }

    return {
        Display,
        Update,
        SetDisplay,
        SetController,
        ControllerBtnPressed
    }
}