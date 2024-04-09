const path = require('node:path')
const { app, BrowserWindow, ipcMain, Tray, Menu, globalShortcut } = require('electron')
const {mouse, Button, keyboard, Key} = require("@nut-tree/nut-js");
const Gamepad = require('./Gamepad');
const { KeyboardTest } = require('./VKeyboard/KeyboardTest');
const { DebouncedKeyboard } = require('./VKeyboard/DebouncedKeyboard');

let win = null;
const WIN_WIDTH = 400;
const WIN_HEIGHT = 300;

const gp = Gamepad;
// const vkeyboard = new KeyboardTest(gp, keyboard);
const vkeyboard = new DebouncedKeyboard(gp, keyboard);

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
}


app.whenReady().then(() => {

    createWindow()
    setupTray();

    keyboard.config.autoDelayMs = 0;
    mouse.config.autoDelayMs = 0;
    mouse.config.mouseSpeed = 10000;

    gp.events.on('update', async () => {

        try {
            if (!win) return;

            if (gp.onButtonRelease('options') && !win.isVisible()) win.showInactive()
            else if (gp.onButtonRelease('options') && win.isVisible()) win.hide()

            handleInputs()
            handleDPad();
            handleLeftStick();
            handleRightStick();

            if (win.isVisible()) win.webContents.send('update', vkeyboard.Data);
        } catch (e) {
            console.error(e);
        }
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

async function handleInputs() {
    if (win.isVisible()) {
        vkeyboard.handleInput();
        return;
    }

    const btn0Released = gp.onButtonRelease('cross');
    const btn1Released = gp.onButtonRelease('square');

    if (btn0Released) mouse.click(Button.LEFT);

    if (btn1Released) {
        win.showInactive();
        mouse.click(Button.LEFT);
    }
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

        position.x +=  1 * _Xsign;
        position.y += 1 * _Ysign;
        await mouse.move(position);

        win.setPosition(position.x - WIN_WIDTH / 2, position.y + 50);
    }
}

function handleDPad() {
    const dPadUpPressed = gp.onButtonPressed('dPadUp');
    const dPadDownPressed = gp.onButtonPressed('dPadDown');
    const dPadLeftPressed = gp.onButtonPressed('dPadLeft');
    const dPadRightPressed = gp.onButtonPressed('dPadRight');

    if (!win.isVisible() || !vkeyboard.LockedCursor) {
        if (dPadUpPressed) keyboard.pressKey(Key.Up);
        if (dPadDownPressed) keyboard.pressKey(Key.Down);
        if (dPadLeftPressed) keyboard.pressKey(Key.Left);
        if (dPadRightPressed) keyboard.pressKey(Key.Right);
        return;
    }
}

// 123 456 789
// (), .?! @+-=