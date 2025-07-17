import React, { createContext, useContext, useEffect, useState } from 'react';
import { StudySession } from '../../models/StudySession';
import { StudySessionManager } from '../../models/StudySessionManager';

interface StudySessionContextType {
    manager: StudySessionManager | null;
    setManager: (manager: StudySessionManager) => void;
    currentSession: StudySession | null;
    setCurrentSession: (session: StudySession | null) => void;
}

const StudySessionContext = createContext<StudySessionContextType | undefined>(undefined);

export const StudySessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [manager, setManager] = useState<StudySessionManager | null>(null);
    const [currentSession, setCurrentSession] = useState<StudySession | null>(null);

    useEffect(() => {
        console.log('StudySessionProvider: manager changed:', manager);
    }, [manager]);

    useEffect(() => {
        console.log('StudySessionProvider: currentSession changed:', currentSession);
    }, [currentSession]);

    return (
        <StudySessionContext.Provider
            value={{ manager, setManager, currentSession, setCurrentSession }}
        >
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
