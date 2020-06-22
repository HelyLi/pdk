import {pdklogic} from "./pdkLogic"

function log(data) {
    if (data) {
        for (let index = 0; index < data.length; index++) {
            const v = data[index];
            if (v) {
                console.log("key:", index, ",v:", v)
            }
        }
        console.log("------------------------------------")
    }
}

let localHandCard = pdklogic.bytesToLCard([0x03,0x13,0x04,0x04,0x04])
log(localHandCard)

let selectCard = pdklogic.bytesToLCard([0x04,0x04,0x04])
log(selectCard)

let rtn = pdklogic.getOneAICard(localHandCard, selectCard, true)
log(rtn)

