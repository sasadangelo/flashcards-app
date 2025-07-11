import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';
import { Deck } from '../../models/Deck';
import { ConfigManager } from '../../utils/ConfigManager';
import { ProgressTracker } from '../../utils/ProgressTracker';

export default function HomeScreen() {
  const router = useRouter();

  const [newCount, setNewCount] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);

  const loadCounts = async () => {
    const deck = new Deck();
    const config = await ConfigManager.getConfig();

    const newDone = await ProgressTracker.getNewCardsStudiedToday();
    const reviewDone = await ProgressTracker.getReviewCardsStudiedToday();

    const remainingNew = Math.max(0, config.dailyLimit - newDone);
    const remainingReview = Math.max(0, config.reviewLimit - reviewDone);

    const newCards = await deck.getNewCards(remainingNew);
    const reviewCards = await deck.getReviewCards(remainingReview);

    setNewCount(newCards.length);
    setReviewCount(reviewCards.length);
  };

  useFocusEffect(
    useCallback(() => {
      loadCounts();
    }, [])
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📚 English Flashcards - 100 Most Frequent Words</Text>

      <View style={styles.buttonsRow}>
        <View style={styles.buttonWrapper}>
          <Button
            title={`🆕 ${newCount}`}
            onPress={() => router.push('/study?mode=new')}
            disabled={newCount === 0}
            color="#3498db"
          />
        </View>

        <View style={styles.buttonWrapper}>
          <Button
            title={`🔁 ${reviewCount}`}
            onPress={() => router.push('/study?mode=review')}
            disabled={reviewCount === 0}
            color="#2ecc71"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, marginBottom: 20, textAlign: 'center' },
  buttonsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  buttonWrapper: {
    marginHorizontal: 10,
  },
});
