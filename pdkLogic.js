"use strict";
exports.__esModule = true;
exports.pdklogic = void 0;
var CT;
(function (CT) {
    //错误牌型
    CT[CT["Error"] = 0] = "Error";
    //单牌
    CT[CT["Single"] = 1] = "Single";
    //对子
    CT[CT["Double"] = 2] = "Double";
    //连对
    CT[CT["DoubleSeq"] = 3] = "DoubleSeq";
    //顺子
    CT[CT["ShunZi"] = 4] = "ShunZi";
    //3条/3带1/3带2
    CT[CT["Three"] = 5] = "Three";
    //飞机（连3条）
    CT[CT["AirPlane"] = 6] = "AirPlane";
    //4带3
    CT[CT["FourAThree"] = 7] = "FourAThree";
    //炸弹（4个相同或者AAA ）
    CT[CT["Bomb"] = 8] = "Bomb";
})(CT || (CT = {}));
var pdklogic = /** @class */ (function () {
    function pdklogic() {
    }
    pdklogic.bytesToLCard = function (cardBytes, sort, desc) {
        if (sort === void 0) { sort = true; }
        if (desc === void 0) { desc = false; }
        var cards = [];
        for (var i = 0; i < cardBytes.length; i++) {
            var v = cardBytes[i];
            if (v) {
                var lc = { o: 0, r: 0, l: 0, s: 0 };
                lc.o = v;
                lc.r = v;
                lc.l = this.logicData(v);
                cards.push(lc);
            }
        }
        if (sort) {
            if (desc) {
                this.sortByLogicDataDesc(cards);
            }
            else {
                this.sortByLogicData(cards);
            }
        }
        return cards;
    };
    pdklogic.logicData = function (card) {
        var ld = card & 0x0F;
        if (ld == 1) {
            ld += 13;
        }
        return ld;
    };
    pdklogic.sortByLogicData = function (cards) {
        cards.sort(function (a, b) {
            if (a.l == b.l) {
                return a.o - b.o;
            }
            else {
                return a.l - b.l;
            }
        });
    };
    pdklogic.sortByLogicDataDesc = function (cards) {
        cards.sort(function (a, b) {
            if (a.l == b.l) {
                return a.o - b.o;
            }
            else {
                return a.l - b.l;
            }
        });
    };
    return pdklogic;
}());
exports.pdklogic = pdklogic;
