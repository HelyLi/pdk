"use strict";
exports.__esModule = true;
var pdkLogic_1 = require("./pdkLogic");
function log(data) {
    if (data) {
        for (var index = 0; index < data.length; index++) {
            var v = data[index];
            if (v) {
                console.log("key:", index, ",v:", v);
            }
        }
        console.log("------------------------------------");
    }
}
var localHandCard = pdkLogic_1.pdklogic.bytesToLCard([0x03, 0x13, 0x04, 0x04, 0x04]);
log(localHandCard);
var selectCard = pdkLogic_1.pdklogic.bytesToLCard([0x04, 0x04, 0x04]);
log(selectCard);
var rtn = pdkLogic_1.pdklogic.getOneAICard(localHandCard, selectCard, true);
log(rtn);
