export interface SeismicEvent {
  id: string;
  timestamp: string;
  magnitude: number;
  depth: number;
  latitude: number;
  longitude: number;
  location: string;
  tsunamiRisk: 'low' | 'medium' | 'high';
}

export interface AlertConfig {
  threshold: number;
  notificationChannels: string[];
  recipients: string[];
}

export interface CoastalRegion {
  id: string;
  name: string;
  prefecture: string;
  latitude: number;
  longitude: number;
  population: number;
  riskLevel: 'low' | 'medium' | 'high';
}