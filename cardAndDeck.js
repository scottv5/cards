class Card {
  constructor(suit, rank, isDrawn, isDiscarded) {
    this.suit = suit;
    this.rank = rank;
    this.isDrawn = isDrawn;
    this.isDiscarded = isDiscarded;
  }
}
class Deck {
  constructor() {
    this.deck = [];
    this.currentDraws = [];
    this.currentDiscards = [];
    this.suits = ["hearts", "spades", "diamonds", "clubs"];
    this.ranks = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
  }
  createDeck() {
    this.deck = [];
    this.suits.forEach((suit) => {
      this.ranks.forEach((rank) => {
        this.deck.push(new Card(suit, rank, false, false));
      });
    });
  }

  getRand() {
    return Math.floor(Math.random() * this.deck.length);
  }

  getRand2(arrOfCards) {
    return Math.floor(Math.random() * arrOfCards.length);
  }

  randomizeDeck() {
    const nums = [];
    let num;
    while (true) {
      num = this.getRand();
      if (!nums.includes(num)) {
        nums.push(num);
      }
      if (nums.length >= this.deck.length) break;
    }
    this.deck = this.deck.map((_, i, arr) => {
      return arr[nums[i]];
    });
  }

  randomizeDiscardsAndCombineWithDrawn(discardArr, drawnArr) {
    const nums = [];
    let num;
    while (true) {
      num = this.getRand2(discardArr);
      if (!nums.includes(num)) {
        nums.push(num);
      }
      if (nums.length >= discardArr.length) break;
    }
    discardArr = discardArr.map((_, i, arr) => {
      return arr[nums[i]];
    });
    this.deck = [...drawnArr, ...discardArr];
  }

  randomizeDeckWhileDrawn() {
    this.populateDrawn();
    this.populateDiscards();
    this.randomizeDiscardsAndCombineWithDrawn(
      this.currentDiscards,
      this.currentDraws
    );
  }

  resetDiscards() {
    this.deck.forEach((card) => {
      card.isDiscarded = false;
    });
  }

  resetCheck() {
    return !this.deck.find((card) => !card.isDrawn && !card.isDiscarded);
  }

  populateDrawn() {
    this.currentDraws = this.deck.filter((card) => card.isDrawn);
  }

  populateDiscards() {
    this.currentDiscards = this.deck.filter((card) => card.isDiscarded);
  }

  betweenRoundsCleanup() {
    this.populateDrawn();
    this.currentDraws.forEach((card) => {
      card.isDrawn = false;
      card.isDiscarded = true;
    });
  }

  singleCardDraw() {
    if (this.resetCheck()) {
      console.log("shuffle...");
      this.randomizeDeckWhileDrawn();
      this.resetDiscards();
    }

    const card = this.deck.find((card) => !card.isDrawn && !card.isDiscarded);
    card.isDrawn = true;
    return card;
  }

  multipleCardDraw(num) {
    const hand = [];
    let i = 0;
    while (true) {
      hand.push(this.singleCardDraw());
      i++;
      if (i >= num) break;
    }
    return hand;
  }
}
