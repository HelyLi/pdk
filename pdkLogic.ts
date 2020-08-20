import { throws } from "assert";

enum CT {
    //错误牌型
    Error = 0,
    //单牌
    Single = 1,
    //对子
    Double = 2,
    //连对
    DoubleSeq = 3,
    //顺子
    ShunZi = 4,
    //3条/3带1/3带2
    Three = 5,
    //飞机（连3条）
    AirPlane = 6,
    //4带3
    FourAThree = 7,
    //炸弹（4个相同或者AAA ）
    Bomb = 8
}

export interface lcardTmp {
    o: number, //原始值
    r: number, //替换值
    l: number, //逻辑值
    s: number, //状态值
}

/**
 * 不拆炸弹
 */


// import { GamePdkConstants } from "../../../model/game/const/GamePdkConstants";
// import { this } from "../../../../lib/utils/this";

export class pdklogic {

    static clone(obj: any): any {
        if (!obj || [] == obj || {} == obj) {
            return obj;
        }

        let newObj: any;
        let isArray = false;
        if (Array.isArray(obj)) {
            newObj = [];
            isArray = true;
        }
        else {
            newObj = {};
            isArray = false;
        }

        for (let key of Object.keys(obj)) {
            if (null == obj[key]) {
                newObj[key] = null;
            }
            else {
                let sub = (typeof obj[key] == 'object') ? this.clone(obj[key]) : obj[key];
                newObj[key] = sub;
            }
        }
        return newObj;
    }

    static bytesToLCard(cardBytes: number[], sort: boolean = true, desc: boolean = false): lcardTmp[] {
        let cards = []
        for (let i = 0; i < cardBytes.length; i++) {
            const v = cardBytes[i];
            if (v) {
                let lc: lcardTmp = { o: 0, r: 0, l: 0, s: 0 };
                lc.o = v
                lc.r = this.replaceData(v)
                lc.l = v & 0x0F
                cards.push(lc)
            }
        }
        if (sort) {
            if (desc) {
                this.sortByLogicDataDesc(cards)
            } else {
                this.sortByLogicData(cards)
            }
        }
        return cards
    }

    static replaceData(card: number): number {
        let rd = card & 0x0F
        if (rd == 14 || rd == 15) {
            rd -= 13
        }
        rd += card & 0xF0
        return rd
    }

    //     function algfj_lx:lCardToBytes( cardData )
    //     local cardBytes = {}

    //     for i, v in ipairs(cardData) do
    //         table.insert(cardBytes, v.o)
    //     end

    //     return cardBytes
    // end

    static lCardToBytes(cardDatas: lcardTmp[]): number[] {
        let cardBytes: number[] = []
        for (let i = 0; i < cardDatas.length; i++) {
            const v = cardDatas[i];
            cardBytes.push(v.o)
        }
        return cardBytes
    }

    // static logicData(card: number): number {
    //     let ld = card & 0x0F
    //     // if (ld == 1 || ld == 2) {
    //     //     ld += 13
    //     // }
    //     return ld
    // }

    static sortByLogicData(cards: lcardTmp[]) {
        cards.sort(function (a, b) {
            if (a.l == b.l) {
                return a.o - b.o
            } else {
                return a.l - b.l
            }
        })
    }

    static sortByLogicDataDesc(cards: lcardTmp[]) {
        cards.sort(function (a, b) {
            if (a.l == b.l) {
                return a.o - b.o
            } else {
                return b.l - a.l
            }
        })
    }

    static dataToIndex(cards: lcardTmp[]): lcardTmp[][] {
        let cardIndex = []
        for (let i = 0; i < cards.length; i++) {
            const v = cards[i];
            if (v) {
                if (cardIndex[v.l] == undefined) {
                    cardIndex[v.l] = []
                }
                cardIndex[v.l].push(v)
            }
        }
        return cardIndex
    }

    static findAllSameCardByIndex(cardIndex: lcardTmp[][]): lcardTmp[][][] {
        let rtn: lcardTmp[][][] = []
        for (let i = 3; i < cardIndex.length; i++) {
            const v = cardIndex[i];
            if (v) {
                if (rtn[v.length] == undefined) {
                    rtn[v.length] = []
                }
                rtn[v.length].push(v)
            }
        }
        return rtn
    }

    static findAllSameCardByIndexDesc(cardIndex: lcardTmp[][]): lcardTmp[][][] {
        let rtn: lcardTmp[][][] = []
        for (let i = cardIndex.length - 1; i >= 3; i--) {
            const v = cardIndex[i];
            if (v) {
                if (rtn[v.length] == undefined) {
                    rtn[v.length] = []
                }
                rtn[v.length].push(v)
            }
        }
        return rtn
    }

    static sortBySame(cards: lcardTmp[], cardType?: number): lcardTmp[] {
        let cardIndex = this.dataToIndex(cards)
        let sameCard = this.findAllSameCardByIndex(cardIndex)
        if (cardType == CT.AirPlane) {
            let rtn = []
            let seq = 2
            let foundThree = false
            let lastThreeMax = 0
            let threeLen = 0
            let lastTHreeMaxL = 0
            let curThreeL = 0
            for (let i = 3; i < cardIndex.length; i++) {
                const v = cardIndex[i]
                if (v && v.length >= 3) {
                    if (!foundThree) {
                        foundThree = true
                        seq = i
                        threeLen = 1
                        curThreeL = i
                    } else {
                        if (seq + 1 == i) {
                            threeLen++
                        }
                        seq = i
                        curThreeL = i
                        if (i + 1 == cardIndex.length) {
                            if (threeLen >= lastThreeMax) {
                                lastTHreeMaxL = curThreeL
                            }
                            lastThreeMax = Math.max(lastThreeMax, threeLen)
                            threeLen = 0
                        }
                    }
                } else {
                    foundThree = false
                    seq = i
                    if (threeLen >= lastThreeMax) {
                        lastTHreeMaxL = curThreeL
                    }
                    lastThreeMax = Math.max(lastThreeMax, threeLen)
                    threeLen = 0
                }
            }
            let minL = lastTHreeMaxL - lastThreeMax + 1
            for (let i = minL; i <= lastTHreeMaxL; i++) {
                const v = cardIndex[i];
                if (v) {
                    rtn = rtn.concat(v)
                }
            }
            for (let i = sameCard.length - 1; i >= 1; i--) {
                const sameItem = sameCard[i]
                if (sameItem) {
                    for (let j = 0; j < sameItem.length; j++) {
                        const v = sameItem[j];
                        if (v[0].l < minL || v[0].l > lastTHreeMaxL) {
                            rtn = rtn.concat(v)
                        }
                    }
                }
            }
            return rtn
        } else {
            let rtn = []
            for (let i = sameCard.length - 1; i >= 1; i--) {
                const sameItem = sameCard[i]
                if (sameItem) {
                    for (let j = 0; j < sameItem.length; j++) {
                        const v = sameItem[j];
                        if (v) {
                            rtn = rtn.concat(v)
                        }
                    }
                }
            }
            return rtn
        }
    }

    static sortDiscard(cards: lcardTmp[], cardType?: number): lcardTmp[] {
        let cardIndex = this.dataToIndex(cards)
        let sameCard = this.findAllSameCardByIndexDesc(cardIndex)
        if (cardType == CT.AirPlane) {
            let rtn = []
            let seq = 2
            let foundThree = false
            let lastThreeMax = 0
            let threeLen = 0
            let lastTHreeMaxL = 0
            let curThreeL = 0
            for (let i = 3; i < cardIndex.length; i++) {
                const v = cardIndex[i]
                if (v && v.length >= 3) {
                    if (!foundThree) {
                        foundThree = true
                        seq = i
                        threeLen = 1
                        curThreeL = i
                    } else {
                        if (seq + 1 == i) {
                            threeLen++
                        }
                        seq = i
                        curThreeL = i
                        if (i + 1 == cardIndex.length) {
                            if (threeLen >= lastThreeMax) {
                                lastTHreeMaxL = curThreeL
                            }
                            lastThreeMax = Math.max(lastThreeMax, threeLen)
                            threeLen = 0
                        }
                    }
                } else {
                    foundThree = false
                    seq = i
                    if (threeLen >= lastThreeMax) {
                        lastTHreeMaxL = curThreeL
                    }
                    lastThreeMax = Math.max(lastThreeMax, threeLen)
                    threeLen = 0
                }
            }
            let minL = lastTHreeMaxL - lastThreeMax + 1
            for (let i = lastTHreeMaxL; i >= minL; i--) {
                const v = cardIndex[i];
                if (v) {
                    rtn = rtn.concat(v)
                }
            }
            for (let i = sameCard.length - 1; i >= 1; i--) {
                const sameItem = sameCard[i]
                if (sameItem) {
                    for (let j = 0; j < sameItem.length; j++) {
                        const v = sameItem[j];
                        if (v[0].l < minL || v[0].l > lastTHreeMaxL) {
                            rtn = rtn.concat(v)
                        }
                    }
                }
            }
            return rtn
        } else {
            let rtn = []
            for (let i = sameCard.length - 1; i >= 1; i--) {
                const sameItem = sameCard[i]
                if (sameItem) {
                    for (let j = 0; j < sameItem.length; j++) {
                        const v = sameItem[j];
                        if (v) {
                            rtn = rtn.concat(v)
                        }
                    }
                }
            }
            return rtn
        }
    }

    static color(card: number) {
        return (card & 0xF0) >> 4
    }

    /*--------------------------------*/

    // 是否一对 传入本地结构
    static isDouble(cards: lcardTmp[]) {
        if (cards.length != 2) {
            return false
        }
        return cards[0].l == cards[1].l
    }

    // 是否连对 传入本地结构
    static isDoubleSeq(cards: lcardTmp[]) {
        console.log("isDoubleSeq")
        let cardLen = cards.length
        if (cardLen < 4 || cardLen % 2 != 0) {
            return false
        }
        let lastCard = cards[0].l - 1
        for (let i = 0; i < cardLen; i = i + 2) {
            const v = cards[i];
            if (lastCard + 1 != v.l) {
                return false
            }
            lastCard = v.l
            if (v.l != cards[i + 1].l) {
                return false
            }
        }
        return true
    }

    // 是否3条
    static isThree(cards: lcardTmp[], last: boolean = false) {
        let cardLen = cards.length
        if (cardLen < 3 || cardLen > 5) {
            return false
        }
        if (!last) {
            if (cardLen != 5) {
                return false
            }
        }
        if (cardLen == 3) {
            return cards[0].l == cards[1].l && cards[0].l == cards[2].l
        }
        if (cardLen == 4) {
            return (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l != cards[3].l)
        }
        if (cardLen == 5) {
            return (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l != cards[4].l)
        }
    }

    static isAirplane(cards: lcardTmp[], last: boolean = false): boolean {
        let cardLen = cards.length
        if (cardLen < 6) {
            return false
        }
        if (!last && cardLen < 10) {
            return false
        }
        if (!last && cardLen % 5 != 0) {
            return false
        }
        let remain = cardLen
        let cardIndex = this.dataToIndex(cards)
        let seq = 2
        let foundThree = false
        let lastThreeMax = 0
        let threeLen = 0
        for (let i = 3; i < cardIndex.length; i++) {
            const v = cardIndex[i];
            if (v && v.length >= 3) {
                if (!foundThree) {
                    foundThree = true
                    seq = i
                    threeLen = 1
                } else {
                    if (seq + 1 == i) {
                        threeLen++
                    }
                    seq = i
                    if (i + 1 == cardIndex.length) {
                        lastThreeMax = Math.max(lastThreeMax, threeLen)
                        threeLen = 0
                    }
                }
            } else {
                foundThree = false
                seq = i
                lastThreeMax = Math.max(lastThreeMax, threeLen)
                threeLen = 0
            }
        }
        if (lastThreeMax < 2) {
            return false
        }
        threeLen = lastThreeMax * 3
        remain = cardLen - threeLen
        if (!last) {
            if (remain / 2 == lastThreeMax) {
                return true
            } else {
                if (lastThreeMax > 2) {
                    let fit = false
                    let tMax = lastThreeMax
                    let lr = remain
                    let lbreak = true
                    do {
                        lr += 3
                        tMax -= 1
                        if (tMax < 2) {
                            fit = false
                            lbreak = false
                        }
                        if (lr / 2 == tMax) {
                            fit = true
                            lbreak = false
                        }
                    } while (lbreak);
                    return fit
                }
            }
        } else {
            if (remain <= lastThreeMax * 2) {
                return true
            }
        }
        return false
    }

    //是否4带3
    static isFourAThree(cards: lcardTmp[], last: boolean = false) {
        let cardLen = cards.length
        if (cardLen < 5 || cardLen > 7) {
            return false
        }
        if (!last && cardLen != 7) {
            return false
        }
        return (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l == cards[3].l)
    }

