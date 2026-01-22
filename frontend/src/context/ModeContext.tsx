import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

type Mode = 'home' | 'work' | null;

interface ModeContextType {
    mode: Mode;
    switchMode: (newMode: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<Mode>(null);
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (location.pathname.startsWith('/home')) {
            setMode('home');
        } else if (location.pathname.startsWith('/work')) {
            setMode('work');
        } else {
            setMode(null);
        }
    }, [location]);

    const switchMode = (newMode: Mode) => {
        setMode(newMode);
        if (newMode === 'home') navigate('/home');
        if (newMode === 'work') navigate('/work');
    };

    return (
        <ModeContext.Provider value={{ mode, switchMode }}>
            {children}
        </ModeContext.Provider>
    );
}

export function useMode() {
    const context = useContext(ModeContext);
    if (context === undefined) {
        throw new Error('useMode must be used within a ModeProvider');
    }
    return context;
}
