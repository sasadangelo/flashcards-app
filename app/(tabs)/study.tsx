import { audiosMap as fifth350Audio } from '@/app/data/decks/fifth-350-essential/audiosMap';
import { audiosMap as fourth350Audio } from '@/app/data/decks/fourth-350-essential/audiosMap';
import { audiosMap as mf100Audio } from '@/app/data/decks/most-frequent-100/audiosMap';
import { audiosMap as next100Audio } from '@/app/data/decks/next-100-essential/audiosMap';
import { audiosMap as third100Audio } from '@/app/data/decks/third-100-essential/audiosMap';

import { imagesMap as fifth350Image } from '@/app/data/decks/fifth-350-essential/imagesMap';
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
    'fifth-350-essential': fifth350Audio,
};

export const imagesMaps: Record<string, any> = {
    'most-frequent-100': mf100Image,
    'next-100-essential': next100Image,
    'third-100-essential': third100Image,
    'fourth-350-essential': fourth350Image,
    'fifth-350-essential': fifth350Image,
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
            setNewStudiedCount(0);       // reset nuovo
            setReviewStudiedCount(0);    // reset ripassi
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
                        {card.region && (
                            <Text style={styles.regionFlag}>
                                {card.region === 'UK' ? '🇬🇧' : card.region === 'US' ? '🇺🇸' : card.region === 'AU' ? '🇦🇺' : ''}
                            </Text>
                        )}
                        <Image source={imageSource} style={styles.image} />
                        {card.front_note && (
                            <Text style={styles.frontDescription}>{card.front_note}</Text>
                        )}

                        {card.categories && card.categories.length > 0 && (
                            <View style={styles.categoriesContainer}>
                                {card.categories.map((cat: string, index: number) => (
                                    <View key={index} style={styles.categoryBadge}>
                                        <Ionicons name="pricetag" size={16} color="#555" style={{ marginRight: 4 }} />
                                        <Text style={styles.categoryText}>{cat}</Text>
                                    </View>
                                ))}
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        <Text style={styles.word}>{card.back}</Text>
                        <TouchableOpacity onPress={playSound} style={styles.playButton}>
                            <Ionicons name="volume-high" size={28} color="grey" />
                        </TouchableOpacity>

                        {card.abbreviation && (
                            <View style={styles.abbreviationContainer}>
                                <Text style={styles.abbreviationText}>Abbr.: {card.abbreviation}</Text>
                                <TouchableOpacity
                                    onPress={async () => {
                                        const abbr = card.abbreviation;
                                        if (!abbr) return;

                                        if (soundRef.current) {
                                            await soundRef.current.unloadAsync();
                                            soundRef.current = null;
                                        }

                                        // Genera la chiave come name + '_' + abbreviation
                                        const key = `${card.name}_${abbr}`.toLowerCase();
                                        const audioSource = audiosMaps[session.deck.slug]?.[key];
                                        if (!audioSource) return; // se non c'è, non fa nulla

                                        const { sound } = await Audio.Sound.createAsync(audioSource);
                                        soundRef.current = sound;
                                        await sound.playAsync();
                                    }}
                                    style={styles.playButtonSmall}
                                >
                                    <Ionicons name="volume-high" size={20} color="lightgrey" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {card.synonyms && card.synonyms.length > 0 && (
                            <View style={styles.synonymsContainer}>
                                {card.synonyms.map((syn, index) => (
                                    <View key={index} style={styles.synonymRow}>
                                        <Text style={styles.synonymText}>Synonyms: {syn}</Text>
                                        <TouchableOpacity
                                            onPress={async () => {
                                                if (!syn) return;

                                                if (soundRef.current) {
                                                    await soundRef.current.unloadAsync();
                                                    soundRef.current = null;
                                                }

                                                // genera chiave come name + '_' + synonym
                                                const key = `${card.name}_${syn}`.toLowerCase();
                                                const audioSource = audiosMaps[session.deck.slug]?.[key];
                                                if (!audioSource) return;

                                                const { sound } = await Audio.Sound.createAsync(audioSource);
                                                soundRef.current = sound;
                                                await sound.playAsync();
                                            }}
                                            style={styles.playButtonSmall}
                                        >
                                            <Ionicons name="volume-high" size={20} color="lightgrey" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {card.nationality && (
                            <View style={styles.nationalityContainer}>
                                <Text style={styles.nationalityText}>Nationality: {card.nationality}</Text>
                                <TouchableOpacity
                                    onPress={async () => {
                                        const nationality = card.nationality;
                                        if (!nationality) return;

                                        if (soundRef.current) {
                                            await soundRef.current.unloadAsync();
                                            soundRef.current = null;
                                        }

                                        // Genera la chiave come name + '_' + abbreviation
                                        const key = `${card.name}_${nationality}`.toLowerCase();
                                        const audioSource = audiosMaps[session.deck.slug]?.[key];
                                        if (!audioSource) return; // se non c'è, non fa nulla

                                        const { sound } = await Audio.Sound.createAsync(audioSource);
                                        soundRef.current = sound;
                                        await sound.playAsync();
                                    }}
                                    style={styles.playButtonSmall}
                                >
                                    <Ionicons name="volume-high" size={20} color="lightgrey" />
                                </TouchableOpacity>
                            </View>
                        )}

                        {card.languages && card.languages.length > 0 && (
                            <View style={styles.languagesContainer}>
                                {card.languages.map((lang, index) => (
                                    <View key={index} style={styles.languagesRow}>
                                        <Text style={styles.languagesText}>Languages: {lang}</Text>
                                        <TouchableOpacity
                                            onPress={async () => {
                                                if (!lang) return;

                                                if (soundRef.current) {
                                                    await soundRef.current.unloadAsync();
                                                    soundRef.current = null;
                                                }

                                                // genera chiave come name + '_' + synonym
                                                const key = `${card.name}_${lang}`.toLowerCase();
                                                const audioSource = audiosMaps[session.deck.slug]?.[key];
                                                if (!audioSource) return;

                                                const { sound } = await Audio.Sound.createAsync(audioSource);
                                                soundRef.current = sound;
                                                await sound.playAsync();
                                            }}
                                            style={styles.playButtonSmall}
                                        >
                                            <Ionicons name="volume-high" size={20} color="lightgrey" />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </View>
                        )}

                        {card.back_note && (
                            <Text style={styles.backNote}>{card.back_note}</Text>
                        )}
                    </>
                )}
            </View>

            <Button
                title={showBack ? 'Mostra fronte' : 'Mostra retro'}
                onPress={() => setShowBack(!showBack)}
            />

            {
                showBack && (
                    <View style={styles.buttons}>
                        <Button title="Ripeti" onPress={() => handleAnswer('again')} color="#e74c3c" />
                        <Button title="Difficile" onPress={() => handleAnswer('hard')} color="#f39c12" />
                        <Button title="Buono" onPress={() => handleAnswer('good')} color="#27ae60" />
                        <Button title="Facile" onPress={() => handleAnswer('easy')} color="#2ecc71" />
                    </View>
                )
            }
        </View >
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
        width: 350,
        height: 350,
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
        fontSize: 14,
        color: '#333',
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
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
    categoriesContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginTop: 8,
        width: '100%',
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eee',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        marginRight: 6,
        marginBottom: 6,
    },
    categoryText: {
        fontSize: 12,
        color: '#333',
    },
    abbreviationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
    },
    abbreviationText: {
        fontSize: 16,
        color: '#666',
        marginRight: 6,
        fontStyle: 'italic',
    },
    playButtonSmall: {
        padding: 4,
    },
    synonymsContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    synonymRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    synonymText: {
        fontSize: 16,
        color: '#666',
        marginRight: 6,
        fontStyle: 'italic',
    },
    regionFlag: {
        position: 'absolute',
        top: 8,
        right: 8,
        fontSize: 28,
    },
    nationalityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 30,
    },
    nationalityText: {
        fontSize: 16,
        color: '#666',
        marginRight: 6,
        fontStyle: 'italic',
    },
    languagesContainer: {
        marginTop: 20,
        alignItems: 'center',
    },
    languagesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    languagesText: {
        fontSize: 16,
        color: '#666',
        marginRight: 6,
        fontStyle: 'italic',
    },
    backNote: {
        fontSize: 14,
        color: '#444',
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
});
