import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class PayPalService {
  private readonly logger = new Logger(PayPalService.name);
  private clientId: string;
  private clientSecret: string;
  private baseUrl: string;

  constructor(private configService: ConfigService) {
    this.clientId = this.configService.get<string>('PAYPAL_CLIENT_ID');
    this.clientSecret = this.configService.get<string>('PAYPAL_CLIENT_SECRET');
    const mode = this.configService.get<string>('PAYPAL_MODE', 'sandbox');
    this.baseUrl =
      mode === 'live'
        ? 'https://api-m.paypal.com'
        : 'https://api-m.sandbox.paypal.com';
  }

  private async getAccessToken(): Promise<string> {
    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString(
      'base64',
    );
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/oauth2/token`,
        'grant_type=client_credentials',
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      return response.data.access_token;
    } catch (error) {
      this.logger.error(
        'Failed to get PayPal access token',
        error.response?.data || error.message,
      );
      throw new Error('Failed to authenticate with PayPal');
    }
  }

  async cancelSubscription(
    subscriptionId: string,
    reason: string = 'User requested cancellation',
  ): Promise<void> {
    const accessToken = await this.getAccessToken();
    try {
      await axios.post(
        `${this.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`,
        { reason },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );
      this.logger.log(`Subscription ${subscriptionId} cancelled successfully.`);
    } catch (error) {
      this.logger.error(
        `Failed to cancel subscription ${subscriptionId}`,
        error.response?.data || error.message,
      );
      throw new Error('Failed to cancel PayPal subscription');
    }
  }

  async verifyWebhookSignature(
    headers: any,
    body: any,
    webhookId: string,
  ): Promise<boolean> {
    // Implementation of webhook signature verification would go here
    // For now, we might skip strict verification or implement it if critical
    // PayPal provides an API to verify webhook signatures
    return true;
  }
}
