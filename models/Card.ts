import AsyncStorage from '@react-native-async-storage/async-storage';
import log from '../utils/logger';

// Dati base letti da JSON, senza deckSlug
export interface CardData {
    id: string;
    name: string;
    back: string;
    front_note?: string;
    abbreviation?: string;
    synonyms: string[];
    back_note?: string;
    region?: string;
    categories: string[];
}

const logger = log.extend('Card');

export class Card {
    id: string;
    name: string;
    back: string;
    front_note?: string;
    abbreviation?: string;
    synonyms: string[];
    back_note?: string;
    region?: string;
    categories: string[];

    constructor({ id, name, back, front_note, abbreviation, synonyms, back_note, region, categories }: CardData) {
        this.id = id;
        this.name = name;
        this.back = back;
        this.front_note = front_note;
        this.abbreviation = abbreviation;
        this.synonyms = synonyms || [];
        this.back_note = back_note;
        this.region = region;
        this.categories = categories;
    }

    async getNextReviewDate(): Promise<Date | null> {
        try {
            const key = `card_${this.name}_nextReview`;
            const dateStr = await AsyncStorage.getItem(key);
            const result = dateStr ? new Date(dateStr) : null;
            logger.debug(`${this.name} -> ${result}`);
            return result;
        } catch (error) {
            console.error(`Error for card ${this.name}:`, error);
            return null;
        }
    }

    async getReviewData(): Promise<{
        reps: number;
        interval: number;
        easeFactor: number;
        nextReview: Date | null;
    }> {
        try {
            const [repsStr, intervalStr, easeStr, nextStr] = await Promise.all([
                AsyncStorage.getItem(`card_${this.name}_reps`),
                AsyncStorage.getItem(`card_${this.name}_interval`),
                AsyncStorage.getItem(`card_${this.name}_ease`),
                AsyncStorage.getItem(`card_${this.name}_nextReview`)
            ]);

            const reviewData = {
                reps: repsStr ? parseInt(repsStr, 10) : 0,
                interval: intervalStr ? parseInt(intervalStr, 10) : 0,
                easeFactor: easeStr ? parseFloat(easeStr) : 2.5,
                nextReview: nextStr ? new Date(nextStr) : null,
            };

            logger.debug(`${this.name} ${JSON.stringify(reviewData)}`);
            return reviewData;
        } catch (error) {
            logger.error(`Error for card ${this.name}: ${error}`);
            return {
                reps: 0,
                interval: 0,
                easeFactor: 2.5,
                nextReview: null,
            };
        }
    }
}
