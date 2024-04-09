class VKeyboard {
    template = "./test.html";
    gamepad = null;
    keyboard = null;

    data = null;
    keyboardInput = null;

    get Data() {
        return this.data;
    }

    get Template() {
        return this.template;
    }

    // get LockedCursor() {
    //     return false;
    // }

    constructor(gamepad, keyboard) {
        if (!gamepad) throw new Error("Gamepad not set");
        if (!keyboard) throw new Error("Keyboard controller not set");

        this.gamepad = gamepad;
        this.keyboard = keyboard;
    }

    handleInput() {
    }



    serialize(data) {
        // throw new Error("Not implemented")
        return this;
    }

    unserialize(data) {
        return this;
    }
}

module.exports = {
    VKeyboard,
    Serializer: () => {},
    Template: "./test.js"
}