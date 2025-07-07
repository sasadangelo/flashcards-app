import { audioMap } from '@/utils/audioMap';
import { imageMap } from '@/utils/imageMap';
import { Audio } from 'expo-av';
import React, { useEffect, useRef, useState } from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Deck } from '../../models/Deck';
import { StudySession } from '../../models/StudySession';

export default function StudyScreen() {
    const [session, setSession] = useState<StudySession | null>(null);
    const [showBack, setShowBack] = useState(false);
    const [hasStarted, setHasStarted] = useState(false);
    const soundRef = useRef<Audio.Sound | null>(null);

    useEffect(() => {
        const setup = async () => {
            const deck = new Deck(); // Carica deck.json
            const studySession = new StudySession(deck);
            await studySession.load();
            setSession(studySession);
            setHasStarted(true);
        };

        setup();

        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    useEffect(() => {
        if (showBack) {
            playSound();
        } else {
            if (soundRef.current) {
                soundRef.current.stopAsync();
            }
        }
    }, [showBack]);

    const playSound = async () => {
        const card = session?.currentCard;
        if (!card) return;

        if (soundRef.current) {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
        }

        const { sound } = await Audio.Sound.createAsync(audioMap[card.name]);
        soundRef.current = sound;
        await sound.playAsync();
    };

    const handleAnswer = async (difficulty: 'again' | 'hard' | 'good' | 'easy') => {
        if (!session) return;

        await session.answer(difficulty);
        setShowBack(false);

        if (session.isDone) {
            setSession(null);
        } else {
            // Non ricreare una nuova sessione, aggiorna semplicemente lo state con la stessa istanza aggiornata
            setSession(session);
        }
    };
    if (!session || !session.currentCard) {
        return (
            <View style={styles.container}>
                <Text style={styles.word}>
                    {hasStarted ? '🎉 Hai completato tutte le carte di oggi!' : '🎉 Non ci sono carte da studiare oggi!'}
                </Text>
            </View>
        );
    }

    const card = session.currentCard;

    return (
        <View style={styles.container}>
            <Text style={styles.counter}>{session.currentIndex + 1} / {session.cardsToStudy.length}</Text>
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
            <Button title={showBack ? 'Show Front' : 'Show Back'} onPress={() => setShowBack(!showBack)} />
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
    playButton: { marginTop: 10 },
    buttons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
        width: '90%',
    },
    counter: { marginBottom: 10, fontSize: 18 },
});
