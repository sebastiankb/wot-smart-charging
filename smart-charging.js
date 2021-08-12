// include Eclipse node-wot packages
Servient = require("@node-wot/core").Servient
HttpClientFactory = require("@node-wot/binding-http").HttpClientFactory
MqttClientFactory = require("@node-wot/binding-mqtt").MqttClientFactory
FileClientFactory = require("@node-wot/binding-file").FileClientFactory
Helpers = require("@node-wot/core").Helpers

// create Servient and add HTTP, MQTT, File binding
let servient = new Servient();
servient.addClientFactory(new HttpClientFactory(null));
servient.addClientFactory(new MqttClientFactory(null));
servient.addClientFactory(new FileClientFactory(null));

let wotHelper = new Helpers(servient);

const CHARGE_POWER = 4000; // threshold for starting charge process

// fetch all 
wotHelper.fetch("http://127.0.0.1:8080/ecar/").then(async (td_ecar) => { // (1)
wotHelper.fetch("file://pv-system.td.jsonld").then(async (td_pv) => { // (2)

    try {
        servient.start().then((WoT) => {
            WoT.consume(td_pv).then((thing_pv) => { // (3)
            WoT.consume(td_ecar).then((thing_ecar) => { // (4)

                // keep latest PV and eCar values
                let pv_status;
                let pv_power;
                let ecar_status; 
                let ecar_soc; 

                // subscribe to current PV status (5)
                thing_pv.subscribeEvent('status', (status) => { 
                    pv_status = status;
                });

                // subscribe to current sun power production (6)
                thing_pv.subscribeEvent('power', (power) => { 
                    pv_power = power;
                });

                // request each ~2s the ecar status and soc (7)
                // (the timeout should be a little less than of the next function)
                setInterval(async function(){
                    ecar_status= await thing_ecar.readProperty("status");
                    ecar_soc= await thing_ecar.readProperty("soc");
                }, 2000); 

                // check each 5s, if eCar is ready to charge (8)
                setInterval(async function(){
                    if(ecar_status==="readyToCharge" ){ // (9)
                        console.info("eCar is ready to charge! Check the current sun power.")

                        if(pv_power>=CHARGE_POWER) { // (10)
                            console.info("Start charging")
                            thing_ecar.invokeAction("startCharging")

                        } else {
                            console.info("Too low sun power (" + pv_power +" Watt)! Wait...")
                        }
                    }
                    else if(ecar_status==="charging"){
                        console.info("eCar's SOC is " + ecar_soc +"%")
                    }
                }, 2000); // update each 2s


            });
            });
        });
    } catch (err) {
        console.error("Script error:", err);
    }
}).catch((err) => { console.error("Fetch error:", err); });
}).catch((err) => { console.error("Fetch error:", err); });


// turn off messages from core package
const debug = console.debug
console.debug = (package,...args) => {
 if(package !== "[core/content-serdes]" && 
 package !== "[binding-mqtt]" && 
 package !== "[core/helpers]" && 
 package !== "[binding-http]" && 
 package !== "[core/consumed-thing]" && 
 package !== "[core/servient]"){
    debug(package,...args)
 }
}