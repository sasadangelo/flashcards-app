import { ConfigManager } from '../utils/ConfigManager';
import { ProgressTracker } from '../utils/ProgressTracker';
import { Card } from './Card';
import { Deck } from './Deck';
import { SRS } from './SRS';

export class StudySession {
    deck: Deck;
    mode: 'new' | 'review';

    cardsToStudy: Card[] = [];
    currentIndex = 0;
    srs = new SRS();

    constructor(deck: Deck, mode: 'new' | 'review') {
        this.deck = deck;
        this.mode = mode;
    }


    async load() {
        const config = await ConfigManager.getConfig();

        if (this.mode === 'review') {
            const alreadyStudied = await ProgressTracker.getReviewCardsStudiedToday();
            const remaining = Math.max(0, config.reviewLimit - alreadyStudied);
            this.cardsToStudy = remaining > 0 ? await this.deck.getReviewCards(remaining) : [];
        } else {
            const alreadyStudied = await ProgressTracker.getNewCardsStudiedToday();
            const remaining = Math.max(0, config.dailyLimit - alreadyStudied);
            this.cardsToStudy = remaining > 0 ? await this.deck.getNewCards(remaining) : [];
        }

        // Applica shuffle se la configurazione lo richiede
        if (config.cardOrder === 'random') {
            this.shuffle(this.cardsToStudy);
        }

        this.currentIndex = 0;
    }

    get currentCard(): Card | null {
        return this.cardsToStudy[this.currentIndex] ?? null;
    }

    async answer(difficulty: 'again' | 'hard' | 'good' | 'easy') {
        const card = this.currentCard;
        if (!card) return;

        await this.srs.handleAnswer(card, difficulty);


        if (difficulty === 'again') {
            // Sposta la carta corrente in fondo all'array
            this.cardsToStudy.splice(this.currentIndex, 1); // rimuovi carta corrente
            this.cardsToStudy.push(card); // aggiungi in fondo

            // Nota: currentIndex rimane invariato perché la carta successiva ora è all'indice corrente
            if (this.currentIndex >= this.cardsToStudy.length) {
                this.currentIndex = 0;
            }
            return;
        }

        // Incrementa solo se la risposta non è "again"
        if (this.mode === 'new') {
            await ProgressTracker.incrementNewCardsStudied();
        } else {
            await ProgressTracker.incrementReviewCardsStudied();
        }

        // Rimuove la carta appena studiata dall'elenco
        this.cardsToStudy.splice(this.currentIndex, 1);

        // Aggiorna l'indice corrente
        if (this.currentIndex >= this.cardsToStudy.length) {
            this.currentIndex = 0;
        }
    }

    next() {
        if (this.currentIndex < this.cardsToStudy.length - 1) {
            this.currentIndex++;
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
        }
    }

    get isDone(): boolean {
        return this.cardsToStudy.length === 0;
    }

    private shuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
}
