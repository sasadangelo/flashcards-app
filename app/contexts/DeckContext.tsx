// app/contexts/DeckContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Deck } from '../../models/Deck';

import deckData5 from '../data/decks/fifth-350-essential/deck.json';
import deckData4 from '../data/decks/fourth-350-essential/deck.json';
import deckData1 from '../data/decks/most-frequent-100/deck.json';
import deckData2 from '../data/decks/next-100-essential/deck.json';
import deckData3 from '../data/decks/third-100-essential/deck.json';

const DeckContext = createContext<Deck[] | undefined>(undefined);

export const DeckProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [decks, setDecks] = useState<Deck[]>([]);

    useEffect(() => {
        const loadedDecks = [
            new Deck(deckData1),
            new Deck(deckData2),
            new Deck(deckData3),
            new Deck(deckData4),
            new Deck(deckData5),
        ];
        setDecks(loadedDecks);
        console.log('Decks loaded:', loadedDecks.map(d => d.name));
    }, []);

    return <DeckContext.Provider value={decks}>{children}</DeckContext.Provider>;
};

export const useDecks = () => {
    const context = useContext(DeckContext);
    if (!context) throw new Error('useDecks must be used within DeckProvider');
    return context;
};
