import rawDeck from '../app/data/deck.json';
import { Card } from './Card';

export class Deck {
    cards: Card[];

    constructor(data = rawDeck) {
        this.cards = data.map(c => new Card(c));
    }

    // Carte da rivedere: hanno una data di review nel passato o oggi
    async getReviewCards(limit: number): Promise<Card[]> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const reviewCards: Card[] = [];

        for (const card of this.cards) {
            const reviewDate = await card.getNextReviewDate();
            if (reviewDate && reviewDate <= today) {
                reviewCards.push(card);
            }
        }

        return reviewCards.slice(0, limit);
    }

    // Carte nuove: mai viste (nessun dato memorizzato)
    async getNewCards(limit: number): Promise<Card[]> {
        const newCards: Card[] = [];

        for (const card of this.cards) {
            const reviewDate = await card.getNextReviewDate();
            if (!reviewDate) {
                newCards.push(card);
            }
        }

        return newCards.slice(0, limit);
    }
}
