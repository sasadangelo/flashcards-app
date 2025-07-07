import AsyncStorage from '@react-native-async-storage/async-storage';

export class Card {
    id: string;
    name: string;
    image: string;
    back: string;

    constructor({ id, name, image, back }: { id: string; name: string; image: string; back: string }) {
        this.id = id;
        this.name = name;
        this.image = image;
        this.back = back;
    }

    async getNextReviewDate(): Promise<Date | null> {
        const dateStr = await AsyncStorage.getItem(`card_${this.name}_nextReview`);
        return dateStr ? new Date(dateStr) : null;
    }

    async setReviewResult(difficulty: 'again' | 'hard' | 'good' | 'easy') {
        const nextDate = Card.calculateNextReviewDate(difficulty);
        await AsyncStorage.setItem(`card_${this.name}_difficulty`, difficulty);
        await AsyncStorage.setItem(`card_${this.name}_nextReview`, nextDate.toISOString());
    }

    static calculateNextReviewDate(difficulty: 'again' | 'hard' | 'good' | 'easy'): Date {
        const date = new Date();
        const daysMap = { again: 1, hard: 2, good: 4, easy: 7 };
        date.setDate(date.getDate() + daysMap[difficulty]);
        return date;
    }
}
