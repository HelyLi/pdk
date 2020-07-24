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
/**
 * 不拆炸弹
 */
var pdklogic = /** @class */ (function () {
    function pdklogic() {
    }
    // static bytesToLCard(cardBytes: number[], sort: boolean = true, desc: boolean = false): lcardTmp[] {
    //     let cards = []
    //     for (let i = 0; i < cardBytes.length; i++) {
    //         const v = cardBytes[i];
    //         if (v) {
    //             let lc: lcardTmp = { o: 0, r: 0, l: 0, s: 0 };
    //             lc.o = v
    //             lc.r = v
    //             lc.l = this.logicData(v)
    //             cards.push(lc)
    //         }
    //     }
    //     if (sort) {
    //         if (desc) {
    //             this.sortByLogicDataDesc(cards)
    //         } else {
    //             this.sortByLogicData(cards)
    //         }
    //     }
    //     return cards
    // }
    // static logicData(card: number): number {
    //     let ld = card & 0x0F
    //     if (ld == 1 || ld == 2) {
    //         ld += 13
    //     }
    //     return ld
    // }
    pdklogic.bytesToLCard = function (cardBytes, sort, desc) {
        if (sort === void 0) { sort = true; }
        if (desc === void 0) { desc = false; }
        var cards = [];
        for (var i = 0; i < cardBytes.length; i++) {
            var v = cardBytes[i];
            if (v) {
                var lc = { o: 0, r: 0, l: 0, s: 0 };
                lc.o = v;
                lc.r = this.replaceData(v);
                lc.l = v & 0x0F;
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
    pdklogic.replaceData = function (card) {
        var rd = card & 0x0F;
        if (rd == 14 || rd == 15) {
            rd -= 13;
        }
        rd += card & 0xF0;
        return rd;
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
                return b.l - a.l;
            }
        });
    };
    pdklogic.dataToIndex = function (cards) {
        var cardIndex = [];
        for (var i = 0; i < cards.length; i++) {
            var v = cards[i];
            if (v) {
                if (cardIndex[v.l] == undefined) {
                    cardIndex[v.l] = [];
                }
                cardIndex[v.l].push(v);
            }
        }
        return cardIndex;
    };
    pdklogic.findAllSameCardByIndex = function (cardIndex) {
        var rtn = [];
        for (var i = 3; i < cardIndex.length; i++) {
            var v = cardIndex[i];
            if (v) {
                if (rtn[v.length] == undefined) {
                    rtn[v.length] = [];
                }
                rtn[v.length].push(v);
            }
        }
        return rtn;
    };
    pdklogic.findAllSameCardByIndexDesc = function (cardIndex) {
        var rtn = [];
        for (var i = cardIndex.length - 1; i >= 3; i--) {
            var v = cardIndex[i];
            if (v) {
                if (rtn[v.length] == undefined) {
                    rtn[v.length] = [];
                }
                rtn[v.length].push(v);
            }
        }
        return rtn;
    };
    pdklogic.sortBySame = function (cards, cardType) {
        var cardIndex = this.dataToIndex(cards);
        var sameCard = this.findAllSameCardByIndex(cardIndex);
        if (cardType == CT.AirPlane) {
            var rtn = [];
            var seq = 2;
            var foundThree = false;
            var lastThreeMax = 0;
            var threeLen = 0;
            var lastTHreeMaxL = 0;
            var curThreeL = 0;
            for (var i = 3; i < cardIndex.length; i++) {
                var v = cardIndex[i];
                if (v && v.length >= 3) {
                    if (!foundThree) {
                        foundThree = true;
                        seq = i;
                        threeLen = 1;
                        curThreeL = i;
                    }
                    else {
                        if (seq + 1 == i) {
                            threeLen++;
                        }
                        seq = i;
                        curThreeL = i;
                        if (i == 14) {
                            if (threeLen >= lastThreeMax) {
                                lastTHreeMaxL = curThreeL;
                            }
                            lastThreeMax = Math.max(lastThreeMax, threeLen);
                            threeLen = 0;
                        }
                    }
                }
                else {
                    foundThree = false;
                    seq = i;
                    if (threeLen >= lastThreeMax) {
                        lastTHreeMaxL = curThreeL;
                    }
                    lastThreeMax = Math.max(lastThreeMax, threeLen);
                    threeLen = 0;
                }
            }
            var minL = lastTHreeMaxL - lastThreeMax + 1;
            for (var i = minL; i <= lastTHreeMaxL; i++) {
                var v = cardIndex[i];
                if (v) {
                    rtn = rtn.concat(v);
                }
            }
            for (var i = sameCard.length - 1; i >= 1; i--) {
                var sameItem = sameCard[i];
                if (sameItem) {
                    for (var j = 0; j < sameItem.length; j++) {
                        var v = sameItem[j];
                        if (v[0].l < minL || v[0].l > lastTHreeMaxL) {
                            rtn = rtn.concat(v);
                        }
                    }
                }
            }
            return rtn;
        }
        else {
            var rtn = [];
            for (var i = sameCard.length - 1; i >= 1; i--) {
                var sameItem = sameCard[i];
                if (sameItem) {
                    for (var j = 0; j < sameItem.length; j++) {
                        var v = sameItem[j];
                        if (v) {
                            rtn = rtn.concat(v);
                        }
                    }
                }
            }
            return rtn;
        }
    };
    pdklogic.color = function (card) {
        return (card & 0xF0) >> 4;
    };
    /*--------------------------------*/
    // 是否一对 传入本地结构
    pdklogic.isDouble = function (cards) {
        if (cards.length != 2) {
            return false;
        }
        return cards[0].l == cards[1].l;
    };
    // 是否连对 传入本地结构
    pdklogic.isDoubleSeq = function (cards) {
        var cardLen = cards.length;
        if (cardLen < 4 || cardLen % 2 != 0) {
            return false;
        }
        var lastCard = cards[0].l - 1;
        for (var i = 0; i < cardLen; i = i + 2) {
            var v = cards[i];
            if (lastCard + 1 != v.l) {
                return false;
            }
            lastCard = v.l;
            if (v.l != cards[i + 1].l) {
                return false;
            }
        }
        return true;
    };
    // 是否3条
    pdklogic.isThree = function (cards, last) {
        if (last === void 0) { last = false; }
        var cardLen = cards.length;
        if (cardLen < 3 || cardLen > 5) {
            return false;
        }
        if (!last) {
            if (cardLen != 5) {
                return false;
            }
        }
        if (cardLen == 3) {
            return cards[0].l == cards[1].l && cards[0].l == cards[2].l;
        }
        if (cardLen == 4) {
            return (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l != cards[3].l);
        }
        if (cardLen == 5) {
            return (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l != cards[4].l);
        }
    };
    // 是否飞机
    pdklogic.isAirplane = function (cards, last) {
        if (last === void 0) { last = false; }
        var cardLen = cards.length;
        if (cardLen < 6) {
            return false;
        }
        if (!last && cardLen < 10) {
            return false;
        }
        if (!last && cardLen % 5 != 0) {
            return false;
        }
        var remain = cardLen;
        var cardIndex = this.dataToIndex(cards);
        var seq = 2;
        var foundThree = false;
        var lastThreeMax = 0;
        var threeLen = 0;
        for (var i = 3; i < cardIndex.length; i++) {
            var v = cardIndex[i];
            if (v && v.length >= 3) {
                if (!foundThree) {
                    foundThree = true;
                    seq = i;
                    threeLen = 1;
                }
                else {
                    if (seq + 1 == i) {
                        threeLen++;
                    }
                    seq = i;
                    if (i == 14) {
                        lastThreeMax = Math.max(lastThreeMax, threeLen);
                        threeLen = 0;
                    }
                }
            }
            else {
                foundThree = false;
                seq = i;
                lastThreeMax = Math.max(lastThreeMax, threeLen);
                threeLen = 0;
            }
        }
        if (lastThreeMax < 2) {
            return false;
        }
        threeLen = lastThreeMax * 3;
        remain = cardLen - threeLen;
        console.log("threeLen:", threeLen, ",remain:", remain);
        if (!last) {
            if (remain / 2 == lastThreeMax) {
                return true;
            }
            else {
                if (lastThreeMax > 2) {
                    var fit = false;
                    var tMax = lastThreeMax;
                    var lr = remain;
                    var lbreak = true;
                    do {
                        lr += 3;
                        tMax -= 1;
                        if (tMax < 2) {
                            fit = false;
                            lbreak = false;
                        }
                        if (lr / 2 == tMax) {
                            fit = true;
                            lbreak = false;
                        }
                    } while (lbreak);
                    return fit;
                }
            }
        }
        else {
            if (remain <= lastThreeMax * 2) {
                return true;
            }
        }
        return false;
    };
    //是否4带3
    pdklogic.isFourAThree = function (cards, last) {
        if (last === void 0) { last = false; }
        var cardLen = cards.length;
        if (cardLen < 5 || cardLen > 7) {
            return false;
        }
        if (!last && cardLen != 7) {
            return false;
        }
        return (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l == cards[3].l);
    };
    pdklogic.isBomb = function (cards) {
        var cardLen = cards.length;
        if (cardLen < 3 && cardLen > 4) {
            return false;
        }
        if (cardLen == 3) {
            return (cards[0].l == 14 && cards[0].l == cards[1].l && cards[0].l == cards[2].l);
        }
        return (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l == cards[3].l);
    };
    pdklogic.isShunZi = function (cards) {
        var cardLen = cards.length;
        if (cardLen < 5) {
            return false;
        }
        var card = cards[cardLen - 1].l;
        if (card == 0x0F) { //2不能参与顺子
            return false;
        }
        card = cards[0].l;
        for (var i = 1; i < cardLen; i++) {
            if (card + 1 != cards[i].l) {
                return false;
            }
            card = cards[i].l;
        }
        return true;
    };
    pdklogic.getCardType = function (cards, last) {
        if (last === void 0) { last = false; }
        var cardLen = cards.length;
        cards = this.sortBySame(cards);
        if (cardLen == 1) {
            return CT.Single;
        }
        if (cardLen == 2) {
            if (cards[0].l == cards[1].l) {
                return CT.Double;
            }
        }
        if (cardLen == 3) {
            if (last) {
                if (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l != 14) {
                    return CT.Three;
                }
            }
            if (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l == 14) {
                return CT.Bomb;
            }
        }
        if (cardLen == 4) {
            if (this.isBomb(cards)) {
                return CT.Bomb;
            }
            if (this.isDoubleSeq(cards)) {
                return CT.DoubleSeq;
            }
            if (this.isThree(cards, last)) {
                return CT.Three;
            }
        }
        if (cardLen >= 5) {
            if (this.isFourAThree(cards, last)) {
                return CT.FourAThree;
            }
            if (this.isAirplane(cards, last)) {
                return CT.AirPlane;
            }
            if (this.isThree(cards)) {
                return CT.Three;
            }
            if (cardLen % 2 == 0) {
                if (this.isDoubleSeq(cards)) {
                    return CT.DoubleSeq;
                }
            }
            if (this.isShunZi(cards)) {
                return CT.ShunZi;
            }
        }
        return CT.Error;
    };
    pdklogic.findFirstOutCard = function (localHandCard) {
        this.sortByLogicData(localHandCard);
        for (var i = 3; i >= 0; i--) {
            for (var j = 0; j < localHandCard.length; j++) {
                var v = localHandCard[j];
                if (v && this.color(v.o) == i) {
                    return v;
                }
            }
        }
        return null;
    };
    /****************************************/
    pdklogic.findOneDoubleSeq = function (localHandCard, localCompare) {
        if (localHandCard.length < 4) {
            return null;
        }
        var minCld = 2;
        var compareSeq = 0;
        var any = false;
        if (localCompare) {
            minCld = localCompare[0].l;
            compareSeq = localCompare.length / 2;
        }
        else {
            minCld = 2;
            compareSeq = Math.floor(localHandCard.length / 2);
            any = true;
        }
        var handCardIndex = this.dataToIndex(localHandCard);
        var lastLd = minCld;
        for (var i = minCld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length == 2) {
                lastLd = i;
                for (var j = i + 1; j < handCardIndex.length; j++) {
                    var v_1 = handCardIndex[j];
                    if (v_1 && v_1.length == 2) {
                        if (lastLd + 1 == j) {
                            lastLd = j;
                            if (j - i + 1 >= compareSeq) {
                                var r = [];
                                for (var m = i; m <= j; m++) {
                                    r = r.concat(handCardIndex[m]);
                                }
                                return r;
                            }
                        }
                        else {
                            if (any) {
                                if (j - i >= 2) {
                                    var r = [];
                                    for (var m = i; m < j; m++) {
                                        r = r.concat(handCardIndex[m]);
                                    }
                                    return r;
                                }
                            }
                            break;
                        }
                    }
                    else {
                        if (any) {
                            if (j - i >= 2) {
                                var r = [];
                                for (var m = i; m < j; m++) {
                                    r = r.concat(handCardIndex[m]);
                                }
                                return r;
                            }
                        }
                        break;
                    }
                }
            }
        }
        for (var i = minCld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length >= 2) {
                lastLd = i;
                for (var j = i + 1; j < handCardIndex.length; j++) {
                    var v_2 = handCardIndex[j];
                    if (v_2 && v_2.length >= 2) {
                        if (lastLd + 1 == j) {
                            lastLd = j;
                            if (j - i + 1 >= compareSeq) {
                                var r = [];
                                for (var m = i; m <= j; m++) {
                                    r = r.concat(handCardIndex[m].slice(0, 2));
                                }
                                return r;
                            }
                        }
                        else {
                            if (any) {
                                if (j - i >= 2) {
                                    var r = [];
                                    for (var m = i; m < j; m++) {
                                        r = r.concat(handCardIndex[m].slice(0, 2));
                                    }
                                    return r;
                                }
                            }
                        }
                    }
                    else {
                        if (any) {
                            if (j - i >= 2) {
                                var r = [];
                                for (var m = i; m < j; m++) {
                                    r = r.concat(handCardIndex[m].slice(0, 2));
                                }
                                return r;
                            }
                        }
                        break;
                    }
                }
            }
        }
        return null;
    };
    pdklogic.findOneThree = function (localHandCard, localCompare) {
        if (localHandCard.length < 3) {
            return null;
        }
        var minCld = 2;
        var singleCnt = 0;
        if (localCompare) {
            minCld = localCompare[0].l;
            singleCnt = Math.min(localHandCard.length - 3, localCompare.length - 3);
        }
        else {
            minCld = 2;
            singleCnt = Math.min(localHandCard.length - 3, 2);
        }
        var handCardIndex = this.dataToIndex(localHandCard);
        var found = false;
        var rtn = [];
        for (var i = minCld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length >= 3) {
                found = true;
                rtn = rtn.concat(v);
                singleCnt -= (v.length - 3);
                break;
            }
        }
        if (found && singleCnt > 0) {
            for (var i = 3; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length == 1) {
                    rtn = rtn.concat(v);
                    singleCnt -= 1;
                    if (singleCnt == 0) {
                        break;
                    }
                }
            }
        }
        if (found && singleCnt > 0) {
            for (var i = 3; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length > 1 && v.length < 3) {
                    var removeCount = Math.min(singleCnt, v.length);
                    rtn = rtn.concat(v.slice(0, removeCount));
                    singleCnt -= removeCount;
                    if (singleCnt == 0) {
                        break;
                    }
                }
            }
        }
        if (found && singleCnt == 0) {
            return rtn;
        }
        return null;
    };
    pdklogic.findOneFourThree = function (localHandCard, localCompare) {
        if (localHandCard.length < 4) {
            return null;
        }
        var minCld = 2;
        var singleCnt = 0;
        if (localCompare) {
            minCld = localCompare[0].l;
            singleCnt = Math.min(localHandCard.length - 4, localCompare.length - 4);
        }
        else {
            minCld = 2;
            singleCnt = Math.min(localHandCard.length - 4, 3);
        }
        var found = false;
        var rtn = [];
        var handCardIndex = this.dataToIndex(localHandCard);
        for (var i = minCld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length == 4) {
                found = true;
                rtn = rtn.concat(v);
                break;
            }
        }
        if (found && singleCnt > 0) {
            for (var i = 2; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length == 1) {
                    rtn = rtn.concat(v);
                    singleCnt -= 1;
                    if (singleCnt == 0) {
                        break;
                    }
                }
            }
        }
        if (found && singleCnt > 0) {
            for (var i = 0; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length < 4 && v.length > 1) {
                    var minus = Math.min(singleCnt, v.length);
                    rtn = rtn.concat(v.slice(0, minus));
                    singleCnt -= minus;
                    if (singleCnt == 0) {
                        break;
                    }
                }
            }
        }
        if (found && singleCnt == 0) {
            return rtn;
        }
        return null;
    };
    pdklogic.findOneShunZi = function (localHandCard, localCompare) {
        if (localHandCard.length < 5) {
            return null;
        }
        var compareLen = 5;
        var minCld = 2;
        if (localCompare) {
            minCld = localCompare[0].l;
            compareLen = localCompare.length;
        }
        else {
            minCld = 2;
            this.sortByLogicData(localHandCard);
            compareLen = Math.max(5, Math.abs(localHandCard[localHandCard.length - 1].l - localHandCard[0].l) + 1);
            minCld = localHandCard[0].l - 1;
            console.log("minCld:", minCld, ",compareLen:", compareLen, ",minCld:", minCld);
        }
        var handCardIndex = this.dataToIndex(localHandCard);
        var lastLd = minCld;
        for (var i = minCld + 1; i < handCardIndex.length; i++) {
            if (handCardIndex.length - i < compareLen) {
                break;
            }
            var v = handCardIndex[i];
            if (v && v.length > 0) {
                lastLd = i;
                for (var j = i + 1; j < handCardIndex.length; j++) {
                    var v_3 = handCardIndex[j];
                    if (v_3 && v_3.length > 0) {
                        if (lastLd + 1 == j) {
                            lastLd = j;
                            if (j - i + 1 >= compareLen) {
                                var r = [];
                                for (var m = i; m <= j; m++) {
                                    r.push(handCardIndex[m][0]);
                                }
                                return r;
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        return null;
    };
    pdklogic.findOnePlane = function (localHandCard, localCompare) {
        if (localHandCard.length < 6) {
            return null;
        }
        var compareLen = 0;
        var threeLen = 0;
        var singleCnt = 0;
        var minCld = 0;
        if (localCompare) {
            var lc = this.sortBySame(localCompare, CT.AirPlane);
            var cardIndex = this.dataToIndex(lc);
            var seq = 2;
            var foundThree = false;
            var lastThreeMax = 0;
            for (var i = 3; i < cardIndex.length; i++) {
                var v = cardIndex[i];
                if (v && v.length >= 3) {
                    if (!foundThree) {
                        foundThree = true;
                        seq = i;
                        threeLen = 1;
                    }
                    else {
                        if (seq + 1 == i) {
                            threeLen += 1;
                        }
                        seq = i;
                        if (i == 14) {
                            lastThreeMax = Math.max(lastThreeMax, threeLen);
                            threeLen = 0;
                        }
                    }
                }
                else {
                    foundThree = false;
                    seq = i;
                    lastThreeMax = Math.max(lastThreeMax, threeLen);
                    threeLen = 0;
                }
            }
            threeLen = lastThreeMax;
            compareLen = localCompare.length;
            if (localHandCard.length < threeLen * 3) {
                return null;
            }
            singleCnt = Math.min(compareLen - threeLen * 3, localHandCard.length - threeLen * 3);
            minCld = localCompare[0].l;
        }
        else {
            minCld = 2;
            var srcCardIndex = this.dataToIndex(localHandCard);
            var srcSameCard = this.findAllSameCardByIndex(srcCardIndex);
            var threeMax = 0;
            if (srcSameCard[3]) {
                threeMax = srcSameCard[3].length;
            }
            if (threeMax < 2) {
                return null;
            }
            var lastCard = srcSameCard[3][0][0].l - 1;
            threeMax = 0;
            for (var i = 0; i < srcSameCard[3].length; i++) {
                var v = srcSameCard[3][i];
                if (lastCard + 1 == v[0].l) {
                    lastCard += 1;
                    threeMax += 1;
                }
                else {
                    break;
                }
            }
            if (threeMax < 2) {
                return null;
            }
            threeLen = threeMax;
            singleCnt = Math.min(localHandCard.length - threeMax * 3, threeMax * 2);
            compareLen = threeLen * 3 + singleCnt;
            console.log("threeLen:", threeLen, ",singleCnt:", singleCnt, ",compareLen:", compareLen);
        }
        var rtn = [];
        var handCardIndex = this.dataToIndex(localHandCard);
        var lastLd = minCld;
        var found = false;
        var minL = 3;
        var maxL = 3;
        for (var i = minCld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (found) {
                break;
            }
            if (v && v.length >= 3) {
                lastLd = i;
                for (var j = i + 1; j < handCardIndex.length; j++) {
                    var v_4 = handCardIndex[j];
                    if (v_4 && v_4.length >= 3) {
                        if (lastLd + 1 == j) {
                            lastLd = j;
                            if (j - i + 1 >= threeLen) {
                                minL = i;
                                maxL = j;
                                for (var m = i; m <= j; m++) {
                                    var v_5 = handCardIndex[m];
                                    found = true;
                                    rtn = rtn.concat(v_5.slice(0, 3));
                                }
                                break;
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        if (found && singleCnt > 0) {
            for (var i = 3; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length == 1) {
                    rtn = rtn.concat(v);
                    singleCnt -= 1;
                    if (singleCnt == 0) {
                        break;
                    }
                }
            }
        }
        if (found && singleCnt > 0) {
            for (var i = 0; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length == 2) {
                    var valid = true;
                    if (i >= minL && i <= maxL) {
                        valid = false;
                    }
                    if (valid) {
                        var minus = Math.min(singleCnt, handCardIndex[i].length);
                        console.log("minus:", minus, ",singleCnt:", singleCnt);
                        rtn = rtn.concat(v.slice(0, minus));
                        singleCnt -= minus;
                        if (singleCnt == 0) {
                            break;
                        }
                    }
                }
            }
        }
        if (found && singleCnt > 0) {
            for (var i = 0; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length == 3) {
                    var valid = true;
                    if (i >= minL && i <= maxL) {
                        valid = false;
                    }
                    if (valid) {
                        var minus = Math.min(singleCnt, handCardIndex[i].length);
                        console.log("minus:", minus, ",singleCnt:", singleCnt);
                        rtn = rtn.concat(v.slice(0, minus));
                        singleCnt -= minus;
                        if (singleCnt == 0) {
                            break;
                        }
                    }
                }
            }
        }
        if (found && singleCnt == 0) {
            return rtn;
        }
        return null;
    };
    pdklogic.findOneBomb = function (localHandCard, localCompare) {
        if (localCompare) {
            var compareLen = localCompare.length;
            var minCld = localCompare[0].l;
            var handCardIndex = this.dataToIndex(localHandCard);
            if (compareLen == 3) {
                var rtn = [];
                for (var i = 3; i < handCardIndex.length; i++) {
                    var v = handCardIndex[i];
                    if (v && v.length == 4) {
                        rtn = rtn.concat(v);
                        return rtn;
                    }
                }
            }
            for (var i = minCld + 1; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length == 4) {
                    var rtn = [];
                    rtn = rtn.concat(v);
                    return rtn;
                }
            }
            return null;
        }
        else {
            var handCardIndex = this.dataToIndex(localHandCard);
            var rtn = [];
            if (handCardIndex[14] && handCardIndex[14].length == 3) {
                rtn = rtn.concat(handCardIndex[14]);
                return rtn;
            }
            for (var i = 3; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length == 4) {
                    rtn = rtn.concat(v);
                    return rtn;
                }
            }
        }
        return null;
    };
    pdklogic.findOneGtCom = function (localHandCard, localCompare) {
        var toCardType = this.getCardType(localCompare);
        localCompare = this.sortBySame(localCompare, toCardType);
        console.log("传入牌型：", CT[toCardType]);
        if (toCardType == CT.Single) {
            for (var i = 0; i < localHandCard.length; i++) {
                var v = localHandCard[i];
                if (v.l > localCompare[0].l) {
                    return [v];
                }
            }
            return this.findOneBomb(localHandCard);
        }
        else if (toCardType == CT.Double) {
            var handCardIndex = this.dataToIndex(localHandCard);
            var cld = localCompare[0].l;
            for (var i = cld + 1; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length == 2) {
                    return [].concat(v);
                }
            }
            for (var i = cld + 1; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length == 3) {
                    return [].concat(v.slice(0, 2));
                }
            }
            return this.findOneBomb(localHandCard);
        }
        else if (toCardType == CT.DoubleSeq) {
            var rtn = this.findOneDoubleSeq(localHandCard, localCompare);
            if (rtn && rtn.length > 0) {
                return rtn;
            }
            return this.findOneBomb(localHandCard);
        }
        else if (toCardType == CT.Three) {
            if (localHandCard.length >= localCompare.length) {
                var rtn = this.findOneThree(localHandCard, localCompare);
                if (rtn && rtn.length > 0) {
                    return rtn;
                }
            }
            return this.findOneBomb(localHandCard);
        }
        else if (toCardType == CT.FourAThree) {
            if (localHandCard.length >= localCompare.length) {
                var rtn = this.findOneFourThree(localHandCard, localCompare);
                if (rtn && rtn.length > 0) {
                    return rtn;
                }
            }
            return this.findOneBomb(localHandCard);
        }
        else if (toCardType == CT.ShunZi) {
            if (localHandCard.length >= localCompare.length) {
                var rtn = this.findOneShunZi(localHandCard, localCompare);
                if (rtn && rtn.length > 0) {
                    return rtn;
                }
            }
            return this.findOneBomb(localHandCard);
        }
        else if (toCardType == CT.AirPlane) {
            if (localHandCard.length >= localCompare.length) {
                var rtn = this.findOnePlane(localHandCard, localCompare);
                if (rtn && rtn.length > 0) {
                    return rtn;
                }
            }
            return this.findOneBomb(localHandCard);
        }
        else if (toCardType == CT.Bomb) {
            return this.findOneBomb(localHandCard, localCompare);
        }
    };
    pdklogic.findFirstTipCard = function (localHandCard, nextRemainOne) {
        if (nextRemainOne === void 0) { nextRemainOne = false; }
        var handCardIndex = this.dataToIndex(localHandCard);
        //去除炸弹
        var ret = [];
        for (var i = handCardIndex.length - 1; i >= 3; i--) {
            var v = handCardIndex[i];
            if (v && v.length == 4) {
                var rtn = [].concat(v);
                ret.push(rtn);
                this.deleteRtn(localHandCard, rtn);
            }
        }
        var cardType = this.getCardType(localHandCard, true);
        console.log("传入牌型：", CT[cardType]);
        if (cardType > CT.Error) {
            if (ret.length == 0) { //没有炸弹
                var rtn = [].concat(localHandCard);
                ret.push(rtn);
            }
            return ret;
        }
        //去除飞机
        var plane = this.findOnePlane(localHandCard);
        while (plane != null) {
            ret.push(plane);
            plane = this.findOnePlane(localHandCard, plane);
        }
        //去除连对
        var seq = this.findFirstTipDoubleSeq(localHandCard);
        ret = ret.concat(seq);
        //去除三张
        var three = this.findAllThree(localHandCard);
        ret = ret.concat(three);
        //去除顺子
        var shunZi = this.findFirstTipShunZi(localHandCard);
        ret = ret.concat(shunZi);
        //去掉对子
        var double = this.findAllDouble(localHandCard);
        ret = ret.concat(double);
        var single = this.findAllSingle(localHandCard, [{ o: 0, r: 0, l: 2, s: 0 }], nextRemainOne);
        ret = ret.concat(single);
        return ret;
    };
    pdklogic.findFirstTipDoubleSeq = function (localHandCard) {
        var ret = [];
        var localHandCardT = this.clone(localHandCard);
        var seq = this.findOneDoubleSeq(localHandCardT);
        while (seq) {
            this.deleteRtn(localHandCardT, seq);
            ret.push(seq);
            seq = this.findOneDoubleSeq(localHandCardT);
        }
        return ret;
    };
    pdklogic.findFirstTipShunZi = function (localHandCard) {
        var allret = [];
        for (var length_1 = Math.min(11, localHandCard.length); length_1 >= 5; length_1--) {
            var ret = [];
            var localHandCardT = this.clone(localHandCard);
            var localCompare = [];
            for (var i = 0; i < length_1; i++) {
                localCompare.push({ o: 0, r: 0, l: 2, s: 0 });
            }
            var rtn = this.findOneShunZi(localHandCardT, localCompare);
            var size = localHandCardT.length - length_1;
            console.log(rtn);
            console.log("size:", size);
            while (rtn) {
                this.deleteRtn(localHandCardT, rtn);
                ret.push(rtn);
                for (var i = size; i >= 5; i--) {
                    localCompare = [];
                    for (var j = 0; j < i; j++) {
                        localCompare.push({ o: 0, r: 0, l: 2, s: 0 });
                    }
                    var rtn_1 = this.findOneShunZi(localHandCardT, localCompare);
                    if (rtn_1) {
                        ret.push(rtn_1);
                        break;
                    }
                }
                rtn = null;
            }
            if (ret.length == 1 && allret.length == 0) {
                allret = allret.concat(ret);
            }
            if (ret.length == 2) {
                allret = allret.concat(ret);
                return allret;
            }
        }
    };
    pdklogic.deleteRtn = function (localHandCard, rtn) {
        var start = (new Date()).valueOf();
        for (var i = 0; i < rtn.length; i++) {
            var d = rtn[i];
            if (d) {
                for (var j = 0; j < localHandCard.length; j++) {
                    var v = localHandCard[j];
                    if (v && v.o === d.o) {
                        localHandCard.splice(j, 1);
                        break;
                    }
                }
            }
        }
        var end = (new Date()).valueOf();
        console.log("end-start:", end - start);
    };
    // static deleteRtn1(localHandCard: lcardTmp[], rtn: lcardTmp[]){
    //     let start = (new Date()).valueOf()
    //     for (let i = 0; i < localHandCard.length; i++) {
    //         const d = localHandCard[i];
    //         if (d) {
    //             for (let j = 0; j < rtn.length; j++) {
    //                 const v = rtn[j];
    //                 if (v && v.o === d.o) {
    //                     localHandCard.splice(j, 1)
    //                 }
    //             }
    //         }
    //     }
    //     let end = (new Date()).valueOf()
    //     console.log("end-start:", end - start)
    // }
    //牌型由飞机->连对->三张->龙->对子->单张
    pdklogic.findLastTipCard = function (localHandCard, localCompare, nextRemainOne) {
        if (nextRemainOne === void 0) { nextRemainOne = false; }
        var cardType = this.getCardType(localCompare);
        //飞机
        if (cardType == CT.AirPlane) {
        }
        //连对
    };
    /**************************************** */
    //获取提示牌
    pdklogic.findAllTipCard = function (localHandCard, nextRemainOne) {
        if (nextRemainOne === void 0) { nextRemainOne = false; }
        var handCardIndex = this.dataToIndex(localHandCard);
        var size = 0;
        for (var i = 0; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length > 0) {
                size++;
            }
        }
        var ret = [];
        var handCardType = this.getCardType(localHandCard, true);
        console.log("handCardType:", handCardType, ",size:", size);
        if (size > 1 && handCardType > CT.Error) {
            var rtn = [];
            rtn = rtn.concat(localHandCard);
            ret.push(rtn);
        }
        var maxCard = null;
        for (var i = 3; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v) {
                if (!nextRemainOne) {
                    ret.push(v);
                }
                else {
                    if (v.length == 1) {
                        maxCard = v;
                    }
                    else {
                        ret.push(v);
                    }
                }
            }
        }
        if (maxCard) {
            if (ret.length > 0) {
                for (var i = ret.length - 1; i > 0; i--) {
                    var v = ret[i];
                    if (v[0].l < maxCard[0].l) {
                        ret[i] = maxCard;
                    }
                }
            }
            else {
                ret.push(maxCard);
            }
        }
        return ret;
    };
    /************************************ */
    pdklogic.findAllSingle = function (localHandCard, localCompare, nextRemainOne) {
        if (nextRemainOne === void 0) { nextRemainOne = false; }
        var ret = [];
        var handCardIndex = this.dataToIndex(localHandCard);
        var cld = localCompare[0].l;
        var maxCard = null;
        for (var i = cld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length == 1) {
                if (!nextRemainOne) {
                    ret.push(v);
                }
                else {
                    maxCard = v;
                }
            }
        }
        for (var i = cld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length > 1 && v.length < 4) {
                if (!nextRemainOne) {
                    ret.push([v[0]]);
                }
                else {
                    if (maxCard == null) {
                        maxCard = [v[0]];
                    }
                    else if (maxCard[0].l < v[0].l) {
                        maxCard = [v[0]];
                    }
                }
            }
        }
        if (maxCard) {
            ret.push(maxCard);
        }
        return ret;
    };
    pdklogic.findAllDouble = function (localHandCard, localCompare) {
        var handCardIndex = this.dataToIndex(localHandCard);
        var cld = 2;
        if (localCompare) {
            cld = localCompare[0].l;
        }
        var ret = [];
        for (var i = cld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length == 2) {
                ret.push(v);
            }
        }
        for (var i = cld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length == 3) {
                ret.push(v.slice(0, 2));
            }
        }
        return ret;
    };
    pdklogic.findAllDoubleSeq = function (localHandCard, localCompare) {
        var minCld = localCompare[0].l;
        var compareSeq = localCompare.length / 2;
        var handCardIndex = this.dataToIndex(localHandCard);
        var lastLd = minCld;
        var ret = [];
        var foundT = [];
        var minIndex = Math.min(14, handCardIndex.length);
        for (var i = minCld + 1; i < minIndex; i++) {
            var v = handCardIndex[i];
            if (v && v.length == 2) {
                lastLd = i;
                for (var j = i + 1; j <= minIndex; j++) {
                    var v_6 = handCardIndex[j];
                    if (v_6 && v_6.length == 2) {
                        if (lastLd + 1 == j) {
                            lastLd = j;
                            if (j - i + 1 >= compareSeq) {
                                var r = [];
                                for (var m = i; m <= j; m++) {
                                    r = r.concat(handCardIndex[m]);
                                }
                                var cardkey = this.getCardKey(r);
                                if (!foundT[cardkey]) {
                                    foundT[cardkey] = true;
                                    ret.push(r);
                                }
                                break;
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        for (var i = minCld + 1; i < minIndex; i++) {
            var v = handCardIndex[i];
            if (v && v.length >= 2 && v.length < 4) {
                lastLd = i;
                for (var j = i + 1; j <= minIndex; j++) {
                    var v_7 = handCardIndex[j];
                    if (v_7 && v_7.length >= 2 && v_7.length < 4) {
                        if (lastLd + 1 == j) {
                            lastLd = j;
                            if (j - i + 1 >= compareSeq) {
                                var r = [];
                                for (var m = i; m <= j; m++) {
                                    r = r.concat(handCardIndex[m].slice(0, 2));
                                }
                                var cardkey = this.getCardKey(r);
                                if (!foundT[cardkey]) {
                                    foundT[cardkey] = true;
                                    ret.push(r);
                                }
                                break;
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        // for (let i = minCld + 1; i < minIndex; i++) {
        //     const v = handCardIndex[i];
        //     if (v && v.length >= 2) {
        //         lastLd = i
        //         for (let j = i + 1; j <= minIndex; j++) {
        //             const v = handCardIndex[j];
        //             if (v && v.length >= 2) {
        //                 if (lastLd + 1 == j) {
        //                     lastLd = j
        //                     if (j - i + 1 >= compareSeq) {
        //                         let r = []
        //                         for (let m = i; m <= j; m++) {
        //                             r = r.concat(handCardIndex[m].slice(0,2))
        //                         }
        //                         let cardkey = this.getCardKey(r)
        //                         if (!foundT[cardkey]) {
        //                             foundT[cardkey] = true
        //                             ret.push(r)
        //                         }
        //                         break
        //                     }
        //                 } else {
        //                     break
        //                 }
        //             }
        //         }
        //     }
        // }
        return ret;
    };
    pdklogic.getCardKey = function (cards) {
        var key = "";
        for (var i = 0; i < cards.length; i++) {
            var v = cards[i];
            if (v) {
                key = key + v.l;
            }
        }
        return key;
    };
    pdklogic.findAllThree = function (localHandCard, localCompare) {
        var handCardIndex = this.dataToIndex(localHandCard);
        var minCld = 2;
        var singleCnt = Math.min(2, localHandCard.length - 3);
        if (localCompare) {
            minCld = localCompare[0].l;
            singleCnt = Math.min(localCompare.length - 3, localHandCard.length - 3);
        }
        var ret = [];
        for (var i = minCld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length == 3) {
                var rtn = [];
                var needSingle = singleCnt;
                rtn = rtn.concat(v);
                if (needSingle > 0) {
                    for (var j = 3; j < handCardIndex.length; j++) {
                        var v_8 = handCardIndex[j];
                        if (v_8 && v_8.length == 1) {
                            rtn = rtn.concat(v_8);
                            needSingle--;
                            if (needSingle == 0) {
                                break;
                            }
                        }
                    }
                }
                if (needSingle > 0) {
                    for (var j = 0; j < handCardIndex.length; j++) {
                        var v_9 = handCardIndex[j];
                        if (v_9 && v_9.length > 2 && v_9[0].l != rtn[0].l) {
                            var removeCount = Math.min(needSingle, v_9.length);
                            rtn = rtn.concat(v_9.slice(0, removeCount));
                            needSingle -= removeCount;
                            if (needSingle == 0) {
                                break;
                            }
                        }
                    }
                }
                if (needSingle == 0) {
                    ret.push(rtn);
                }
            }
        }
        return ret;
    };
    pdklogic.findAllFourThree = function (localHandCard, localCompare) {
        var minCld = localCompare[0].l;
        var handCardIndex = this.dataToIndex(localHandCard);
        var singleCnt = Math.min(localCompare.length - 4, localHandCard.length - 4);
        var ret = [];
        for (var i = minCld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length == 4) {
                var rtn = [];
                rtn = rtn.concat(v);
                var needSingle = singleCnt;
                if (needSingle > 0) {
                    for (var j = 3; j < handCardIndex.length; j++) {
                        var v_10 = handCardIndex[j];
                        if (v_10 && v_10.length == 1) {
                            rtn = rtn.concat(v_10);
                            needSingle--;
                            if (needSingle == 0) {
                                break;
                            }
                        }
                    }
                }
                if (needSingle > 0) {
                    for (var j = 0; j < handCardIndex.length; j++) {
                        var v_11 = handCardIndex[j];
                        if (v_11 && v_11.length < 4) {
                            var minus = Math.min(needSingle, v_11.length);
                            rtn = rtn.concat(v_11.slice(0, minus));
                            needSingle -= minus;
                            if (needSingle == 0) {
                                break;
                            }
                        }
                    }
                }
                if (needSingle == 0) {
                    ret.push(rtn);
                }
            }
        }
        return ret;
    };
    pdklogic.findAllShunZi = function (localHandCard, localCompare) {
        var handCardIndex = this.dataToIndex(localHandCard);
        var compareLen = 5;
        var minCld = 2;
        if (localCompare) {
            compareLen = localCompare.length;
            minCld = localCompare[0].l;
        }
        var lastLd = minCld;
        var ret = [];
        for (var i = minCld + 1; i < handCardIndex.length; i++) {
            if (handCardIndex.length - i < compareLen) {
                break;
            }
            var v = handCardIndex[i];
            if (v && v.length > 0) {
                lastLd = i;
                var rtn = [];
                for (var j = i + 1; j < handCardIndex.length; j++) {
                    var v_12 = handCardIndex[j];
                    if (v_12 && v_12.length > 0) {
                        if (lastLd + 1 == j) {
                            lastLd = j;
                            if (j - i + 1 >= compareLen) {
                                var r = [];
                                for (var m = i; m <= j; m++) {
                                    rtn.push(handCardIndex[m][0]);
                                }
                                ret.push(rtn);
                                break;
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        return ret;
    };
    pdklogic.findAllPlane = function (localHandCard, localCompare) {
        localCompare = this.sortBySame(localCompare, CT.AirPlane);
        var threeLen = 0;
        var ret = [];
        var cardIndex = this.dataToIndex(localCompare);
        var seq = 2;
        var foundThree = false;
        var lastThreeMax = 0;
        // let threeLen = 0
        for (var i = 3; i < cardIndex.length; i++) {
            var v = cardIndex[i];
            if (v && v.length > 3) {
                if (!foundThree) {
                    foundThree = true;
                    seq = i;
                    threeLen = 1;
                }
                else {
                    if (seq + 1 == i) {
                        threeLen++;
                    }
                    seq = i;
                    if (i == 14) {
                        lastThreeMax = Math.max(lastThreeMax, threeLen);
                        threeLen = 0;
                    }
                }
            }
            else {
                foundThree = false;
                seq = i;
                lastThreeMax = Math.max(lastThreeMax, threeLen);
                threeLen = 0;
            }
        }
        threeLen = lastThreeMax;
        var compareLen = localCompare.length;
        var singleCnt = Math.min(compareLen - threeLen * 3, localHandCard.length - threeLen * 3);
        if (singleCnt > 0 && singleCnt < threeLen * 2) {
            //单牌小于3条需要的数量，拆3条
            var fit = false;
            var lbreak = false;
            var lt = threeLen;
            do {
                lt--;
                singleCnt += 3;
                if (lt < 2) {
                    lbreak = true;
                    fit = false;
                }
                if (singleCnt == lt * 2) {
                    fit = true;
                    lbreak = true;
                }
            } while (!lbreak);
            if (fit) {
                threeLen = lt;
            }
        }
        var minCld = localCompare[0].l;
        var handCardIndex = this.dataToIndex(localHandCard);
        var lastLd = minCld;
        // let found = false
        for (var i = minCld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length >= 3) {
                lastLd = i;
                for (var j = i + 1; j < handCardIndex.length; j++) {
                    var v_13 = handCardIndex[j];
                    if (v_13 && v_13.length >= 3) {
                        if (lastLd + 1 == j) {
                            lastLd = j;
                            if (j - i + 1 >= threeLen) {
                                var r = [];
                                for (var m = i; m <= j; m++) {
                                    r = r.concat(handCardIndex[m].slice(0, 3));
                                }
                                var needSingle = singleCnt;
                                if (needSingle > 0) {
                                    for (var i_1 = 3; i_1 < handCardIndex.length; i_1++) {
                                        var v_14 = handCardIndex[i_1];
                                        if (v_14 && v_14.length == 1) {
                                            r = r.concat(v_14);
                                            needSingle--;
                                            if (needSingle == 0) {
                                                break;
                                            }
                                        }
                                    }
                                }
                                if (needSingle > 0) {
                                    var valid = true;
                                    for (var k = 3; k < handCardIndex.length; k++) {
                                        var v_15 = handCardIndex[k];
                                        if (v_15) {
                                            var ccount = v_15.length;
                                            valid = true;
                                            if (ccount > 1 && ccount < 4) {
                                                if (ccount == 3) {
                                                    if (k >= i && k <= j) {
                                                        valid = false;
                                                    }
                                                }
                                                if (valid) {
                                                    var minus = Math.min(needSingle, ccount);
                                                    r = r.concat(v_15.slice(0, minus));
                                                    needSingle -= minus;
                                                    if (needSingle == 0) {
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if (needSingle == 0) {
                                    ret.push(r);
                                    break;
                                }
                            }
                        }
                        else {
                            break;
                        }
                    }
                }
            }
        }
        return ret;
    };
    pdklogic.findAllBomb = function (localHandCard, localCompare) {
        var ret = [];
        if (localCompare) {
            var compareLen = localCompare.length;
            var handCardIndex = this.dataToIndex(localHandCard);
            var minCld = localCompare[0].l;
            // if (compareLen == 3) {
            //     //AAA
            //     for (let i = 3; i < handCardIndex.length; i++) {
            //         const v = handCardIndex[i]
            //         if (v && v.length == 4) {
            //             let rtn = [].concat(v)
            //             ret.push(rtn)
            //         }
            //     }
            // }
            for (var i = minCld + 1; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length == 4) {
                    var rtn = [].concat(v);
                    ret.push(rtn);
                }
            }
        }
        else {
            var handCardIndex = this.dataToIndex(localHandCard);
            // //有AAA 就返回AAA
            // if (handCardIndex[14] && handCardIndex[14].length == 3) {
            //     let rtn = [].concat(handCardIndex[14])
            //     ret.push(rtn)
            // }
            for (var i = 3; i < handCardIndex.length; i++) {
                var v = handCardIndex[i];
                if (v && v.length == 4) {
                    var rtn = [].concat(v);
                    ret.push(rtn);
                }
            }
        }
        return ret;
    };
    //a是否大于b
    pdklogic.isGt = function (a, b, last) {
        var at = this.getCardType(a, last);
        var bt = this.getCardType(b, last);
        var as = this.sortBySame(a, at);
        var bs = this.sortBySame(b, bt);
        if (at == bt) {
            if (bt == CT.Bomb && bs[0].l == 14) {
                return true;
            }
            else if (at == CT.Bomb && as[0].l == 14) {
                return false;
            }
            else {
                console.log("as:", as[0].l);
                console.log("bs:", bs[0].l);
                if (as[0].l == 0x0F) {
                    return true;
                }
                else if (bs[0].l == 0x0F) {
                    return false;
                }
                else {
                    return as[0].l > bs[0].l && (as.length == bs.length);
                }
            }
        }
        else {
            if (at == CT.Bomb) {
                return true;
            }
        }
        return false;
    };
    pdklogic.getOneAICard = function (localHandCard, selectCard, findFit) {
        var selectLen = selectCard.length;
        var handCardLen = localHandCard.length;
        if (selectLen == 1) {
            return selectCard;
        }
        if (selectLen == 2) {
            if (selectCard[0].l == selectCard[1].l) {
                return selectCard;
            }
        }
        var sc = this.sortBySame(selectCard);
        var st = this.getCardType(sc);
        if (st > CT.Error) {
            return selectCard;
        }
        var selCardIndex = this.dataToIndex(selectCard);
        var selSameCard = this.findAllSameCardByIndex(selCardIndex);
        var allSingle = true;
        for (var i = 2; i < selSameCard.length; i++) {
            var v = selSameCard[i];
            if (v) {
                allSingle = false;
            }
        }
        if (allSingle) {
        }
        if (selectLen == 3) {
            //连对
            if (selSameCard[2] && selSameCard[1] && Math.abs(selSameCard[2][0][0].l - selSameCard[1][0][0].l) == 1) {
                var rtn = [];
                rtn = rtn.concat(selectCard);
                var handCardIndex = this.dataToIndex(localHandCard);
                if (handCardIndex[selSameCard[1][0][0].l]) {
                    for (var i = 0; i < handCardIndex[selSameCard[1][0][0].l].length; i++) {
                        var v = handCardIndex[selSameCard[1][0][0].l][i];
                        if (v.o != selSameCard[1][0][0].o) {
                            rtn.push(v);
                            break;
                        }
                    }
                }
                if (this.getCardType(rtn) == CT.DoubleSeq) {
                    //连对
                    return rtn;
                }
                //对子
                return selSameCard[2][0];
            }
            //3带2
            if (selSameCard[3]) {
                var rtn = [].concat(selSameCard[3][0]);
                var singleCnt = 2;
                var handCardIndex = this.dataToIndex(localHandCard);
                if (singleCnt > 0) {
                    for (var i = 3; i < handCardIndex.length; i++) {
                        var v = handCardIndex[i];
                        if (v && v.length == 1) {
                            rtn = rtn.concat(v);
                            singleCnt -= 1;
                            if (singleCnt == 0) {
                                break;
                            }
                        }
                    }
                }
                if (singleCnt > 0) {
                    for (var i = 3; i < handCardIndex.length; i++) {
                        var v = handCardIndex[i];
                        if (v && v.length > 1 && v.length < 3) {
                            var removeCount = Math.min(singleCnt, v.length);
                            rtn = rtn.concat(v.slice(0, removeCount));
                            singleCnt -= removeCount;
                            if (singleCnt == 0) {
                                break;
                            }
                        }
                    }
                }
                if (singleCnt == 0) {
                    return rtn;
                }
            }
        }
        if (findFit) {
            if (selectLen >= 5) {
                this.sortByLogicData(selectCard);
                var rtn = this.findOneShunZi(selectCard);
                if (rtn && rtn.length > 0) {
                    return rtn;
                }
                rtn = this.findOnePlane(selectCard);
                if (rtn && rtn.length > 0) {
                    return rtn;
                }
                rtn = this.findOneFourThree(selectCard);
                if (rtn && rtn.length > 0) {
                    return rtn;
                }
                rtn = this.findOneThree(selectCard);
                if (rtn && rtn.length > 0) {
                    return rtn;
                }
                rtn = this.findOneDoubleSeq(selectCard);
                if (rtn && rtn.length > 0) {
                    return rtn;
                }
                rtn = this.findOneBomb(selectCard);
                if (rtn && rtn.length > 0) {
                    return rtn;
                }
            }
        }
    };
    pdklogic.findAIShunZi = function (localHandCard, selectCard) {
        this.sortByLogicData(selectCard);
    };
    pdklogic.isCardValid = function (cards, last) {
        var cardLen = cards.length;
        if (cardLen == 1) {
            return true;
        }
        cards = this.sortBySame(cards);
        if (this.isDouble(cards)) {
            return true;
        }
        else if (this.isDoubleSeq(cards)) {
            return true;
        }
        else if (this.isThree(cards, last)) {
            return true;
        }
        else if (this.isFourAThree(cards, last)) {
            return true;
        }
        else if (this.isShunZi(cards)) {
            return true;
        }
        else if (this.isAirplane(cards, last)) {
            return true;
        }
        else if (this.isBomb(cards)) {
            return true;
        }
        return false;
    };
    pdklogic.findAllGtCom = function (localHandCard, localCompare, bHoldDown) {
        localCompare = this.sortBySame(localCompare);
        var allBomb = this.findAllBomb(localHandCard, localCompare);
        var cardType = this.getCardType(localCompare);
        console.log("传入牌型：", CT[cardType]);
        if (cardType == CT.Single) {
            var ret = this.findAllSingle(localHandCard, localCompare, bHoldDown);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
        }
        else if (cardType == CT.Double) {
            var ret = this.findAllDouble(localHandCard, localCompare);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
        }
        else if (cardType == CT.DoubleSeq) {
            var ret = this.findAllDoubleSeq(localHandCard, localCompare);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
        }
        else if (cardType == CT.Three) {
            var ret = this.findAllThree(localHandCard, localCompare);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
        }
        else if (cardType == CT.FourAThree) {
            var ret = this.findAllFourThree(localHandCard, localCompare);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
        }
        else if (cardType == CT.ShunZi) {
            var ret = this.findAllShunZi(localHandCard, localCompare);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
        }
        else if (cardType == CT.AirPlane) {
            var ret = this.findAllPlane(localHandCard, localCompare);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
        }
        else if (cardType == CT.Bomb) {
            return this.findAllBomb(localHandCard, localCompare);
        }
    };
    pdklogic.clone = function (obj) {
        if (!obj || [] == obj || {} == obj) {
            return obj;
        }
        var newObj;
        var isArray = false;
        if (Array.isArray(obj)) {
            newObj = [];
            isArray = true;
        }
        else {
            newObj = {};
            isArray = false;
        }
        for (var _i = 0, _a = Object.keys(obj); _i < _a.length; _i++) {
            var key = _a[_i];
            if (null == obj[key]) {
                newObj[key] = null;
            }
            else {
                var sub = (typeof obj[key] == 'object') ? this.clone(obj[key]) : obj[key];
                newObj[key] = sub;
            }
        }
        return newObj;
    };
    return pdklogic;
}());
exports.pdklogic = pdklogic;
