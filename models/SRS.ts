import AsyncStorage from '@react-native-async-storage/async-storage';
import { Card } from './Card';

type Difficulty = 'again' | 'hard' | 'good' | 'easy';

const difficultyMap: Record<Difficulty, number> = {
    again: 0,
    hard: 3,
    good: 4,
    easy: 5,
};

export class SRS {
    async handleAnswer(card: Card, difficulty: Difficulty) {
        const now = new Date();

        const keyBase = `card_${card.name}`;
        const reps = parseInt((await AsyncStorage.getItem(`${keyBase}_reps`)) || '0');
        const interval = parseInt((await AsyncStorage.getItem(`${keyBase}_interval`)) || '0');
        const easeFactor = parseFloat((await AsyncStorage.getItem(`${keyBase}_ease`)) || '2.5');

        const quality = difficultyMap[difficulty];

        let newReps = reps;
        let newEase = easeFactor;
        let newInterval = interval;

        if (quality < 3) {
            newReps = 0;
            newInterval = 1;
        } else {
            newReps += 1;
            newEase = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

            if (newReps === 1) {
                newInterval = 1;
            } else if (newReps === 2) {
                newInterval = 6;
            } else {
                newInterval = Math.round(interval * newEase);
            }
        }

        const nextDate = new Date();
        nextDate.setDate(now.getDate() + newInterval);

        // Save updated values
        await AsyncStorage.multiSet([
            [`${keyBase}_reps`, newReps.toString()],
            [`${keyBase}_interval`, newInterval.toString()],
            [`${keyBase}_ease`, newEase.toFixed(4)],
            [`${keyBase}_nextReview`, nextDate.toISOString()],
            [`${keyBase}_difficulty`, difficulty]
        ]);

        console.log(`${card.name} → reps: ${newReps}, ease: ${newEase}, next: ${nextDate.toISOString()}`);
    }
}
