import { Clock } from '../utils/Clock';
import { Card, CardData } from './Card';

interface DeckData {
    group: string;
    name: string;
    cards: CardData[];
}

export class Deck {
    group: string;
    name: string;
    cards: Card[];

    constructor(data: DeckData) {
        console.log('************')
        console.log(data)
        console.log('************')
        this.group = data.group;
        this.name = data.name;
        this.cards = data.cards.map(c => new Card(c));
    }

    // Carte da rivedere: hanno una data di review nel passato o oggi
    async getReviewCards(limit: number): Promise<Card[]> {
        const today = Clock.today();

        const reviewCards: Card[] = [];

        // Parallel fetching delle date di review per ogni carta
        const cardsWithDates = await Promise.all(
            this.cards.map(async (card) => ({
                card,
                reviewDate: await card.getNextReviewDate(),
            }))
        );

        // Filtra le carte che hanno una data di review nel passato o oggi
        const reviewCardsFiltered = cardsWithDates
            .filter(({ reviewDate }) => reviewDate && reviewDate <= today)
            .map(({ card }) => card);

        // Restituisce solo il numero di carte richieste
        return reviewCardsFiltered.slice(0, limit);
    }

    // Carte nuove: non hanno mai avuto una data di review
    async getNewCards(limit: number): Promise<Card[]> {
        const newCards: Card[] = [];

        // Parallel fetching delle date di review per ogni carta
        const cardsWithDates = await Promise.all(
            this.cards.map(async (card) => ({
                card,
                reviewDate: await card.getNextReviewDate(),
            }))
        );

        // Filtra le carte che non hanno mai avuto una data di review
        const newCardsFiltered = cardsWithDates
            .filter(({ reviewDate }) => reviewDate === null)
            .map(({ card }) => card);

        // Restituisce solo il numero di carte richieste
        return newCardsFiltered.slice(0, limit);
    }

    // Restituisce il numero totale di carte nuove (non ancora viste)
    async getTotalNewCards(): Promise<number> {
        const newCards = await this.getNewCards(Number.MAX_VALUE); // Ottieni tutte le carte nuove
        return newCards.length;
    }

    // Restituisce il numero totale di carte da ripasso
    async getTotalReviewCards(): Promise<number> {
        const reviewCards = await this.getReviewCards(Number.MAX_VALUE); // Ottieni tutte le carte da ripasso
        return reviewCards.length;
    }
}