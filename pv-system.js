// create a node-wot servient
const Servient = require('@node-wot/core').Servient
const MqttBrokerServer = require('@node-wot/binding-mqtt').MqttBrokerServer

// create Servient add HTTP binding with port configuration
let servient = new Servient();
servient.addServer(new MqttBrokerServer("mqtt://192.168.178.64:1883"));

let status; // enum
let power; // number
let hourOfDay;

function start() {
    console.log("Starting PV System...");
	status = "powerOn";
    power = 0;
}

function stop() {
    console.log("Starting PV System...");
    status = "powerOff";
	power = 0;
}

function error() {
	console.log("PV System failure...");
	status = "error";
	power = 0;
}


function sunMovesOn() {
	setTimeout(function(){
		// get current seconds and transform it into hours
		// 60 seconds ~ 24 hours -> 2.5 secs means 1 hour
		// --> 1 minute is one day
		let date = new Date();
		let secs = date.getSeconds();
		hourOfDay = Math.round(secs / 2.5);
		
//		if (status == "powerOn") {
			if (hourOfDay >= 6 && hourOfDay <= 18) {
				// "power" hours
				let step = 1000;
				if (hourOfDay > 12) {
					power = (19-hourOfDay) * step;
				} else {
					power = (hourOfDay-5) * step;
				}
			} else {
				power = 0;
			}
/*		} else {
			power = 0;
		}
		*/
		console.log("Charging power is " + power);
		
		// moves on all the time
		sunMovesOn();
	}, 250);
}

servient.start().then((WoT) => {
    WoT.produce({
        title: "PV-System",
        description: "Solar power system",
        events: {
			"status": {
				"title": "Betriebszustand",
				"description": "Mögliche Zustände (Strom Produktion, Nachtmodus, Fehler)",
				"data": {"type": "string",
				"enum": [
					"powerOn",
					"powerOff",
					"error"
				]}
			},
			"power": {
				"title": "Aktuelle Leistung",
				"description": "Leistung in Watt",
				"date" : {"type": "number",
				"unit": "W"}
			} 
        },
        actions: {
			"start": {
			},
			"stop": {
			},
			"error": {
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
            thing.readProperty("status").then((c) => {
                console.log("status is " + c);
            });
            thing.readProperty("power").then((c) => {
                console.log("power is " + c);
			});
			
			setInterval(function(){
				thing.emitEvent('power', power);
				thing.emitEvent('status', status);

			}, 1000);

			
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