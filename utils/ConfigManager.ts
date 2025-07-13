import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

export type CardOrder = 'sequential' | 'random';

export type AppConfig = {
    dailyLimit: number;
    reviewLimit: number;
    autoAudio: boolean;
    cardOrder: CardOrder;
    mockDate?: string | null; // ISO string
};

const DEFAULT_CONFIG: AppConfig = {
    dailyLimit: 20,
    reviewLimit: 50,
    autoAudio: true,
    cardOrder: 'random',
};

export class ConfigManager {
    // Recupera la configurazione utente, fondendo con i default
    static async getConfig(): Promise<AppConfig> {
        const configString = await AsyncStorage.getItem('app_config');
        if (configString) {
            return { ...DEFAULT_CONFIG, ...JSON.parse(configString) };
        }
        return DEFAULT_CONFIG;
    }

    // Aggiorna solo i valori specificati nella configurazione
    static async updateConfig(partial: Partial<AppConfig>) {
        const current = await this.getConfig();
        const updated = { ...current, ...partial };
        await AsyncStorage.setItem('app_config', JSON.stringify(updated));
    }

    // Ripristina la configurazione ai valori predefiniti
    static async resetConfig() {
        await AsyncStorage.removeItem('app_config');
    }

    // Elimina tutti i progressi delle carte (reps, ease, interval, etc.)
    static async resetProgress() {
        const keys = await AsyncStorage.getAllKeys();
        const cardKeys = keys.filter(key => key.startsWith('card_'));
        // Chiavi dei contatori giornalieri da rimuovere
        const progressKeys = [
            'newCardsStudiedCount',
            'newCardsStudiedDate',
            'reviewCardsStudiedCount',
            'reviewCardsStudiedDate',
        ];
        const keysToRemove = [...cardKeys, ...progressKeys];
        console.log('Chiavi da rimuovere:', keysToRemove);
        if (keysToRemove.length > 0) {
            await AsyncStorage.multiRemove(keysToRemove);
        }
    }

    // Esegue un reset completo: configurazione + progressi
    static async resetAll() {
        await this.resetConfig();
        await this.resetProgress();
    }

    // Recupera la data simulata (null se disattiva o in produzione)
    static getMockDate(): Date {
        const { MOCK_DATE } = Constants.expoConfig?.extra || {};
        let date = new Date();

        if (this.isDevMode && MOCK_DATE) {
            const parsed = new Date(MOCK_DATE);
            if (!isNaN(parsed.getTime())) {
                date = parsed;
            }
        }

        date.setHours(0, 0, 0, 0);
        return date;
    }

    static get isDevMode(): boolean {
        const { APP_ENV } = Constants.expoConfig?.extra || {};
        return APP_ENV === 'development';
    }
}
