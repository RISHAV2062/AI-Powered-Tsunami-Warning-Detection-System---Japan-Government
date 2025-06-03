import type { SeismicEvent } from '../types';
import { alertService } from './AlertService';

class SeismicDataService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly MAX_RECONNECT_ATTEMPTS = 5;

  connect(): void {
    try {
      this.ws = new WebSocket('wss://seismic-api.example.com');
      
      this.ws.onopen = () => {
        console.log('Connected to seismic data stream');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const seismicData: SeismicEvent = JSON.parse(event.data);
        this.processSeismicData(seismicData);
      };

      this.ws.onclose = () => {
        this.handleDisconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect to seismic data stream:', error);
    }
  }

  private async processSeismicData(data: SeismicEvent): Promise<void> {
    try {
      await alertService.processSeismicEvent(data);
    } catch (error) {
      console.error('Error processing seismic data:', error);
    }
  }

  private handleDisconnect(): void {
    if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      this.reconnectAttempts++;
      setTimeout(() => this.connect(), 5000 * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async getHistoricalData(startDate: Date, endDate: Date): Promise<SeismicEvent[]> {
    try {
      const response = await fetch(`https://seismic-api.example.com/historical?start=${startDate.toISOString()}&end=${endDate.toISOString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching historical data:', error);
      return [];
    }
  }
}

export const seismicDataService = new SeismicDataService();