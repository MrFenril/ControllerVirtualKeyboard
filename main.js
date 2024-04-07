// var robot = require("robotjs");

const path = require('node:path')
const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut } = require('electron')
const {mouse, Button, keyboard, Key} = require("@nut-tree/nut-js");
const Gamepad = require('./Gamepad');
const { callbackify } = require('node:util');

let win = null;
const WIN_WIDTH = 400;
const WIN_HEIGHT = 300;

const createWindow = async () => {
    win = new BrowserWindow({
        width: WIN_WIDTH,
        height: WIN_HEIGHT,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        // skipTaskbar: true,
        transparent:true,
        frame: false
    })

    win.setAlwaysOnTop(true);
    win.on("ready-to-show", () => {
        // win.webContents.openDevTools();
    });

    await win.loadFile('index.html')

    ipcMain.on('move', async (event, { x, y }) => {
        // const position = await mouse.getPosition();
        // console.log(x, y);
        // position.x +=  (1) * Math.sign(x);
        // position.y += (1) * Math.sign(y);
        // await mouse.move(straightTo(position));
    })

    ipcMain.on('controller-input', async (event, btn) => {
        // console.log("Pressed: ", btn);
    })
}

const gp = Gamepad;
const MenuData = {
    selectedRowIdx: 0,
    selectedInputIdx: 0,
    selectedBtn: -1,
    selectedChar: 0,
    upperCase: false
}
app.whenReady().then(() => {

    createWindow()
    setupTray();

    keyboard.config.autoDelayMs = 0;
    mouse.config.autoDelayMs = 0;
    mouse.config.mouseSpeed = 10000;

    gp.events.on('update', async () => {

        if (!win) return;

        if (gp.onButtonRelease('options') && !win.isVisible()) {
            win.showInactive()
        }else if (gp.onButtonRelease('options') && win.isVisible()) {
            win.hide()
        }

        handleInputs()

        handleDPad();
        handleLeftStick();
        handleRightStick();
    })
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
})

let tray = null;
app.on('before-quit', function (evt) {
    console.log(tray);
    tray.destroy();
});

function setupTray() {
    tray = new Tray('./logo.png')
    const contextMenu = Menu.buildFromTemplate([{
            label: 'Quit',
            type: 'normal',
        click: async () => {
            if (process.platform !== 'darwin') app.quit()
            tray.destroy();
        }
    }])

    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
}

const alpha = [
    [ ['a', 'b', 'c'], ['d', 'e', 'f'], ['g', 'h', 'i'], ['j', 'k', 'l'] ],
    [ ['m', 'n', 'o'], ['p', 'q', 'r'], ['s', 't', 'u', 'v'], ['w', 'x', 'y', 'z'] ]
]
function handleInputs() {

    if (!win.isVisible()) {
        const btn0Released = gp.onButtonRelease('cross');
        const btn1Released = gp.onButtonRelease('square');

        if (btn0Released) mouse.click(Button.LEFT);
        if (btn1Released) {
            win.showInactive();
            mouse.click(Button.LEFT);
        }

        return;
    }

    const btn0Released = gp.onButtonRelease('cross');
    const btn1Released = gp.onButtonRelease('square');
    const btn2Released = gp.onButtonRelease('circle');
    const btn3Released = gp.onButtonRelease('triangle');

    if (btn0Released
        || btn1Released
        || btn2Released
        || btn3Released) {
            const { selectedRowIdx, selectedBtn, selectedChar, upperCase } = MenuData;
            const char = alpha[selectedRowIdx][selectedBtn][selectedChar];
            keyboard.type(upperCase ? char.toUpperCase() : char);

            MenuData.selectedChar = 0;
        }
    const btn0Press = gp.onButtonPress('cross');
    const btn1Press = gp.onButtonPress('square');
    const btn2Press = gp.onButtonPress('circle');
    const btn3Press = gp.onButtonPress('triangle');

    const btnR1Pressed = gp.onButtonPressed('r1');
    const btnL1Pressed = gp.onButtonPressed('l1');

    if (btn0Press) MenuData.selectedBtn = 0;
    else if (btn1Press) MenuData.selectedBtn = 1;
    else if (btn2Press) MenuData.selectedBtn = 2;
    else if (btn3Press) MenuData.selectedBtn = 3;
    else MenuData.selectedBtn = -1;

    const noBtnPress = !btn0Press
        && !btn1Press
        && !btn2Press
        && !btn3Press

    if (btnR1Pressed) keyboard.pressKey(Key.Space);
    if (btnL1Pressed) keyboard.pressKey(Key.Backspace)
        win.webContents.send('update', MenuData);
}

