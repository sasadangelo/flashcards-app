// models/Stats.ts

import { Clock } from '../utils/Clock';
import { Card } from './Card';

const SHORT_TERM_DAYS = 3;
const MEDIUM_TERM_DAYS = 7;
const LONG_TERM_DAYS = 90;

const LEVELS = [
    { level: "pre-A1", min: 0, max: 499, steps: [{ min: 0, max: 99 }, { min: 100, max: 199 }, { min: 200, max: 299 }, { min: 300, max: 399 }, { min: 400, max: 499 }] },
    { level: "A1", min: 500, max: 999, steps: [{ min: 500, max: 599 }, { min: 600, max: 699 }, { min: 700, max: 799 }, { min: 800, max: 899 }, { min: 900, max: 999 }] }, // A1.0 = 500
    { level: "A2", min: 1000, max: 1499, steps: [{ min: 1000, max: 1099 }, { min: 1100, max: 1199 }, { min: 1200, max: 1299 }, { min: 1300, max: 1399 }, { min: 1400, max: 1499 }] },
    { level: "B1", min: 1500, max: 2499, steps: [{ min: 1500, max: 1799 }, { min: 1800, max: 1999 }, { min: 2000, max: 2199 }, { min: 2200, max: 2399 }, { min: 2400, max: 2499 }] },
    { level: "B2", min: 2500, max: 3999, steps: [{ min: 2500, max: 2799 }, { min: 2800, max: 3099 }, { min: 3100, max: 3399 }, { min: 3400, max: 3699 }, { min: 3700, max: 3999 }] },
    { level: "C1", min: 4000, max: 5999, steps: [{ min: 4000, max: 4399 }, { min: 4400, max: 4799 }, { min: 4800, max: 5199 }, { min: 5200, max: 5599 }, { min: 5600, max: 5999 }] },
    { level: "C2", min: 500, max: 7999, steps: [{ min: 6000, max: 6399 }, { min: 6400, max: 6799 }, { min: 6800, max: 7199 }, { min: 7200, max: 7599 }, { min: 7600, max: 7999 }] },
];

export class Stats {
    studied: number;     // tutte le carte viste almeno una volta
    short: number;       // carte con review < 7 giorni
    medium: number;      // carte con review 7-90 giorni
    long: number;        // carte con review > 90 giorni

    constructor(
        studied: number,
        short: number,
        medium: number,
        long: number
    ) {
        this.studied = studied;
        this.short = short;
        this.medium = medium;
        this.long = long;
    }

    /**
     * Calcola statistiche da una lista di card
     */
    static async fromCards(cards: Card[]): Promise<Stats> {
        const today = Clock.today();
        let studied = 0;
        let short = 0;
        let medium = 0;
        let long = 0;

        for (const card of cards) {
            const { nextReview } = await card.getReviewData();

            // Se la carta è stata studiata almeno una volta
            studied++;

            if (!nextReview) {
                // Carta nuova -> conta solo come studied
                continue;
            }

            const diffDays = Math.ceil(
                (nextReview.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (diffDays < SHORT_TERM_DAYS) {
                // troppo recente → solo studied
                continue;
            } else if (diffDays < MEDIUM_TERM_DAYS) {
                short++;
            } else if (diffDays < LONG_TERM_DAYS) {
                medium++;
            } else {
                long++;
            }
        }

        return new Stats(studied, short, medium, long);
    }

    computeScore(): number {
        const score =
            (this.studied - this.short - this.medium - this.long) * 0.05 +
            this.short * 0.20 +
            this.medium * 0.40 +
            this.long * 1.00;
        console.log("Studied=", this.studied)
        console.log("Short=", this.short)
        console.log("Medium=", this.medium)
        console.log("long=", this.long)
        console.log("Score=", score)

        return Math.floor(score); // intero, più semplice per confronti
    }

    computeLevel(): { level: string; progress: number } {
        const score = this.computeScore();
        console.log("Score=", score);

        for (const lvl of LEVELS) {
            if (score < lvl.min || score > lvl.max) continue;
            console.log("Found Level=", lvl.level);

            for (let i = 0; i < lvl.steps.length; i++) {
                const step = lvl.steps[i];
                if (score >= step.min && score <= step.max) {
                    // livello completo tipo "pre-A1.4"
                    const displayLevel = i === 0 ? lvl.level : `${lvl.level}.${i}`;
                    // progress normalizzato tra 0 e 1 all’interno dello step
                    const progress = (score - step.min) / (step.max - step.min);
                    console.log("Step=", i, "DisplayLevel=", displayLevel, "Progress=", progress);
                    return { level: displayLevel, progress };
                }
            }
        }

        // se supera l’ultimo livello
        const lastLvl = LEVELS[LEVELS.length - 1];
        const lastStep = lastLvl.steps[lastLvl.steps.length - 1];
        return { level: `${lastLvl.level}.${lastLvl.steps.length - 1}`, progress: 1 };
    }
}
