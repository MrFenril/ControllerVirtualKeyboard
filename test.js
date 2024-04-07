const HID = require('node-hid');

const vendorId = 1118;
const productId = 767;
const deviceInfo = HID.devices().find(device => device.vendorId === vendorId && device.productId === productId);

console.log(deviceInfo);
if (!deviceInfo) {
    console.error('Device not found.');
    process.exit(1);
}

// Open a connection to the device
const device = new HID.HID(deviceInfo.path);
let prevStates = null;

// Listen for data events
device.on('data', data => {
    console.log(data);
    // dataMapping(data)
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
