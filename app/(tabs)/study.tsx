import { audiosMap as fourth350Audio } from '@/app/data/decks/fourth-350-essential/audiosMap';
import { audiosMap as mf100Audio } from '@/app/data/decks/most-frequent-100/audiosMap';
import { audiosMap as next100Audio } from '@/app/data/decks/next-100-essential/audiosMap';
import { audiosMap as third100Audio } from '@/app/data/decks/third-100-essential/audiosMap';

import { imagesMap as fourth350Image } from '@/app/data/decks/fourth-350-essential/imagesMap';
import { imagesMap as mf100Image } from '@/app/data/decks/most-frequent-100/imagesMap';
import { imagesMap as next100Image } from '@/app/data/decks/next-100-essential/imagesMap';
import { imagesMap as third100Image } from '@/app/data/decks/third-100-essential/imagesMap';

import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ConfigManager } from '../../utils/ConfigManager';
import { useStudySession } from '../contexts/StudySessionContext';

export const audiosMaps: Record<string, any> = {
    'most-frequent-100': mf100Audio,
    'next-100-essential': next100Audio,
    'third-100-essential': third100Audio,
    'fourth-350-essential': fourth350Audio,
};

export const imagesMaps: Record<string, any> = {
    'most-frequent-100': mf100Image,
    'next-100-essential': next100Image,
    'third-100-essential': third100Image,
    'fourth-350-essential': fourth350Image,
};

type Difficulty = 'again' | 'hard' | 'good' | 'easy';

export default function StudyScreen() {
    const { currentSession: session, setCurrentSession } = useStudySession();

    const [showBack, setShowBack] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);
    const [totalCards, setTotalCards] = useState(0);
    const [newStudiedCount, setNewStudiedCount] = useState(0);
    const [reviewStudiedCount, setReviewStudiedCount] = useState(0);
    const [autoAudio, setAutoAudio] = useState(true);

    useFocusEffect(
        React.useCallback(() => {
            const loadConfig = async () => {
                const config = await ConfigManager.getConfig();
                setAutoAudio(config.autoAudio);
            };
            loadConfig();
        }, [])
    );

    useEffect(() => {
        if (session) {
            setTotalCards(session.cardsToStudy.length);
            setHasStarted(true);
        }

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
                soundRef.current = null;
            }
        };
    }, [session]);

    useEffect(() => {
        if (showBack && autoAudio) {
            playSound();
        } else {
            if (soundRef.current) {
                soundRef.current.stopAsync();
            }
        }
    }, [showBack, autoAudio]);

    const playSound = async () => {
        const card = session?.currentCard;
        if (!card || !session) return;

        if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
        }

        // Usa slug per la mappa corretta
        const audioSource = audiosMaps[session.deck.slug]?.[card.name];
        if (!audioSource) return;

        const { sound } = await Audio.Sound.createAsync(audioSource);
        soundRef.current = sound;
        await sound.playAsync();
    };

    if (!session || !session.currentCard) {
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

    const card = session.currentCard;
    const cardType = session.mode;

    // DEBUG
    console.log('Deck slug:', session.deck.slug);
    console.log('Available decks:', Object.keys(imagesMaps));
    console.log('Image source:', imagesMaps[session.deck.slug]?.[card.name]);
    console.log('Card name:', card.name);
    console.log('Keys in imageMap for this deck:', Object.keys(imagesMaps[session.deck.slug] || {}));

    // Prendi immagine corretta per la carta con slug
    const imageSource = imagesMaps[session.deck.slug]?.[card.name];
    if (!imageSource) {
        return (
            <View style={styles.container}>
                <Text style={styles.word}>⏳ Caricamento risorse...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {cardType && (
                <Text style={styles.badge}>{cardType === 'new' ? '🆕 Nuova' : '🔁 Ripasso'}</Text>
            )}

            <Text style={styles.counter}>
                {cardType === 'new'
                    ? `${newStudiedCount} / ${totalCards} nuove`
                    : `${reviewStudiedCount} / ${totalCards} ripassi`}
            </Text>

            <View style={styles.card}>
                {!showBack ? (
                    <>
                        <Image source={imageSource} style={styles.image} />
                        {card.front_description && (
                            <Text style={styles.frontDescription}>{card.front_description}</Text>
                        )}
                    </>
                ) : (
                    <>
                        <Text style={styles.word}>{card.back}</Text>
                        <TouchableOpacity onPress={playSound} style={styles.playButton}>
                            <Ionicons name="volume-high" size={28} color="lightgrey" />
                        </TouchableOpacity>
                    </>
                )}
            </View>

            <Button
                title={showBack ? 'Mostra fronte' : 'Mostra retro'}
                onPress={() => setShowBack(!showBack)}
            />

            {showBack && (
                <View style={styles.buttons}>
                    <Button title="Ripeti" onPress={() => handleAnswer('again')} color="#e74c3c" />
                    <Button title="Difficile" onPress={() => handleAnswer('hard')} color="#f39c12" />
                    <Button title="Buono" onPress={() => handleAnswer('good')} color="#27ae60" />
                    <Button title="Facile" onPress={() => handleAnswer('easy')} color="#2ecc71" />
                </View>
            )}
        </View>
    );

    async function handleAnswer(difficulty: Difficulty) {
        if (!session) return;

        await session.answer(difficulty);
        setShowBack(false);

        console.log('Difficulty: ', difficulty);

        if (difficulty !== 'again') {
            if (session.mode === 'new') {
                setNewStudiedCount((prev) => prev + 1);
            } else {
                setReviewStudiedCount((prev) => prev + 1);
            }

            if (session.isDone) {
                setCurrentSession(null);
            }
        }
    }
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
    frontDescription: {
        fontSize: 18,
        color: '#333',
        textAlign: 'center',
        marginTop: 10,
        paddingHorizontal: 10,
    },
    playButton: { marginTop: 10 },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        width: '90%',
    },
    counter: { marginBottom: 10, fontSize: 18 },
    badge: {
        fontSize: 18,
        marginBottom: 5,
        color: '#888',
    },
});
