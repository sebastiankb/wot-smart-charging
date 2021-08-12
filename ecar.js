/**
 * Simple eCar simulator 
 * 
 * Call: node ecar.js
 */

// import dependencies
const Servient = require('@node-wot/core').Servient
const HttpServer = require('@node-wot/binding-http').HttpServer

// create Servient add HTTP binding with port configuration
let servient = new Servient();
servient.addServer(new HttpServer({
    // port: 8081 // (default 8080)
}));

// runtime data
let soc; // state of charge 0..100%
let driving; // is driving true/false
let status; // readyToCharge, charging, stopCharging

function driveCar() {
    console.log("Driving...");
    driving = true;
    //status = "stopCharging";
    setTimeout(function () {
        //  code after time
        let decStep = 5.25;
        soc -= 1;
        if (soc <= 0) {
            driving = false;
            soc = 0.0;
            console.log("Battery drained :-(");
        } else {
            // keep on driving ?
            if (driving) {
                driveCar();
            }
        }
        console.log("Charging status decreased by " + decStep + " -> " + soc);
    }, 250);
}

function stopCar() {
    console.log("STOP driving!");
    driving = false;
}

function chargeCar() {

    driving = false;

    let intId = setInterval(async function () {

        console.log("Charging... (SOC): " + soc + "%");

        if (soc == 100) {
            soc = 100;
            console.log("Battery fully charged :-)");
            //complete charging and set stopCharging status 
            clearInterval(intId); // stop loop
        }
        if (soc <= 99) {
            //  charging step
            let incStep = 4;
            soc += incStep;
        }
    }, 2000);

}

function stopCharging() {
    console.log("STOP charging!");
    status = "readyToCharge";

}

servient.start().then((WoT) => {
    WoT.produce({
        title: "eCar",
        description: "eCarThing",
        properties: {
            soc: {
                type: "number",
                description: "Current chargingStatus in % (0 ... 100%)",
                observable: true,
                readOnly: true,
                minimum: 0.0,
                maximum: 100.0
            },
            driving: {
                type: "boolean",
                description: "Is car driving around",
                observable: true,
                readOnly: true
            },
            status: {
                type: "string",
                description: "Current car status (readyToCharge, charging, stopCharging)",
                "enum": ["readyToCharge", "charging", "stopCharging"],
                observable: true
            }
        },
        actions: {
            startDriving: {
                description: "Starting to drive"
            },
            stopDriving: {
                description: "Stopping to drive"
            },
            startCharging: {
                description: "Starting to charge"
            },
            stopCharging: {
                description: "Stopping to charge"
            }
        }
    }).then((thing) => {
        console.log("Produced " + thing.getThingDescription().title);
        // init property values
        soc = 32;
        driving = false;
        status = "notReadyToCharge";
        // set property handlers (using async-await)
        thing.setPropertyReadHandler("soc", async () => soc);
        thing.setPropertyReadHandler("driving", async () => driving);
        thing.setPropertyReadHandler("status", async () => status);

        // set action handlers (using async-await)
        thing.setActionHandler("startDriving", async (params, options) => {
            status = "stopCharging";
            driveCar();
        });
        thing.setActionHandler("stopDriving", async (params, options) => {
            status = "readyToCharge";
            stopCar();
        });
        thing.setActionHandler("startCharging", async (params, options) => {
            status = "charging";
            chargeCar();
        });
        thing.setActionHandler("stopCharging", async (params, options) => {
            status = "stopCharging";
            stopCharging();
        });

        // expose the thing
        thing.expose().then(() => {
            console.info(thing.getThingDescription().title + " ready");
            console.info("TD : " + JSON.stringify(thing.getThingDescription()));
            thing.readProperty("status").then((c) => {
                console.log("eCar status is " + c);
            });
        });

        // after 2.5s change status
        setTimeout(function () {
            status = "readyToCharge";
            thing.readProperty("status").then((c) => {
                console.log("eCar status is " + c);
            });
        }, 2500);

        // after 2.5s change status
        setInterval(function () {
            if(soc==100) {status = "stopCharging"}
        }, 2000);


    });
});

// turn off messages from core package
const debug = console.debug
console.debug = (package, ...args) => { }

const warn = console.warn
console.warn = (package, ...args) => { }