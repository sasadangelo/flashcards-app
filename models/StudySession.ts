import { Card } from './Card';
import { Deck } from './Deck';

export class StudySession {
    deck: Deck;
    cardsToStudy: Card[] = [];
    currentIndex: number = 0;

    constructor(deck: Deck) {
        this.deck = deck;
    }

    async load() {
        this.cardsToStudy = await this.deck.getCardsToStudy();
    }

    get currentCard(): Card | null {
        return this.cardsToStudy[this.currentIndex] ?? null;
    }

    async answer(difficulty: 'again' | 'hard' | 'good' | 'easy') {
        const card = this.currentCard;
        if (!card) return;

        await card.setReviewResult(difficulty);

        this.cardsToStudy = await this.deck.getCardsToStudy();
        this.currentIndex = 0;
    }

    get isDone(): boolean {
        return this.cardsToStudy.length === 0;
    }
}
