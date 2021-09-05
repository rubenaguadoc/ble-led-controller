const express = require('express');
const { connect, connected, disconnect, run, COMMANDS } = require('./lib-ble');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/sleep-service', (req, res) => {
  res.sendStatus(200);
  sleepService(req, res).catch(console.error);
});

async function sleepService(req, res) {
  const { event } = req.body;
  if (event === 'alarm_alert_start') {
    if (!connected()) await connect();
    await dim(1, [255, 25, 0], 0.1);
    await run(COMMANDS.ON);
    await dim(100, [255, 255, 0], 45);
    await dim(100, [255, 255, 255], 15);
    await disconnect();
  } else if (event === 'alarm_snooze_clicked') {
    if (!connected()) await connect();
    await dim(1, [255, 35, 0], 2);
    await run(COMMANDS.OFF);
    await disconnect();
  } else if (event === 'alarm_alert_dismiss') {
    if (!connected()) await connect();
    await dim(100, [255, 255, 0], 5);
    await dim(100, [255, 255, 255], 2);
    await disconnect();
  }
}

let dimming = false;
let dimInterval;
let bri = 0;
let color = { r: 0, g: 0, b: 0 };
let SMOOTH = 50;

async function dim(tBri, [tr, tg, tb], t) {
  if (dimming) clearInterval(dimInterval);
  dimming = true;
  let timePassed = 0;

  const dBri = (tBri - bri) / ((t * 1000) / SMOOTH);
  const dr = (tr - color.r) / ((t * 1000) / SMOOTH);
  const dg = (tg - color.g) / ((t * 1000) / SMOOTH);
  const db = (tb - color.b) / ((t * 1000) / SMOOTH);

  return new Promise((resolve, reject) => {
    const to = setTimeout(
      () => reject(new Error('Uncompleted')),
      (t + 0.5) * 1000
    );
    dimInterval = setInterval(() => {
      bri += dBri;
      color.r += dr;
      color.g += dg;
      color.b += db;
      // console.log(
      //   Math.round(bri),
      //   Math.round(color.r),
      //   Math.round(color.g),
      //   Math.round(color.b)
      // );
      run(COMMANDS.BRI, Math.round(bri)).then(() =>
        run(
          COMMANDS.COLOR,
          Math.round(color.r),
          Math.round(color.g),
          Math.round(color.b)
        )
      );

      timePassed += SMOOTH;
      if (timePassed >= t * 1000) {
        clearInterval(dimInterval);
        clearTimeout(to);
        dimming = false;
        resolve();
      }
    }, SMOOTH);
  });
}

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
