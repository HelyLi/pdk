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
    // static isAirplane(cards: lcardTmp[], last: boolean = false):boolean {
    //     let cardLen = cards.length
    //     if (cardLen < 6) {
    //         return false
    //     }
    //     if (!last && cardLen < 10) {
    //         return false
    //     }
    //     if (!last && cardLen % 5 != 0) {
    //         return false
    //     }
    //     let remain = cardLen
    //     let cardIndex = this.dataToIndex(cards)
    //     let seq = 2
    //     let foundThree = false
    //     let lastThreeMax = 0
    //     let threeLen = 0
    //     for (let i = 3; i < cardIndex.length; i++) {
    //         const v = cardIndex[i];
    //         if (v && v.length >= 3) {
    //             if (!foundThree) {
    //                 foundThree = true
    //                 seq = i
    //                 threeLen = 1
    //             } else {
    //                 if (seq + 1 == i) {
    //                     threeLen++
    //                 }
    //                 seq = i
    //                 if (i == 14) {
    //                     lastThreeMax = Math.max(lastThreeMax, threeLen)
    //                     threeLen = 0
    //                 }
    //             }
    //         } else {
    //             foundThree = false
    //             seq = i
    //             lastThreeMax = Math.max(lastThreeMax, threeLen)
    //             threeLen = 0
    //         }
    //     }
    //     if (lastThreeMax < 2) {
    //         return false
    //     }
    //     threeLen = lastThreeMax * 3
    //     remain = cardLen - threeLen
    //     console.log("threeLen:", threeLen, ",remain:", remain)
    //     if (!last) {
    //         if (remain / 2 == lastThreeMax) {
    //             return true
    //         } else {
    //             if (lastThreeMax > 2) {
    //                 let fit = false
    //                 let tMax = lastThreeMax
    //                 let lr = remain
    //                 let lbreak = true
    //                 do {
    //                     lr += 3
    //                     tMax -= 1
    //                     if (tMax < 2) {
    //                         fit = false
    //                         lbreak = false
    //                     }
    //                     if (lr / 2 == tMax) {
    //                         fit = true
    //                         lbreak = false
    //                     }
    //                 } while (lbreak);
    //                 return fit
    //             }
    //         }
    //     } else {
    //         if (remain <= lastThreeMax * 2) {
    //             return true
    //         }
    //     }
    //     return false
    // }
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
                    if (i + 1 == cardIndex.length) {
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
            // if (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l == 14) {
            //     return CT.Bomb
            // }
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
        console.log("compareSeq:", compareSeq);
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
        }
        var handCardIndex = this.dataToIndex(localHandCard);
        console.log("handCardIndex.length:", handCardIndex.length);
        var lastLd = minCld;
        var minIndex = Math.min(handCardIndex.length, 15);
        for (var i = minCld + 1; i < minIndex; i++) {
            if (handCardIndex.length - i < compareLen) {
                break;
            }
            var v = handCardIndex[i];
            if (v && v.length > 0) {
                lastLd = i;
                for (var j = i + 1; j < minIndex; j++) {
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
        allret = allret.reverse();
        return allret;
    };
    // static findFirstTipShunZi(localHandCard: lcardTmp[]){
    //     let allret = []
    //     for (let length = Math.min(11, localHandCard.length); length >= 5; length--) {
    //         let ret = []
    //         let localHandCardT:lcardTmp[]  = this.clone(localHandCard)
    //         let localCompare = []
    //         for (let i = 0; i < length; i++) {
    //             localCompare.push({ o: 0, r: 0, l: 2, s: 0 })
    //         }
    //         let rtn = this.findOneShunZi(localHandCardT, localCompare)
    //         let size = localHandCardT.length - length
    //         console.log(rtn)
    //         console.log("size:", size)
    //         while (rtn) {
    //             this.deleteRtn(localHandCardT, rtn)
    //             ret.push(rtn)
    //             for (let i = size; i >= 5; i--) {
    //                 localCompare = []
    //                 for (let j = 0; j < i; j++) {
    //                     localCompare.push({ o: 0, r: 0, l: 2, s: 0 })
    //                 }
    //                 let rtn = this.findOneShunZi(localHandCardT, localCompare)
    //                 if (rtn) {
    //                     ret.push(rtn)
    //                     break;
    //                 }
    //             }
    //             rtn = null
    //         }
    //         if (ret.length == 1 && allret.length == 0) {
    //             allret = allret.concat(ret)
    //         }
    //         if (ret.length == 2) {
    //             allret = allret.concat(ret)
    //             return allret
    //         }
    //     }
    // }
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
    pdklogic.findLastTipCard = function (localHandCard, localCompare, bHoldDown) {
        if (bHoldDown === void 0) { bHoldDown = false; }
        localCompare = this.sortBySame(localCompare);
        var allBomb = this.findAllBomb(localHandCard, localCompare);
        for (var i = 0; i < allBomb.length; i++) {
            var bomb = allBomb[i];
            this.deleteRtn(localHandCard, bomb);
        }
        var cardType = this.getCardType(localCompare);
        if (cardType == CT.Single) {
            var ret = this.findLastGt(CT.Single, CT.Single, localHandCard, localCompare);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
        }
        else if (cardType == CT.Double) {
            var ret = this.findLastGt(CT.Double, CT.Double, localHandCard, localCompare);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
        }
        else if (cardType == CT.DoubleSeq) {
            var ret = this.findLastGt(CT.DoubleSeq, CT.DoubleSeq, localHandCard, localCompare);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
        }
        else if (cardType == CT.Three) {
            var ret = this.findLastTipThree(localHandCard, localCompare);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
            // }else if(cardType == CT.FourAThree){
            // let ret = this.findAllFourThree(localHandCard, localCompare)
            // if (allBomb && allBomb.length > 0) {
            //     ret = ret.concat(allBomb)
            // }
            // return ret
        }
        else if (cardType == CT.ShunZi) {
            var ret = this.findLastGt(CT.ShunZi, CT.ShunZi, localHandCard, localCompare);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
        }
        else if (cardType == CT.AirPlane) {
            var ret = this.findLastTipPlane(localHandCard, localCompare);
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb);
            }
            return ret;
        }
        else if (cardType == CT.Bomb) {
            return allBomb; //this.findAllBomb(localHandCard, localCompare)
        }
    };
    // static findLastTipCard
    pdklogic.findLastTip = function (cardType, localHandCard, needSingle) {
        var nextType = 0;
        var firstTip = [];
        var needCard = [];
        var localHandCardT = this.clone(localHandCard);
        var rtn = [];
        // if (cardType == CT.AirPlane) {
        if (cardType == CT.AirPlane) {
            var planes = this.findPlaneBody(localHandCardT);
            if (planes && planes.length > 0) {
                // this.sortRetDesc(planes)
                for (var i = 0; i < planes.length; i++) {
                    var plane = planes[i];
                    if (firstTip.length == 0) {
                        // firstTip = firstTip.concat(plane)
                        nextType = CT.DoubleSeq;
                    }
                    rtn = rtn.concat(plane);
                    // this.deleteRtn(localHandCardT, plane)
                }
            }
        }
        if (cardType == CT.AirPlane || cardType == CT.DoubleSeq) {
            //排除连对主体
            var seqs = this.findDoubleSeqBody(localHandCardT);
            if (seqs && seqs.length > 0) {
                // this.sortRetDesc(seqs)
                for (var i = 0; i < seqs.length; i++) {
                    var seq = seqs[i];
                    if (firstTip.length == 0) {
                        // firstTip = firstTip.concat(seq)
                        nextType = CT.Three;
                    }
                    rtn = rtn.concat(seq);
                    // this.deleteRtn(localHandCardT, seq)
                }
            }
        }
        if (cardType == CT.AirPlane || cardType == CT.DoubleSeq || cardType == CT.Three) {
            //排除三张主体
            var threes = this.findThreeBody(localHandCardT);
            if (threes && threes.length > 0) {
                this.sortRetDesc(threes);
                for (var i = 0; i < threes.length; i++) {
                    var three = threes[i];
                    if (firstTip.length == 0) {
                        firstTip = firstTip.concat(three);
                        nextType = CT.ShunZi;
                    }
                    rtn = rtn.concat(three);
                    this.deleteRtn(localHandCardT, three);
                }
            }
        }
        if (cardType == CT.AirPlane || cardType == CT.DoubleSeq || cardType == CT.Three || cardType == CT.ShunZi) {
            //排除长顺子
            var shunZi = this.findFirstTipShunZi(localHandCardT);
            if (shunZi && shunZi.length > 0) {
                for (var i = 0; i < shunZi.length; i++) {
                    var sz = shunZi[i];
                    if (firstTip.length == 0) {
                        firstTip = firstTip.concat(sz);
                        nextType = CT.Double;
                    }
                    rtn = rtn.concat(sz);
                    this.deleteRtn(localHandCardT, sz);
                    break;
                }
            }
        }
        if (cardType == CT.AirPlane || cardType == CT.DoubleSeq || cardType == CT.Three || cardType == CT.ShunZi || cardType == CT.Double) {
            //排除对子
            var doubles = this.findDoubleBody(localHandCardT);
            if (doubles && doubles.length > 0) {
                this.sortRetDesc(doubles);
                for (var i = 0; i < doubles.length; i++) {
                    var double = doubles[i];
                    if (firstTip.length == 0) {
                        firstTip = firstTip.concat(double);
                        nextType = CT.Single;
                    }
                    rtn = rtn.concat(double);
                    this.deleteRtn(localHandCardT, double);
                }
            }
        }
        //单张排序
        this.sortByLogicDataDesc(localHandCardT);
        rtn = rtn.concat(localHandCardT);
        needCard = rtn.splice(rtn.length - needSingle, needSingle);
        //
        for (var i = 0; i < firstTip.length; i++) {
            var first = firstTip[i];
            for (var j = 0; j < needCard.length; j++) {
                var need = needCard[j];
                if (need.o == first.o) {
                    return this.findLastTip(nextType, localHandCard, needSingle);
                }
            }
        }
        return rtn.concat(needCard);
    };
    pdklogic.sortRetDesc = function (ret) {
        ret.sort(function (a, b) {
            return b[0].l - a[0].l;
        });
    };
    //排除炸弹
    pdklogic.findLastTipPlane = function (localHandCard, localCompare) {
        var ret = [];
        var body = [];
        var planes = this.findAllPlane(localHandCard, localCompare);
        console.log(planes);
        if (planes && planes.length > 0) {
            for (var size = 0; size < planes.length; size++) {
                var plane = planes[size];
                if (plane) {
                    var t = [];
                    t = t.concat(plane.slice(0, (plane.length / 5) * 3));
                    body.push(t);
                }
            }
        }
        console.log("body:", body);
        for (var idex = 0; idex < body.length; idex++) {
            var rtn = [];
            var bd = body[idex]; //飞机主体
            rtn = rtn.concat(bd);
            var localHandCardT = this.clone(localHandCard);
            //排除飞机主体
            this.deleteRtn(localHandCardT, bd);
            var needSingle = localCompare.length / 5 * 2;
            var cards = this.findLastTip(CT.AirPlane, localHandCardT, needSingle);
            console.log("cards:", cards);
            rtn = rtn.concat(cards.splice(cards.length - needSingle, needSingle));
            ret.push(rtn);
        }
        console.log("ret:", ret);
        return ret;
    };
    pdklogic.findLastTipThree = function (localHandCard, localCompare) {
        var ret = [];
        var body = [];
        var threes = this.findAllThree(localHandCard, localCompare);
        console.log(threes);
        if (threes && threes.length > 0) {
            for (var size = 0; size < threes.length; size++) {
                var three = threes[size];
                if (three) {
                    var t = [];
                    t = t.concat(three.slice(0, 3));
                    body.push(t);
                }
            }
        }
        console.log("body:", body);
        for (var idex = 0; idex < body.length; idex++) {
            var rtn = [];
            var bd = body[idex]; //飞机主体
            rtn = rtn.concat(bd);
            var localHandCardT = this.clone(localHandCard);
            //排除飞机主体
            this.deleteRtn(localHandCardT, bd);
            var needSingle = 2;
            var cards = this.findLastTip(CT.AirPlane, localHandCardT, needSingle);
            console.log("cards:", cards);
            rtn = rtn.concat(cards.splice(cards.length - needSingle, needSingle));
            ret.push(rtn);
        }
        console.log("ret:", ret);
        return ret;
    };
    // static findLastTipDoubleSeq(localHandCard: lcardTmp[], localCompare: lcardTmp[]){
    //     let ret = []
    //     // let body = []
    //     // let seqs = this.findAllDoubleSeq(localHandCard, localCompare)
    //     // console.log(seqs)
    //     // if (seqs && seqs.length > 0) {
    //     //     for (let size = 0; size < seqs.length; size++) {
    //     //         const three = seqs[size];
    //     //         if (three) {
    //     //             let t = []
    //     //             t = t.concat(three.slice(0, 3))
    //     //             body.push(t)
    //     //         }
    //     //     }
    //     // }
    //     // console.log("body:", body)
    //     //去除
    //     let localHandCardT = this.clone(localHandCard)
    //     // if (cardType == CT.AirPlane) {
    //         let planes = this.findPlaneBody(localHandCardT)
    //         if (planes && planes.length > 0) {
    //             this.sortRetDesc(planes)
    //             for (let i = 0; i < planes.length; i++) {
    //                 const plane = planes[i];
    //                 // if (firstTip.length == 0) {
    //                 //     firstTip = firstTip.concat(plane)
    //                 //     nextType = CT.DoubleSeq
    //                 // }
    //                 // rtn = rtn.concat(plane)
    //                 this.deleteRtn(localHandCardT, plane)
    //             }
    //         }
    //     // }
    //     let seqs = this.findAllDoubleSeq(localHandCardT, localCompare)
    //     if (seqs && seqs.length > 0) {
    //         return seqs
    //     }
    //     seqs = this.findAllDoubleSeq(localHandCard, localCompare)
    //     if (seqs && seqs.length > 0) {
    //         return seqs
    //     }
    //     // for (let idex = 0; idex < body.length; idex++) {
    //     //     let rtn = []
    //     //     const bd = body[idex];//飞机主体
    //     //     rtn = rtn.concat(bd)
    //     //     let localHandCardT = this.clone(localHandCard)
    //     //     //排除飞机主体
    //     //     this.deleteRtn(localHandCardT, bd)
    //     //     let needSingle = 2
    //     //     let cards = this.findLastTip(CT.AirPlane, localHandCardT, needSingle)
    //     //     console.log("cards:", cards)
    //     //     rtn = rtn.concat(cards.splice(cards.length - needSingle, needSingle))
    //     //     ret.push(rtn)
    //     // }
    //     console.log("ret:", ret)
    //     return ret
    // }
    pdklogic.findLastGt = function (nextType, cardType, localHandCard, localCompare) {
        // let nextType: number = 0
        var localHandCardT = this.clone(localHandCard);
        if (nextType == CT.Single || nextType == CT.Double || nextType == CT.ShunZi || nextType == CT.Three || nextType == CT.DoubleSeq) {
            var planes = this.findPlaneBody(localHandCardT);
            if (planes && planes.length > 0) {
                // this.sortRetDesc(planes)
                for (var i = 0; i < planes.length; i++) {
                    var plane = planes[i];
                    // this.deleteRtn(localHandCardT, plane)
                }
            }
        }
        if (nextType == CT.Single || nextType == CT.Double || nextType == CT.ShunZi || nextType == CT.Three) {
            //排除连对主体
            var seqs = this.findDoubleSeqBody(localHandCardT);
            if (seqs && seqs.length > 0) {
                // this.sortRetDesc(seqs)
                for (var i = 0; i < seqs.length; i++) {
                    var seq = seqs[i];
                    // this.deleteRtn(localHandCardT, seq)
                }
            }
        }
        if (nextType == CT.Single || nextType == CT.Double || nextType == CT.ShunZi) {
            var threes = this.findThreeBody(localHandCardT);
            if (threes && threes.length > 0) {
                this.sortRetDesc(threes);
                for (var i = 0; i < threes.length; i++) {
                    var three = threes[i];
                    this.deleteRtn(localHandCardT, three);
                }
            }
        }
        if (nextType == CT.Single || nextType == CT.Double) {
            console.log("findFirstTipShunZi:", localHandCardT);
            var shunZi = this.findFirstTipShunZi(localHandCardT);
            console.log("shunZi:", shunZi);
            if (shunZi && shunZi.length > 0) {
                for (var i = 0; i < shunZi.length; i++) {
                    var sz = shunZi[i];
                    this.deleteRtn(localHandCardT, sz);
                }
            }
        }
        if (nextType == CT.Single) {
            //排除对子
            var doubles = this.findDoubleBody(localHandCardT);
            if (doubles && doubles.length > 0) {
                this.sortRetDesc(doubles);
                for (var i = 0; i < doubles.length; i++) {
                    var double = doubles[i];
                    this.deleteRtn(localHandCardT, double);
                }
            }
        }
        /* ------------------------------------------------- */
        if (cardType == CT.Single) {
            var ret = [];
            var singles = this.findAllSingle(localHandCardT, localCompare);
            if (singles && singles.length > 0) {
                ret = ret.concat(singles);
            }
            if (nextType == CT.Single) {
                nextType = CT.Double;
            }
            else if (nextType == CT.Double) {
                nextType = CT.ShunZi;
            }
            else if (nextType == CT.ShunZi) {
                nextType = CT.Three;
            }
            else if (nextType == CT.Three) {
                nextType = CT.DoubleSeq;
            }
            else if (nextType == CT.DoubleSeq) {
                nextType = CT.AirPlane;
            }
            else if (nextType == CT.AirPlane) {
                return ret;
            }
            return this.findLastGt(nextType, cardType, localHandCard, localCompare);
        }
        else if (cardType == CT.Double) {
            // console.log("CT.Double:", localHandCardT)
            var ret = [];
            var doubles = this.findAllDouble(localHandCardT, localCompare);
            if (doubles && doubles.length > 0) {
                ret = ret.concat(doubles);
            }
            if (nextType == CT.Double) {
                nextType = CT.ShunZi;
            }
            else if (nextType == CT.ShunZi) {
                nextType = CT.Three;
            }
            else if (nextType == CT.Three) {
                nextType = CT.DoubleSeq;
            }
            else if (nextType == CT.DoubleSeq) {
                nextType = CT.AirPlane;
            }
            else if (nextType == CT.AirPlane) {
                return ret;
            }
            return this.findLastGt(nextType, cardType, localHandCard, localCompare);
        }
        else if (cardType == CT.ShunZi) {
            var ret = [];
            var shunZi = this.findAllShunZi(localHandCardT, localCompare);
            if (shunZi && shunZi.length > 0) {
                ret = ret.concat(shunZi);
            }
            if (nextType == CT.ShunZi) {
                nextType = CT.Three;
            }
            else if (nextType == CT.Three) {
                nextType = CT.DoubleSeq;
            }
            else if (nextType == CT.DoubleSeq) {
                nextType = CT.AirPlane;
            }
            else if (nextType == CT.AirPlane) {
                return ret;
            }
            return this.findLastGt(nextType, cardType, localHandCard, localCompare);
        }
        else if (cardType == CT.DoubleSeq) {
            var ret = [];
            var seqs = this.findAllDoubleSeq(localHandCardT, localCompare);
            if (seqs && seqs.length > 0) {
                ret = ret.concat(seqs);
                console.log("ret:", ret, ",nextType:", nextType);
            }
            if (nextType == CT.DoubleSeq) {
                nextType = CT.AirPlane;
            }
            else if (nextType == CT.AirPlane) {
                return ret;
            }
            ret = ret.concat(this.findLastGt(nextType, cardType, localHandCard, localCompare));
        }
    };
    pdklogic.findLastTipDouble = function (localHandCard, localCompare) {
        var ret = [];
        // let body = []
        // let seqs = this.findAllDoubleSeq(localHandCard, localCompare)
        // console.log(seqs)
        // if (seqs && seqs.length > 0) {
        //     for (let size = 0; size < seqs.length; size++) {
        //         const three = seqs[size];
        //         if (three) {
        //             let t = []
        //             t = t.concat(three.slice(0, 3))
        //             body.push(t)
        //         }
        //     }
        // }
        // console.log("body:", body)
        //去除
        var localHandCardT = this.clone(localHandCard);
        // if (cardType == CT.AirPlane) {
        var planes = this.findPlaneBody(localHandCardT);
        if (planes && planes.length > 0) {
            // this.sortRetDesc(planes)
            for (var i = 0; i < planes.length; i++) {
                var plane = planes[i];
                // if (firstTip.length == 0) {
                //     firstTip = firstTip.concat(plane)
                //     nextType = CT.DoubleSeq
                // }
                // rtn = rtn.concat(plane)
                // this.deleteRtn(localHandCardT, plane)
            }
        }
        // }
        var seqs = this.findDoubleSeqBody(localHandCardT);
        if (seqs && seqs.length > 0) {
            // this.sortRetDesc(seqs)
            for (var i = 0; i < seqs.length; i++) {
                var seq = seqs[i];
                // if (firstTip.length == 0) {
                //     firstTip = firstTip.concat(seq)
                //     nextType = CT.Three
                // }
                // rtn = rtn.concat(seq)
                // this.deleteRtn(localHandCardT, seq)
            }
        }
        // let seqs = this.findAllDoubleSeq(localHandCardT, localCompare)
        // if (seqs && seqs.length > 0) {
        //     return seqs
        // }
        // seqs = this.findAllDoubleSeq(localHandCard, localCompare)
        // if (seqs && seqs.length > 0) {
        //     return seqs
        // }
        // for (let idex = 0; idex < body.length; idex++) {
        //     let rtn = []
        //     const bd = body[idex];//飞机主体
        //     rtn = rtn.concat(bd)
        //     let localHandCardT = this.clone(localHandCard)
        //     //排除飞机主体
        //     this.deleteRtn(localHandCardT, bd)
        //     let needSingle = 2
        //     let cards = this.findLastTip(CT.AirPlane, localHandCardT, needSingle)
        //     console.log("cards:", cards)
        //     rtn = rtn.concat(cards.splice(cards.length - needSingle, needSingle))
        //     ret.push(rtn)
        // }
        console.log("ret:", ret);
        return ret;
    };
    // static findLastTipDoubleSeq(localHandCard: lcardTmp[], localCompare: lcardTmp[]){
    //     let ret = []
    //     let body = []
    //     let doubles = this.findAllDoubleSeq(localHandCard, localCompare)
    //     console.log(doubles)
    //     if (doubles && doubles.length > 0) {
    //         for (let size = 0; size < doubles.length; size++) {
    //             const double = doubles[size];
    //             if (double) {
    //                 let t = []
    //                 t = t.concat(plane.slice(0, (plane.length/5)*3))
    //                 body.push(t)
    //             }
    //         }
    //     }
    //     console.log("body:", body)
    //     for (let idex = 0; idex < body.length; idex++) {
    //         let rtn = []
    //         const bd = body[idex];//飞机主体
    //         rtn = rtn.concat(bd)
    //         let localHandCardT = this.clone(localHandCard)
    //         //排除飞机主体
    //         this.deleteRtn(localHandCardT, bd)
    //         let needSingle = localCompare.length/5*2
    //         let cards = this.findLastTip(CT.AirPlane, localHandCardT, needSingle)
    //         console.log("cards:", cards)
    //         rtn = rtn.concat(cards.splice(cards.length - needSingle, needSingle))
    //         ret.push(rtn)
    //     }
    //     console.log("ret:", ret)
    // }
    // static findLastTipPlane(bomb: lcardTmp[][],localHandCard: lcardTmp[], localCompare: lcardTmp[], ){
    //     let ret = []
    //     ret = ret.concat(bomb)
    //     let body = []
    //     let planes = this.findAllPlane(localHandCard, localCompare)
    //     console.log(planes)
    //     if (planes && planes.length > 0) {
    //         for (let size = 0; size < planes.length; size++) {
    //             const plane = planes[size];
    //             if (plane) {
    //                 let t = []
    //                 t = t.concat(plane.slice(0, (plane.length/5)*3))
    //                 body.push(t)
    //             }
    //         }
    //     }
    //     console.log("body:", body)
    //     // {bd: , cards:}
    //     for (let idex = 0; idex < body.length; idex++) {
    //         const bd = body[idex];//飞机主体
    //         let localHandCardT = this.clone(localHandCard)
    //         //排除飞机主体
    //         this.deleteRtn(localHandCardT, bd)
    //         let rtn = []
    //         let planes = this.findPlaneBody(localHandCardT)
    //         if (planes && planes.length > 0) {
    //             let rtnT = this.ret2rtn(planes)
    //             this.sortByLogicDataDesc(rtnT)
    //             rtn = rtn.concat(rtnT)
    //             this.deleteRtn(localHandCardT, rtnT)
    //         }
    //         //排除连对主体
    //         let bseq = this.findDoubleSeqBody(localHandCardT)
    //         if (bseq && bseq.length > 0) {
    //             let rtnT = this.ret2rtn(bseq)
    //             this.sortByLogicDataDesc(rtnT)
    //             rtn = rtn.concat(rtnT)
    //             this.deleteRtn(localHandCardT, rtnT)
    //         }
    //         let threes = this.findThreeBody(localHandCardT)
    //         //排除三张主体
    //         if (threes && threes.length > 0) {
    //             let rtnT = this.ret2rtn(threes)
    //             this.sortByLogicDataDesc(rtnT)
    //             rtn = rtn.concat(rtnT)
    //             this.deleteRtn(localHandCardT, rtnT)
    //         }
    //         //排除顺子
    //         let shunZi = this.findFirstTipShunZi(localHandCardT)
    //         if (shunZi && shunZi.length > 0) {
    //             let rtnT = this.ret2rtn(shunZi)
    //             this.sortByLogicDataDesc(rtnT)
    //             rtnT = this.unique(rtnT)
    //             rtn = rtn.concat(rtnT)
    //             this.deleteRtn(localHandCardT, rtnT)
    //         }
    //         //排除对子
    //         let double = this.findDoubleBody(localHandCardT)
    //         if (double && double.length > 0) {
    //             let rtnT = this.ret2rtn(double)
    //             this.sortByLogicDataDesc(rtnT)
    //             rtn = rtn.concat(rtnT)
    //             this.deleteRtn(localHandCardT, rtnT)
    //         }
    //         //单张排序
    //         this.sortByLogicDataDesc(localHandCardT)
    //         rtn = rtn.concat(localHandCardT)
    //         console.log("rtn:", rtn)
    //     }
    // }
    // static findLastTipPlane(bomb: lcardTmp[][],localHandCard: lcardTmp[], localCompare: lcardTmp[], ){
    //     let ret = []
    //     this.sortByLogicData(localHandCard)
    //     this.sortByLogicData(localCompare)
    //     console.log("localHandCard:", localHandCard, localHandCard.length)
    //     console.log("localCompare:", localCompare)
    //     // let bomb = this.findAllBomb(localHandCard)
    //     ret = ret.concat(bomb)
    //     let body = []
    //     let planes = this.findAllPlane(localHandCard, localCompare)
    //     console.log(planes)
    //     // this.findOnePlane
    //     if (planes && planes.length == 1) {
    //         if (planes[0].length == localHandCard.length) {
    //             //炸弹剩余的手牌刚好
    //             ret = ret.concat(planes)
    //             return ret
    //         }
    //     }
    //     if (planes && planes.length > 0) {
    //         for (let size = 0; size < planes.length; size++) {
    //             const plane = planes[size];
    //             if (plane) {
    //                 console.log("plane:", plane)
    //                 let t = []
    //                 t = plane.slice(0, (plane.length/5)*3)
    //                 body.push(t)
    //             }
    //         }
    //     }
    //     console.log("body:", body)
    //     for (let idex = 0; idex < body.length; idex++) {
    //         const bd = body[idex];
    //         console.log("bd:", bd)
    //         let localHandCardT = this.clone(localHandCard)
    //         this.deleteRtn(localHandCardT, bd)
    //         let rtn = []
    //         //排除飞机主体
    //         console.log(localHandCardT)
    //         let pt = this.findPlaneThreeBody(localHandCardT)
    //         // console.log(bplane.length)
    //         if (pt.planes) {
    //             console.log("bplane:", pt.planes)
    //             console.log("bplane:", pt.planes.length)
    //             // for (let i = 0; i < pt.planes.length; i++) {
    //             //     const plane = pt.planes[i];
    //             //     rtn = rtn.concat(plane)
    //             // }
    //             rtn = this.ret2rtn(pt.planes)
    //             this.sortByLogicDataDesc(rtn)
    //             console.log("rtn:", rtn)
    //         }
    //         //排除连对主体
    //         let bseq = this.findFirstTipDoubleSeq(localHandCardT)
    //         if (bseq && bseq.length > 0) {
    //             console.log("bseq:", bseq)
    //             let rtnT = this.ret2rtn(bseq)
    //             // for (let i = 0; i < bseq.length; i++) {
    //             //     const seq = bseq[i];
    //             //     rtnT = rtnT.concat(seq)
    //             // }
    //             console.log("rtnT:", rtnT)
    //             if (rtn && rtn.length > 0) {
    //                 //
    //                 this.deleteRtn(rtnT, rtn)
    //             }
    //             console.log("rtnT.1:", rtnT)
    //             rtn = rtn.concat(rtnT)
    //             console.log("rtn.1:", rtn)
    //         }
    //         //排除三张主体
    //         if (pt.threes) {
    //             console.log("bplane:", pt.threes)
    //             let rtnT = this.ret2rtn(pt.threes)
    //             this.sortByLogicDataDesc(rtnT)
    //             if (rtn && rtn.length > 0) {
    //                 //
    //                 this.deleteRtn(rtnT, rtn)
    //             }
    //             console.log("rtnT.2:", rtnT)
    //             rtn = rtn.concat(rtnT)
    //             console.log("rtn.2:", rtn)
    //         }
    //         //排除顺子
    //         let shunZi = this.findFirstTipShunZi(localHandCardT)
    //         if (shunZi) {
    //             console.log("shunZi:", shunZi)
    //             let rtnT = this.ret2rtn(shunZi)
    //             this.sortByLogicDataDesc(rtnT)
    //             rtnT = this.unique(rtnT)
    //             if (rtn && rtn.length > 0) {
    //                 //
    //                 this.deleteRtn(rtnT, rtn)
    //             }
    //             rtn = rtn.concat(rtnT)
    //             console.log("shunZi.rtn", rtn)
    //         }
    //         //排除对子
    //         let double = this.findAllDouble(localHandCardT)
    //         if (double && double.length > 0) {
    //             let rtnT = this.ret2rtn(double)
    //             this.sortByLogicDataDesc(rtnT)
    //             if (rtn && rtn.length > 0) {
    //                 this.deleteRtn(rtnT, rtn)
    //             }
    //             rtn = rtn.concat(rtnT)
    //             console.log("double.rtn:", rtn)
    //         }
    //         // let single = this.findAllSingle(localHandCard)
    //         if (rtn.length < localHandCardT.length) {
    //             this.deleteRtn(localHandCardT, rtn)
    //             this.sortByLogicDataDesc(localHandCardT)
    //             rtn = rtn.concat(localHandCardT)
    //         }
    //         console.log('out.rtn:', rtn)
    //         if (localHandCard.length == bd.length + rtn.length) {
    //             console.log("pass")
    //         }
    //         for (let index = rtn.length - 1; index > rtn.length - 1 - 4; index--) {
    //             const v = rtn[index];
    //             bd.push(v)
    //         }
    //         console.log("tip.bd:", bd)
    //     }
    // }
    pdklogic.unique = function (cards) {
        //去重
        var arr = [cards[0]];
        for (var i = 1; i < cards.length; i++) {
            if (cards[i].o !== cards[i - 1].o) {
                arr.push(cards[i]);
            }
        }
        return arr;
    };
    pdklogic.ret2rtn = function (ret) {
        var rtn = [];
        for (var i = 0; i < ret.length; i++) {
            var v = ret[i];
            rtn = rtn.concat(v);
        }
        return rtn;
    };
    // static findPlaneBody(localHandCard: lcardTmp[]){
    //     let cardIndex = this.dataToIndex(localHandCard)
    //     let sameCard = this.findAllSameCardByIndex(cardIndex)
    //     let foundThree = false
    //     let seq = 0
    //     let threeLen = 0
    //     let planes:lcardTmp[][] = []
    //     if (sameCard[3] && sameCard[3].length >= 2) {
    //         //飞机
    //         for (let index = 0; index < sameCard[3].length; index++) {
    //             const same = sameCard[3][index];
    //             console.log("same:", same)
    //             if (!foundThree) {
    //                 foundThree = true
    //                 seq = same[0].l
    //                 threeLen = 1
    //             }else{
    //                 if (seq + 1 == same[0].l) {
    //                     threeLen++
    //                     if (threeLen == sameCard[3].length) {
    //                         planes = planes.concat(sameCard[3])
    //                     }
    //                 }else{
    //                     if (threeLen > 1) {
    //                         for (let i = 0; i < threeLen; i++) {
    //                             planes.push(sameCard[3][index - i -1])
    //                         }
    //                     }
    //                     foundThree = false
    //                 }
    //             }
    //         }
    //     }
    //     return planes
    // }
    pdklogic.findPlaneBody = function (localHandCard) {
        var planes = [];
        var plane = [];
        var cardIndex = this.dataToIndex(localHandCard);
        var seq = 2;
        var foundThree = false;
        var threeLen = 0;
        for (var i = 3; i < cardIndex.length; i++) {
            var v = cardIndex[i];
            if (v && v.length == 3) {
                if (!foundThree) {
                    foundThree = true;
                    seq = i;
                    threeLen = 1;
                    plane = [];
                }
                else {
                    if (seq + 1 == i) {
                        threeLen++;
                    }
                    seq = i;
                    if (threeLen >= 2) {
                        if (threeLen == 2) {
                            plane.push(cardIndex[i - 1]);
                        }
                        plane.push(cardIndex[i]);
                    }
                    if (i + 1 == cardIndex.length) {
                        planes.push(plane);
                    }
                }
            }
            else {
                foundThree = false;
                seq = i;
                if (threeLen >= 2) {
                    planes.push(plane);
                }
                threeLen = 0;
            }
        }
        return planes;
    };
    pdklogic.findDoubleSeqBody = function (localHandCard) {
        var dseqs = [];
        var dseq = [];
        var cardIndex = this.dataToIndex(localHandCard);
        var seq = 2;
        var foundThree = false;
        var threeLen = 0;
        for (var i = 3; i < cardIndex.length; i++) {
            var v = cardIndex[i];
            if (v && v.length >= 2) {
                if (!foundThree) {
                    foundThree = true;
                    seq = i;
                    threeLen = 1;
                    dseq = [];
                }
                else {
                    if (seq + 1 == i) {
                        threeLen++;
                    }
                    seq = i;
                    if (threeLen >= 2) {
                        if (threeLen == 2) {
                            dseq.push(cardIndex[i - 1].slice(0, 2));
                        }
                        dseq.push(cardIndex[i].slice(0, 2));
                    }
                    if (i + 1 == cardIndex.length) {
                        dseqs.push(dseq);
                    }
                }
            }
            else {
                foundThree = false;
                seq = i;
                if (threeLen >= 2) {
                    dseqs.push(dseq);
                }
                threeLen = 0;
            }
        }
        return dseqs;
    };
    // static findDoubleSeqBody(localHandCard: lcardTmp[]){
    //     // let ret = []
    //     // let localHandCardT = this.clone(localHandCard)
    //     // let seq = this.findOneDoubleSeq(localHandCardT)
    //     // while(seq){
    //     //     this.deleteRtn(localHandCardT, seq)
    //     //     ret.push(seq)
    //     //     seq = this.findOneDoubleSeq(localHandCardT)
    //     // }
    //     return ret
    // }
    pdklogic.findThreeBody = function (localHandCard) {
        var ret = [];
        var localHandCardT = this.clone(localHandCard);
        var handCardIndex = this.dataToIndex(localHandCardT);
        for (var i = 3; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length == 3) {
                ret.push(v);
            }
        }
        return ret;
    };
    pdklogic.findDoubleBody = function (localHandCard) {
        var handCardIndex = this.dataToIndex(localHandCard);
        var ret = [];
        for (var i = 3; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length == 2) {
                ret.push(v);
            }
        }
        return ret;
    };
    pdklogic.findAIShunzi = function (localHandCard, selectCard) {
        var cardIndex = this.dataToIndex(selectCard);
        var seq = 2;
        var isSingle = false;
        var singleLen = 0;
        var findShunzi = false;
        console.log("cardIndex:", cardIndex);
        for (var i = 3; i < cardIndex.length; i++) {
            var v = cardIndex[i];
            if (v && v.length > 0) {
                if (!isSingle) {
                    isSingle = true;
                    seq = i;
                    singleLen = 1;
                }
                else {
                    if (seq + 1 == i) {
                        singleLen++;
                    }
                    seq = i;
                    console.log("seq:", seq, ",i:", i, ",cardIndex.length:", cardIndex.length);
                    if (i + 1 == cardIndex.length) {
                        findShunzi = true;
                    }
                }
            }
            else if (isSingle == true) {
                isSingle = false;
                seq = i;
                singleLen = 0;
                findShunzi = false;
                break;
            }
        }
        // let uSelectCard = this.uniqueLogicValue(selectCard)
        console.log("findShunzi:", findShunzi);
        // if (findShunzi) {
        //     let shunZi = this.findFirstTipShunZi(localHandCard)
        //     console.log("shunZi:", shunZi)
        //     if (shunZi && shunZi.length > 0) {
        //         for (let i = 0; i < shunZi.length; i++) {
        //             const sz = shunZi[i];
        //             let contains = this.isContains(sz, uSelectCard)
        //             if (contains) {
        //                 return sz
        //             }
        //         }
        //     }
        // }
        return null;
    };
    // static findDoubleSeq(localHandCard: lcardTmp[]){
    //     this.findAllDoubleSeq()
    //     let seq = this.findFirstTipDoubleSeq(localHandCard)
    //     if (seq && seq.length > 0) {
    //         console.log("seq:", seq)
    //         ret = ret.concat(seq)
    //     }
    // }
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
    // static findAllDoubleSeq(localHandCard: lcardTmp[], localCompare: lcardTmp[]) {
    //     let minCld = localCompare[0].l
    //     let compareSeq = localCompare.length / 2
    //     let handCardIndex = this.dataToIndex(localHandCard)
    //     let lastLd = minCld
    //     let ret = []
    //     let foundT = []
    //     let minIndex = Math.min(14, handCardIndex.length)
    //     for (let i = minCld + 1; i < minIndex; i++) {
    //         const v = handCardIndex[i];
    //         if (v && v.length == 2) {
    //             lastLd = i
    //             for (let j = i + 1; j <= minIndex; j++) {
    //                 const v = handCardIndex[j];
    //                 if (v && v.length == 2) {
    //                     if (lastLd + 1 == j) {
    //                         lastLd = j
    //                         if (j - i + 1 >= compareSeq) {
    //                             let r = []
    //                             for (let m = i; m <= j; m++) {
    //                                 r = r.concat(handCardIndex[m])
    //                             }
    //                             let cardkey = this.getCardKey(r)
    //                             if (!foundT[cardkey]) {
    //                                 foundT[cardkey] = true
    //                                 ret.push(r)
    //                             }
    //                             break
    //                         }
    //                     } else {
    //                         break
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     for (let i = minCld + 1; i < minIndex; i++) {
    //         const v = handCardIndex[i];
    //         if (v && v.length >= 2 && v.length < 4) {
    //             lastLd = i
    //             for (let j = i + 1; j <= minIndex; j++) {
    //                 const v = handCardIndex[j];
    //                 if (v && v.length >= 2 && v.length < 4) {
    //                     if (lastLd + 1 == j) {
    //                         lastLd = j
    //                         if (j - i + 1 >= compareSeq) {
    //                             let r = []
    //                             for (let m = i; m <= j; m++) {
    //                                 r = r.concat(handCardIndex[m].slice(0,2))
    //                             }
    //                             let cardkey = this.getCardKey(r)
    //                             if (!foundT[cardkey]) {
    //                                 foundT[cardkey] = true
    //                                 ret.push(r)
    //                             }
    //                             break
    //                         }
    //                     } else {
    //                         break
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //     // for (let i = minCld + 1; i < minIndex; i++) {
    //     //     const v = handCardIndex[i];
    //     //     if (v && v.length >= 2) {
    //     //         lastLd = i
    //     //         for (let j = i + 1; j <= minIndex; j++) {
    //     //             const v = handCardIndex[j];
    //     //             if (v && v.length >= 2) {
    //     //                 if (lastLd + 1 == j) {
    //     //                     lastLd = j
    //     //                     if (j - i + 1 >= compareSeq) {
    //     //                         let r = []
    //     //                         for (let m = i; m <= j; m++) {
    //     //                             r = r.concat(handCardIndex[m].slice(0,2))
    //     //                         }
    //     //                         let cardkey = this.getCardKey(r)
    //     //                         if (!foundT[cardkey]) {
    //     //                             foundT[cardkey] = true
    //     //                             ret.push(r)
    //     //                         }
    //     //                         break
    //     //                     }
    //     //                 } else {
    //     //                     break
    //     //                 }
    //     //             }
    //     //         }
    //     //     }
    //     // }
    //     return ret
    // }
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
        for (var i = minCld + 1; i < minIndex; i++) {
            var v = handCardIndex[i];
            if (v && v.length >= 2) {
                lastLd = i;
                for (var j = i + 1; j <= minIndex; j++) {
                    var v_8 = handCardIndex[j];
                    if (v_8 && v_8.length >= 2) {
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
        console.log("handCardIndex:", handCardIndex);
        var minCld = 2;
        var singleCnt = Math.min(2, localHandCard.length - 3);
        if (localCompare) {
            minCld = localCompare[0].l;
            singleCnt = Math.min(localCompare.length - 3, localHandCard.length - 3);
        }
        console.log("minCld:", minCld, ",singleCnt:", singleCnt, ",handCardIndex.length:", handCardIndex.length);
        var ret = [];
        for (var i = minCld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length == 3) {
                var rtn = [];
                var needSingle = singleCnt;
                rtn = rtn.concat(v);
                if (needSingle > 0) {
                    for (var j = 3; j < handCardIndex.length; j++) {
                        var v_9 = handCardIndex[j];
                        if (v_9 && v_9.length == 1) {
                            rtn = rtn.concat(v_9);
                            needSingle--;
                            if (needSingle == 0) {
                                break;
                            }
                        }
                    }
                }
                if (needSingle > 0) {
                    for (var j = 0; j < handCardIndex.length; j++) {
                        var v_10 = handCardIndex[j];
                        if (v_10 && v_10.length >= 2 && v_10[0].l != rtn[0].l) {
                            var removeCount = Math.min(needSingle, v_10.length);
                            rtn = rtn.concat(v_10.slice(0, removeCount));
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
                        var v_11 = handCardIndex[j];
                        if (v_11 && v_11.length == 1) {
                            rtn = rtn.concat(v_11);
                            needSingle--;
                            if (needSingle == 0) {
                                break;
                            }
                        }
                    }
                }
                if (needSingle > 0) {
                    for (var j = 0; j < handCardIndex.length; j++) {
                        var v_12 = handCardIndex[j];
                        if (v_12 && v_12.length < 4) {
                            var minus = Math.min(needSingle, v_12.length);
                            rtn = rtn.concat(v_12.slice(0, minus));
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
                    var v_13 = handCardIndex[j];
                    if (v_13 && v_13.length > 0) {
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
        console.log("localCompare:", localCompare);
        var threeLen = 0;
        var ret = [];
        var cardIndex = this.dataToIndex(localCompare);
        var seq = 2;
        var foundThree = false;
        var lastThreeMax = 0;
        // let threeLen = 0
        for (var i = 3; i < cardIndex.length; i++) {
            var v = cardIndex[i];
            console.log("v:", v);
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
                    else {
                        lastThreeMax = Math.max(lastThreeMax, threeLen);
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
        console.log("compareLen:", compareLen, threeLen, compareLen - threeLen * 3, localHandCard.length, localHandCard.length - threeLen * 3);
        var singleCnt = (compareLen - threeLen * 3);
        var minCld = localCompare[0].l;
        console.log("singleCnt:", singleCnt, threeLen * 2);
        if (singleCnt >= 0 && singleCnt < threeLen * 2) {
            //单牌小于3条需要的数量，拆3条
            var fit = false;
            var lbreak = true;
            var lt = threeLen;
            console.log("lt:", lt, singleCnt);
            do {
                lt--;
                console.log("lt:", lt, singleCnt);
                singleCnt += 3;
                if (lt < 2) {
                    lbreak = false;
                    fit = false;
                }
                console.log("lt:", lt, singleCnt);
                if (singleCnt == lt * 2) {
                    fit = true;
                    lbreak = false;
                }
                console.log("lt:", lt, singleCnt);
            } while (lbreak);
            console.log("lt:", lt, singleCnt);
            if (fit) {
                threeLen = lt;
            }
            console.log("threeLen:", threeLen, lastThreeMax);
            minCld = localCompare[(lastThreeMax - threeLen) * 3].l;
            console.log("minCld:", minCld);
            // singleCnt = Math.min(compareLen - threeLen * 3, localHandCard.length - threeLen * 3)
            singleCnt = threeLen * 2;
            console.log("singleCnt:", singleCnt);
        }
        singleCnt = compareLen - threeLen * 3;
        var handCardIndex = this.dataToIndex(localHandCard);
        var lastLd = minCld;
        // let found = false
        for (var i = minCld + 1; i < handCardIndex.length; i++) {
            var v = handCardIndex[i];
            if (v && v.length >= 3) {
                lastLd = i;
                for (var j = i + 1; j < handCardIndex.length; j++) {
                    var v_14 = handCardIndex[j];
                    if (v_14 && v_14.length >= 3) {
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
                                        var v_15 = handCardIndex[i_1];
                                        if (v_15 && v_15.length == 1) {
                                            r = r.concat(v_15);
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
                                        var v_16 = handCardIndex[k];
                                        if (v_16) {
                                            var ccount = v_16.length;
                                            valid = true;
                                            if (ccount > 1 && ccount < 4) {
                                                if (ccount == 3) {
                                                    if (k >= i && k <= j) {
                                                        valid = false;
                                                    }
                                                }
                                                if (valid) {
                                                    var minus = Math.min(needSingle, ccount);
                                                    r = r.concat(v_16.slice(0, minus));
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
    // static findAllBomb(localHandCard: lcardTmp[], localCompare?: lcardTmp[]) {
    //     let ret = []
    //     if (localCompare) {
    //         let compareLen = localCompare.length
    //         let handCardIndex = this.dataToIndex(localHandCard)
    //         let minCld = localCompare[0].l
    //         // if (compareLen == 3) {
    //         //     //AAA
    //         //     for (let i = 3; i < handCardIndex.length; i++) {
    //         //         const v = handCardIndex[i]
    //         //         if (v && v.length == 4) {
    //         //             let rtn = [].concat(v)
    //         //             ret.push(rtn)
    //         //         }
    //         //     }
    //         // }
    //         for (let i = minCld + 1; i < handCardIndex.length; i++) {
    //             const v = handCardIndex[i];
    //             if (v && v.length == 4) {
    //                 let rtn = [].concat(v)
    //                 ret.push(rtn)
    //             }
    //         }
    //     } else {
    //         let handCardIndex = this.dataToIndex(localHandCard)
    //         // //有AAA 就返回AAA
    //         // if (handCardIndex[14] && handCardIndex[14].length == 3) {
    //         //     let rtn = [].concat(handCardIndex[14])
    //         //     ret.push(rtn)
    //         // }
    //         for (let i = 3; i < handCardIndex.length; i++) {
    //             const v = handCardIndex[i];
    //             if (v && v.length == 4) {
    //                 let rtn = [].concat(v)
    //                 ret.push(rtn)
    //             }
    //         }
    //     }
    //     return ret
    // }
    //a是否大于b
    pdklogic.isGt = function (a, b, last) {
        var at = this.getCardType(a, last);
        var bt = this.getCardType(b, last);
        console.log("at:", at, ",bt:", bt);
        var as = this.sortBySame(a, at);
        var bs = this.sortBySame(b, bt);
        console.log("as:", as, ",bs:", bs);
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
    pdklogic.getAICard = function (localHandCard, selectCard, localCompare, findFit) {
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
