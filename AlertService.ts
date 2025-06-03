import type { SeismicEvent, AlertConfig } from '../types';
import { aiService } from './AIService';

class AlertService {
  private readonly ALERT_THRESHOLD = 5.0;
  private alertSubscribers: ((event: SeismicEvent) => void)[] = [];

  async processSeismicEvent(event: SeismicEvent): Promise<void> {
    const riskLevel = await aiService.analyzeTsunamiRisk(event);
    
    if (riskLevel !== 'low') {
      const propagation = await aiService.predictWavePropagation(event);
      this.notifySubscribers({
        ...event,
        tsunamiRisk: riskLevel
      });
    }
  }

  subscribe(callback: (event: SeismicEvent) => void): () => void {
    this.alertSubscribers.push(callback);
    return () => {
      this.alertSubscribers = this.alertSubscribers.filter(cb => cb !== callback);
    };
  }

  private notifySubscribers(event: SeismicEvent): void {
    this.alertSubscribers.forEach(callback => callback(event));
  }

  async sendEmergencyAlert(event: SeismicEvent, config: AlertConfig): Promise<void> {
    const message = this.formatAlertMessage(event);
    
    if (config.notificationChannels.includes('sms')) {
      await this.sendSMSAlert(message, config.recipients);
    }
    
    if (config.notificationChannels.includes('email')) {
      await this.sendEmailAlert(message, config.recipients);
    }
  }

  private formatAlertMessage(event: SeismicEvent): string {
    return `TSUNAMI WARNING: Magnitude ${event.magnitude} earthquake detected at ${event.location}. Risk level: ${event.tsunamiRisk.toUpperCase()}`;
  }

  private async sendSMSAlert(message: string, recipients: string[]): Promise<void> {
    // Implementation would integrate with SMS service
    console.log('Sending SMS alert:', message, 'to:', recipients);
  }

  private async sendEmailAlert(message: string, recipients: string[]): Promise<void> {
    // Implementation would integrate with email service
    console.log('Sending email alert:', message, 'to:', recipients);
  }
}

export const alertService = new AlertService();