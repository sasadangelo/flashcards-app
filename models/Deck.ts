import { Clock } from '../utils/Clock';
import log from '../utils/logger';
import { Card, CardData } from './Card';

interface DeckData {
    group: string;
    name: string;
    slug: string;
    cards: CardData[];
}

const logger = log.extend('Deck');

export class Deck {
    group: string;
    name: string;
    slug: string;
    cards: Card[];

    constructor(data: DeckData) {
        this.group = data.group;
        this.name = data.name;
        this.slug = data.slug;
        this.cards = data.cards.map(c => new Card(c));
        logger.info(`Initialized deck "${this.name}" with ${this.cards.length} cards`);
    }

    private async getCardsWithReviewDates(): Promise<{ card: Card; reviewDate: Date | null }[]> {
        logger.debug(`Calculating review dates for ${this.cards.length} cards...`);
        const results = await Promise.all(
            this.cards.map(async card => {
                const reviewDate = await card.getNextReviewDate();
                return { card, reviewDate };
            })
        );
        logger.debug(`Completed review date calculation`);
        return results;
    }

    async getReviewCards(limit: number): Promise<Card[]> {
        logger.debug(`Getting review cards with limit ${limit}`);
        const today = Clock.today();

        const reviewCards = (await this.getCardsWithReviewDates())
            .filter(({ reviewDate }) => reviewDate && reviewDate <= today)
            .map(({ card }) => card);

        logger.info(`Found ${reviewCards.length} review cards`);
        return reviewCards.slice(0, limit);
    }

    async getNewCards(limit: number): Promise<Card[]> {
        logger.debug(`Getting new cards with limit ${limit}`);
        const newCards = (await this.getCardsWithReviewDates())
            .filter(({ reviewDate }) => reviewDate === null)
            .map(({ card }) => card);

        logger.info(`Found ${newCards.length} new cards`);
        return newCards.slice(0, limit);
    }

    async getTotalNewCards(): Promise<number> {
        const total = await this.getNewCards(Number.MAX_VALUE);
        logger.info(`Total new cards: ${total.length}`);
        return total.length;
    }

    async getTotalReviewCards(): Promise<number> {
        const total = await this.getReviewCards(Number.MAX_VALUE);
        logger.info(`Total review cards: ${total.length}`);
        return total.length;
    }
}