    static isBomb(cards: lcardTmp[]) {
        let cardLen = cards.length
        if (cardLen !== 4) {
            return false
        }
        return (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l == cards[3].l)
    }

    static isShunZi(cards: lcardTmp[]) {
        let cardLen = cards.length
        if (cardLen < 5) {
            return false
        }
        let card = cards[cardLen - 1].l
        if (card == 0x0F) {//2不能参与顺子
            return false
        }
        card = cards[0].l
        for (let i = 1; i < cardLen; i++) {
            if (card + 1 != cards[i].l) {
                return false
            }
            card = cards[i].l
        }
        return true
    }

    static getCardType(cards: lcardTmp[], last: boolean = false) {
        let cardLen = cards.length
        cards = this.sortBySame(this.clone(cards))
        if (cardLen == 1) {
            return CT.Single
        }
        if (cardLen == 2) {
            if (cards[0].l == cards[1].l) {
                return CT.Double
            }
        }
        if (cardLen == 3) {
            if (last) {
                if (cards[0].l == cards[1].l && cards[0].l == cards[2].l) {
                    return CT.Three
                }
            }
        }
        if (cardLen == 4) {
            if (this.isBomb(cards)) {
                return CT.Bomb
            }
            if (this.isDoubleSeq(cards)) {
                return CT.DoubleSeq
            }
            if (this.isThree(cards, last)) {
                return CT.Three
            }
        }
        if (cardLen >= 5) {
            //排除炸弹与单张组成的三张

            if (this.isAirplane(cards, last)) {
                return CT.AirPlane
            }
            if (this.isThree(cards)) {
                return CT.Three
            }
            if (cardLen % 2 == 0) {
                if (this.isDoubleSeq(cards)) {
                    return CT.DoubleSeq
                }
            }
            if (this.isShunZi(cards)) {
                return CT.ShunZi
            }
        }
        return CT.Error
    }

    static findFirstOutCard(localHandCard: lcardTmp[]) {
        this.sortByLogicData(localHandCard)
        for (let i = 3; i >= 0; i--) {
            for (let j = 0; j < localHandCard.length; j++) {
                const v = localHandCard[j];
                if (v && this.color(v.o) == i) {
                    return v
                }
            }
        }
        return null
    }

