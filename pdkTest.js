"use strict";
exports.__esModule = true;
var pdkLogic_1 = require("./pdkLogic");
function log(data) {
    for (var index = 0; index < data.length; index++) {
        var v = data[index];
        if (v) {
            console.log("key:", index, ",v:", v);
        }
    }
}
var cards = pdkLogic_1.pdklogic.bytesToLCard([0x03, 0x05, 0x07, 0x04]);
log(cards);
