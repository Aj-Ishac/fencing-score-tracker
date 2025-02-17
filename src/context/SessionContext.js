import React, { createContext, useContext, useState } from 'react';

const SessionContext = createContext();

export function SessionProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  const [isGuestSession, setIsGuestSession] = useState(false);

  const startGuestSession = () => {
    const sessionId = Date.now();
    const sessionName = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    setActiveSession({
      id: sessionId,
      name: sessionName,
      isGuest: true,
      student_count: 0
    });
    setIsGuestSession(true);
  };

  const endSession = () => {
    setActiveSession(null);
    setIsGuestSession(false);
  };

  return (
    <SessionContext.Provider value={{ 
      activeSession, 
      setActiveSession,
      isGuestSession,
      startGuestSession,
      endSession
    }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
} 