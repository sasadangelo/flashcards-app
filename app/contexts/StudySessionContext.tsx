// app/contexts/StudySessionContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { StudySession } from '../../models/StudySession';
import { StudySessionManager } from '../../models/StudySessionManager';
import { useDecks } from './DeckContext';

interface StudySessionContextType {
    manager: StudySessionManager | null;
    setManager: (manager: StudySessionManager) => void;
    currentSession: StudySession | null;
    setCurrentSession: (session: StudySession | null) => void;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

export const StudySessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const decks = useDecks(); // Prendiamo i deck già caricati dal DeckContext
    const [manager, setManager] = useState<StudySessionManager | null>(null);
    const [currentSession, setCurrentSession] = useState<StudySession | null>(null);

    // Creazione automatica del manager quando i deck sono disponibili
    useEffect(() => {
        if (!manager && decks.length > 0) {
            console.log('StudySessionProvider: initializing manager with decks:', decks.map(d => d.name));

            const newManager = new StudySessionManager(decks, {
                dailyLimit: 20,   // esempio: limite carte nuove giornaliere
                reviewLimit: 30,  // esempio: limite carte da ripasso giornaliere
            });

            // Carichiamo subito tutte le sessioni
            newManager.loadAllSessions().then(() => {
                console.log('StudySessionProvider: sessions loaded', newManager.getSessions().length);
                setManager(newManager);
            });
        }
    }, [decks, manager]);

    useEffect(() => {
        console.log('StudySessionProvider: manager changed:', manager);
    }, [manager]);

    useEffect(() => {
        console.log('StudySessionProvider: currentSession changed:', currentSession);
    }, [currentSession]);

    return (
        <StudySessionContext.Provider value={{ manager, setManager, currentSession, setCurrentSession }}>
            {children}
        </StudySessionContext.Provider>
    );
};

export function useStudySession() {
    const context = useContext(StudySessionContext);
    if (!context) {
        throw new Error('useStudySession must be used within a StudySessionProvider');
    }
    return context;
}
