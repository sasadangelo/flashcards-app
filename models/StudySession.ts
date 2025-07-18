import { ConfigManager } from '../utils/ConfigManager';
import log from '../utils/logger';
import { ProgressTracker } from '../utils/ProgressTracker';
import { Card } from './Card';
import { Deck } from './Deck';
import { SRS } from './SRS';

const logger = log.extend('StudySession');

export class StudySession {
    deck: Deck;
    mode: 'new' | 'review';

    cardsToStudy: Card[] = [];
    currentIndex = 0;
    srs = new SRS();

    constructor(deck: Deck, mode: 'new' | 'review') {
        this.deck = deck;
        this.mode = mode;
        logger.debug(`Created session for deck "${deck.name}" in mode "${mode}"`);
    }


    async load() {
        logger.debug(`Loading cards for mode "${this.mode}"`);
        const config = await ConfigManager.getConfig();

        if (this.mode === 'review') {
            const alreadyStudied = await ProgressTracker.getReviewCardsStudiedToday();
            const remaining = Math.max(0, config.reviewLimit - alreadyStudied);
            logger.debug(`Already studied ${alreadyStudied} review cards. Remaining: ${remaining}`);
            this.cardsToStudy = remaining > 0 ? await this.deck.getReviewCards(remaining) : [];
        } else {
            const alreadyStudied = await ProgressTracker.getNewCardsStudiedToday();
            const remaining = Math.max(0, config.dailyLimit - alreadyStudied);
            logger.debug(`Already studied ${alreadyStudied} new cards. Remaining: ${remaining}`);
            this.cardsToStudy = remaining > 0 ? await this.deck.getNewCards(remaining) : [];
        }

        // Applica shuffle se la configurazione lo richiede
        if (config.cardOrder === 'random') {
            logger.debug('Shuffling cards due to config.cardOrder = "random"');
            this.shuffle(this.cardsToStudy);
        }

        logger.debug(`Loaded ${this.cardsToStudy.length} cards`);
        this.currentIndex = 0;
    }

    get currentCard(): Card | null {
        return this.cardsToStudy[this.currentIndex] ?? null;
    }

    async answer(difficulty: 'again' | 'hard' | 'good' | 'easy') {
        const card = this.currentCard;
        if (!card) {
            logger.warn('Tried to answer with no current card');
            return;
        }

        logger.debug(`Answering card "${card.name}" with difficulty "${difficulty}"`);
        await this.srs.handleAnswer(card, difficulty);


        if (difficulty === 'again') {
            // Sposta la carta corrente in fondo all'array
            this.cardsToStudy.splice(this.currentIndex, 1); // rimuovi carta corrente
            this.cardsToStudy.push(card); // aggiungi in fondo
            logger.debug(`Card "${card.name}" moved to end of queue (answered "again")`);

            // Nota: currentIndex rimane invariato perché la carta successiva ora è all'indice corrente
            if (this.currentIndex >= this.cardsToStudy.length) {
                this.currentIndex = 0;
                logger.debug('Resetting currentIndex to 0');
            }
            return;
        }

        // Incrementa solo se la risposta non è "again"
        if (this.mode === 'new') {
            await ProgressTracker.incrementNewCardsStudied();
            logger.debug('Incremented new cards studied');
        } else {
            await ProgressTracker.incrementReviewCardsStudied();
            logger.debug('Incremented review cards studied');
        }

        // Rimuove la carta appena studiata dall'elenco
        this.cardsToStudy.splice(this.currentIndex, 1);
        logger.debug(`Removed card "${card.name}" from queue`);

        // Aggiorna l'indice corrente
        if (this.currentIndex >= this.cardsToStudy.length) {
            this.currentIndex = 0;
            logger.debug('Resetting currentIndex to 0');
        }
    }

    next() {
        if (this.currentIndex < this.cardsToStudy.length - 1) {
            this.currentIndex++;
            logger.debug(`Moved to next card. currentIndex=${this.currentIndex}`);
        }
    }

    prev() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            logger.debug(`Moved to previous card. currentIndex=${this.currentIndex}`);
        }
    }

    get isDone(): boolean {
        const done = this.cardsToStudy.length === 0;
        if (done) {
            logger.debug('Study session is done');
        }
        return done;
    }

    private shuffle<T>(array: T[]): T[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        logger.debug('Cards shuffled');
        return array;
    }
}
