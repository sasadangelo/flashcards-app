import { Card } from './Card';

export class SRS {
    async handleAnswer(card: Card, difficulty: 'again' | 'hard' | 'good' | 'easy') {
        await card.setReviewResult(difficulty);
    }
}