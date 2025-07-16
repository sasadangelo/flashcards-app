import { Deck } from './Deck';
import { StudySession } from './StudySession';

interface Config {
    dailyLimit: number;  // max nuove carte totali
    reviewLimit: number; // max ripasso carte totali
}

export class StudySessionManager {
    private decks: Deck[];
    private config: Config;
    private sessions: StudySession[] = [];
    private currentSession: StudySession | null = null;

    constructor(decks: Deck[], config: Config) {
        this.decks = decks;
        this.config = config;
    }

    // Carica le StudySession in base a limiti daily e review e ai deck in ordine
    async loadAllSessions() {
        this.sessions = [];

        let remainingNew = this.config.dailyLimit;
        let remainingReview = this.config.reviewLimit;

        for (const deck of this.decks) {
            // New cards
            if (remainingNew > 0) {
                const newSession = new StudySession(deck, 'new');
                await newSession.load();
                // Prendo solo le carte necessarie (limite residuo)
                newSession.cardsToStudy = newSession.cardsToStudy.slice(0, remainingNew);

                if (newSession.cardsToStudy.length > 0) {
                    this.sessions.push(newSession);
                    remainingNew -= newSession.cardsToStudy.length;
                }
            }

            // Review cards
            if (remainingReview > 0) {
                const reviewSession = new StudySession(deck, 'review');
                await reviewSession.load();
                reviewSession.cardsToStudy = reviewSession.cardsToStudy.slice(0, remainingReview);

                if (reviewSession.cardsToStudy.length > 0) {
                    this.sessions.push(reviewSession);
                    remainingReview -= reviewSession.cardsToStudy.length;
                }
            }

            // Se ho finito entrambi i limiti, esco
            if (remainingNew <= 0 && remainingReview <= 0) {
                break;
            }
        }
    }

    // Ritorna tutte le sessioni caricate
    getSessions(): StudySession[] {
        return this.sessions;
    }

    // Seleziona una sessione (per deck e mode)
    selectSession(deckName: string, mode: 'new' | 'review'): boolean {
        const session = this.sessions.find(
            s => s.deck.name === deckName && s.mode === mode
        );
        if (!session) return false;

        this.currentSession = session;
        return true;
    }

    // Ritorna la sessione selezionata (o null)
    getCurrentSession(): StudySession | null {
        return this.currentSession;
    }
}
