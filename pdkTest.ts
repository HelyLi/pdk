import {pdklogic} from "./pdkLogic"

function log(data) {
    for (let index = 0; index < data.length; index++) {
        const v = data[index];
        if (v) {
            console.log("key:", index, ",v:", v)
        }
    }
}

let cards = pdklogic.bytesToLCard([0x03,0x05,0x07,0x04])
log(cards)
