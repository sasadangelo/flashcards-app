import rawDeck from '../app/data/deck.json';
import { Card } from './Card';

export class Deck {
    cards: Card[];

    constructor(data = rawDeck) {
        this.cards = data.map(c => new Card(c));
    }

    async getCardsToStudy(): Promise<Card[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cardsToStudy: Card[] = [];

        for (const card of this.cards) {
            const reviewDate = await card.getNextReviewDate();
            if (!reviewDate || reviewDate <= today) {
                cardsToStudy.push(card);
            }
        }

        return cardsToStudy;
    }
}
