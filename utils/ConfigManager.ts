import AsyncStorage from '@react-native-async-storage/async-storage';

export type CardOrder = 'sequential' | 'random';

export type AppConfig = {
    dailyLimit: number;
    reviewLimit: number;
    autoAudio: boolean;
    cardOrder: CardOrder;
};

const DEFAULT_CONFIG: AppConfig = {
    dailyLimit: 20,
    reviewLimit: 100,
    autoAudio: true,
    cardOrder: 'sequential',
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
        if (cardKeys.length > 0) {
            await AsyncStorage.multiRemove(cardKeys);
        }
    }

    // Esegue un reset completo: configurazione + progressi
    static async resetAll() {
        await this.resetConfig();
        await this.resetProgress();
    }
}
