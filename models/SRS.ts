import AsyncStorage from '@react-native-async-storage/async-storage';
import { Clock } from '../utils/Clock';
import log from '../utils/logger';
import { Card } from './Card';

type Difficulty = 'again' | 'hard' | 'good' | 'easy';

const difficultyMap: Record<Difficulty, number> = {
    again: 0,
    hard: 3,
    good: 4,
    easy: 5,
};

const logger = log.extend('SRS');

export class SRS {
    // Ottieni la base della chiave per una card
    getKeyBase(card: Card): string {
        return `card_${card.name}`;
    }

    // Metodo principale per gestire la risposta (aggiorna reps, ease, interval, nextReview)
    async handleAnswer(card: Card, difficulty: Difficulty) {
        const now = new Date();
        const keyBase = this.getKeyBase(card);

        // Leggi dati correnti dalla card tramite il metodo dedicato
        const { reps, interval, easeFactor } = await card.getReviewData();

        const quality = difficultyMap[difficulty];

        let newReps = reps;
        let newEase = easeFactor;
        let newInterval = interval;

        if (quality < 3) {
            // Se la qualità è bassa, resetta il conteggio ripetizioni e imposta intervallo a 1
            newReps = 0;
            newInterval = 1;
        } else {
            newReps += 1;
            // Calcola nuovo ease factor basato sulla formula SM-2
            newEase = Math.max(
                1.3,
                easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)
            );

            if (newReps === 1) {
                newInterval = 1;
            } else if (newReps === 2) {
                newInterval = 6;
            } else {
                newInterval = Math.round(interval * newEase);
            }
        }

        // Calcola la data del prossimo review
        const today = Clock.today();
        const nextDate = Clock.today();
        nextDate.setDate(nextDate.getDate() + newInterval);

        // Ottieni anno, mese, giorno
        const year = nextDate.getFullYear();
        const month = (nextDate.getMonth() + 1).toString().padStart(2, '0');
        const day = nextDate.getDate().toString().padStart(2, '0');

        // Ora fissa a mezzanotte (00:00:00)
        const hours = '00';
        const minutes = '00';
        const seconds = '00';

        // Costruisci la stringa completa con ora
        const nextDateStr = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

        logger.debug('[SRS:handleAnswer] SRS today: ', today)
        logger.debug('[SRS:handleAnswer] SRS new interval: ', newInterval)
        logger.debug('[SRS:handleAnswer] SRS next date: ', nextDateStr)

        // Salva tutti i dati in AsyncStorage in modo atomico
        await AsyncStorage.multiSet([
            [`${keyBase}_reps`, newReps.toString()],
            [`${keyBase}_interval`, newInterval.toString()],
            [`${keyBase}_ease`, newEase.toFixed(4)],
            [`${keyBase}_nextReview`, nextDateStr],
            [`${keyBase}_difficulty`, difficulty],
        ]);

        logger.debug(
            `[SRS:handleAnswer] ${card.name} → reps: ${newReps}, ease: ${newEase}, next: ${nextDateStr}`
        );
    }
}