function handleRightStick() {
    const rightjoystick = gp.getStates().rightStick;
    const range = [ 90, 160]

    if (rightjoystick.y <range[0] || rightjoystick.y > range[1]) {

        const _Ysign = rightjoystick.y < range[0] ? -1 : rightjoystick.y > range[1] ? 1 : 0;

        if (_Ysign < 0) mouse.scrollUp(1*2);
        if (_Ysign > 0) mouse.scrollDown(1*2);
    }
}

async function handleLeftStick() {
    const leftjoystick = gp.getStates().leftStick;

    const range = [ 90, 160]
    if (leftjoystick.x < range[0] || leftjoystick.x > range[1] || leftjoystick.y <range[0] || leftjoystick.y > range[1]) {
        const position = await mouse.getPosition();

        const _Xsign = leftjoystick.x < range[0] ? -1 : leftjoystick.x > range[1] ? 1 : 0;
        const _Ysign = leftjoystick.y < range[0] ? -1 : leftjoystick.y > range[1] ? 1 : 0;

        // console.log(position.x, position.x + 1 * 1 * _Xsign, _Xsign, (1 * .2) * _Ysign, _Ysign);

        position.x +=  1 * _Xsign;
        position.y += 1 * _Ysign;
        await mouse.move(position);

        win.setPosition(position.x - WIN_WIDTH / 2, position.y + 50);
    }

    if (gp.onButtonPressed('l3')) {
        MenuData.upperCase = !MenuData.upperCase;
    }
}

function handleDPad() {
    const dPadUpPressed = gp.onButtonPressed('dPadUp');
    const dPadDownPressed = gp.onButtonPressed('dPadDown');
    const dPadLeftPressed = gp.onButtonPressed('dPadLeft');
    const dPadRightPressed = gp.onButtonPressed('dPadRight');

    const btn0Press = gp.onButtonPress('cross');
    const btn1Press = gp.onButtonPress('square');
    const btn2Press = gp.onButtonPress('circle');
    const btn3Press = gp.onButtonPress('triangle');

    const btnR2Pressed = gp.onTriggerPressed('r2');

    const noBtnPress = !btn0Press
    && !btn1Press
    && !btn2Press
    && !btn3Press

    if (btnR2Pressed) MenuData.selectedChar = MenuData.selectedRowIdx = MenuData.selectedRowIdx >= 1 ? 0 : 1;

    if (!win.isVisible() || noBtnPress) {
        if (dPadUpPressed) keyboard.pressKey(Key.Up);
        if (dPadDownPressed) keyboard.pressKey(Key.Down);
        if (dPadLeftPressed) keyboard.pressKey(Key.Left);
        if (dPadRightPressed) keyboard.pressKey(Key.Right);
        return;
    }

    if (dPadLeftPressed) MenuData.selectedChar = MenuData.selectedChar <= 0 ? alpha[MenuData.selectedRowIdx][MenuData.selectedBtn].length - 1 : MenuData.selectedChar - 1;
    else if (dPadRightPressed) MenuData.selectedChar = MenuData.selectedChar >= alpha[MenuData.selectedRowIdx][MenuData.selectedBtn].length - 1 ? 0 : MenuData.selectedChar + 1;

    win.webContents.send('update', MenuData);
}

// 123 456 789
// (), .?! @+-=