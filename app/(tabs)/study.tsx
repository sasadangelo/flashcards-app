import { audioMap } from '@/utils/audioMap';
import { imageMap } from '@/utils/imageMap';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import deck from '../data/deck.json';

type Card = {
    id: string;
    image: string;
    back: string;
    name: string;
};

function calculateNextReviewDate(difficulty: 'again' | 'hard' | 'good' | 'easy'): Date {
    const date = new Date();
    switch (difficulty) {
        case 'again':
            date.setDate(date.getDate() + 1);
            break;
        case 'hard':
            date.setDate(date.getDate() + 2);
            break;
        case 'good':
            date.setDate(date.getDate() + 4);
            break;
        case 'easy':
            date.setDate(date.getDate() + 7);
            break;
    }
    return date;
}

async function filterCardsToStudy(deck: Card[]): Promise<Card[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const result: Card[] = [];

    for (const card of deck) {
        const nextReviewStr = await AsyncStorage.getItem(`card_${card.name}_nextReview`);
        if (!nextReviewStr) {
            result.push(card); // mai studiata
        } else {
            const nextReview = new Date(nextReviewStr);
            if (nextReview <= today) {
                result.push(card); // da rivedere
            }
        }
    }

    return result;
}

export default function StudyScreen() {
    const [cardsToStudy, setCardsToStudy] = useState<Card[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showBack, setShowBack] = useState(false);
    const [isDone, setIsDone] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        async function load() {
            const filtered = await filterCardsToStudy(deck);
            setCardsToStudy(filtered);
            if (filtered.length > 0) setHasStarted(true);
        }
        load();

        return () => {
            // Cleanup audio on unmount
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        // Autoplay audio when back is shown
        if (showBack) {
            playSound();
        } else {
            // Stop audio when front is shown
            if (soundRef.current) {
                soundRef.current.stopAsync();
            }
        }
    }, [showBack]);

    const playSound = async () => {
        const card = cardsToStudy[currentIndex];
        if (!card) return;

        // Se c'è un suono caricato, scaricalo prima
        if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
        }

        // Carica nuovo audio per la parola corrente
        const { sound } = await Audio.Sound.createAsync(audioMap[card.name]);

        soundRef.current = sound;
        await sound.playAsync();
    };

    // 👇 gestione messaggi vuoto / fine sessione
    if (cardsToStudy.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.word}>
                    {hasStarted
                        ? '🎉 Hai completato tutte le carte di oggi!'
                        : '🎉 Non ci sono carte da studiare oggi!'}
                </Text>
            </View>
        );
    }

    const card = cardsToStudy[currentIndex];

    const handleAnswer = async (difficulty: 'again' | 'hard' | 'good' | 'easy') => {
        const nextReviewDate = calculateNextReviewDate(difficulty);

        console.log(`Carta ${card.name} evaluated like: ${difficulty}, next review: ${nextReviewDate.toISOString()}`);

        await AsyncStorage.setItem(`card_${card.name}_difficulty`, difficulty);
        await AsyncStorage.setItem(`card_${card.name}_nextReview`, nextReviewDate.toISOString());

        setShowBack(false);

        const updatedCards = await filterCardsToStudy(deck);

        if (updatedCards.length === 0) {
            setCardsToStudy([]);
            setIsDone(true);
        } else {
            setCardsToStudy(updatedCards);
            setCurrentIndex(0); // ricomincia dalla prima carta da studiare
        }
    };


    return (
        <View style={styles.container}>
            <Text style={styles.counter}>{currentIndex + 1} / {cardsToStudy.length}</Text>
            <View style={styles.card}>
                {!showBack ? (
                    <Image source={imageMap[card.name]} style={styles.image} />
                ) : (
                    <>
                        <Text style={styles.word}>{card.back}</Text>
                        <TouchableOpacity onPress={playSound} style={styles.playButton}>
                            <Text style={{ color: 'blue' }}>▶️</Text>
                        </TouchableOpacity>
                    </>
                )}
            </View>
            <Button title={showBack ? "Show Front" : "Show Back"} onPress={() => setShowBack(!showBack)} />
            {showBack && (
                <View style={styles.buttons}>
                    <Button title="Again" onPress={() => handleAnswer('again')} color="#e74c3c" />
                    <Button title="Hard" onPress={() => handleAnswer('hard')} color="#f39c12" />
                    <Button title="Good" onPress={() => handleAnswer('good')} color="#27ae60" />
                    <Button title="Easy" onPress={() => handleAnswer('easy')} color="#2ecc71" />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    card: {
        backgroundColor: 'white',
        width: 300,
        height: 300,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        borderWidth: 1,
        borderRadius: 8,
        borderColor: '#ccc',
        padding: 10,
    },
    image: { width: 250, height: 250, resizeMode: 'contain' },
    word: { fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
    playButton: {
        marginTop: 10,
    },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        width: '90%',
    },
    counter: {
        marginBottom: 10,
        fontSize: 18,
    },
});
