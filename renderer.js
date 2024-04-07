
let InputRows = document.querySelectorAll('.input-row');
let ControllerInputs = document.querySelectorAll('.controller-input');
let selectedRow = InputRows[0];
let selectedControllerInputs = null;
let selectedLetter = null;
let formatSelected = document.getElementById('input-type');

window.addEventListener('DOMContentLoaded', () => {
    window.addEventListener("gamepadconnected", function (e) {
        console.log(
            // e.gamepad.index,
            // e.gamepad.id,
            // e.gamepad.buttons,
            // e.gamepad.axes,
            e.gamepad
        );
            displayButtonsValues();
      });

    window.addEventListener("gamepaddisconnected", function (e) {
        clearInterval(interval)
        console.log(
            "Manette déconnectée à l'indice %d : %s",
            e.gamepad.index,
            e.gamepad.id,
        );
    });

    selectedRow.classList.add('selected-row');
})

let interval = null;
function displayButtonsValues() {
    interval = setInterval(() => {
        const gamepad = getGamepad();
        const [ x, y ] = gamepad.axes;

        // console.log(x, y, IsValueInRange(x, .2), IsValueInRange(y, .2));
        // renderButton(gamepad);

        if (IsValueInRange(x, .2) || IsValueInRange(y, .2)) {
            window.electronAPI.move({
                x: IsValueInRange(x, .1) ? x : 0,
                y: IsValueInRange(y, .1) ? y : 0
            });
        }
    }, 1);
}

window.electronAPI.onInputRelease((e, value) => {
    console.log(e, value);
    selectedRow.classList.remove('selected-row');

    selectedRow = InputRows[value.selectedRowIdx];
    selectedRow.classList.add('selected-row');
})

window.electronAPI.onInput((e, value) => {
    if (selectedControllerInputs && selectedControllerInputs.classList.contains('selected-input')) {
        selectedControllerInputs.classList.remove('selected-input')
    }

    if (selectedRow && selectedRow.classList.contains('selected-row')) selectedRow.classList.remove('selected-row');
    if (selectedLetter) selectedLetter.classList.remove('selected-letter');

    if (formatSelected && formatSelected.classList.contains('capitalize')) {
        value.upperCase ? formatSelected.classList.add('capitalize') : formatSelected.classList.remove('capitalize')
    }

    document.querySelectorAll('span').forEach(sp => {
        if (value['upperCase'] && !sp.classList.contains('capitalize')) {
            sp.classList.add('capitalize');
        }
        else if (!value['upperCase'] && sp.classList.contains('capitalize')) {
            console.log("here");
            sp.classList.remove('capitalize');
        }
    });

    selectedRow = InputRows[value.selectedRowIdx];
    if (selectedRow && !selectedRow.classList.contains('selected-row')) selectedRow.classList.add('selected-row');

    selectedControllerInputs = selectedRow.querySelectorAll('.controller-input')[value.selectedBtn];
    if (selectedControllerInputs) {

        const CtrlClassList = selectedControllerInputs.classList;
        if( !CtrlClassList.contains('selected-input')) CtrlClassList.add('selected-input')

        selectedLetter = selectedControllerInputs.querySelectorAll('span')[value.selectedChar];
        if (selectedLetter && !selectedLetter.classList.contains('selected-letter')) selectedLetter.classList.add('selected-letter')
    }

    // console.log(value);
})



IsValueInRange = (value, threshold) => {
    if (value > 0.1) return value > threshold
    else if (value < .1) return value < -threshold
}

function getGamepad() {
    const [ gamepad ] = navigator.getGamepads();
    return gamepad;
}

const container = document.querySelector(".input-container");
// const vkeyboard = new VKeyboard(container, "")

// function renderButton() {
//     const controller = getGamepad();
//     vkeyboard.Update(controller);

//     vkeyboard.Display();

//     if (vkeyboard.ControllerBtnPressed(0)) window.electronAPI.btnPressed(0);
// }