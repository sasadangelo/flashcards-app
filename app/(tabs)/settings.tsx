import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { AppConfig, CardOrder, ConfigManager } from '../../utils/ConfigManager';

export default function SettingsScreen() {
    const [config, setConfig] = useState<AppConfig>({
        dailyLimit: 20,
        reviewLimit: 100,
        autoAudio: true,
        cardOrder: 'sequential',
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const loadedConfig = await ConfigManager.getConfig();
            setConfig(loadedConfig);
            setLoading(false);
        })();
    }, []);

    const saveConfig = async (partial: Partial<AppConfig>) => {
        const newConfig = { ...config, ...partial };
        setConfig(newConfig);
        await ConfigManager.updateConfig(partial);
    };

    const resetConfig = async () => {
        await ConfigManager.resetConfig();
        const defaultConfig = await ConfigManager.getConfig();
        setConfig(defaultConfig);
        Alert.alert('Configurazione resettata ai valori di default');
    };

    const resetProgress = async () => {
        // Rimuove tutte le chiavi delle carte nello storage
        try {
            const allKeys = await AsyncStorage.getAllKeys();
            const cardKeys = allKeys.filter(k => k.startsWith('card_'));
            await AsyncStorage.multiRemove(cardKeys);
            Alert.alert('Progressi resettati');
        } catch (e) {
            Alert.alert('Errore nel resettare i progressi');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Text>Caricamento configurazione...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Limite carte nuove al giorno</Text>
            <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={config.dailyLimit.toString()}
                onChangeText={text => {
                    const val = parseInt(text) || 0;
                    saveConfig({ dailyLimit: val });
                }}
            />

            <Text style={styles.label}>Limite carte da ripassare al giorno</Text>
            <TextInput
                style={styles.input}
                keyboardType="number-pad"
                value={config.reviewLimit.toString()}
                onChangeText={text => {
                    const val = parseInt(text) || 0;
                    saveConfig({ reviewLimit: val });
                }}
            />

            <View style={styles.switchRow}>
                <Text style={styles.label}>Audio automatico</Text>
                <Switch
                    value={config.autoAudio}
                    onValueChange={value => saveConfig({ autoAudio: value })}
                />
            </View>

            <Text style={styles.label}>Ordine carte</Text>
            <Picker
                selectedValue={config.cardOrder}
                onValueChange={value => saveConfig({ cardOrder: value as CardOrder })}
                style={styles.picker}
            >
                <Picker.Item label="Sequenziale" value="sequential" />
                <Picker.Item label="Casuale" value="random" />
            </Picker>

            <View style={styles.buttons}>
                <Button title="Reset Configurazione" onPress={resetConfig} color="#e67e22" />
            </View>

            <View style={styles.buttons}>
                <Button title="Reset Progressi" onPress={resetProgress} color="#c0392b" />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20, justifyContent: 'flex-start' },
    label: { fontSize: 16, marginVertical: 8 },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        paddingHorizontal: 10,
        height: 40,
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 12,
    },
    picker: {
        height: 50,
        width: '100%',
    },
    buttons: {
        marginTop: 20,
    },
});
