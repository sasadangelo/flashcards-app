import AsyncStorage from '@react-native-async-storage/async-storage';

export class Card {
    id: string;
    name: string;
    back: string;

    constructor({ id, name, back }: { id: string; name: string; back: string }) {
        this.id = id;
        this.name = name;
        this.back = back;
    }

    async getNextReviewDate(): Promise<Date | null> {
        const dateStr = await AsyncStorage.getItem(`card_${this.name}_nextReview`);
        return dateStr ? new Date(dateStr) : null;
    }

    async getReviewData(): Promise<{
        reps: number;
        interval: number;
        easeFactor: number;
        nextReview: Date | null;
    }> {
        const repsStr = await AsyncStorage.getItem(`card_${this.name}_reps`);
        const intervalStr = await AsyncStorage.getItem(`card_${this.name}_interval`);
        const easeStr = await AsyncStorage.getItem(`card_${this.name}_ease`);
        const nextStr = await AsyncStorage.getItem(`card_${this.name}_nextReview`);

        return {
            reps: repsStr ? parseInt(repsStr, 10) : 0,
            interval: intervalStr ? parseInt(intervalStr, 10) : 0,
            easeFactor: easeStr ? parseFloat(easeStr) : 2.5,
            nextReview: nextStr ? new Date(nextStr) : null,
        };
    }
}
