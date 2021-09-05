const express = require('express');
const {
  connect,
  connected,
  disconnect,
  run,
  dim,
  COMMANDS,
} = require('./lib-ble');
const app = express();
const port = 3000;

app.use(express.json());

app.post('/sleep-service', (req, res) => {
  res.sendStatus(200);
  sleepService(req.body).catch(console.error);
});

async function sleepService({ event }) {
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

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
