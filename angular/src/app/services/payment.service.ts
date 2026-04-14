import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BE_URL } from '../constants/app.constant';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private apiUrl = `${BE_URL}/payments`;
  constructor(private http: HttpClient) {}
  getSubscriptionPlans(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/subscription-plans`);
  }

  normalizePlanFeatures(features: any): string[] {
    if (!features) return [];
    if (Array.isArray(features)) return features.map((f) => String(f));
    if (typeof features === 'string') {
      try {
        const parsed = JSON.parse(features);
        if (Array.isArray(parsed)) return parsed.map((f) => String(f));
      } catch {
        return features.split(',').map((f) => f.trim());
      }
    }
    return [];
  }

  getCurrentSubscription(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/my-subscription`);
  }

  createOrder(amount: number, planId?: string): Observable<{ orderId: string }> {
    return this.http.post<{ orderId: string }>(`${this.apiUrl}/create-order`, {
      amount,
      planId,
    });
  }

  capturePayment(orderId: string, planId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/capture-order`, {
      orderId,
      planId,
    });
  }

  cancelSubscription(subscriptionId: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/cancel-subscription`, {
      subscriptionId,
    });
  }

  getPaymentHistory(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.apiUrl}/payment-history`, {
      params: { page: page.toString(), limit: limit.toString() },
    });
  }
}