    /****************************************/
    static findOneDoubleSeq(localHandCard: lcardTmp[], localCompare?: lcardTmp[]) {
        if (localHandCard.length < 4) {
            return null
        }
        let minCld = 2
        let compareSeq = 0
        let any = false
        if (localCompare) {
            minCld = localCompare[0].l
            compareSeq = localCompare.length / 2
        } else {
            minCld = 2
            compareSeq = Math.floor(localHandCard.length / 2)
            any = true
        }
        let handCardIndex = this.dataToIndex(localHandCard)
        let lastLd = minCld
        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length == 2) {
                lastLd = i
                for (let j = i + 1; j < handCardIndex.length; j++) {
                    const v = handCardIndex[j];
                    if (v && v.length == 2) {
                        if (lastLd + 1 == j) {
                            lastLd = j
                            if (j - i + 1 >= compareSeq) {
                                let r = []
                                for (let m = i; m <= j; m++) {
                                    r = r.concat(handCardIndex[m])
                                }
                                return r
                            }
                        } else {
                            if (any) {
                                if (j - i >= 2) {
                                    let r = []
                                    for (let m = i; m < j; m++) {
                                        r = r.concat(handCardIndex[m])
                                    }
                                    return r
                                }
                            }
                            break
                        }
                    } else {
                        if (any) {
                            if (j - i >= 2) {
                                let r = []
                                for (let m = i; m < j; m++) {
                                    r = r.concat(handCardIndex[m])
                                }
                                return r
                            }
                        }
                        break
                    }
                }
            }
        }

        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length >= 2) {
                lastLd = i
                for (let j = i + 1; j < handCardIndex.length; j++) {
                    const v = handCardIndex[j];
                    if (v && v.length >= 2) {
                        if (lastLd + 1 == j) {
                            lastLd = j
                            if (j - i + 1 >= compareSeq) {
                                let r = []
                                for (let m = i; m <= j; m++) {
                                    r = r.concat(handCardIndex[m].slice(0, 2))
                                }
                                return r
                            }
                        } else {
                            if (any) {
                                if (j - i >= 2) {
                                    let r = []
                                    for (let m = i; m < j; m++) {
                                        r = r.concat(handCardIndex[m].slice(0, 2))
                                    }
                                    return r
                                }
                            }
                        }
                    } else {
                        if (any) {
                            if (j - i >= 2) {
                                let r = []
                                for (let m = i; m < j; m++) {
                                    r = r.concat(handCardIndex[m].slice(0, 2))
                                }
                                return r
                            }
                        }
                        break
                    }
                }
            }
        }
        return null
    }

    static findOneThree(localHandCard: lcardTmp[], localCompare?: lcardTmp[]): lcardTmp[] {
        if (localHandCard.length < 3) {
            return null
        }
        let minCld = 2
        let singleCnt = 0
        if (localCompare) {
            minCld = localCompare[0].l
            singleCnt = Math.min(localHandCard.length - 3, localCompare.length - 3)
        } else {
            minCld = 2
            singleCnt = Math.min(localHandCard.length - 3, 2)
        }
        let handCardIndex = this.dataToIndex(localHandCard)
        let found = false
        let rtn = []
        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i]
            if (v && v.length >= 3) {
                found = true
                rtn = rtn.concat(v)
                singleCnt -= (v.length - 3)
                break
            }
        }
        if (found && singleCnt > 0) {
            for (let i = 3; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 1) {
                    rtn = rtn.concat(v)
                    singleCnt -= 1
                    if (singleCnt == 0) {
                        break
                    }
                }
            }
        }
        if (found && singleCnt > 0) {
            for (let i = 3; i < handCardIndex.length; i++) {
                const v = handCardIndex[i]
                if (v && v.length > 1 && v.length < 3) {
                    let removeCount = Math.min(singleCnt, v.length)
                    rtn = rtn.concat(v.slice(0, removeCount))
                    singleCnt -= removeCount
                    if (singleCnt == 0) {
                        break
                    }
                }
            }
        }
        if (found && singleCnt == 0) {
            return rtn
        }
        return null
    }

    static findOneFourThree(localHandCard: lcardTmp[], localCompare?: lcardTmp[]) {
        if (localHandCard.length < 4) {
            return null
        }
        let minCld = 2
        let singleCnt = 0
        if (localCompare) {
            minCld = localCompare[0].l
            singleCnt = Math.min(localHandCard.length - 4, localCompare.length - 4)
        } else {
            minCld = 2
            singleCnt = Math.min(localHandCard.length - 4, 3)
        }
        let found = false
        let rtn = []
        let handCardIndex = this.dataToIndex(localHandCard)
        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length == 4) {
                found = true
                rtn = rtn.concat(v)
                break
            }
        }
        if (found && singleCnt > 0) {
            for (let i = 2; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 1) {
                    rtn = rtn.concat(v)
                    singleCnt -= 1
                    if (singleCnt == 0) {
                        break
                    }
                }
            }
        }
        if (found && singleCnt > 0) {
            for (let i = 0; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length < 4 && v.length > 1) {
                    let minus = Math.min(singleCnt, v.length)
                    rtn = rtn.concat(v.slice(0, minus))
                    singleCnt -= minus
                    if (singleCnt == 0) {
                        break
                    }
                }
            }
        }
        if (found && singleCnt == 0) {
            return rtn
        }
        return null
    }

    static findOneShunZi(localHandCard: lcardTmp[], localCompare?: lcardTmp[]) {
        if (localHandCard.length < 5) {
            return null
        }
        let compareLen = 5
        let minCld = 2
        if (localCompare) {
            minCld = localCompare[0].l
            compareLen = localCompare.length
        } else {
            minCld = 2
            this.sortByLogicData(localHandCard)
            compareLen = Math.max(5, Math.abs(localHandCard[localHandCard.length - 1].l - localHandCard[0].l) + 1)
            minCld = localHandCard[0].l - 1
        }
        let handCardIndex = this.dataToIndex(localHandCard)
        let lastLd = minCld
        let minIndex = Math.min(handCardIndex.length, 15)
        for (let i = minCld + 1; i < minIndex; i++) {
            if (handCardIndex.length - i < compareLen) {
                break
            }
            const v = handCardIndex[i];
            if (v && v.length > 0) {
                lastLd = i
                for (let j = i + 1; j < minIndex; j++) {
                    const v = handCardIndex[j];
                    if (v && v.length > 0) {
                        if (lastLd + 1 == j) {
                            lastLd = j
                            if (j - i + 1 >= compareLen) {
                                let r = []
                                for (let m = i; m <= j; m++) {
                                    r.push(handCardIndex[m][0])
                                }
                                return r
                            }
                        } else {
                            break
                        }
                    }
                }
            }
        }
        return null
    }

    static findOnePlane(localHandCard: lcardTmp[], localCompare?: lcardTmp[]): lcardTmp[] {
        if (localHandCard.length < 6) {
            return null
        }
        let compareLen = 0
        let threeLen = 0
        let singleCnt = 0
        let minCld = 0
        if (localCompare) {
            let lc = this.sortBySame(localCompare, CT.AirPlane)
            let cardIndex = this.dataToIndex(lc)
            let seq = 2
            let foundThree = false
            let lastThreeMax = 0
            for (let i = 3; i < cardIndex.length; i++) {
                const v = cardIndex[i];
                if (v && v.length >= 3) {
                    if (!foundThree) {
                        foundThree = true
                        seq = i
                        threeLen = 1
                    } else {
                        if (seq + 1 == i) {
                            threeLen += 1
                        }
                        seq = i
                        if (i + 1 == cardIndex.length) {
                            lastThreeMax = Math.max(lastThreeMax, threeLen)
                            threeLen = 0
                        }
                    }
                } else {
                    foundThree = false
                    seq = i
                    lastThreeMax = Math.max(lastThreeMax, threeLen)
                    threeLen = 0
                }
            }
            threeLen = lastThreeMax
            compareLen = localCompare.length
            if (localHandCard.length < threeLen * 3) {
                return null
            }
            singleCnt = Math.min(compareLen - threeLen * 3, localHandCard.length - threeLen * 3)
            minCld = localCompare[0].l
        } else {
            minCld = 2
            let srcCardIndex = this.dataToIndex(localHandCard)
            let srcSameCard = this.findAllSameCardByIndex(srcCardIndex)
            let threeMax = 0
            if (srcSameCard[3]) {
                threeMax = srcSameCard[3].length
            }
            if (threeMax < 2) {
                return null
            }
            let lastCard = srcSameCard[3][0][0].l - 1
            threeMax = 0
            for (let i = 0; i < srcSameCard[3].length; i++) {
                const v = srcSameCard[3][i];
                if (lastCard + 1 == v[0].l) {
                    lastCard += 1
                    threeMax += 1
                } else {
                    break
                }
            }
            if (threeMax < 2) {
                return null
            }
            threeLen = threeMax
            singleCnt = Math.min(localHandCard.length - threeMax * 3, threeMax * 2)
            compareLen = threeLen * 3 + singleCnt
        }
        let rtn = []
        let handCardIndex = this.dataToIndex(localHandCard)
        let lastLd = minCld
        let found = false
        let minL = 3
        let maxL = 3
        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (found) {
                break
            }
            if (v && v.length >= 3) {
                lastLd = i
                for (let j = i + 1; j < handCardIndex.length; j++) {
                    const v = handCardIndex[j];
                    if (v && v.length >= 3) {
                        if (lastLd + 1 == j) {
                            lastLd = j
                            if (j - i + 1 >= threeLen) {
                                minL = i
                                maxL = j
                                for (let m = i; m <= j; m++) {
                                    const v = handCardIndex[m];
                                    found = true
                                    rtn = rtn.concat(v.slice(0, 3))
                                }
                                break
                            }
                        } else {
                            break
                        }
                    }
                }
            }
        }
        if (found && singleCnt > 0) {
            for (let i = 3; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 1) {
                    rtn = rtn.concat(v)
                    singleCnt -= 1
                    if (singleCnt == 0) {
                        break
                    }
                }
            }
        }
        if (found && singleCnt > 0) {
            for (let i = 0; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 2) {
                    let valid = true
                    if (i >= minL && i <= maxL) {
                        valid = false
                    }
                    if (valid) {
                        let minus = Math.min(singleCnt, handCardIndex[i].length)
                        console.log("minus:", minus, ",singleCnt:", singleCnt)
                        rtn = rtn.concat(v.slice(0, minus))
                        singleCnt -= minus
                        if (singleCnt == 0) {
                            break
                        }
                    }
                }
            }
        }
        if (found && singleCnt > 0) {
            for (let i = 0; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 3) {
                    let valid = true
                    if (i >= minL && i <= maxL) {
                        valid = false
                    }
                    if (valid) {
                        let minus = Math.min(singleCnt, handCardIndex[i].length)
                        console.log("minus:", minus, ",singleCnt:", singleCnt)
                        rtn = rtn.concat(v.slice(0, minus))
                        singleCnt -= minus
                        if (singleCnt == 0) {
                            break
                        }
                    }
                }
            }
        }
        if (found && singleCnt == 0) {
            return rtn
        }
        return null
    }

    static findOneBomb(localHandCard: lcardTmp[], localCompare?: lcardTmp[]) {
        if (localCompare) {
            let compareLen = localCompare.length
            let minCld = localCompare[0].l
            let handCardIndex = this.dataToIndex(localHandCard)
            if (compareLen == 3) {
                let rtn = []
                for (let i = 3; i < handCardIndex.length; i++) {
                    const v = handCardIndex[i];
                    if (v && v.length == 4) {
                        rtn = rtn.concat(v)
                        return rtn
                    }
                }
            }
            for (let i = minCld + 1; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 4) {
                    let rtn = []
                    rtn = rtn.concat(v)
                    return rtn
                }
            }
            return null
        } else {
            let handCardIndex = this.dataToIndex(localHandCard)
            let rtn = []
            for (let i = 3; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 4) {
                    rtn = rtn.concat(v)
                    return rtn
                }
            }
        }
        return null
    }

    static findOneGtCom(localHandCard: lcardTmp[], localCompare?: lcardTmp[]) {
        let toCardType = this.getCardType(localCompare)
        localCompare = this.sortBySame(localCompare, toCardType)
        console.log("传入牌型：", CT[toCardType])
        if (toCardType == CT.Single) {
            for (let i = 0; i < localHandCard.length; i++) {
                const v = localHandCard[i];
                if (v.l > localCompare[0].l) {
                    return [v]
                }
            }
            return this.findOneBomb(localHandCard)
        } else if (toCardType == CT.Double) {
            let handCardIndex = this.dataToIndex(localHandCard)
            let cld = localCompare[0].l
            for (let i = cld + 1; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 2) {
                    return [].concat(v)
                }
            }
            for (let i = cld + 1; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 3) {
                    return [].concat(v.slice(0, 2))
                }
            }
            return this.findOneBomb(localHandCard)
        } else if (toCardType == CT.DoubleSeq) {
            let rtn = this.findOneDoubleSeq(localHandCard, localCompare)
            if (rtn && rtn.length > 0) {
                return rtn
            }
            return this.findOneBomb(localHandCard)
        } else if (toCardType == CT.Three) {
            if (localHandCard.length >= localCompare.length) {
                let rtn = this.findOneThree(localHandCard, localCompare)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
            }
            return this.findOneBomb(localHandCard)
            // } else if (toCardType == CT.FourAThree) {
            //     if (localHandCard.length >= localCompare.length) {
            //         let rtn = this.findOneFourThree(localHandCard, localCompare)
            //         if (rtn && rtn.length > 0) {
            //             return rtn
            //         }
            //     }
            //     return this.findOneBomb(localHandCard)
        } else if (toCardType == CT.ShunZi) {
            if (localHandCard.length >= localCompare.length) {
                let rtn = this.findOneShunZi(localHandCard, localCompare)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
            }
            return this.findOneBomb(localHandCard)
        } else if (toCardType == CT.AirPlane) {
            if (localHandCard.length >= localCompare.length) {
                let rtn = this.findOnePlane(localHandCard, localCompare)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
            }
            return this.findOneBomb(localHandCard)
        } else if (toCardType == CT.Bomb) {
            return this.findOneBomb(localHandCard, localCompare)
        }
    }

    static findFirstTipCard(localHandCard: lcardTmp[], nextRemainOne: boolean = false) {
        localHandCard = this.clone(localHandCard)

        let bombs = []
        //去除炸弹
        bombs = this.findAllBomb(localHandCard)
        for (let i = 0; i < bombs.length; i++) {
            const bomb = bombs[i];
            this.deleteRtn(localHandCard, bomb)
        }

        let cardType = this.getCardType(localHandCard, true)
        console.log("传入牌型：", CT[cardType])
        if (cardType > CT.Error) {
            if (bombs.length == 0) {//没有炸弹
                let rtn = [].concat(localHandCard)
                bombs.push(rtn)
            }
            return bombs
        }

        let ret = []
        //去除飞机
        let plane = this.findOnePlane(localHandCard)
        while (plane != null) {
            ret.push(plane)
            plane = this.findOnePlane(localHandCard, plane)
        }

        //去除连对
        let seq = this.findFirstTipDoubleSeq(localHandCard)
        ret = ret.concat(seq)

        //去除三张
        let three = this.findAllThree(localHandCard)
        ret = ret.concat(three)

        //去除顺子
        let shunZi = this.findFirstTipShunZi(localHandCard)
        ret = ret.concat(shunZi)
        //去掉对子

        let double = this.findAllDouble(localHandCard)
        ret = ret.concat(double)

        let single = this.findAllSingle(localHandCard, [{ o: 0, r: 0, l: 2, s: 0 }], nextRemainOne)
        ret = ret.concat(single)

        ret = ret.concat(bombs)

        return ret
    }

    static findFirstTipDoubleSeq(localHandCard: lcardTmp[]) {
        let ret = []
        let localHandCardT = this.clone(localHandCard)
        let seq = this.findOneDoubleSeq(localHandCardT)
        while (seq) {
            this.deleteRtn(localHandCardT, seq)
            ret.push(seq)
            seq = this.findOneDoubleSeq(localHandCardT)
        }
        return ret
    }

    static findFirstTipShunZi(localHandCard: lcardTmp[]): lcardTmp[][] {

        let allret = []
        for (let length = Math.min(11, localHandCard.length); length >= 5; length--) {
            let ret = []
            let localHandCardT: lcardTmp[] = this.clone(localHandCard)
            let localCompare = []
            for (let i = 0; i < length; i++) {
                localCompare.push({ o: 0, r: 0, l: 2, s: 0 })
            }
            let rtn = this.findOneShunZi(localHandCardT, localCompare)
            let size = localHandCardT.length - length
            console.log(rtn)
            console.log("size:", size)
            while (rtn) {
                this.deleteRtn(localHandCardT, rtn)
                ret.push(rtn)
                for (let i = size; i >= 5; i--) {
                    localCompare = []
                    for (let j = 0; j < i; j++) {
                        localCompare.push({ o: 0, r: 0, l: 2, s: 0 })
                    }
                    let rtn = this.findOneShunZi(localHandCardT, localCompare)
                    if (rtn) {
                        ret.push(rtn)
                        break;
                    }
                }
                rtn = null
            }
            if (ret.length == 1 && allret.length == 0) {
                allret = allret.concat(ret)
            }
            if (ret.length == 2) {
                allret = allret.concat(ret)
                return allret
            }
        }
        allret = allret.reverse()
        return allret
    }

    static deleteRtn(localHandCard: lcardTmp[], rtn: lcardTmp[]) {
        let start = (new Date()).valueOf()
        for (let i = 0; i < rtn.length; i++) {
            const d = rtn[i];
            if (d) {
                for (let j = 0; j < localHandCard.length; j++) {
                    const v = localHandCard[j];
                    if (v && v.o === d.o) {
                        localHandCard.splice(j, 1)
                        break
                    }
                }
            }
        }
        let end = (new Date()).valueOf()
        console.log("end-start:", end - start)
    }

    /**************************************** */
    //获取提示牌
    static findAllTipCard(localHandCard: lcardTmp[], nextRemainOne: boolean = false) {
        let handCardIndex = this.dataToIndex(localHandCard)
        let size = 0
        for (let i = 0; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length > 0) {
                size++
            }
        }
        let ret = []
        let handCardType = this.getCardType(localHandCard, true)
        console.log("handCardType:", handCardType, ",size:", size)
        if (size > 1 && handCardType > CT.Error) {
            let rtn = []
            rtn = rtn.concat(localHandCard)
            ret.push(rtn)
        }
        let maxCard: lcardTmp[] = null
        for (let i = 3; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v) {
                if (!nextRemainOne) {
                    ret.push(v)
                } else {
                    if (v.length == 1) {
                        maxCard = v
                    } else {
                        ret.push(v)
                    }
                }
            }
        }
        if (maxCard) {
            if (ret.length > 0) {
                for (let i = ret.length - 1; i > 0; i--) {
                    const v = ret[i];
                    if (v[0].l < maxCard[0].l) {
                        ret[i] = maxCard
                    }
                }
            } else {
                ret.push(maxCard)
            }
        }
        return ret
    }

    static findAllGtCom(localHandCard: lcardTmp[], localCompare: lcardTmp[], bHoldDown: boolean) {
        localCompare = this.sortBySame(localCompare)
        let cardType = this.getCardType(localCompare)

        let allBomb = this.findAllBomb(localHandCard, (cardType == CT.Bomb ? localCompare : null))

        console.log("传入牌型：", cardType)
        if (cardType == CT.Single) {
            let ret = this.findAllSingle(localHandCard, localCompare)
            if (bHoldDown) {
                ret = ret.reverse()
            }
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb)
            }
            return ret
        } else if (cardType == CT.Double) {
            let ret = this.findAllDouble(localHandCard, localCompare)
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb)
            }
            return ret
        } else if (cardType == CT.DoubleSeq) {
            let ret = this.findAllDoubleSeq(localHandCard, localCompare)
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb)
            }
            return ret
        } else if (cardType == CT.Three) {
            let ret = this.findAllThree(localHandCard, localCompare)
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb)
            }
            return ret
            // } else if (cardType == CT.FourAThree) {
            //     let ret = this.findAllFourThree(localHandCard, localCompare)
            //     if (allBomb && allBomb.length > 0) {
            //         ret = ret.concat(allBomb)
            //     }
            //     return ret
        } else if (cardType == CT.ShunZi) {
            let ret = this.findAllShunZi(localHandCard, localCompare)
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb)
            }
            return ret
        } else if (cardType == CT.AirPlane) {
            let ret = this.findAllPlane(localHandCard, localCompare)
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb)
            }
            return ret
        } else if (cardType == CT.Bomb) {
            return this.findAllBomb(localHandCard, localCompare)
        }
    }

    static findLastTipCard(localHandCard: lcardTmp[], localCompare: lcardTmp[], bHoldDown: boolean = false) {
        localHandCard = this.clone(localHandCard)

        localCompare = this.sortBySame(localCompare)
        let cardType = this.getCardType(localCompare)

        let allBomb = this.findAllBomb(localHandCard, (cardType == CT.Bomb ? localCompare : null))

        let bombs = this.findAllBomb(localHandCard)
        for (let i = 0; i < bombs.length; i++) {
            const bomb = bombs[i];
            this.deleteRtn(localHandCard, bomb)
        }

        if (cardType == CT.Single) {
            if (bHoldDown) {
                let ret = this.findAllSingle(localHandCard, localCompare)
                if (bHoldDown) {
                    ret = ret.reverse()
                }
                if (allBomb && allBomb.length > 0) {
                    ret = ret.concat(allBomb)
                }
                return ret
            }
            let ret = this.findLastGt(CT.Single, CT.Single, localHandCard, localCompare)
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb)
            }
            return ret
        } else if (cardType == CT.Double) {
            let ret = this.findLastGt(CT.Double, CT.Double, localHandCard, localCompare)
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb)
            }
            return ret
        } else if (cardType == CT.DoubleSeq) {
            let ret = this.findLastGt(CT.DoubleSeq, CT.DoubleSeq, localHandCard, localCompare)
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb)
            }
            return ret
        } else if (cardType == CT.Three) {
            let ret = this.findLastTipThree(localHandCard, localCompare)
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb)
            }
            return ret
            // }else if(cardType == CT.FourAThree){
            // let ret = this.findAllFourThree(localHandCard, localCompare)
            // if (allBomb && allBomb.length > 0) {
            //     ret = ret.concat(allBomb)
            // }
            // return ret
        } else if (cardType == CT.ShunZi) {
            let ret = this.findLastGt(CT.ShunZi, CT.ShunZi, localHandCard, localCompare)
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb)
            }
            return ret
        } else if (cardType == CT.AirPlane) {
            let ret = this.findLastTipPlane(localHandCard, localCompare)
            if (allBomb && allBomb.length > 0) {
                ret = ret.concat(allBomb)
            }
            return ret
        } else if (cardType == CT.Bomb) {
            return allBomb//this.findAllBomb(localHandCard, localCompare)
        }
    }

    static findLastGt(nextType: number, cardType: number, localHandCard: lcardTmp[], localCompare: lcardTmp[]) {

        let localHandCardT = this.clone(localHandCard)
        if (nextType == CT.Single || nextType == CT.Double || nextType == CT.ShunZi || nextType == CT.Three || nextType == CT.DoubleSeq) {
            let planes = this.findPlaneBody(localHandCardT)
            if (planes && planes.length > 0) {
                for (let j = planes.length - 1; j >= 0; j--) {
                    const plane = planes[j];
                    if (plane) {
                        for (let i = plane.length - 1; i >= 0; i--) {
                            const p = plane[i];
                            this.deleteRtn(localHandCardT, p)
                        }
                    }
                }
            }
        }

        if (nextType == CT.Single || nextType == CT.Double || nextType == CT.ShunZi || nextType == CT.Three) {
            //排除连对主体
            let dseqs = this.findDoubleSeqBody(localHandCardT)
            if (dseqs && dseqs.length > 0) {
                for (let j = dseqs.length - 1; j >= 0; j--) {
                    const seqs = dseqs[j];
                    if (seqs) {
                        for (let i = seqs.length - 1; i >= 0; i--) {
                            const seq = seqs[i];
                            this.deleteRtn(localHandCardT, seq)
                        }
                    }
                }
            }
        }

        if (nextType == CT.Single || nextType == CT.Double || nextType == CT.ShunZi) {
            let threes = this.findThreeBody(localHandCardT)
            if (threes && threes.length > 0) {
                this.sortRetDesc(threes)
                for (let i = 0; i < threes.length; i++) {
                    const three = threes[i];
                    this.deleteRtn(localHandCardT, three)
                }
            }
        }

        if (nextType == CT.Single || nextType == CT.Double) {
            console.log("findFirstTipShunZi:", localHandCardT)
            let shunZi = this.findFirstTipShunZi(localHandCardT)
            console.log("shunZi:", shunZi)
            if (shunZi && shunZi.length > 0) {
                for (let i = 0; i < shunZi.length; i++) {
                    const sz = shunZi[i];
                    this.deleteRtn(localHandCardT, sz)
                }
            }
        }

        if (nextType == CT.Single) {
            //排除对子
            let doubles = this.findDoubleBody(localHandCardT)
            if (doubles && doubles.length > 0) {
                this.sortRetDesc(doubles)
                for (let i = 0; i < doubles.length; i++) {
                    const double = doubles[i];
                    this.deleteRtn(localHandCardT, double)
                }
            }
        }

        /* ------------------------------------------------- */

        if (cardType == CT.Single) {
            let singles = this.findAllSingle(localHandCardT, localCompare)
            if (singles && singles.length > 0) {
                return singles
            }
            if (nextType == CT.Single) {
                nextType = CT.Double
            } else if (nextType == CT.Double) {
                nextType = CT.ShunZi
            } else if (nextType == CT.ShunZi) {
                nextType = CT.Three
            } else if (nextType == CT.Three) {
                nextType = CT.DoubleSeq
            } else if (nextType == CT.DoubleSeq) {
                nextType = CT.AirPlane
            } else if (nextType == CT.AirPlane) {
                return []
            }
            return this.findLastGt(nextType, cardType, localHandCard, localCompare)
        } else if (cardType == CT.Double) {
            console.log("CT.Double:", localHandCardT)
            let doubles = this.findAllDouble(localHandCardT, localCompare)
            if (doubles && doubles.length > 0) {
                return doubles
            }
            if (nextType == CT.Double) {
                nextType = CT.ShunZi
            } else if (nextType == CT.ShunZi) {
                nextType = CT.Three
            } else if (nextType == CT.Three) {
                nextType = CT.DoubleSeq
            } else if (nextType == CT.DoubleSeq) {
                nextType = CT.AirPlane
            } else if (nextType == CT.AirPlane) {
                return []
            }
            return this.findLastGt(nextType, cardType, localHandCard, localCompare)
        } else if (cardType == CT.ShunZi) {
            let shunZi = this.findAllShunZi(localHandCardT, localCompare)
            if (shunZi && shunZi.length > 0) {
                return shunZi
            }
            if (nextType == CT.ShunZi) {
                nextType = CT.Three
            } else if (nextType == CT.Three) {
                nextType = CT.DoubleSeq
            } else if (nextType == CT.DoubleSeq) {
                nextType = CT.AirPlane
            } else if (nextType == CT.AirPlane) {
                return []
            }
            return this.findLastGt(nextType, cardType, localHandCard, localCompare)
        } else if (cardType == CT.DoubleSeq) {
            let seqs = this.findAllDoubleSeq(localHandCardT, localCompare)
            if (seqs && seqs.length > 0) {
                return seqs
            }
            if (nextType == CT.DoubleSeq) {
                nextType = CT.AirPlane
            } else if (nextType == CT.AirPlane) {
                return []
            }
            return this.findLastGt(nextType, cardType, localHandCard, localCompare)
        }
        return []
    }


    // static findLastGt(nextType: number, cardType: number, localHandCard: lcardTmp[], localCompare: lcardTmp[]){

    //     let localHandCardT = this.clone(localHandCard)
    //     if (nextType == CT.Single || nextType == CT.Double || nextType == CT.ShunZi || nextType == CT.Three || nextType == CT.DoubleSeq) {
    //         let planes = this.findPlaneBody(localHandCardT)
    //         if (planes && planes.length > 0) {
    //             this.sortRetDesc(planes)
    //             for (let i = 0; i < planes.length; i++) {
    //                 const plane = planes[i];
    //                 this.deleteRtn(localHandCardT, plane)
    //             }
    //         }
    //     }

    //     if (nextType == CT.Single || nextType == CT.Double || nextType == CT.ShunZi || nextType == CT.Three) {
    //         //排除连对主体
    //         let seqs = this.findDoubleSeqBody(localHandCardT)
    //         if (seqs && seqs.length > 0) {
    //             this.sortRetDesc(seqs)
    //             for (let i = 0; i < seqs.length; i++) {
    //                 const seq = seqs[i];
    //                 this.deleteRtn(localHandCardT, seq)
    //             }
    //         }
    //     }

    //     if (nextType == CT.Single || nextType == CT.Double || nextType == CT.ShunZi) {
    //         let threes = this.findThreeBody(localHandCardT)
    //         if (threes && threes.length > 0) {
    //             this.sortRetDesc(threes)
    //             for (let i = 0; i < threes.length; i++) {
    //                 const three = threes[i];
    //                 this.deleteRtn(localHandCardT, three)
    //             }
    //         }
    //     }

    //     if (nextType == CT.Single || nextType == CT.Double) {
    //         console.log("findFirstTipShunZi:", localHandCardT)
    //         let shunZi = this.findFirstTipShunZi(localHandCardT)
    //         console.log("shunZi:", shunZi)
    //         if (shunZi && shunZi.length > 0) {
    //             for (let i = 0; i < shunZi.length; i++) {
    //                 const sz = shunZi[i];
    //                 this.deleteRtn(localHandCardT, sz)
    //             }
    //         }
    //     }

    //     if (nextType == CT.Single) {
    //         //排除对子
    //         let doubles = this.findDoubleBody(localHandCardT)
    //         if (doubles && doubles.length > 0) {
    //             this.sortRetDesc(doubles)
    //             for (let i = 0; i < doubles.length; i++) {
    //                 const double = doubles[i];
    //                 this.deleteRtn(localHandCardT, double)
    //             }
    //         }
    //     }

    //     /* ------------------------------------------------- */

    //     if (cardType == CT.Single) {
    //         let singles = this.findAllSingle(localHandCardT, localCompare)
    //         if (singles && singles.length > 0) {
    //             return singles
    //         }
    //         if (nextType == CT.Single) {
    //             nextType = CT.Double
    //         }else if(nextType == CT.Double){
    //             nextType = CT.ShunZi
    //         }else if(nextType == CT.ShunZi){
    //             nextType = CT.Three
    //         }else if(nextType == CT.Three){
    //             nextType = CT.DoubleSeq
    //         }else if(nextType == CT.DoubleSeq){
    //             nextType = CT.AirPlane
    //         }else if(nextType == CT.AirPlane){
    //             return []
    //         }
    //         return this.findLastGt(nextType, cardType, localHandCard, localCompare)
    //     }else if (cardType == CT.Double) {
    //         console.log("CT.Double:", localHandCardT)
    //         let doubles = this.findAllDouble(localHandCardT, localCompare)
    //         if (doubles && doubles.length > 0) {
    //             return doubles
    //         }
    //         if(nextType == CT.Double){
    //             nextType = CT.ShunZi
    //         }else if(nextType == CT.ShunZi){
    //             nextType = CT.Three
    //         }else if(nextType == CT.Three){
    //             nextType = CT.DoubleSeq
    //         }else if(nextType == CT.DoubleSeq){
    //             nextType = CT.AirPlane
    //         }else if(nextType == CT.AirPlane){
    //             return []
    //         }
    //         return this.findLastGt(nextType, cardType, localHandCard, localCompare)
    //     }else if (cardType == CT.ShunZi) {
    //         let shunZi = this.findAllShunZi(localHandCardT, localCompare)
    //         if (shunZi && shunZi.length > 0) {
    //             return shunZi
    //         }
    //         if(nextType == CT.ShunZi){
    //             nextType = CT.Three
    //         }else if(nextType == CT.Three){
    //             nextType = CT.DoubleSeq
    //         }else if(nextType == CT.DoubleSeq){
    //             nextType = CT.AirPlane
    //         }else if(nextType == CT.AirPlane){
    //             return []
    //         }
    //         return this.findLastGt(nextType, cardType, localHandCard, localCompare)
    //     }else if (cardType == CT.DoubleSeq) {
    //         let seqs = this.findAllDoubleSeq(localHandCardT, localCompare)
    //         if (seqs && seqs.length > 0) {
    //             return seqs
    //         }
    //         if(nextType == CT.DoubleSeq){
    //             nextType = CT.AirPlane
    //         }else if(nextType == CT.AirPlane){
    //             return []
    //         }
    //         return this.findLastGt(nextType, cardType, localHandCard, localCompare)
    //     }
    //     return []
    // }

    static findLastTipThree(localHandCard: lcardTmp[], localCompare: lcardTmp[]) {
        let ret = []
        let body = []
        let threes = this.findAllThree(localHandCard, localCompare)
        if (threes && threes.length > 0) {
            for (let size = 0; size < threes.length; size++) {
                const three = threes[size];
                if (three) {
                    let t = []
                    t = t.concat(three.slice(0, 3))
                    body.push(t)
                }
            }
        }
        console.log("body:", body)

        for (let idex = 0; idex < body.length; idex++) {
            let rtn = []
            const bd = body[idex];//飞机主体
            rtn = rtn.concat(bd)

            let localHandCardT = this.clone(localHandCard)
            //排除飞机主体
            this.deleteRtn(localHandCardT, bd)
            let needSingle = 2
            let cards = this.findLastTip(CT.AirPlane, localHandCardT, needSingle)
            console.log("cards:", cards)

            rtn = rtn.concat(cards.splice(cards.length - needSingle, needSingle))
            ret.push(rtn)
        }
        console.log("ret:", ret)
        return ret
    }

    static findLastTipPlane(localHandCard: lcardTmp[], localCompare: lcardTmp[]) {
        let ret = []

        let body = []

        let planes = this.findAllPlane(localHandCard, localCompare)

        console.log(planes)

        if (planes && planes.length > 0) {
            for (let size = 0; size < planes.length; size++) {
                const plane = planes[size];
                if (plane) {
                    let t = []
                    t = t.concat(plane.slice(0, (plane.length / 5) * 3))
                    body.push(t)
                }
            }
        }
        console.log("body:", body)

        for (let idex = 0; idex < body.length; idex++) {
            let rtn = []
            const bd = body[idex];//飞机主体
            rtn = rtn.concat(bd)

            let localHandCardT = this.clone(localHandCard)
            //排除飞机主体
            this.deleteRtn(localHandCardT, bd)
            let needSingle = localCompare.length / 5 * 2
            let cards = this.findLastTip(CT.AirPlane, localHandCardT, needSingle)
            console.log("cards:", cards)

            rtn = rtn.concat(cards.splice(cards.length - needSingle, needSingle))
            ret.push(rtn)
        }
        console.log("ret:", ret)
        return ret
    }

    static findLastTip(cardType: number, localHandCard: lcardTmp[], needSingle: number): lcardTmp[] {

        let nextType: number = 0
        let firstTip: lcardTmp[] = []
        let needCard: lcardTmp[] = []

        let localHandCardT = this.clone(localHandCard)
        let rtn = []

        if (cardType == CT.AirPlane) {
            let planes = this.findPlaneBody(localHandCardT)
            if (planes && planes.length > 0) {
                for (let i = 0; i < planes.length; i++) {
                    const plane = planes[i];
                    if (plane) {
                        for (let j = 0; j < plane.length; j++) {
                            const p = plane[j];
                            if (firstTip.length == 0) {
                                firstTip = firstTip.concat(p)
                                nextType = CT.DoubleSeq
                            }
                            rtn = rtn.concat(p)
                            this.deleteRtn(localHandCardT, p)
                        }
                    }
                }
            }
        }

        if (cardType == CT.AirPlane || cardType == CT.DoubleSeq) {
            //排除连对主体
            let dseqs = this.findDoubleSeqBody(localHandCardT)
            if (dseqs && dseqs.length > 0) {
                for (let j = dseqs.length - 1; j >= 0; j--) {
                    const seqs = dseqs[j];
                    if (seqs) {
                        for (let i = seqs.length - 1; i >= 0; i--) {
                            const seq = seqs[i];
                            if (firstTip.length == 0) {
                                firstTip = firstTip.concat(seq)
                                nextType = CT.Three
                            }
                            rtn = rtn.concat(seq)
                            this.deleteRtn(localHandCardT, seq)
                        }
                    }
                }
            }
        }

        if (cardType == CT.AirPlane || cardType == CT.DoubleSeq || cardType == CT.Three) {
            //排除三张主体
            let threes = this.findThreeBody(localHandCardT)
            if (threes && threes.length > 0) {
                this.sortRetDesc(threes)
                for (let i = 0; i < threes.length; i++) {
                    const three = threes[i];
                    if (firstTip.length == 0) {
                        firstTip = firstTip.concat(three)
                        nextType = CT.ShunZi
                    }
                    rtn = rtn.concat(three)
                    this.deleteRtn(localHandCardT, three)
                }
            }
        }

        if (cardType == CT.AirPlane || cardType == CT.DoubleSeq || cardType == CT.Three || cardType == CT.ShunZi) {
            //排除长顺子
            let shunZi = this.findFirstTipShunZi(localHandCardT)
            if (shunZi && shunZi.length > 0) {
                for (let i = 0; i < shunZi.length; i++) {
                    const sz = shunZi[i];
                    if (firstTip.length == 0) {
                        firstTip = firstTip.concat(sz)
                        nextType = CT.Double
                    }
                    rtn = rtn.concat(sz)
                    this.deleteRtn(localHandCardT, sz)
                    break
                }
            }
        }

        if (cardType == CT.AirPlane || cardType == CT.DoubleSeq || cardType == CT.Three || cardType == CT.ShunZi || cardType == CT.Double) {
            //排除对子
            let doubles = this.findDoubleBody(localHandCardT)
            if (doubles && doubles.length > 0) {
                this.sortRetDesc(doubles)
                for (let i = 0; i < doubles.length; i++) {
                    const double = doubles[i];
                    if (firstTip.length == 0) {
                        firstTip = firstTip.concat(double)
                        nextType = CT.Single
                    }
                    rtn = rtn.concat(double)
                    this.deleteRtn(localHandCardT, double)
                }
            }
        }

        //单张排序
        this.sortByLogicDataDesc(localHandCardT)
        rtn = rtn.concat(localHandCardT)

        needCard = rtn.splice(rtn.length - needSingle, needSingle)

        if (nextType == 0) {
            return rtn.concat(needCard)
        }
        //
        for (let i = 0; i < firstTip.length; i++) {
            const first = firstTip[i];
            for (let j = 0; j < needCard.length; j++) {
                const need = needCard[j];
                if (need.o == first.o) {
                    return this.findLastTip(nextType, localHandCard, needSingle)
                }
            }
        }

        return rtn.concat(needCard)
    }

    // static findPlaneBody(localHandCard: lcardTmp[]):lcardTmp[][]{

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

    static findPlaneBody(localHandCard: lcardTmp[]): lcardTmp[][][] {
        let planes: lcardTmp[][][] = []
        let plane: lcardTmp[][] = []

        let cardIndex = this.dataToIndex(localHandCard)
        let seq = 2
        let foundThree = false
        let threeLen = 0
        for (let i = 3; i < cardIndex.length; i++) {
            const v = cardIndex[i];
            if (v && v.length == 3) {
                if (!foundThree) {
                    foundThree = true
                    seq = i
                    threeLen = 1
                    plane = []
                } else {
                    if (seq + 1 == i) {
                        threeLen++
                    }
                    seq = i
                    if (threeLen >= 2) {
                        if (threeLen == 2) {
                            plane.push(cardIndex[i - 1])
                        }
                        plane.push(cardIndex[i])
                    }
                    if (i + 1 == cardIndex.length) {
                        planes.push(plane)
                    }
                }
            } else {
                foundThree = false
                seq = i
                if (threeLen >= 2) {
                    planes.push(plane)
                }
                threeLen = 0
            }
        }
        return planes
    }
    // static findPlaneBody(localHandCard: lcardTmp[]):lcardTmp[][]{
    //     let planes : lcardTmp[][] = []

    //     let cardIndex = this.dataToIndex(localHandCard)
    //     let seq = 2
    //     let foundThree = false
    //     let threeLen = 0
    //     for (let i = 3; i < cardIndex.length; i++) {
    //         const v = cardIndex[i];
    //         if (v && v.length == 3) {
    //             if (!foundThree) {
    //                 foundThree = true
    //                 seq = i
    //                 threeLen = 1
    //             } else {
    //                 if (seq + 1 == i) {
    //                     threeLen++
    //                 }
    //                 seq = i
    //                 if (threeLen >= 2) {
    //                     if (threeLen == 2) {
    //                         planes.push(cardIndex[i - 1])
    //                     }
    //                     planes.push(cardIndex[i])
    //                 }
    //             }
    //         } else {
    //             foundThree = false
    //             seq = i
    //             threeLen = 0
    //         }
    //     }
    //     return planes
    // }

    static findDoubleSeqBody(localHandCard: lcardTmp[]): lcardTmp[][][] {
        let dseqs: lcardTmp[][][] = []
        let dseq: lcardTmp[][] = []

        let cardIndex = this.dataToIndex(localHandCard)
        let seq = 2
        let foundThree = false
        let threeLen = 0
        for (let i = 3; i < cardIndex.length; i++) {
            const v = cardIndex[i];
            if (v && v.length >= 2) {
                if (!foundThree) {
                    foundThree = true
                    seq = i
                    threeLen = 1
                    dseq = []
                } else {
                    if (seq + 1 == i) {
                        threeLen++
                    }
                    seq = i
                    if (threeLen >= 2) {
                        if (threeLen == 2) {
                            dseq.push(cardIndex[i - 1].slice(0, 2))
                        }
                        dseq.push(cardIndex[i].slice(0, 2))
                    }
                    if (i + 1 == cardIndex.length) {
                        dseqs.push(dseq)
                    }
                }
            } else {
                foundThree = false
                seq = i
                if (threeLen >= 2) {
                    dseqs.push(dseq)
                }
                threeLen = 0
            }
        }
        return dseqs
    }
    // static findDoubleSeqBody(localHandCard: lcardTmp[]):lcardTmp[][]{
    //     let seqs:lcardTmp[][] = []

    //     let cardIndex = this.dataToIndex(localHandCard)
    //     let seq = 2
    //     let foundThree = false
    //     let threeLen = 0
    //     for (let i = 3; i < cardIndex.length; i++) {
    //         const v = cardIndex[i];
    //         if (v && v.length >= 2) {
    //             if (!foundThree) {
    //                 foundThree = true
    //                 seq = i
    //                 threeLen = 1
    //             } else {
    //                 if (seq + 1 == i) {
    //                     threeLen++
    //                 }
    //                 seq = i
    //                 if (threeLen >= 2) {
    //                     if (threeLen == 2) {
    //                         seqs.push(cardIndex[i - 1].slice(0, 2))
    //                     }
    //                     seqs.push(cardIndex[i].slice(0, 2))
    //                 }
    //             }
    //         } else {
    //             foundThree = false
    //             seq = i
    //             threeLen = 0
    //         }
    //     }
    //     return seqs
    // }


    static findAIShunzi(localHandCard: lcardTmp[], selectCard: lcardTmp[]): lcardTmp[] {

        let cardIndex = this.dataToIndex(selectCard)
        let seq = 2
        let isSingle = false
        let singleLen = 0
        let findShunzi = false
        for (let i = 3; i < cardIndex.length; i++) {
            const v = cardIndex[i];
            if (v && v.length > 0) {
                if (!isSingle) {
                    isSingle = true
                    seq = i
                    singleLen = 1
                } else {
                    if (seq + 1 == i) {
                        singleLen++
                    }
                    seq = i
                    if (i + 1 == cardIndex.length) {
                        findShunzi = true
                    }
                }
            } else if (isSingle) {
                isSingle = false
                seq = i
                singleLen = 0
                findShunzi = false
                break
            }
        }

        let uSelectCard = this.uniqueLogicValue(selectCard)
        console.log("findShunzi:", findShunzi)
        if (findShunzi) {
            let shunZi = this.findFirstTipShunZi(localHandCard)
            console.log("shunZi:", shunZi)
            if (shunZi && shunZi.length > 0) {
                for (let i = 0; i < shunZi.length; i++) {
                    const sz = shunZi[i];
                    let contains = this.isContains(sz, uSelectCard)
                    if (contains) {
                        return sz
                    }
                }
            }
        }

        return null
    }

    /**
     * true A 包含 B, false A 不包含 B
     * @param handCardA 
     * @param handCardB 
     */
    static isContains(handCardA: lcardTmp[], handCardB: lcardTmp[]) {

        for (let i = 0; i < handCardB.length; i++) {
            const b = handCardB[i];
            let contains = false
            for (let j = 0; j < handCardA.length; j++) {
                const a = handCardA[j];
                if (b.l == a.l) {
                    contains = true
                    break
                }
            }
            if (!contains) {
                return false
            }
        }
        return true
    }

    // static findDoubleSeqBody(localHandCard: lcardTmp[]){
    //     let ret = []
    //     let localHandCardT = this.clone(localHandCard)
    //     let seq = this.findOneDoubleSeq(localHandCardT)
    //     while(seq){
    //         this.deleteRtn(localHandCardT, seq)
    //         ret.push(seq)
    //         seq = this.findOneDoubleSeq(localHandCardT)
    //     }
    //     return ret
    // }

    static findThreeBody(localHandCard: lcardTmp[]) {
        let ret = []
        let localHandCardT = this.clone(localHandCard)
        let handCardIndex = this.dataToIndex(localHandCardT)
        for (let i = 3; i < handCardIndex.length; i++) {
            const v = handCardIndex[i]
            if (v && v.length == 3) {
                ret.push(v)
            }
        }
        return ret
    }

    static findDoubleBody(localHandCard: lcardTmp[]) {
        let handCardIndex = this.dataToIndex(localHandCard)
        let ret = []
        for (let i = 3; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length == 2) {
                ret.push(v)
            }
        }
        return ret
    }

    static findOneDouble(localHandCard: lcardTmp[], localCompare: lcardTmp[]): lcardTmp[] {
        let handCardIndex = this.dataToIndex(localHandCard)
        let rtn = []
        let minCld = 2
        if (localCompare) {
            minCld = localCompare[0].l
        } else {
            minCld = 2
        }
        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length >= 2) {
                rtn = rtn.concat(v.slice(0, 2))
                return rtn
            }
        }
        return null
    }

    static sortRetDesc(ret: lcardTmp[][]) {
        ret.sort(function (a: lcardTmp[], b: lcardTmp[]) {
            return b[0].l - a[0].l
        })
    }

    /************************************ */
    static findAllSingle(localHandCard: lcardTmp[], localCompare: lcardTmp[], nextRemainOne: boolean = false) {
        let ret = []
        let handCardIndex = this.dataToIndex(localHandCard)
        let cld = localCompare[0].l
        let maxCard: lcardTmp[] = null
        for (let i = cld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length == 1) {
                if (!nextRemainOne) {
                    ret.push(v)
                } else {
                    maxCard = v
                }
            }
        }
        for (let i = cld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length > 1 && v.length < 4) {
                if (!nextRemainOne) {
                    ret.push([v[0]])
                } else {
                    if (maxCard == null) {
                        maxCard = [v[0]]
                    } else if (maxCard[0].l < v[0].l) {
                        maxCard = [v[0]]
                    }
                }
            }
        }
        if (maxCard) {
            ret.push(maxCard)
        }
        return ret
    }

    static findAllDouble(localHandCard: lcardTmp[], localCompare?: lcardTmp[]) {
        let handCardIndex = this.dataToIndex(localHandCard)
        let cld = 2
        if (localCompare) {
            cld = localCompare[0].l
        }
        let ret = []
        for (let i = cld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length == 2) {
                ret.push(v)
            }
        }
        for (let i = cld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length == 3) {
                ret.push(v.slice(0, 2))
            }
        }
        return ret
    }

    static findAllDoubleSeq(localHandCard: lcardTmp[], localCompare: lcardTmp[]) {
        let minCld = localCompare[0].l
        let compareSeq = localCompare.length / 2
        let handCardIndex = this.dataToIndex(localHandCard)
        let lastLd = minCld
        let ret = []
        let foundT = []
        let minIndex = Math.min(14, handCardIndex.length)
        for (let i = minCld + 1; i < minIndex; i++) {
            const v = handCardIndex[i];
            if (v && v.length == 2) {
                lastLd = i
                for (let j = i + 1; j <= minIndex; j++) {
                    const v = handCardIndex[j];
                    if (v && v.length == 2) {
                        if (lastLd + 1 == j) {
                            lastLd = j
                            if (j - i + 1 >= compareSeq) {
                                let r = []
                                for (let m = i; m <= j; m++) {
                                    r = r.concat(handCardIndex[m])
                                }
                                let cardkey = this.getCardKey(r)
                                if (!foundT[cardkey]) {
                                    foundT[cardkey] = true
                                    ret.push(r)
                                }
                                break
                            }
                        } else {
                            break
                        }
                    }
                }
            }
        }
        for (let i = minCld + 1; i < minIndex; i++) {
            const v = handCardIndex[i];
            if (v && v.length >= 2 && v.length < 4) {
                lastLd = i
                for (let j = i + 1; j <= minIndex; j++) {
                    const v = handCardIndex[j];
                    if (v && v.length >= 2 && v.length < 4) {
                        if (lastLd + 1 == j) {
                            lastLd = j
                            if (j - i + 1 >= compareSeq) {
                                let r = []
                                for (let m = i; m <= j; m++) {
                                    r = r.concat(handCardIndex[m].slice(0, 2))
                                }
                                let cardkey = this.getCardKey(r)
                                if (!foundT[cardkey]) {
                                    foundT[cardkey] = true
                                    ret.push(r)
                                }
                                break
                            }
                        } else {
                            break
                        }
                    }
                }
            }
        }
        for (let i = minCld + 1; i < minIndex; i++) {
            const v = handCardIndex[i];
            if (v && v.length >= 2) {
                lastLd = i
                for (let j = i + 1; j <= minIndex; j++) {
                    const v = handCardIndex[j];
                    if (v && v.length >= 2) {
                        if (lastLd + 1 == j) {
                            lastLd = j
                            if (j - i + 1 >= compareSeq) {
                                let r = []
                                for (let m = i; m <= j; m++) {
                                    r = r.concat(handCardIndex[m].slice(0, 2))
                                }
                                let cardkey = this.getCardKey(r)
                                if (!foundT[cardkey]) {
                                    foundT[cardkey] = true
                                    ret.push(r)
                                }
                                break
                            }
                        } else {
                            break
                        }
                    }
                }
            }
        }
        return ret
    }

    static getCardKey(cards: lcardTmp[]) {
        let key = ""
        for (let i = 0; i < cards.length; i++) {
            const v = cards[i];
            if (v) {
                key = key + v.l//cc.js.formatStr("%s%d", key, v.l)
            }
        }
        return key
    }

    static findAllThree(localHandCard: lcardTmp[], localCompare?: lcardTmp[]) {
        let handCardIndex = this.dataToIndex(localHandCard)
        let minCld = 2
        let singleCnt = Math.min(2, localHandCard.length - 3)
        if (localCompare) {
            minCld = localCompare[0].l
            singleCnt = Math.min(localCompare.length - 3, localHandCard.length - 3)
        }
        let ret = []
        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length == 3) {
                let rtn = []
                let needSingle = singleCnt
                rtn = rtn.concat(v)
                if (needSingle > 0) {
                    for (let j = 3; j < handCardIndex.length; j++) {
                        const v = handCardIndex[j];
                        if (v && v.length == 1) {
                            rtn = rtn.concat(v)
                            needSingle--
                            if (needSingle == 0) {
                                break;
                            }
                        }
                    }
                }
                if (needSingle > 0) {
                    for (let j = 0; j < handCardIndex.length; j++) {
                        const v = handCardIndex[j];
                        if (v && v.length >= 2 && v[0].l != rtn[0].l) {
                            let removeCount = Math.min(needSingle, v.length)
                            rtn = rtn.concat(v.slice(0, removeCount))
                            needSingle -= removeCount
                            if (needSingle == 0) {
                                break
                            }
                        }
                    }
                }
                if (needSingle == 0) {
                    ret.push(rtn)
                }
            }
        }
        return ret
    }

    static findAllFourThree(localHandCard: lcardTmp[], localCompare: lcardTmp[]) {
        let minCld = localCompare[0].l
        let handCardIndex = this.dataToIndex(localHandCard)
        let singleCnt = Math.min(localCompare.length - 4, localHandCard.length - 4)
        let ret = []

        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length == 4) {
                let rtn = []
                rtn = rtn.concat(v)
                let needSingle = singleCnt
                if (needSingle > 0) {
                    for (let j = 3; j < handCardIndex.length; j++) {
                        const v = handCardIndex[j];
                        if (v && v.length == 1) {
                            rtn = rtn.concat(v)
                            needSingle--
                            if (needSingle == 0) {
                                break
                            }
                        }
                    }
                }
                if (needSingle > 0) {
                    for (let j = 0; j < handCardIndex.length; j++) {
                        const v = handCardIndex[j];
                        if (v && v.length < 4) {
                            let minus = Math.min(needSingle, v.length)
                            rtn = rtn.concat(v.slice(0, minus))
                            needSingle -= minus
                            if (needSingle == 0) {
                                break
                            }
                        }
                    }
                }
                if (needSingle == 0) {
                    ret.push(rtn)
                }
            }
        }

        return ret
    }

    static findAllShunZi(localHandCard: lcardTmp[], localCompare: lcardTmp[]) {

        let handCardIndex = this.dataToIndex(localHandCard)
        let compareLen = 5
        let minCld = 2
        if (localCompare) {
            compareLen = localCompare.length
            minCld = localCompare[0].l
        }
        let lastLd = minCld
        let ret = []
        let minIndex = Math.min(handCardIndex.length, 15)
        for (let i = minCld + 1; i < minIndex; i++) {
            if (handCardIndex.length - i < compareLen) {
                break
            }
            const v = handCardIndex[i];
            if (v && v.length > 0) {
                lastLd = i
                let rtn = []
                for (let j = i + 1; j < minIndex; j++) {
                    const v = handCardIndex[j];
                    if (v && v.length > 0) {
                        if (lastLd + 1 == j) {
                            lastLd = j
                            if (j - i + 1 >= compareLen) {
                                let r = []
                                for (let m = i; m <= j; m++) {
                                    rtn.push(handCardIndex[m][0])
                                }
                                ret.push(rtn)
                                break
                            }
                        } else {
                            break
                        }
                    }
                }
            }
        }

        return ret
    }


    static findAllPlane(localHandCard: lcardTmp[], localCompare: lcardTmp[]) {
        localCompare = this.sortBySame(localCompare, CT.AirPlane)
        console.log("localCompare:", localCompare)
        let threeLen = 0
        let ret = []

        let cardIndex = this.dataToIndex(localCompare)
        let seq = 2
        let foundThree = false
        let lastThreeMax = 0
        // let threeLen = 0
        for (let i = 3; i < cardIndex.length; i++) {
            const v = cardIndex[i];
            if (v && v.length >= 3) {
                if (!foundThree) {
                    foundThree = true
                    seq = i
                    threeLen = 1
                } else {
                    if (seq + 1 == i) {
                        threeLen++
                    }
                    seq = i
                    if (i + 1 == cardIndex.length) {
                        lastThreeMax = Math.max(lastThreeMax, threeLen)
                        threeLen = 0
                    }
                }
            } else {
                foundThree = false
                seq = i
                lastThreeMax = Math.max(lastThreeMax, threeLen)
                threeLen = 0
            }
        }
        threeLen = lastThreeMax
        let compareLen = localCompare.length

        let singleCnt = Math.min(compareLen - threeLen * 3, localHandCard.length - threeLen * 3)
        if (singleCnt > 0 && singleCnt < threeLen * 2) {
            //单牌小于3条需要的数量，拆3条
            let fit = false
            let lbreak = true
            let lt = threeLen
            do {
                lt--
                singleCnt += 3
                if (lt < 2) {
                    lbreak = false
                    fit = false
                }
                if (singleCnt == lt * 2) {
                    fit = true
                    lbreak = false
                }
            } while (lbreak);
            if (fit) {
                threeLen = lt
            }
        }
        let minCld = localCompare[0].l
        let handCardIndex = this.dataToIndex(localHandCard)
        let lastLd = minCld
        // let found = false
        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length >= 3) {
                lastLd = i
                for (let j = i + 1; j < handCardIndex.length; j++) {
                    const v = handCardIndex[j];
                    if (v && v.length >= 3) {
                        if (lastLd + 1 == j) {
                            lastLd = j
                            if (j - i + 1 >= threeLen) {
                                let r = []
                                for (let m = i; m <= j; m++) {
                                    r = r.concat(handCardIndex[m].slice(0, 3))
                                }
                                let needSingle = singleCnt
                                if (needSingle > 0) {
                                    for (let i = 3; i < handCardIndex.length; i++) {
                                        const v = handCardIndex[i];
                                        if (v && v.length == 1) {
                                            r = r.concat(v)
                                            needSingle--
                                            if (needSingle == 0) {
                                                break
                                            }
                                        }
                                    }
                                }
                                if (needSingle > 0) {
                                    let valid = true
                                    for (let k = 3; k < handCardIndex.length; k++) {
                                        const v = handCardIndex[k];
                                        if (v) {
                                            let ccount = v.length
                                            valid = true
                                            if (ccount > 1 && ccount < 4) {
                                                if (ccount == 3) {
                                                    if (k >= i && k <= j) {
                                                        valid = false
                                                    }
                                                }
                                                if (valid) {
                                                    let minus = Math.min(needSingle, ccount)
                                                    r = r.concat(v.slice(0, minus))
                                                    needSingle -= minus
                                                    if (needSingle == 0) {
                                                        break;
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                if (needSingle == 0) {
                                    ret.push(r)
                                    break
                                }
                            }
                        } else {
                            break
                        }
                    }
                }
            }
        }
        return ret
    }

    static findAllBomb(localHandCard: lcardTmp[], localCompare?: lcardTmp[]): lcardTmp[][] {
        let ret = []
        if (localCompare) {
            let compareLen = localCompare.length
            let handCardIndex = this.dataToIndex(localHandCard)
            let minCld = localCompare[0].l
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
            for (let i = minCld + 1; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 4) {
                    // let rtn = [].concat(v)
                    ret.push(v)
                }
            }
        } else {
            let handCardIndex = this.dataToIndex(localHandCard)
            for (let i = 3; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 4) {
                    // let rtn = [].concat(v)
                    ret.push(v)
                }
            }
        }
        return ret
    }

    static getPoker2(localHandCard: lcardTmp[]): lcardTmp[] {
        for (let i = 0; i < localHandCard.length; i++) {
            const cardData = localHandCard[i];
            if (cardData.l == 15) {
                return [].concat(cardData)
            }
        }
        return null
    }

    //a是否大于b
    static isGt(a: lcardTmp[], b: lcardTmp[], last: boolean) {
        console.log("a:", a, ",b:", b)
        let at = this.getCardType(a, last)
        let bt = this.getCardType(b, last)
        console.log("at:", at, ",bt:", bt)
        let as = this.sortBySame(a, at)
        let bs = this.sortBySame(b, bt)
        console.log("as:", as)
        console.log("bs:", bs)
        if (at == bt) {
            console.log("as[0]:", as[0].l)
            console.log("bs[0]:", bs[0].l)
            if (as[0].l == 0x0F) {
                return true
            } else if (bs[0].l == 0x0F) {
                return false
            } else {
                return as[0].l > bs[0].l && (as.length == bs.length)
            }
        } else {
            if (at == CT.Bomb) {
                return true
            }
        }
        return false
    }

    static getOneAICard(localHandCard: lcardTmp[], selectCard: lcardTmp[], findFit: boolean = false) {
        let selectLen = selectCard.length
        let handCardLen = localHandCard.length
        if (selectLen == 1) {
            return selectCard
        }
        if (selectLen == 2) {
            if (selectCard[0].l == selectCard[1].l) {
                return selectCard
            }
        }
        let sc = this.sortBySame(selectCard)
        let st = this.getCardType(sc)
        console.log("getOneAICard.st:", st)
        if (st > CT.Error) {
            return selectCard
        }

        let selCardIndex = this.dataToIndex(selectCard)
        let selSameCard = this.findAllSameCardByIndex(selCardIndex)
        let allSingle = true
        for (let i = 2; i < selSameCard.length; i++) {
            const v = selSameCard[i];
            if (v) {
                allSingle = false
            }
        }
        if (allSingle) {





            return []
        }

        if (selectLen == 3) {
            //连对
            if (selSameCard[2] && selSameCard[1] && Math.abs(selSameCard[2][0][0].l - selSameCard[1][0][0].l) == 1) {
                let rtn = []
                rtn = rtn.concat(selectCard)
                let handCardIndex = this.dataToIndex(localHandCard)

                if (handCardIndex[selSameCard[1][0][0].l]) {
                    for (let i = 0; i < handCardIndex[selSameCard[1][0][0].l].length; i++) {
                        const v = handCardIndex[selSameCard[1][0][0].l][i];
                        if (v.o != selSameCard[1][0][0].o) {
                            rtn.push(v)
                            break
                        }
                    }
                }
                console.log("getCardType:", this.getCardType(rtn), ",DoubleSeq:", CT.DoubleSeq)
                if (this.getCardType(rtn) == CT.DoubleSeq) {
                    return rtn
                }
                return selSameCard[2][0]
            }
            //3带2
            if (selSameCard[3]) {
                let rtn = [].concat(selSameCard[3][0])
                let singleCnt = 2
                let handCardIndex = this.dataToIndex(localHandCard)
                if (singleCnt > 0) {
                    for (let i = 3; i < handCardIndex.length; i++) {
                        const v = handCardIndex[i];
                        if (v && v.length == 1) {
                            rtn = rtn.concat(v)
                            singleCnt -= 1
                            if (singleCnt == 0) {
                                break
                            }
                        }
                    }
                }
                if (singleCnt > 0) {
                    for (let i = 3; i < handCardIndex.length; i++) {
                        const v = handCardIndex[i]
                        if (v && v.length > 1 && v.length < 3) {
                            let removeCount = Math.min(singleCnt, v.length)
                            rtn = rtn.concat(v.slice(0, removeCount))
                            singleCnt -= removeCount
                            if (singleCnt == 0) {
                                break
                            }
                        }
                    }
                }
                if (singleCnt == 0) {
                    return rtn
                }
            }
        }

        if (findFit) {
            if (selectLen >= 5) {
                this.sortByLogicData(selectCard)
                let rtn = this.findOneShunZi(selectCard)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
                rtn = this.findOnePlane(selectCard)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
                rtn = this.findOneFourThree(selectCard)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
                rtn = this.findOneThree(selectCard)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
                rtn = this.findOneDoubleSeq(selectCard)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
                rtn = this.findOneBomb(selectCard)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
            }
        }
        return []
    }

    /** 主动滑牌 */
    static getActiveOneAICard(localHandCard: lcardTmp[], selectCard: lcardTmp[]): lcardTmp[] {
        let selectLen = selectCard.length
        let handCardLen = localHandCard.length
        if (selectLen == 1) {
            return selectCard
        }
        if (selectLen == 2) {
            if (selectCard[0].l == selectCard[1].l) {
                return selectCard
            } else if (selectCard[0].l < selectCard[1].l) {
                return [selectCard[0]]
            } else {
                return [selectCard[1]]
            }
        }
        let sc = this.sortBySame(selectCard)
        let st = this.getCardType(sc, handCardLen <= selectLen)
        console.log("getOneAICard.st:", st)
        if (st > CT.Error) {
            return selectCard
        }

        let selCardIndex = this.dataToIndex(selectCard)
        let selSameCard = this.findAllSameCardByIndex(selCardIndex)

        if (selectLen == 3 || selectLen == 4) {

            //3带2
            if (selSameCard[3]) {
                let rtn = selectCard//[].concat(selSameCard[3][0])
                let singleCnt = selectLen == 3 ? 2 : 1

                let localHandCardT = this.clone(localHandCard)
                this.deleteRtn(localHandCardT, rtn)
                let coordinate = this.getCoordinateCard(localHandCardT, singleCnt)

                rtn = rtn.concat(coordinate)
                return rtn
            }

            //顺子
            let sz = this.findAIShunzi(localHandCard, selectCard)
            if (sz && sz.length > 0) {
                return sz
            }

            //对子
            if (selSameCard[2]) {
                return selSameCard[2][0]
            }

            this.sortByLogicData(selectCard)
            return [selectCard[0]]
        }


        if (selectLen >= 5) {
            this.sortByLogicData(selectCard)

            //炸弹
            let bomb = this.findOneBomb(selectCard)
            if (bomb && bomb) {
                return bomb
            }

            let planes = this.findPlaneBody(selectCard)
            if (planes && planes.length > 0) {
                let rtn: lcardTmp[] = []
                for (let i = 0; i < planes[0].length; i++) {
                    const p = planes[0][i];
                    if (p) {
                        rtn = rtn.concat(p)
                    }
                }
                let singleCnt = rtn.length / 3 * 2
                let selectCardT = this.clone(selectCard)

                this.deleteRtn(selectCardT, rtn)
                if (selectCardT.length > singleCnt) {
                    let co = this.getCoordinateCard(selectCardT, singleCnt)
                    rtn = rtn.concat(co)
                    return rtn
                }

                let localHandCardT = this.clone(localHandCard)
                this.deleteRtn(localHandCardT, selectCard)
                singleCnt = singleCnt - selectCardT.length
                let co = this.getCoordinateCard(localHandCardT, singleCnt)

                rtn = rtn.concat(selectCardT)
                rtn = rtn.concat(co)
                return rtn
            }

            //连对
            let dseqs = this.findDoubleSeqBody(selectCard)
            if (dseqs && dseqs.length > 0) {
                console.log("dseqs:", dseqs)
                let rtn: lcardTmp[] = []
                const seqs = dseqs[0];
                for (let j = 0; j < seqs.length; j++) {
                    const seq = seqs[j];
                    if (seq) {
                        rtn = rtn.concat(seq)
                    }
                }
                return rtn
            }

            //三张
            let threes = this.findThreeBody(selectCard)
            if (threes && threes.length > 0) {
                let rtn: lcardTmp[] = threes[0]
                let singleCnt = 2

                let selectCardT = this.clone(selectCard)
                this.deleteRtn(selectCardT, rtn)
                if (selectCardT.length > singleCnt) {
                    let co = this.getCoordinateCard(selectCardT, singleCnt)
                    rtn = rtn.concat(co)
                    return rtn
                }

                let localHandCardT = this.clone(localHandCard)
                this.deleteRtn(localHandCardT, selectCard)
                singleCnt = singleCnt - selectCardT.length
                let co = this.getCoordinateCard(localHandCardT, singleCnt)

                rtn = rtn.concat(selectCardT)
                rtn = rtn.concat(co)
                return rtn
            }

            //顺子
            let sz = this.findAIShunzi(localHandCard, selectCard)
            if (sz && sz.length > 0) {
                return sz
            }

            //对子
            let doubles = this.findDoubleBody(selectCard)
            if (doubles && doubles.length > 0) {
                return doubles[0]
            }
        }
        return selectCard
    }

    static getCoordinateCard(localHandCard: lcardTmp[], singleCnt: number = 0) {
        let rtn: lcardTmp[] = []

        //去掉炸弹主体
        let bombs = this.findAllBomb(localHandCard)
        if (bombs && bombs.length > 0) {
            for (let i = bombs.length - 1; i >= 0; i--) {
                const bomb = bombs[i];
                rtn = rtn.concat(bomb)
                this.deleteRtn(localHandCard, bomb)
            }
        }

        //去掉2
        let poker2 = this.getPoker2(localHandCard)
        if (poker2) {
            rtn = rtn.concat(poker2)
            this.deleteRtn(localHandCard, poker2)
        }

        //去除飞机主体
        let planes = this.findPlaneBody(localHandCard)
        if (planes && planes.length > 0) {
            for (let i = planes.length - 1; i >= 0; i--) {
                const plane = planes[i];
                for (let j = plane.length - 1; j >= 0; j--) {
                    const p = plane[j];
                    rtn = rtn.concat(p)
                    this.deleteRtn(localHandCard, p)
                }
            }
        }

        //去除连对主体
        let dseqs = this.findDoubleSeqBody(localHandCard)
        if (dseqs && dseqs.length > 0) {
            for (let i = dseqs.length - 1; i >= 0; i--) {
                const seqs = dseqs[i];
                if (seqs) {
                    for (let j = seqs.length - 1; j >= 0; j--) {
                        const seq = seqs[j];
                        rtn = rtn.concat(seq)
                        this.deleteRtn(localHandCard, seq)
                    }
                }
            }
        }

        //去除三张主体
        let threes = this.findThreeBody(localHandCard)
        if (threes && threes.length > 0) {
            for (let i = threes.length - 1; i >= 0; i--) {
                const three = threes[i];
                rtn = rtn.concat(three)
                this.deleteRtn(localHandCard, three)
            }
        }

        //去除顺子主体
        let shunZi = this.findFirstTipShunZi(localHandCard)
        console.log("shunZi:", shunZi)
        if (shunZi && shunZi.length > 0) {
            for (let i = 0; i < shunZi.length; i++) {
                const sz = shunZi[i];
                rtn = rtn.concat(sz)
                this.deleteRtn(localHandCard, sz)
            }
        }

        //去除对子主体
        let doubles = this.findDoubleBody(localHandCard)
        if (doubles && doubles.length > 0) {
            this.sortRetDesc(doubles)
            for (let i = 0; i < doubles.length; i++) {
                const double = doubles[i];
                rtn = rtn.concat(double)
                this.deleteRtn(localHandCard, double)
            }
        }

        this.sortByLogicDataDesc(localHandCard)
        rtn = rtn.concat(localHandCard)
        console.log("getCoordinateCard:", rtn)

        return rtn.splice(rtn.length - singleCnt, singleCnt)
    }


    static getPassiveOneAICard(localHandCard: lcardTmp[], selectCard: lcardTmp[], localCompare: lcardTmp[]) {
        let compareCardType = this.getCardType(localCompare)
        console.log("compareCardType:", compareCardType)
        let selectLen = selectCard.length
        let handCardLen = localHandCard.length
        console.log("localHandCard:", localHandCard)
        if (selectLen == 1) {
            //炸弹
            let bombs = this.findAllBomb(localHandCard, compareCardType == CT.Bomb ? localCompare : null)
            console.log("bombs:", bombs)
            console.log("selectCard:", selectCard)
            if (bombs && bombs.length) {
                for (let i = 0; i < bombs.length; i++) {
                    const bomb = bombs[i];
                    console.log("bomb:", bomb)
                    let contains = this.isContains(bomb, selectCard)
                    if (contains) {
                        return bomb
                    }
                }
            }

            //飞机
            if (compareCardType == CT.AirPlane) {
                console.log("AirPlane")
                let plane = this.findOnePlane(localHandCard, localCompare)
                while (plane && plane.length > 0) {
                    let body = plane.slice(0, plane.length / 5 * 3)
                    let contains = this.isContains(body, selectCard)
                    if (contains) {
                        let rtn = []
                        let localHandCardT = this.clone(localHandCard)
                        this.deleteRtn(localHandCardT, body)
                        let singleCnt = plane.length / 5 * 2
                        let co = this.getCoordinateCard(localHandCardT, singleCnt)
                        rtn = rtn.concat(body).concat(co)
                        return rtn
                    }
                    plane = this.findOnePlane(localHandCard, plane)
                }
                let rtn = []
                plane = this.findOnePlane(localHandCard, localCompare)
                let body = plane.slice(0, plane.length / 5 * 3)
                // let body = three.slice(0, 3)
                let localHandCardT = this.clone(localHandCard)
                this.deleteRtn(localHandCardT, body)
                this.deleteRtn(localHandCardT, selectCard)
                let singleCnt = plane.length / 5 * 2 - 1
                let co = this.getCoordinateCard(localHandCardT, singleCnt)
                rtn = rtn.concat(body).concat(selectCard).concat(co)
                return rtn
            }

            //连对
            if (compareCardType == CT.DoubleSeq) {
                console.log("localHandCard:", localHandCard, ",localCompare:", localCompare)
                let dseq = this.findAllDoubleSeq(localHandCard, localCompare)
                console.log("DoubleSeq", dseq)
                for (let i = 0; i < dseq.length; i++) {
                    const seq = dseq[i];
                    let contains = this.isContains(seq, selectCard)
                    console.log("contains:", contains)
                    if (contains) {
                        return seq
                    }
                }

                // this.findOneDoubleSeq()

            }

            //三张
            if (compareCardType == CT.Three) {
                console.log("Three")
                let three = this.findOneThree(localHandCard, localCompare)
                while (three && three.length > 0) {
                    let body = three.slice(0, 3)
                    let contains = this.isContains(body, selectCard)
                    if (contains) {
                        let rtn = []
                        let localHandCardT = this.clone(localHandCard)
                        this.deleteRtn(localHandCardT, body)
                        let singleCnt = 2
                        let co = this.getCoordinateCard(localHandCardT, singleCnt)
                        rtn = rtn.concat(body).concat(co)
                        return rtn
                    }
                    three = this.findOneThree(localHandCard, three)
                }

                let rtn = []
                three = this.findOneThree(localHandCard, localCompare)
                if (three) {
                    let body = three.slice(0, 3)
                    let localHandCardT = this.clone(localHandCard)
                    this.deleteRtn(localHandCardT, body)
                    this.deleteRtn(localHandCardT, selectCard)
                    let singleCnt = 1
                    let co = this.getCoordinateCard(localHandCardT, singleCnt)
                    rtn = rtn.concat(body).concat(selectCard).concat(co)
                }
                return rtn
            }

            //顺子
            if (compareCardType == CT.ShunZi) {
                let sz = this.findOneShunZi(localHandCard, localCompare)
                while (sz && sz.length > 0) {
                    let contains = this.isContains(sz, selectCard)
                    if (contains) {
                        return sz
                    }
                }
            }

            //对子
            if (compareCardType == CT.Double) {
                let doubles = this.findAllDouble(localHandCard, localCompare)
                for (let i = 0; i < doubles.length; i++) {
                    const double = doubles[i];
                    let contains = this.isContains(double, selectCard)
                    if (contains) {
                        return double
                    }
                }
            }

            return selectCard
        }

        if (selectLen >= 2) {
            //炸弹
            let bombs = this.findAllBomb(localHandCard)
            if (bombs && bombs.length) {
                for (let i = 0; i < bombs.length; i++) {
                    const bomb = bombs[i];
                    let contains = this.isContains(bomb, selectCard)
                    if (contains) {
                        return bomb
                    }
                }
            }

            //飞机
            if (compareCardType == CT.AirPlane) {

                let plane = this.findOnePlane(localHandCard, localCompare)
                while (plane && plane.length > 0) {
                    let body = plane.slice(0, plane.length / 5 * 3)
                    let contains = this.isContains(body, selectCard)
                    if (contains) {
                        let rtn = []
                        let localHandCardT = this.clone(localHandCard)
                        this.deleteRtn(localHandCardT, body)
                        let singleCnt = plane.length / 5 * 2
                        let co = this.getCoordinateCard(localHandCardT, singleCnt)
                        rtn = rtn.concat(body).concat(co)
                        return rtn
                    }
                    plane = this.findOnePlane(localHandCard, plane)
                }

                let selectCardT = this.clone(selectCard)
                for (let i = 0; i < localCompare.length - selectCardT; i++) {
                    selectCardT.push(this.bytesToLCard([0x03]))
                }

                plane = this.findOnePlane(selectCardT, localCompare)
                if (plane && plane.length) {
                    let rtn = []
                    rtn = rtn.concat(selectCard)
                    let localHandCardT = this.clone(localHandCard)
                    this.deleteRtn(localHandCardT, selectCard)
                    let singleCnt = plane.length - selectCard.length
                    let co = this.getCoordinateCard(localHandCardT, singleCnt)
                    rtn = rtn.concat(co)
                    return rtn
                }

            }

            //连对
            if (compareCardType == CT.DoubleSeq) {

                let dseq = this.findAllDoubleSeq(localHandCard, localCompare)
                for (let i = 0; i < dseq.length; i++) {
                    const seq = dseq[i];
                    let contains = this.isContains(seq, selectCard)
                    if (contains) {
                        return seq
                    }
                }

                let seq = this.findOneDoubleSeq(selectCard, localCompare)
                if (seq && seq.length) {
                    return seq
                }
            }

            //三张
            if (compareCardType == CT.Three) {
                let three = this.findOneThree(localHandCard, localCompare)
                while (three && three.length > 0) {
                    let body = three.slice(0, 3)
                    let contains = this.isContains(body, selectCard)
                    if (contains) {
                        let rtn = []
                        let localHandCardT = this.clone(localHandCard)
                        this.deleteRtn(localHandCardT, body)
                        let singleCnt = 2
                        let co = this.getCoordinateCard(localHandCardT, singleCnt)
                        rtn = rtn.concat(body).concat(co)
                        return rtn
                    }
                    three = this.findOneThree(localHandCard, three)
                }

                let selectCardT = this.clone(selectCard)
                for (let i = 0; i < localCompare.length - selectCardT; i++) {
                    selectCardT.push(this.bytesToLCard([0x03]))
                }

                three = this.findOneThree(selectCardT, localCompare)
                if (three && three.length) {
                    let rtn = []
                    rtn = rtn.concat(selectCard)
                    let localHandCardT = this.clone(localHandCard)
                    this.deleteRtn(localHandCardT, selectCard)
                    let singleCnt = three.length - selectCard.length
                    let co = this.getCoordinateCard(localHandCardT, singleCnt)
                    rtn = rtn.concat(co)
                    return rtn
                }
            }

            if (compareCardType == CT.ShunZi) {
                let sz = this.findOneShunZi(localHandCard, localCompare)
                while (sz && sz.length > 0) {
                    let contains = this.isContains(sz, selectCard)
                    if (contains) {
                        return sz
                    }
                }
            }

            if (compareCardType == CT.Double) {
                let doubles = this.findAllDouble(localHandCard, localCompare)
                for (let i = 0; i < doubles.length; i++) {
                    const double = doubles[i];
                    let contains = this.isContains(double, selectCard)
                    if (contains) {
                        return double
                    }
                }

                let double = this.findOneDouble(selectCard, localCompare)
                if (double && double.length > 0) {
                    return double
                }
            }

            if (compareCardType == CT.Single) {
                let single = this.findAllSingle(selectCard, localCompare)
                if (single && single.length > 0) {
                    return single[0]
                }
            }

        }

        return selectCard
    }

    static findAIShunZi(localHandCard: lcardTmp[], selectCard: lcardTmp[]) {
        this.sortByLogicData(selectCard)





    }

    static isCardValid(cards: lcardTmp[], last: boolean): boolean {
        let cardLen = cards.length
        if (cardLen == 1) {
            return true
        }
        cards = this.sortBySame(cards)
        if (this.isDouble(cards)) {
            return true
        } else if (this.isDoubleSeq(cards)) {
            return true
        } else if (this.isThree(cards, last)) {
            return true
            // } else if (this.isFourAThree(cards, last)) {
            //     return true
        } else if (this.isShunZi(cards)) {
            return true
        } else if (this.isAirplane(cards, last)) {
            return true
        } else if (this.isBomb(cards)) {
            return true
        }
        return false
    }

    static getAICard(localHandCard: lcardTmp[], selectCard: lcardTmp[], localCompare: lcardTmp[], findFit: boolean = false) {
        let selectLen = selectCard.length
        let handCardLen = localHandCard.length
        if (selectLen == 1) {
            return selectCard
        }
        if (selectLen == 2) {
            if (selectCard[0].l == selectCard[1].l) {
                return selectCard
            }
        }
        let sc = this.sortBySame(selectCard)
        let st = this.getCardType(sc)
        console.log("getOneAICard.st:", st)
        if (st > CT.Error) {
            return selectCard
        }

        let selCardIndex = this.dataToIndex(selectCard)
        let selSameCard = this.findAllSameCardByIndex(selCardIndex)
        let allSingle = true
        for (let i = 2; i < selSameCard.length; i++) {
            const v = selSameCard[i];
            if (v) {
                allSingle = false
            }
        }
        if (allSingle) {





            return []
        }

        if (selectLen == 3) {
            //连对
            if (selSameCard[2] && selSameCard[1] && Math.abs(selSameCard[2][0][0].l - selSameCard[1][0][0].l) == 1) {
                let rtn = []
                rtn = rtn.concat(selectCard)
                let handCardIndex = this.dataToIndex(localHandCard)

                if (handCardIndex[selSameCard[1][0][0].l]) {
                    for (let i = 0; i < handCardIndex[selSameCard[1][0][0].l].length; i++) {
                        const v = handCardIndex[selSameCard[1][0][0].l][i];
                        if (v.o != selSameCard[1][0][0].o) {
                            rtn.push(v)
                            break
                        }
                    }
                }
                console.log("getCardType:", this.getCardType(rtn), ",DoubleSeq:", CT.DoubleSeq)
                if (this.getCardType(rtn) == CT.DoubleSeq) {
                    return rtn
                }
                return selSameCard[2][0]
            }
            //3带2
            if (selSameCard[3]) {
                let rtn = [].concat(selSameCard[3][0])
                let singleCnt = 2
                let handCardIndex = this.dataToIndex(localHandCard)
                if (singleCnt > 0) {
                    for (let i = 3; i < handCardIndex.length; i++) {
                        const v = handCardIndex[i];
                        if (v && v.length == 1) {
                            rtn = rtn.concat(v)
                            singleCnt -= 1
                            if (singleCnt == 0) {
                                break
                            }
                        }
                    }
                }
                if (singleCnt > 0) {
                    for (let i = 3; i < handCardIndex.length; i++) {
                        const v = handCardIndex[i]
                        if (v && v.length > 1 && v.length < 3) {
                            let removeCount = Math.min(singleCnt, v.length)
                            rtn = rtn.concat(v.slice(0, removeCount))
                            singleCnt -= removeCount
                            if (singleCnt == 0) {
                                break
                            }
                        }
                    }
                }
                if (singleCnt == 0) {
                    return rtn
                }
            }
        }

        if (findFit) {
            if (selectLen >= 5) {
                this.sortByLogicData(selectCard)
                let rtn = this.findOneShunZi(selectCard)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
                rtn = this.findOnePlane(selectCard)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
                rtn = this.findOneFourThree(selectCard)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
                rtn = this.findOneThree(selectCard)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
                rtn = this.findOneDoubleSeq(selectCard)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
                rtn = this.findOneBomb(selectCard)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
            }
        }
        return []
    }

    static uniqueOriginValue(cards: lcardTmp[]) {
        //去重
        let arr = [cards[0]]
        for (let i = 1; i < cards.length; i++) {
            if (cards[i].o !== cards[i - 1].o) {
                arr.push(cards[i])
            }
        }
        return arr
    }

    static uniqueLogicValue(cards: lcardTmp[]) {
        //去重
        let arr = [cards[0]]
        for (let i = 1; i < cards.length; i++) {
            if (cards[i].l !== cards[i - 1].l) {
                arr.push(cards[i])
            }
        }
        return arr
    }

    static checkLastHandCard(localHandCard: lcardTmp[], localCompare: lcardTmp[]): boolean {
        let handCardType = this.getCardType(localHandCard, true)
        let bomb = this.findOneBomb(localHandCard)
        if (localHandCard.length > 4 && bomb && bomb.length > 0) {
            return false
        }
        if (handCardType == CT.Error) {
            return false
        }
        let compareCardType = this.getCardType(localCompare)
        //被动出牌
        if (localCompare && localCompare.length > 0) {
            if (compareCardType == handCardType) {
                return true
            }
        } else {
            //主动出牌
            return true
        }
        return false
    }

    /**
     * 能够出的牌
     * @param localHandCard
     * @param localCompare
     * @param bHoldDown 
     */
    static getHintInfo(localHandCard: lcardTmp[], localCompare: lcardTmp[], bHoldDown: boolean): any {
        let hintInfo = { all: false, cards: [] }
        let cardType = this.getCardType(localCompare)

        if (cardType == CT.Single ||
            cardType == CT.Double ||
            cardType == CT.DoubleSeq ||
            cardType == CT.ShunZi ||
            cardType == CT.Bomb) {

            let allgtCom = this.findAllGtCom(localHandCard, localCompare, bHoldDown)
            console.log("allgtCom:", allgtCom)
            let gt: lcardTmp[] = []

            for (let i = 0; i < allgtCom.length; i++) {
                const gtCom = allgtCom[i];
                if (gtCom) {
                    gt = gt.concat(gtCom)
                }
            }
            this.sortByLogicData(gt)
            console.log("gt:", gt)
            let singleL = this.uniqueLogicValue(gt)
            console.log("singleL:", singleL)
            hintInfo.cards = singleL
        } else {
            hintInfo.all = true
        }
        return hintInfo
    }

}

