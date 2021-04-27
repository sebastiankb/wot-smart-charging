# Smart Charging with Web of Things
Simulation of a photovoltaic system (based on MQTT) and an electric car (based on HTTP) to demonstrate a smart charging scenario based on the W3C Web of Things approach.

# Install dependencies (Eclipse node-wot)
* `npm install @node-wot/core@0.7.5`
* `npm install @node-wot/binding-http@0.7.5`
* `npm install @node-wot/binding-mqtt@0.7.5`
* `npm install @node-wot/binding-file@0.7.5`

# Run Application
* start PV simulation in terminal I: `node pv-system.js` 
* start eCar simulation in terminal II: `node smart-charging.js` 
* start smart charging application in terminal III: `node smart-charging.js` 

