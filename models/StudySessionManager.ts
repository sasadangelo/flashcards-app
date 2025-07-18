import log from '../utils/logger';
import { Deck } from './Deck';
import { StudySession } from './StudySession';

interface Config {
    dailyLimit: number;  // max nuove carte totali
    reviewLimit: number; // max ripasso carte totali
}

const logger = log.extend('StudySessionManager');

export class StudySessionManager {
    private decks: Deck[];
    private config: Config;
    private sessions: StudySession[] = [];
    private currentSession: StudySession | null = null;

    constructor(decks: Deck[], config: Config) {
        this.decks = decks;
        this.config = config;
        logger.debug(`Initialized with ${decks.length} decks, config: dailyLimit=${config.dailyLimit}, reviewLimit=${config.reviewLimit}`);
    }

    // Carica le StudySession in base a limiti daily e review e ai deck in ordine
    async loadAllSessions() {
        logger.debug('Starting loadAllSessions');
        this.sessions = [];

        let remainingNew = this.config.dailyLimit;
        let remainingReview = this.config.reviewLimit;

        for (const deck of this.decks) {
            logger.debug(`Processing deck "${deck.name}"`);
            // New cards
            if (remainingNew > 0) {
                const newSession = new StudySession(deck, 'new');
                await newSession.load();
                // Prendo solo le carte necessarie (limite residuo)
                newSession.cardsToStudy = newSession.cardsToStudy.slice(0, remainingNew);
                logger.debug(`Loaded new cards for deck "${deck.name}": ${newSession.cardsToStudy.length}, remainingNew before: ${remainingNew}`);

                if (newSession.cardsToStudy.length > 0) {
                    this.sessions.push(newSession);
                    remainingNew -= newSession.cardsToStudy.length;
                    logger.debug(`Remaining new cards to load after deck "${deck.name}": ${remainingNew}`);
                }
            }

            // Review cards
            if (remainingReview > 0) {
                const reviewSession = new StudySession(deck, 'review');
                await reviewSession.load();
                reviewSession.cardsToStudy = reviewSession.cardsToStudy.slice(0, remainingReview);
                logger.debug(`Loaded review cards for deck "${deck.name}": ${reviewSession.cardsToStudy.length}, remainingReview before: ${remainingReview}`);

                if (reviewSession.cardsToStudy.length > 0) {
                    this.sessions.push(reviewSession);
                    remainingReview -= reviewSession.cardsToStudy.length;
                    logger.debug(`Remaining review cards to load after deck "${deck.name}": ${remainingReview}`);
                }
            }

            // Se ho finito entrambi i limiti, esco
            if (remainingNew <= 0 && remainingReview <= 0) {
                logger.debug('Reached limits for new and review cards, stopping load');
                break;
            }
            logger.debug(`Finished loading sessions: total sessions loaded = ${this.sessions.length}`);
        }
    }

    // Ritorna tutte le sessioni caricate
    getSessions(): StudySession[] {
        logger.debug(`Returning ${this.sessions.length} loaded sessions`);
        return this.sessions;
    }

    // Seleziona una sessione (per deck e mode)
    selectSession(deckName: string, mode: 'new' | 'review'): boolean {
        const session = this.sessions.find(
            s => s.deck.name === deckName && s.mode === mode
        );
        if (!session) {
            logger.warn(`Session not found for deck "${deckName}" in mode "${mode}"`);
            return false;
        }

        this.currentSession = session;
        logger.debug(`Selected session for deck "${deckName}" in mode "${mode}"`);
        return true;
    }

    // Ritorna la sessione selezionata (o null)
    getCurrentSession(): StudySession | null {
        logger.debug(`Returning current session: ${this.currentSession ? `${this.currentSession.deck.name} (${this.currentSession.mode})` : 'null'}`);
        return this.currentSession;
    }
}
