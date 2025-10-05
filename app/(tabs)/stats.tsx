// app/(tabs)/stats.tsx

import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import CEFRGauge from '../../components/CEFRGauge';
import { Stats } from '../../models/Stats';
import { useDecks } from '../contexts/DeckContext';

export default function StatsScreen() {
    const decks = useDecks(); // tutti i deck caricati
    const [cardsStudied, setCardsStudied] = useState(0);
    const [shortCount, setShortCount] = useState(0);
    const [mediumCount, setMediumCount] = useState(0);
    const [longCount, setLongCount] = useState(0);
    const [cefr, setCefr] = useState<{ level: string; progress: number }>({ level: 'pre-A1.1', progress: 0 });

    useEffect(() => {
        const loadStats = async () => {
            if (!decks.length) {
                console.log('No decks available yet.');
                return;
            }

            const allCards = decks.flatMap(deck => deck.cards);
            const stats = await Stats.fromCards(allCards);

            setCardsStudied(stats.studied);
            setShortCount(stats.short);
            setMediumCount(stats.medium);
            setLongCount(stats.long);

            const computedCefr = stats.computeLevel();
            setCefr(computedCefr);
        };

        loadStats();
    }, [decks]);

    return (
        <ScrollView contentContainerStyle={styles.container}>
            <Text style={styles.statsTitle}>📊 Statistiche Vocabolario:</Text>

            <View style={styles.deckStats}>
                <Text style={styles.deckName}>📚 Progresso</Text>
                <Text>Carte studiate: {cardsStudied}</Text>
                <Text>Carte nella memoria a breve termine: {shortCount}</Text>
                <Text>Carte nella memoria a medio termine: {mediumCount}</Text>
                <Text>Carte nella memoria a lungo termine: {longCount}</Text>
            </View>
            <View style={{ width: '100%', paddingLeft: 20, alignItems: 'flex-start' }}>
                <CEFRGauge currentLevel={cefr.level} />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    statsTitle: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
    container: { padding: 20 },
    progressWrapper: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    progressBar: { flex: 1, height: 10, marginRight: 10, borderRadius: 5 },
    deckStats: { marginBottom: 16 },
    deckName: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
});
