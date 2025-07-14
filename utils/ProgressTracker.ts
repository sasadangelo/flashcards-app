import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clock } from './Clock';
import log from './logger';

const NEW_CARDS_COUNT_KEY = 'newCardsStudiedCount';
const NEW_CARDS_DATE_KEY = 'newCardsStudiedDate';

const REVIEW_CARDS_COUNT_KEY = 'reviewCardsStudiedCount';
const REVIEW_CARDS_DATE_KEY = 'reviewCardsStudiedDate';

const logger = log.extend('ProgressTracker');

export class ProgressTracker {
    static async _getTodayDateString() {
        const today = await Clock.today();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const todayStr = `${year}-${month}-${day}`;
        log.info(`Today is ${todayStr}`);
        return todayStr; // "YYYY-MM-DD"
    }

    // --- Nuove carte ---

    static async getNewCardsStudiedToday(): Promise<number> {
        const todayStr = await this._getTodayDateString();
        const storedDate = await AsyncStorage.getItem(NEW_CARDS_DATE_KEY);
        log.debug(`Stored NEW date: ${storedDate}`);

        if (storedDate !== todayStr) {
            log.info(`New day detected. Resetting NEW count.`);
            await AsyncStorage.setItem(NEW_CARDS_DATE_KEY, todayStr);
            await AsyncStorage.setItem(NEW_CARDS_COUNT_KEY, '0');
            return 0;
        }

        const countStr = await AsyncStorage.getItem(NEW_CARDS_COUNT_KEY);
        log.debug(`Loaded NEW count: ${countStr}`);
        return countStr ? parseInt(countStr, 10) : 0;
    }

    static async incrementNewCardsStudied(): Promise<void> {
        const count = await this.getNewCardsStudiedToday();
        const newCount = count + 1;
        await AsyncStorage.setItem(NEW_CARDS_COUNT_KEY, newCount.toString());
        log.info(`Incremented NEW cards to ${newCount}`);
    }

    // --- Carte da ripasso ---

    static async getReviewCardsStudiedToday(): Promise<number> {
        const todayStr = await this._getTodayDateString();
        const storedDate = await AsyncStorage.getItem(REVIEW_CARDS_DATE_KEY);
        log.debug(`Stored REVIEW date: ${storedDate}`);

        if (storedDate !== todayStr) {
            log.info(`New day detected. Resetting REVIEW count.`);
            await AsyncStorage.setItem(REVIEW_CARDS_DATE_KEY, todayStr);
            await AsyncStorage.setItem(REVIEW_CARDS_COUNT_KEY, '0');
            return 0;
        }

        const countStr = await AsyncStorage.getItem(REVIEW_CARDS_COUNT_KEY);
        log.debug(`Loaded REVIEW count: ${countStr}`);
        return countStr ? parseInt(countStr, 10) : 0;
    }

    static async incrementReviewCardsStudied(): Promise<void> {
        const count = await this.getReviewCardsStudiedToday();
        const newCount = count + 1;
        await AsyncStorage.setItem(REVIEW_CARDS_COUNT_KEY, newCount.toString());
        log.info(`Incremented REVIEW cards to ${newCount}`);
    }

    // --- Reset totale progressi (usare solo se serve resettare manualmente) ---

    static async resetAllProgress(): Promise<void> {
        await AsyncStorage.multiRemove([
            NEW_CARDS_COUNT_KEY,
            NEW_CARDS_DATE_KEY,
            REVIEW_CARDS_COUNT_KEY,
            REVIEW_CARDS_DATE_KEY,
        ]);
        log.info(`All progress reset complete.`);
    }
}
