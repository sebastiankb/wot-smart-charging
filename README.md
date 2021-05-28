# Smart Charging with Web of Things
Simulation of a photovoltaic system (based on MQTT) and an electric car (based on HTTP) to demonstrate a smart charging scenario based on the W3C Web of Things approach.

# Prerequisites
* [NodeJS](https://nodejs.org/) version 10+
* MQTT broker (e.g., [Eclipse Mosquitto](http://mosquitto.org/))

# Install dependencies ([Eclipse node-wot](https://github.com/eclipse/thingweb.node-wot/))
* `npm install @node-wot/core@0.7.5`
* `npm install @node-wot/binding-http@0.7.5`
* `npm install @node-wot/binding-mqtt@0.7.5`
* `npm install @node-wot/binding-file@0.7.5`

# Run Application
* start PV simulation in terminal I: `node pv-system.js <MQTT_Broker_Address:Port>` (e.g.,`node pv-system.js 127.0.0.1:1883`) 
* start eCar simulation in terminal II: `node smart-charging.js` 
* start smart charging application in terminal III: `node smart-charging.js` 

