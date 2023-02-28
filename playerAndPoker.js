class Player {
  constructor(isPlayerChar, money, pos) {
    this.isPlayerChar = isPlayerChar;
    this.money = money;
    this.hand = [];
    this.pos = pos;
  }
}

class FinalHand {
  constructor(allPosibleCards, fullHand, kicker, handValueStr, handValueNum) {
    this.allPosibleCards = allPosibleCards;
    this.fullHand = fullHand;
    this.kicker = kicker;
    this.handValueStr = handValueStr;
    this.handValueNum = handValueNum;
  }
}

class Poker extends Deck {
  constructor() {
    super();
    this.players = [];
    this.communalCards = [];
    this.buttonPos = 1;
    this.smBlindPos = 2;
    this.bigBlindPos = 3;
  }
  numberOfPlayers(num) {
    let i = 0;
    while (true) {
      this.players.push(new Player(i === 0, 1000, i + 1));
      i++;
      if (i >= num) break;
    }
  }

  dealHands() {
    this.players.forEach((player) => {
      player.hand = this.multipleCardDraw(2);
    });
  }

  dealCommunalCards(num) {
    let i = 0;
    while (true) {
      this.communalCards.push(this.singleCardDraw());
      i++;
      if (i >= num) break;
    }
  }

  determineHand(hand, communalCards) {
    const posibleRanks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const posibleSuits = ["hearts", "diamonds", "spades", "clubs"];
    const cards = [...hand, ...communalCards];
    const rankedCards = cards.sort((a, b) => {
      return b.rank - a.rank;
    });

    let fiveCardHand;
    let kicker = null;

    const flushArr = posibleSuits
      .map((suit) => {
        return rankedCards.filter((card) => card.suit === suit);
      })
      .filter((array) => array.length >= 5);

    const isFlush = !!flushArr.length;

    const isSequencial = (n1, n2, n3, n4, n5) => {
      if (n1 - n2 === 1 && n2 - n3 === 1 && n3 - n4 === 1 && n4 - n5 === 1)
        return true;
      return false;
    };

    let isStraight = false;

    const ranksArr = rankedCards.map((card) => card.rank);

    if (isSequencial(...ranksArr.slice(0, 5))) {
      fiveCardHand = rankedCards.slice(0, 5);
      isStraight = true;
    } else if (isSequencial(...ranksArr.slice(1, 6))) {
      fiveCardHand = rankedCards.slice(1, 6);
      isStraight = true;
    } else if (isSequencial(...ranksArr.slice(2, 7))) {
      fiveCardHand = rankedCards.slice(2, 7);
      isStraight = true;
    }

    const findDupes = posibleRanks
      .map((rank) => {
        return rankedCards.filter((card) => {
          if (card.rank === rank) return card;
        });
      })
      .filter((a) => a.length >= 2)
      .sort((a, b) => {
        return b[0].rank - a[0].rank;
      })
      .sort((a, b) => {
        return b.length - a.length;
      });

    if (isFlush && isSequencial(...flushArr[0].map((card) => card.rank)))
      return new FinalHand(
        cards,
        flushArr[0].slice(0, 5),
        kicker,
        "straight flush",
        9
      );

    if (findDupes.find((array) => array.length === 4)) {
      const fourOfAKind = findDupes.find((array) => array.length === 4);
      kicker = rankedCards.filter(
        (card) => card.rank !== fourOfAKind[0].rank
      )[0];
      return new FinalHand(
        cards,
        [...fourOfAKind, kicker],
        [kicker],
        "4 of a kind",
        8
      );
    }

    const threeOfAKind = findDupes.find((array) => array.length === 3);
    const threeOfAKindNext = findDupes
      .slice(1)
      .find((array) => array.length === 3);

    if (threeOfAKind && threeOfAKindNext) {
      return new FinalHand(
        cards,
        [...threeOfAKind, ...threeOfAKindNext.slice(0, 2)],
        kicker,
        "full house",
        7
      );
    }

    if (
      findDupes.find((array) => array.length === 3) &&
      findDupes.find((array) => array.length === 2)
    )
      return new FinalHand(
        cards,
        [
          ...findDupes.find((array) => array.length === 3),
          ...findDupes.find((array) => array.length === 2),
        ],
        kicker,
        "full house",
        7
      );

    if (isFlush)
      return new FinalHand(cards, flushArr[0].slice(0, 5), kicker, "flush", 6);

    if (isStraight)
      return new FinalHand(cards, fiveCardHand, kicker, "straight", 5);

    if (findDupes.find((array) => array.length === 3)) {
      const threeofkind = findDupes.find((array) => array.length === 3);
      const threeofkindRank = threeofkind[0].rank;
      const otherCards = rankedCards.filter(
        (card) => card.rank !== threeofkindRank
      );
      kicker = [otherCards[0], otherCards[1]];
      return new FinalHand(
        cards,
        [...threeofkind, ...kicker],
        kicker,
        "three of a kind",
        4
      );
    }

    const pair = findDupes.find((array) => array.length === 2);
    const pairNext = findDupes.slice(1).find((array) => array.length === 2);
    if (pair && pairNext) {
      const otherCards = rankedCards.filter(
        (card) => card.rank !== pair[0].rank && card.rank !== pairNext[0].rank
      );
      kicker = [otherCards[0]];
      return new FinalHand(
        cards,
        [...pair, ...pairNext, ...kicker],
        kicker,
        "two pairs",
        3
      );
    }

    if (findDupes.length === 1) {
      const otherCards = rankedCards.filter(
        (cards) => cards.rank !== pair[0].rank
      );
      kicker = otherCards.slice(0, 3);
      return new FinalHand(cards, [...pair, ...kicker], kicker, "pair", 2);
    }

    if (findDupes.length === 0)
      return new FinalHand(
        cards,
        rankedCards.slice(0, 5),
        kicker,
        "high card",
        1
      );
  }

