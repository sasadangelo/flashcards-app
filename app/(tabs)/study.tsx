import { imageMap } from '@/utils/imageMap';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import deck from '../data/deck.json';

export default function StudyScreen() {
    const [index, setIndex] = useState(0);
    const [showBack, setShowBack] = useState(false);

    const card = deck[index];

    const handleNext = () => {
        setShowBack(false);
        setIndex((prev) => (prev + 1) % deck.length);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.counter}>Card {index + 1} / {deck.length}</Text>
            <TouchableOpacity onPress={() => setShowBack(!showBack)} style={styles.card}>
                {showBack ? (
                    <Text style={styles.backText}>{card.back}</Text>
                ) : (
                    <Image source={imageMap[card.image]} style={styles.image} />
                )}
            </TouchableOpacity>
            {showBack && (
                <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
                    <Text style={styles.nextText}>➡️ Prossima</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: 'center', paddingTop: 60 },
    counter: { fontSize: 16, marginBottom: 20 },
    card: { padding: 20, borderWidth: 1, borderRadius: 10, marginBottom: 20 },
    image: { width: 200, height: 200, resizeMode: 'contain' },
    backText: { fontSize: 36 },
    nextBtn: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8 },
    nextText: { color: 'white', fontSize: 18 },
});
