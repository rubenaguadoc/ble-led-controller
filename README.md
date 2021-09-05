# ble-led-controller

Servidor HTTP para recibir peticiones de [Sleep As Android](https://sleep.urbandroid.org/).

Enciende las luces simulando un amanecer al sonar el despertados, las apaga si se pospone la alarma, y las termina de encender cuando se corta definitivamente.

`lib-ble.js` expone las funciones necesarias para poder controlar las luces.

`router.js` se encarga de gestionar la comunicación con SAA y el amanecer.

`browser.js` es una versión que permite controlar el dispositivo BLE desde el navegador

Los comandos implementados son para unas luces del chino, controladas mediante BLE.

No sé de qué marca son, pero la APP original es [Lotus Lantern](https://play.google.com/store/apps/details?id=wl.smartled).
