import { lstat } from "fs";

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

export class pdklogic {

    static bytesToLCard(cardBytes: number[], sort: boolean = true, desc: boolean = false): lcardTmp[] {
        let cards = []
        for (let i = 0; i < cardBytes.length; i++) {
            const v = cardBytes[i];
            if (v) {
                let lc: lcardTmp = { o: 0, r: 0, l: 0, s: 0 };
                lc.o = v
                lc.r = v
                lc.l = this.logicData(v)
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

    static logicData(card: number): number {
        let ld = card & 0x0F
        if (ld == 1 || ld == 2) {
            ld += 13
        }
        return ld
    }

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

    static findAllSameCardByIndex(cardIndex: lcardTmp[][]) {
        let rtn = []
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

    static sortBySame(cards: lcardTmp[], cardType?: number) {
        let cardIndex = this.dataToIndex(cards)
        console.log(cardIndex)
        let sameCard = this.findAllSameCardByIndex(cardIndex)
        console.log(sameCard)
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
                        if (i == 14) {
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
        let cardLen = cards.length
        if (cardLen < 4 || cardLen % 2 != 2) {
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

    // 是否飞机
    static isAirplane(cards: lcardTmp[], last: boolean = false) {
        let cardLen = cards.length
        if (cardLen < 6) {
            return false
        }
        if (!last && cardLen < 10) {
            return false
        }
        if (!last && cardLen % 5 != 5) {
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
                    if (i == 14) {
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
                let fit = false
                let tMax = lastThreeMax
                let lr = remain
                let lbreak = false
                do {
                    lr -= 3
                    tMax -= 1
                    if (tMax < 2) {
                        fit = false
                        lbreak = false
                    }
                    if (lr / 2 == tMax) {
                        fit = true
                        lbreak = true
                    }
                } while (!lbreak);
                return fit
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
        return
    }

    static isBomb(cards: lcardTmp[]) {
        let cardLen = cards.length
        if (cardLen < 3 && cardLen > 4) {
            return false
        }
        if (cardLen == 3) {
            return (cards[0].l == 14 && cards[0].l == cards[1].l && cards[0].l == cards[2].l)
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
        cards = this.sortBySame(cards)
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
                if (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l != 14) {
                    return CT.Three
                }
            }
            if (cards[0].l == cards[1].l && cards[0].l == cards[2].l && cards[0].l == 14) {
                return CT.Bomb
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
            if (this.isFourAThree(cards, last)) {
                return CT.FourAThree
            }
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
            compareSeq = localCompare.length / 2
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
                    }
                }
            }
        }
        return null
    }

    static findOneThree(localHandCard: lcardTmp[], localCompare?: lcardTmp[]) {
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
        let minCld = 0
        if (localCompare) {
            minCld = localCompare[0].l
            compareLen = localCompare.length
        } else {
            minCld = 2
            this.sortByLogicData(localHandCard)
            compareLen = Math.max(5, Math.abs(localHandCard[localHandCard.length - 1].l - localHandCard[0].l) + 1)
            minCld = localHandCard[0].l
        }
        let handCardIndex = this.dataToIndex(localHandCard)
        let lastLd = minCld
        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            if (handCardIndex.length - i < compareLen) {
                break
            }
            const v = handCardIndex[i];
            if (v && v.length > 0) {
                lastLd = i
                for (let j = i + 1; j < handCardIndex.length; j++) {
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

    static findOnePlane(localHandCard: lcardTmp[], localCompare?: lcardTmp[]) {
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
                        if (i == 14) {
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
                for (let j = 0; j < handCardIndex.length; j++) {
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
                if (v && v.length > 1) {
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
            if (handCardIndex[14] && handCardIndex[14].length == 3) {
                rtn = rtn.concat(handCardIndex[14])
                return rtn
            }
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
            return this.findOneBomb(localHandCard, localCompare, true)
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
            return this.findOneBomb(localHandCard, localCompare, true)
        } else if (toCardType == CT.DoubleSeq) {
            let rtn = this.findOneDoubleSeq(localHandCard, localCompare)
            if (rtn && rtn.length > 0) {
                return rtn
            }
            return this.findOneBomb(localHandCard, localCompare, true)
        } else if (toCardType == CT.Three) {
            if (localHandCard.length >= localCompare.length) {
                let rtn = this.findOneThree(localHandCard, localCompare)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
            }
            return this.findOneBomb(localHandCard, localCompare, true)
        } else if (toCardType == CT.FourAThree) {
            if (localHandCard.length >= localCompare.length) {
                let rtn = this.findOneFourThree(localHandCard, localCompare)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
            }
            return this.findOneBomb(localHandCard, localCompare, true)
        } else if (toCardType == CT.ShunZi) {
            if (localHandCard.length >= localCompare.length) {
                let rtn = this.findOneShunZi(localHandCard, localCompare)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
            }
            return this.findOneBomb(localHandCard, localCompare, true)
        } else if (toCardType == CT.AirPlane) {
            if (localHandCard.length >= localCompare.length) {
                let rtn = this.findOnePlane(localHandCard, localCompare)
                if (rtn && rtn.length > 0) {
                    return rtn
                }
            }
            return this.findOneBomb(localHandCard, localCompare, true)
        } else if (toCardType == CT.Bomb) {
            return this.findOneBomb(localHandCard, localCompare, true)
        }
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

    static findAllDouble(localHandCard: lcardTmp[], localCompare: lcardTmp) {
        let handCardIndex = this.dataToIndex(localHandCard)
        let cld = localCompare[0].l
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
        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length == 2) {
                lastLd = i
                for (let j = 0; j < handCardIndex.length; j++) {
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
        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length >= 2) {
                lastLd = i
                for (let j = 0; j < handCardIndex.length; j++) {
                    const v = handCardIndex[j];
                    if (v && v.length >= 2) {
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
        return ret
    }

    static getCardKey(cards: lcardTmp[]) {
        let key = ""
        for (let i = 0; i < cards.length; i++) {
            const v = cards[i];
            if (v) {
                key = key + v.l
            }
        }
        return key
    }

    static findAllThree(localHandCard: lcardTmp[], localCompare: lcardTmp[]) {
        let minCld = localCompare[0].l
        let handCardIndex = this.dataToIndex(localHandCard)
        let found = false
        let singleCnt = Math.min(localCompare.length - 3, localHandCard.length - 3)
        let ret = []
        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            const v = handCardIndex[i];
            if (v && v.length == 3) {
                found = true
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
                        if (v && v.length > 2 && v[0].l != rtn[0].l) {
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
        let compareLen = localCompare.length
        let minCld = localCompare[0].l
        let handCardIndex = this.dataToIndex(localHandCard)
        let lastLd = minCld
        let ret = []

        for (let i = minCld + 1; i < handCardIndex.length; i++) {
            if (handCardIndex.length - i < compareLen) {
                break
            }
            const v = handCardIndex[i];
            if (v && v.length > 0) {
                lastLd = i
                let rtn = []
                for (let j = i + 1; j < handCardIndex.length; j++) {
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

        let threeLen = 0
        let ret = []

        let cardIndex = this.dataToIndex(localCompare)
        let seq = 2
        let foundThree = false
        let lastThreeMax = 0
        // let threeLen = 0
        for (let i = 3; i < cardIndex.length; i++) {
            const v = cardIndex[i];
            if (v && v.length > 3) {
                if (!foundThree) {
                    foundThree = true
                    seq = i
                    threeLen = 1
                } else {
                    if (seq + 1 == i) {
                        threeLen++
                    }
                    seq = i
                    if (i == 14) {
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
            let lbreak = false
            let lt = threeLen
            do {
                lt--
                singleCnt += 3
                if (lt < 2) {
                    lbreak = true
                    fit = false
                }
                if (singleCnt == lt * 2) {
                    fit = true
                    lbreak = true
                }
            } while (!lbreak);
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

    static findAllBomb(localHandCard: lcardTmp[], localCompare: lcardTmp[], any: boolean) {
        let ret = []
        if (!any) {
            let compareLen = localCompare.length
            let handCardIndex = this.dataToIndex(localHandCard)
            let minCld = localCompare[0].l
            if (compareLen == 3) {
                //AAA
                for (let i = 3; i < handCardIndex.length; i++) {
                    const v = handCardIndex[i]
                    if (v && v.length == 4) {
                        let rtn = [].concat(v)
                        ret.push(rtn)
                    }
                }
            }
            for (let i = minCld + 1; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 4) {
                    let rtn = [].concat(v)
                    ret.push(rtn)
                }
            }
        } else {
            let handCardIndex = this.dataToIndex(localHandCard)
            //有AAA 就返回AAA
            if (handCardIndex[14] && handCardIndex[14].length == 3) {
                let rtn = [].concat(handCardIndex[14])
                ret.push(rtn)
            }
            for (let i = 3; i < handCardIndex.length; i++) {
                const v = handCardIndex[i];
                if (v && v.length == 4) {
                    let rtn = [].concat(v)
                    ret.push(rtn)
                }
            }
        }
        return ret
    }

    //a是否大于b
    static isGt(a: lcardTmp[], b: lcardTmp[], nextRemainOne: boolean, last: boolean) {
        let at = this.getCardType(a, last)
        let bt = this.getCardType(b, last)
        let as = this.sortBySame(a, at)
        let bs = this.sortBySame(b, bt)
        if (at == bt) {
            if (bt == CT.Bomb && bs[0].l == 14) {
                return true
            } else if (at == CT.Bomb && as[0].l == 14) {
                return false
            } else {
                if (as[0].l == 0x0F) {
                    return true
                } else if (bs[0].l == 0x0F) {
                    return false
                } else {
                    return as[0].l > bs[0].l && (as.length == bs.length)
                }
            }
        } else {
            if (at == CT.Bomb) {
                return true
            }
        }
        return false
    }

    static getOneAICard(localHandCard: lcardTmp[], selectCard: lcardTmp[], findFit: boolean) {
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

        }

        if (selectLen == 3) {
            //连对
            if (selSameCard[2] && selSameCard[1] && Math.abs(selSameCard[2][0].l - selSameCard[1][0].l) == 1) {
                let rtn = []
                rtn = rtn.concat(selectCard)
                let handCardIndex = this.dataToIndex(localHandCard)

                if (handCardIndex[selSameCard[1][0].l]) {
                    for (let i = 0; i < handCardIndex[selSameCard[1][0].l].length; i++) {
                        const v = handCardIndex[selSameCard[1][0].l][i];
                        if (v.o != selSameCard[1][0].o) {
                            rtn.push(v)
                            break
                        }
                    }
                }
                return rtn
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
    }

    static findAIShunZi(localHandCard:lcardTmp[], selectCard:lcardTmp[]){
        
        


        
    }

    static isCardValid(cards: lcardTmp[], last: boolean): boolean {
        let cardLen = cards.length
        if (cardLen == 1) {
            return true
        }
        cards = this.sortBySame(cards)
        if (this.isDouble(cards)) {
            return true
        }else if (this.isDoubleSeq(cards)) {
            return true
        }else if (this.isThree(cards,last)) {
            return true
        }else if (this.isFourAThree(cards, last)) {
            return true
        }else if (this.isShunZi(cards)) {
            return true
        }else if (this.isAirplane(cards, last)) {
            return true
        }else if (this.isBomb(cards)) {
            return true
        }
        return false
    }
}