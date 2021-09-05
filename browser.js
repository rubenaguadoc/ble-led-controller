let characteristic;

const hexToBuff = (hex) =>
  new Uint8Array(hex.match(/[\dA-F]{2}/gi).map((s) => parseInt(s, 16)));

const buffToHex = (buff) =>
  [...new Uint8Array(buff)]
    .map((e) => e.toString(16).padStart(2, '0'))
    .join('');

const codes = {
  color: (
    r, //? 0-255 || #RRGGBB
    g,
    b
  ) =>
    !g
      ? `7e070503${r.replace('#', '')}10ef`
      : `7e070503${r.toString(16).padStart(2, '0')}${g
          .toString(16)
          .padStart(2, '0')}${b.toString(16).padStart(2, '0')}10ef`,
  brightness: (
    brightness //? 0-100
  ) => `7e0401${brightness.toString(16).padStart(2, '0')}01ffff00ef`,
  on: () => '7e0404f00001ff00ef',
  off: () => '7e0404000000ff00ef',
};

const COMMANDS = { ON: 'on', OFF: 'off', COLOR: 'color', BRI: 'brightness' };

async function connect() {
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: 'ELK-BLE' }],
    optionalServices: [0xfff0],
  });
  const server = await device.gatt.connect();
  const service = await server.getPrimaryService(
    '0000fff0-0000-1000-8000-00805f9b34fb'
  );
  characteristic = await service.getCharacteristic(
    '0000fff3-0000-1000-8000-00805f9b34fb'
  );
  // const value = buffToHex((await characteristic.readValue()).buffer);
  // console.log(value);
}

async function run(cmd, ...rest) {
  await characteristic.writeValueWithoutResponse(
    hexToBuff(codes[cmd](...rest))
  );
}

connect().then(async () => {
  await run(COMMANDS.ON);
  await run(COMMANDS.COLOR, '#008080');
  await run(COMMANDS.BRI, 25);
});
