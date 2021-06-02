/**
 * Simple PV/sun inverter simulator 
 * 
 * Command line call needs MQTT broker address with port number
 * 
 * E.g., node pv-system.js 127.0.0.1:1883
 */

// import dependencies
const Servient = require('@node-wot/core').Servient
const MqttBrokerServer = require('@node-wot/binding-mqtt').MqttBrokerServer
const fs = require('fs');

// read the broker address from command line 
const args = process.argv.slice(2)

if(args[0]==undefined) {

	console.log("MQTT borker address is missing. \nCommand line call needs MQTT broker address with port number. E.g.:\nnode pv-system.js 127.0.0.1:1883")
	process.exit()
}

// create Servient add MQTT binding with port configuration
let servient = new Servient();
servient.addServer(new MqttBrokerServer("mqtt://" +args[0]));

let status; // powerOn, powerOff, error
let power; // in W
let hourOfDay;

function sunMovesOn() {
	setInterval(function(){
		// get current seconds and transform it into hours
		// 60 seconds ~ 24 hours -> 2.5 secs means 1 hour
		// --> 1 minute is one day
		let date = new Date();
		let secs = date.getSeconds();
		hourOfDay = Math.round(secs / 2.5);
		
			if (hourOfDay >= 6 && hourOfDay <= 18) {
				// "power" hours
				let step = 1000;
				if (hourOfDay > 12) {
					power = (19-hourOfDay) * step;
				} else {
					power = (hourOfDay-5) * step;
				}
				status = "powerOn"
			} else {
				power = 0;
				status = "powerOff"
			}

		console.log("Charging power is " + power);
		
	}, 250);
}

servient.start().then((WoT) => {
    WoT.produce({
        title: "PV-System",
		id: "urn:dev:wot:example:pv-system",
        description: "Solar power system",
        events: {
			"status": {
				"title": "Operating status",
				"description": "Possible operating status (powerOn, powerOff, error)",
				"data": {"type": "string",
				"enum": [
					"powerOn",
					"powerOff",
					"error"
				]}
			},
			"power": {
				"title": "Current power",
				"description": "Power in Watt",
				"data" : {
					"type": "number", 
					"minimum": 0,
					"maximum": 7500,
					"unit": "W"
				}
			} 
        }
    }).then((thing) => {
        console.log("Produced " + thing.getThingDescription().title);
        // init property values
        status = "powerOff";
        power = 0.0;
		hourOfDay = 6; // with morning hours
		
        // expose the thing
        thing.expose().then(() => {
            console.info(thing.getThingDescription().title + " ready");
            console.info("TD : " + JSON.stringify(thing.getThingDescription()));
			
			// Save TD to an external file (needed for smart-charging.js)
			fs.writeFile('pv-system.td.jsonld', JSON.stringify(thing.getThingDescription(), null, 2), (err) => {
				if (err) throw err;
				console.log('Saved TD to pv-system.td.jsonld file');
			});

			setInterval(function(){
				thing.emitEvent('power', power);
				thing.emitEvent('status', status);
			}, 1000);
			// start sun simulation
			sunMovesOn();
        });
    });
});


// turn off messages from core package
const debug = console.debug
console.debug = (package,...args) => {
 if(package !== "[core]" && 
 package !== "[binding-mqtt]" && 
 package !== "[core/content-senders]"&& 
 package !== "[core/helpers]" && 
 package !== "[binding-http]" && 
 package !== "[core/consumed-thing]" && 
 package !== "[core/servient]"){
    debug(package,...args)
 }
}