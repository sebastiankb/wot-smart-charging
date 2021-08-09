# Smart Charging with Web of Things
Simulation of a photovoltaic system (based on MQTT) and an electric car (based on HTTP) to demonstrate a smart charging scenario based on the W3C Web of Things approach.

| |Sun-Inverter|eCar|
--- | --- | ---
|Protocol|MQTT|HTTP|
|Content-type|text-plain|application-json|
|Data model / functions|status ("powerOn”, "powerOff”, "error”)<br />Topic (publish): {..}/status| status ("readyToCharge”, "charging”, "stopCharging”)<br />Resource (GET): {..}/state|
| |power (0..7500 Watt)<br />Topic (publish): {..}/power | soc (0..100%)<br />Resource (GET): {..}/soc|
| | | startCharging<br />Resource (POST): {..}/startCharging |
| | | stopCharging<br />Resource (POST): {..}/stopCharging  |

# Prerequisites
* [NodeJS](https://nodejs.org/) version 10+
* MQTT broker (e.g., [Eclipse Mosquitto](http://mosquitto.org/))

# Install dependencies ([Eclipse node-wot](https://github.com/eclipse/thingweb.node-wot/))
* `npm install @node-wot/core@0.7.7`
* `npm install @node-wot/binding-http@0.7.7`
* `npm install @node-wot/binding-mqtt@0.7.7`
* `npm install @node-wot/binding-file@0.7.7`

# Run Application
* start PV simulation in terminal I: `node pv-system.js <MQTT_Broker_Address:Port>` (e.g.,`node pv-system.js 127.0.0.1:1883`) 
* start eCar simulation in terminal II: `node ecar.js` 
* start smart charging application in terminal III: `node smart-charging.js` 

Hint: The `<MQTT_Broker_Address:Port>` must be the same as provided in the Thing Description `pv-system.td.jsonld` by the `base` term .