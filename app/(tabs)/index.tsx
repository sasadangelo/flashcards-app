import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Button, ScrollView, StyleSheet, Text, View } from 'react-native';

import { Deck } from '../../models/Deck';
import { ConfigManager } from '../../utils/ConfigManager';
import { ProgressTracker } from '../../utils/ProgressTracker';

import deckData1 from '../data/decks/most-frequent-100/deck.json';
import deckData2 from '../data/decks/next-100-essential/deck.json';

type DeckCounts = {
  newCount: number;
  reviewCount: number;
};

export default function HomeScreen() {
  const router = useRouter();

  // Creo i due deck statici
  const decks = [
    new Deck(deckData1),
    new Deck(deckData2)
  ];

  // Prendo il nome del gruppo dal primo deck (tutti sono nello stesso gruppo)
  const groupName = decks[0].group;

  const [counts, setCounts] = useState<Record<string, DeckCounts>>({});

  const loadCounts = async () => {
    const config = await ConfigManager.getConfig();

    const newDone = await ProgressTracker.getNewCardsStudiedToday();
    const reviewDone = await ProgressTracker.getReviewCardsStudiedToday();

    // Qui tengo traccia di quante carte rimangono da assegnare
    let remainingNew = Math.max(0, config.dailyLimit - newDone);
    let remainingReview = Math.max(0, config.reviewLimit - reviewDone);

    const countsTemp: Record<string, DeckCounts> = {};

    for (const deck of decks) {
      const newCards = await deck.getNewCards(remainingNew);
      const reviewCards = await deck.getReviewCards(remainingReview);

      countsTemp[deck.name] = {
        newCount: newCards.length,
        reviewCount: reviewCards.length,
      };

      // Aggiorno le carte residue
      remainingNew -= newCards.length;
      remainingReview -= reviewCards.length;
    }

    setCounts(countsTemp);
  };

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [])
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.groupTitle}>{groupName}</Text>

      {decks.map((deck) => (
        <View key={deck.name} style={styles.deckRow}>
          <Text style={styles.deckName}>{deck.name}</Text>

          <View style={styles.buttonsRow}>
            <Button
              title={`🆕 ${counts[deck.name]?.newCount ?? 0}`}
              onPress={() =>
                router.push(`/study?mode=new&deck=${encodeURIComponent(deck.name)}`)
              }
              disabled={!counts[deck.name] || counts[deck.name].newCount === 0}
              color="#3498db"
            />
            <Button
              title={`🔁 ${counts[deck.name]?.reviewCount ?? 0}`}
              onPress={() =>
                router.push(`/study?mode=review&deck=${encodeURIComponent(deck.name)}`)
              }
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
