import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { SeismicEvent, AlertConfig } from '../types';

interface AlertContextType {
  alerts: SeismicEvent[];
  config: AlertConfig;
  updateConfig: (newConfig: AlertConfig) => void;
  dismissAlert: (id: string) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<SeismicEvent[]>([]);
  const [config, setConfig] = useState<AlertConfig>({
    threshold: 6.0,
    notificationChannels: ['sms', 'email', 'app'],
    recipients: ['emergency-services', 'local-authorities'],
  });

  useEffect(() => {
    // Placeholder for WebSocket connection
    const connectWebSocket = () => {
      console.log('WebSocket connection would be established here');
    };

    connectWebSocket();
  }, []);

  const updateConfig = (newConfig: AlertConfig) => {
    setConfig(newConfig);
  };

  const dismissAlert = (id: string) => {
    setAlerts((current) => current.filter((alert) => alert.id !== id));
  };

  return (
    <AlertContext.Provider value={{ alerts, config, updateConfig, dismissAlert }}>
      {children}
    </AlertContext.Provider>
  );
}

export function useAlert() {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
}