  determineWinner(hand1, hand2) {
    const h1 = hand1.reduce((accu, curr) => {
      return accu + curr.rank;
    }, 0);

    const h2 = hand2.reduce((accu, curr) => {
      return accu + curr.rank;
    }, 0);

    if (h1 === h2) console.log(`its a tie with ${h1} points`);
    else {
      console.log(
        h1 > h2
          ? `p1 wins with ${h1} points to ${h2} points`
          : `p2 wins with ${h2} points to ${h1} points`
      );
    }
  }

  gameSim() {
    let p1 = this.multipleCardDraw(5);
    let p2 = this.multipleCardDraw(5);

    this.determineWinner(p1, p2);
    this.betweenRoundsCleanup();

    p1 = this.multipleCardDraw(5);
    p2 = this.multipleCardDraw(5);

    this.determineWinner(p1, p2);
    this.betweenRoundsCleanup();

    p1 = this.multipleCardDraw(5);
    p2 = this.multipleCardDraw(5);

    this.determineWinner(p1, p2);
    this.betweenRoundsCleanup();

    p1 = this.multipleCardDraw(5);
    p2 = this.multipleCardDraw(5);

    this.determineWinner(p1, p2);
    this.betweenRoundsCleanup();

    p1 = this.multipleCardDraw(5);
    p2 = this.multipleCardDraw(5);

    this.determineWinner(p1, p2);
    this.betweenRoundsCleanup();

    console.log(this.deck);

    p1 = this.multipleCardDraw(5);
    p2 = this.multipleCardDraw(5);

    this.determineWinner(p1, p2);
    this.betweenRoundsCleanup();
    console.log(this.deck);
  }
}

const poker = new Poker();

poker.createDeck();
poker.randomizeDeck();
poker.numberOfPlayers(3);

poker.dealHands();
poker.dealCommunalCards(5);
console.log(
  "p1",
  poker.determineHand(poker.players[0].hand, poker.communalCards)
);
console.log(
  "p2",
  poker.determineHand(poker.players[1].hand, poker.communalCards)
);
console.log(
  "p3",
  poker.determineHand(poker.players[2].hand, poker.communalCards)
);
//suit, rank, isDrawn, isDiscarded
console.log(
  poker.determineHand(
    [new Card("hearts", 14, true, false), new Card("hearts", 13, true, false)],
    [
      new Card("hearts", 12, true, false),
      new Card("hearts", 11, true, false),
      new Card("hearts", 10, true, false),
      new Card("hearts", 9, true, false),
      new Card("hearts", 8, true, false),
    ]
  )
);
console.log("deck", poker.deck);
console.log("players", poker.players);
console.log("communal cards", poker.communalCards);
