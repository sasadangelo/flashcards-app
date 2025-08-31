import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Deck } from '../../models/Deck';
import { ConfigManager } from '../../utils/ConfigManager';
import { ProgressTracker } from '../../utils/ProgressTracker';

import deckData5 from '../data/decks/fifth-350-essential/deck.json';
import deckData4 from '../data/decks/fourth-350-essential/deck.json';
import deckData1 from '../data/decks/most-frequent-100/deck.json';
import deckData2 from '../data/decks/next-100-essential/deck.json';
import deckData3 from '../data/decks/third-100-essential/deck.json';

import { StudySessionManager } from '../../models/StudySessionManager';
import { useStudySession } from '../contexts/StudySessionContext';

type DeckCounts = {
  newCount: number;
  reviewCount: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const { manager, setManager, setCurrentSession } = useStudySession();

  // Initialize decks
  const decks = [new Deck(deckData1), new Deck(deckData2), new Deck(deckData3), new Deck(deckData4), new Deck(deckData5)];
  const groupName = decks[0].group;

  const [counts, setCounts] = useState<Record<string, DeckCounts>>({});

  const loadCounts = async () => {
    console.log('Loading counts...');
    const config = await ConfigManager.getConfig();
    console.log('Config:', config);

    const newDone = await ProgressTracker.getNewCardsStudiedToday();
    const reviewDone = await ProgressTracker.getReviewCardsStudiedToday();

    console.log('New cards studied today:', newDone);
    console.log('Review cards studied today:', reviewDone);

    let remainingNew = Math.max(0, config.dailyLimit - newDone);
    let remainingReview = Math.max(0, config.reviewLimit - reviewDone);

    console.log('Remaining new:', remainingNew, 'Remaining review:', remainingReview);

    const newManager = new StudySessionManager(decks, {
      dailyLimit: remainingNew,
      reviewLimit: remainingReview,
    });

    await newManager.loadAllSessions();

    setManager(newManager);

    const countsTemp: Record<string, DeckCounts> = {};

    for (const deck of decks) {
      const sessions = newManager.getSessions().filter(s => s.deck.name === deck.name);
      const newCount = sessions
        .filter(s => s.mode === 'new')
        .reduce((acc, s) => acc + s.cardsToStudy.length, 0);

      const reviewCount = sessions
        .filter(s => s.mode === 'review')
        .reduce((acc, s) => acc + s.cardsToStudy.length, 0);

      countsTemp[deck.name] = { newCount, reviewCount };

      console.log(`Deck ${deck.name} - New: ${newCount}, Review: ${reviewCount}`);
    }

    setCounts(countsTemp);
  };

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [])
  );

  const handleStartSession = (deckName: string, mode: 'new' | 'review') => {
    if (!manager) {
      console.warn('No manager available');
      return;
    }

    const session = manager.getSessions().find(
      s => s.deck.name === deckName && s.mode === mode
    );

    if (session) {
      console.log(`Starting session for deck ${deckName}, mode ${mode}`);
      setCurrentSession(session);
      router.push('/study');
    } else {
      console.warn(`No session found for deck ${deckName} mode ${mode}`);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.groupTitle}>{groupName}</Text>

      {decks.map((deck) => (
        <View key={deck.name} style={styles.deckRow}>
          <Text style={styles.deckName}>{deck.name}</Text>

          <View style={styles.buttonsRow}>
            <Button
              title={`🆕 ${counts[deck.name]?.newCount ?? 0}`}
              onPress={() => handleStartSession(deck.name, 'new')}
              disabled={!counts[deck.name] || counts[deck.name].newCount === 0}
              color="#3498db"
            />
            <Button
              title={`🔁 ${counts[deck.name]?.reviewCount ?? 0}`}
              onPress={() => handleStartSession(deck.name, 'review')}
              disabled={!counts[deck.name] || counts[deck.name].reviewCount === 0}
              color="#2ecc71"
            />
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  groupTitle: {
    fontSize: 24,
    marginBottom: 20,
    fontWeight: 'bold',
  },
  deckRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  deckName: {
    fontSize: 20,
    flex: 1,
    paddingLeft: 20,
    marginRight: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
});
