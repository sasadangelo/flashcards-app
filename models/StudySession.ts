import { ConfigManager } from '../utils/ConfigManager';
import { Card } from './Card';
import { Deck } from './Deck';
import { SRS } from './SRS';

export class StudySession {
    deck: Deck;
    reviewCardsToStudy: Card[] = [];
    newCardsToStudy: Card[] = [];
    currentIndex = 0;
    currentList: 'review' | 'new' = 'review';
    srs = new SRS();

    constructor(deck: Deck) {
        this.deck = deck;
    }

    async load() {
        const config = await ConfigManager.getConfig();

        this.reviewCardsToStudy = await this.deck.getReviewCards(config.reviewLimit);
        this.newCardsToStudy = await this.deck.getNewCards(config.dailyLimit);

        this.currentIndex = 0;
        this.currentList = this.reviewCardsToStudy.length > 0 ? 'review' : 'new';
    }

    get currentCard(): Card | null {
        const list = this.currentList === 'review' ? this.reviewCardsToStudy : this.newCardsToStudy;
        return list[this.currentIndex] ?? null;
    }

    get currentType(): 'review' | 'new' | null {
        return this.currentCard ? this.currentList : null;
    }

    async answer(difficulty: 'again' | 'hard' | 'good' | 'easy') {
        const list = this.currentList === 'review' ? this.reviewCardsToStudy : this.newCardsToStudy;
        const card = list[this.currentIndex];
        if (!card) return;

        await this.srs.handleAnswer(card, difficulty);

        // Rimuovi la carta appena studiata
        list.splice(this.currentIndex, 1);

        // Se siamo alla fine della lista, passa all’altra lista se possibile
        if (this.currentIndex >= list.length) {
            if (this.currentList === 'review' && this.newCardsToStudy.length > 0) {
                this.currentList = 'new';
                this.currentIndex = 0;
            } else {
                this.currentIndex = 0; // Reset indice se non ci sono più carte
            }
        }
    }

    next() {
        const list = this.currentList === 'review' ? this.reviewCardsToStudy : this.newCardsToStudy;
        if (this.currentIndex < list.length - 1) {
            this.currentIndex++;
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        }
    }

    get isDone(): boolean {
        return this.reviewCardsToStudy.length === 0 && this.newCardsToStudy.length === 0;
    }

    getTotalCount(): number {
        return this.reviewCardsToStudy.length + this.newCardsToStudy.length;
    }
}
