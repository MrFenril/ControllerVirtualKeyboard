const HID = require('node-hid');
const EventEmitter = require('events');

function Gamepad() {

    // Define vendor and product IDs of your HID device
    const vendorId = 1356; // Replace with your vendor ID
    const productId = 2508; // Replace with your product ID
    const eventEmitter = new EventEmitter();

    eventEmitter.emit('greet');

    // // Find the device with the specified vendor and product IDs
    const deviceInfo = HID.devices().find(device => device.vendorId === vendorId && device.productId === productId);

    if (!deviceInfo) {
        console.error('Device not found.');
        process.exit(1);
    }

    // Open a connection to the device
    const device = new HID.HID(deviceInfo.path);
    let prevStates = null;

    // Listen for data events
    device.on('data', data => {
        dataMapping(data)
    });

    // Listen for error events
    device.on('error', error => {
        console.error('Error:', error);
    });

    // Start polling for data
    device.read((error, data) => {
        if (error) {
            console.error('Error reading data:', error);
            return;
        }
        console.log('Polling start');
    });

    // Close the device connection when done
    process.on('SIGINT', () => {
        device.close();
        process.exit();
    });

    function onButtonRelease(btn) {
        return !states[btn] && prevStates[btn];
    }

    function onButtonPressed(btn, fn) {
        return states[btn] && !prevStates[btn];
    }

    function onButtonPress(btn) {
        return states[btn]
    }

    let states;
    function dataMapping(data) {
        // reportId: { value: input[0] },
        // verticalAxis: { value: input[1] },
        // horizontalAxis: { value: input[2] }

        prevStates = states;
        states = {
                battery: data[12],
                square: _getSquareState(data[5]),
                triangle: _getTriangleState(data[5]),
                circle: _getCircleState(data[5]),
                cross: _getCrossState(data[5]),
                dPadDown: _getDPadDownState(data[5] & 15),
                dPadLeft: _getDPadLeftState(data[5] & 15),
                dPadRight: _getDPadRightState(data[5] & 15),
                dPadUp: _getDPadUpState(data[5] & 15),
                l3: (data[6] & 64) !== 0,
                leftStick: { x: data[1], y: data[2] },
                rightStick: { x: data[3], y: data[4] },
                // motion: _getMotionState(data),
                options: _getOptionsState(data[6]),
                // orientation: _getOrientationState(data),
                // ps: _getPsState(data[7]),
                l1: _getL1State(data[6]),
                l2: _getL2State(data),
                r1: _getR1State(data[6]),
                r2: _getR2State(data),
                // r3: _getR3State(data[6]),
                // share: _getShareState(data[6]),
                // timestamp: _getTimestampState(data[7]),
                // touchPad: _getTrackPadState(data),
            };
            // console.log(states);
            // console.clear();
            eventEmitter.emit('update');
    }

     /**
         * Returns DPad Down state
         *
         * @param state - Reference of state
         * @returns Returns true if pressed, otherwise false
         * @internal
         * @private
         */
    function _getDPadDownState(state) {
        return state === 3 || state === 4 || state === 5;
    }

    /**
         * Returns DPad Up state
         *
         * @param state - Reference of state
         * @returns Returns true if pressed, otherwise false
         * @internal
         * @private
         */
    function _getDPadUpState(state) {
        return state === 0 || state === 1 || state === 7;
    }

    function _getDPadLeftState(state) {
        return state === 5 || state === 6 || state === 7;
    }

    /**
     * Returns DPad Right state
     *
     * @param state - Reference of state
     * @returns Returns true if pressed, otherwise false
     * @internal
     * @private
     */
    function _getDPadRightState(state) {
        return state === 1 || state === 2 || state === 3;
    }

    /**
     * Returns Cross state
     *
     * @param state - Reference of state
     * @returns Returns true if pressed, otherwise false
     * @internal
     * @private
     */
    function _getCrossState(state) {
        return (state & 32) !== 0;
    }

    /**
     * Returns Circle state
     *
     * @param state - Reference of state
     * @returns Returns true if pressed, otherwise false
     * @internal
     * @private
     */
    function _getCircleState(state) {
        return (state & 64) !== 0;
    }

    /**
     * Returns Square state
     *
     * @param state - Reference of state
     * @returns Returns true if pressed, otherwise false
     * @internal
     * @private
     */
    function _getSquareState(state) {
        return (state & 16) !== 0;
    }

    /**
     * Returns Triangle state
     *
     * @param state - Reference of state
     * @returns Returns true if pressed, otherwise false
     * @internal
     * @private
     */
    function _getTriangleState(state) {
        return (state & 128) !== 0;
    }

        /**
         * Returns L1 state
         *
         * @param state - Reference of state
         * @returns Returns true if pressed, otherwise false
         * @internal
         * @private
         */
    function _getL1State(state) {
        return (state & 1) !== 0;
    }

    /**
     * Returns R1 state
         *
         * @param state - Reference of state
         * @returns Returns true if pressed, otherwise false
         * @internal
         * @private
         */
    function _getR1State(state) {
        return (state & 2) !== 0;
    }

    /**
     * Returns R2 state
         *
         * @param state - Reference of state
         * @returns Returns state of {@link AnalogState | R2 analog}
         * @internal
         * @private
         */
    function _getR2State(state) {
        return {
            pressed: (state[6] & 8) !== 0,
            value: state[9]
        };
    }

        /**
         * Returns L2 state
         *
         * @param state - Reference of state
         * @returns Returns state of {@link AnalogState | L2 analog}
         * @internal
         * @private
         */
    function _getL2State(state) {
        return {
            pressed: (state[6] & 4) !== 0,
            value: state[8]
        };
    }

    function _getOptionsState(state) {
        return (state & 32) !== 0;
    }

    function getStates() {
        return states;
    }

    function onTriggerPressed(btn) {
        if (!states[btn]) return false;

        return states[btn].pressed && !prevStates[btn].pressed;
        // return {
        //     pressed: (state[6] & 8) !== 0,
        //     value: state[9]
        // };
    }

    return {
        states,
        getStates,
        onButtonPressed,
        onButtonPress,
        onButtonRelease,
        onTriggerPressed,
        events: eventEmitter
    };
}

module.exports = new Gamepad();