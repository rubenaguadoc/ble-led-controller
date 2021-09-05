const noble = require('noble');

let device, transport;

const COMMANDS = { ON: 'on', OFF: 'off', COLOR: 'color', BRI: 'brightness' };

const codes = {
  color: (r, g, b) =>
    `7e070503${
      !g
        ? r.replace('#', '')
        : r.toString(16).padStart(2, '0') +
          g.toString(16).padStart(2, '0') +
          b.toString(16).padStart(2, '0')
    }10ef`,
  brightness: (brightness) =>
    `7e0401${brightness.toString(16).padStart(2, '0')}01ffff00ef`,
  on: () => '7e0404f00001ff00ef',
  off: () => '7e0404000000ff00ef',
};

const hexToBuff = (hex) =>
  new Uint8Array(hex.match(/[\dA-F]{2}/gi).map((s) => parseInt(s, 16)));

const run = (cmd, ...rest) =>
  new Promise((resolve, reject) =>
    transport.write(
      Buffer.from(hexToBuff(codes[cmd](...rest))),
      true,
      (error) => (error ? reject(error) : resolve())
    )
  );

const btSensor = new Promise((resolve, reject) => {
  noble.on('stateChange', (state) =>
    state === 'poweredOn'
      ? resolve()
      : reject(new Error('Sin acceso al sensor bluetooth'))
  );
  setTimeout(() => reject(new Error('Sin acceso al sensor bluetooth')), 2000);
});

let connected = false;
async function connect() {
  console.log('Buscando...');
  await btSensor;

  const getDevice = new Promise((resolve, reject) => {
    noble.on('discover', (peripheral) => {
      const name = peripheral.advertisement.localName;
      if (!name || !name.includes('ELK-BLEDOM')) return;
      noble.stopScanning(() => resolve(peripheral));
    });
    setTimeout(reject, 5000);
  });
  noble.startScanning();
  device = await getDevice;

  console.log('Conectando...');
  await new Promise((resolve, reject) =>
    device.connect((error) => (error ? reject(error) : resolve()))
  );
  console.log('Connected to', device.advertisement.localName, device.id);
  transport = await new Promise((resolve, reject) =>
    device.discoverSomeServicesAndCharacteristics(
      ['fff0'],
      ['fff3'],
      (error, _, [characteristics]) =>
        error ? reject(error) : resolve(characteristics)
    )
  );
  console.log('Com aquired');
  connected = true;
}

module.exports = {
  connect: () =>
    connect().catch((error) => {
      console.error(error);
      noble.stopScanning();
      if (device) device.disconnect();
    }),
  connected: () => connected,
  disconnect: () => {
    noble.stopScanning();
    if (device) device.disconnect();
    connected = false;
  },
  run: (...x) =>
    run(...x).catch((error) => {
      console.error(error);
      noble.stopScanning();
      if (device) device.disconnect();
    }),
  COMMANDS,
};
