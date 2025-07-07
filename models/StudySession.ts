import { Card } from './Card';
import { Deck } from './Deck';
import { SRS } from './SRS';

export class StudySession {
    deck: Deck;
    cardsToStudy: Card[] = [];
    currentIndex: number = 0;
    srs: SRS;

    constructor(deck: Deck) {
        this.deck = deck;
        this.srs = new SRS();
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

        await this.srs.handleAnswer(card, difficulty);

        this.cardsToStudy = await this.deck.getCardsToStudy();
        this.currentIndex = 0;
    }

    get isDone(): boolean {
        return this.cardsToStudy.length === 0;
    }
}
