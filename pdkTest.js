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
    else {
        console.log("data is null!");
    }
}
// local function test_a( r, expect )
//     if r == expect then
//         print("test pass!")
//     else
//         print("test fail!")
//     end
// end
function test_a(r, expect) {
    if (r == expect) {
        console.log("test pass!");
    }
    else {
        console.log("test fail!");
    }
}
// var localHandCard = pdklogic.bytesToLCard([0x03, 0x13, 0x23, 0x04,0x14,0x24, 0x05, 0x06, 0x15, 0x25, 0x07, 0x17, 0x27, 0x2a, 0x3a, 0x09]);
// let rtn = pdklogic.findOnePlane(localHandCard)
// console.log(rtn)
// var localHandCard = pdklogic.bytesToLCard([
//     0x03, 0x04, 0x25, 0x06,0x17,0x28,  0x09, 0x0a,0x0b, 0x2c, 0x0d,
//     0x17, 0x28,0x09,0x1a,0x3b]);
var localHandCard = pdkLogic_1.pdklogic.bytesToLCard([
    14, 46, 29, 45, 28, 11, 27, 59, 42, 57, 8, 39, 55, 6, 37, 36
]);
var localCompare = pdkLogic_1.pdklogic.bytesToLCard([
    0x03, 0x04, 0x05, 0x06, 0x07
], true, true);
// let rtn = pdklogic.findOneDoubleSeq(localHandCard)
// console.log(rtn)
console.log("------------------");
// let rtn = pdklogic.findAllThree(localHandCard, localCompare)
// console.log(rtn)
// let gt = pdklogic.isGt(localHandCard, localCompare, false)
// let same = pdklogic.sortBySame(localCompare)
// console.log("same:", same)
// let planes = pdklogic.findPlaneBody(localHandCard)
// console.log("planes:", planes)
// console.log("planes[0]", planes[0])
// let seqs = pdklogic.findDoubleSeqBody(localCompare)
// console.log("seqs:", seqs)
// // console.log(seqs.splice(seqs.length - 2, 2))
// let bombs = pdklogic.findAllBomb(localHandCard)
// localCompare = pdklogic.bytesToLCard([
//     0x05,0x06,0x07,0x17], true, true);
// let sz = pdklogic.findOneShunZi(localHandCard, localCompare)
// console.log(sz)
var rtn = pdkLogic_1.pdklogic.findAllDoubleSeq(localHandCard, pdkLogic_1.pdklogic.bytesToLCard([13, 61, 44, 60]));
console.log(rtn);
// let localHandCard = pdklogic.bytesToLCard([0x03,0x13,0x23,0x33, 0x05,0x06,0x07,0x08, 0x09, 0x0a,0x1a,0x2a,0x3a])
// // let rtn = pdklogic.bytesToLCard([0x28,0x19,0x0a,0x1c])
// // console.log(localHandCard)
// // pdklogic.deleteRtn(localHandCard, rtn)
// // console.log(localHandCard)
// let ret = pdklogic.findFirstTipShunZi(localHandCard)
// for (let i = 0; i < ret.length; i++) {
//     const element = ret[i];
//     console.log("------------")
//     console.log(element)
// }
// pdklogic.deleteRtn1(localHandCard, rtn)
// log(localHandCard)
// let selectCard = pdklogic.bytesToLCard([0x04,0x14,0x05])
// log(selectCard)
// let rtn = pdklogic.getOneAICard(localHandCard, selectCard, true)
// log(rtn)
// let f = pdklogic.isDouble(pdklogic.bytesToLCard([0x03,0x04]))
// console.log("isDouble",f)
// f = pdklogic.isDoubleSeq(pdklogic.bytesToLCard([0x03,0x04,0x13,0x14]))
// console.log("isDoubleSeq", f)
// f = pdklogic.isThree(pdklogic.bytesToLCard([0x03,0x04,0x13,0x14]))
// console.log("isThree", f)
// f = pdklogic.isThree(pdklogic.bytesToLCard([0x03,0x04,0x13,0x14,0x23]))
// console.log("isThree.1", f)
// f = pdklogic.isThree(pdklogic.bytesToLCard([0x03,0x04,0x13,0x23]), true)
// test_a(f, true)
// console.log("isThree.1", f)
// f = pdklogic.isThree(pdklogic.bytesToLCard([0x03,0x13,0x23]), true)
// test_a(f, true)
// console.log("isThree.2", f)
// let f = pdklogic.isAirplane(pdklogic.bytesToLCard([0x03,0x13,0x23, 0x04,0x14,0x24,0x08,0x33, 0x05,0x06]))
// test_a(f, true)
// f = pdklogic.isAirplane(pdklogic.bytesToLCard([0x03,0x13,0x23, 0x04,0x14,0x24,0x08, 0x05,0x06]), true)
// test_a(f, true)
// let f = pdklogic.isAirplane(pdklogic.bytesToLCard([0x03,0x13,0x23, 0x04,0x14,0x24,0x15, 0x25,0x35,0x06]))
// test_a(f, true)
// console.log("isAirplane", f)
// ret = pdklogic.findLastTipCard(pdklogic.bytesToLCard([0x03,0x13,0x28,
//      0x04,0x14,0x24, 
//      0x25,0x35,0x05
//      ,0x06,0x16,0x26,
//     0x17,0x27,0x07,0x08,0x09,0x29, 0x19,0x1a,0x2a,0x1b,0x1c,0x1d,0xe]),pdklogic.bytesToLCard([0x14, 0x24, 0x03,0x13]))
//     console.log("ret:", ret)
// ret = []
//     ret[0] = pdklogic.bytesToLCard([0x03,0x13,0x04,0x14])
//     ret[1] = pdklogic.bytesToLCard([0x05,0x15,0x04,0x14])
//     ret[1] = pdklogic.bytesToLCard([0x06,0x16,0x05,0x16])
//     console.log("------------")
//     console.log(ret)
// pdklogic.sortRetDesc(ret)
// console.log(ret)
//     console.log(ret[0].splice(ret[0].length - 3, 3))
//     console.log(ret[0])
// f = pdklogic.isAirplane(pdklogic.bytesToLCard([0x03,0x13,0x26,0x04,0x14,0x24,0x04,0x33]), true)
// test_a(f, true)
// console.log("isAirplane.2", f)
// f = pdklogic.isShunZi(pdklogic.bytesToLCard([0x09,0x0a,0x0b,0x0c,0x0d,0x0e]))
// test_a(f, true)
// f = pdklogic.isGt(pdklogic.bytesToLCard([0x0c]), pdklogic.bytesToLCard([0x0d]), false)
// console.log("f:", f)
// rtn = pdklogic.findOneShunZi(pdklogic.bytesToLCard([0x03,0x04,0x05,0x06,0x16,0x07,0x17,0x09,0x08]), pdklogic.bytesToLCard([0x03,0x04,0x05,0x06,0x07]))
// // 9 -  3 = 6
// // rtn = pdklogic.findOneShunZi(pdklogic.bytesToLCard([0x03,0x04,0x05,0x06,0x16,0x07,0x17,0x09,0x08]))
// // log(rtn)
// rtn = pdklogic.findOneDoubleSeq(pdklogic.bytesToLCard([0x03, 0x04,0x14,0x05,0x15,0x06,0x16]))
// log(rtn)
// rtn = pdklogic.findAllDoubleSeq(pdklogic.bytesToLCard([0x03, 0x04,0x18,0x0d,0x1d,0x2d,0x0e,0x1e]), pdklogic.bytesToLCard([0x03,0x13, 0x04,0x14]))
// log(rtn)
// Math.random()
// console.log(Math.round(3))
// function random(max: number, min: number = 0){
//     let range = max - min;
//     let ranValue = min + Math.round(Math.random() * range);
//     return ranValue
// }
// console.log(random(3))
