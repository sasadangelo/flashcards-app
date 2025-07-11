import { ConfigManager } from './ConfigManager';

export class Clock {
    static today(): Date {
        return ConfigManager.getMockDate();
    }

    static now(): Date {
        return new Date();
    }
}