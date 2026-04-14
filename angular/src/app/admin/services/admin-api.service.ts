import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BE_URL } from '../../constants/app.constant';

@Injectable({
  providedIn: 'root',
})
export class AdminApiService {
  private baseUrl = `${BE_URL}/admin`;

  constructor(private http: HttpClient) {}

  // Dashboard
  getStats(): Observable<any> {
    return this.http.get(`${this.baseUrl}/stats`);
  }

  // Users
  getUsers(page: number = 1, limit: number = 10, search?: string, status?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());
    
    if (search) params = params.set('search', search);
    if (status) params = params.set('status', status);

    return this.http.get(`${this.baseUrl}/users`, { params });
  }

  getUserById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/users/${id}`);
  }

  activateUser(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/${id}/activate`, {});
  }

  deactivateUser(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/${id}/deactivate`, {});
  }

  terminateUser(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/users/${id}/terminate`, {});
  }

  // KeyHolders
  getKeyHolders(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(`${this.baseUrl}/keyholders`, { params });
  }

  getKeyHolderById(id: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/keyholders/${id}`);
  }

  deleteKeyHolder(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/keyholders/${id}`);
  }

  // Uploads
  getUploads(page: number = 1, limit: number = 10, filters?: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.userId) params = params.set('userId', filters.userId);
    if (filters?.contentType) params = params.set('contentType', filters.contentType);
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get(`${this.baseUrl}/uploads`, { params });
  }

  deleteUpload(id: string, table?: string): Observable<any> {
    let params = new HttpParams();
    if (table) {
      params = params.set('table', table);
    }
    return this.http.delete(`${this.baseUrl}/uploads/${id}`, { params });
  }

  // Plans
  getPlans(): Observable<any> {
    return this.http.get(`${this.baseUrl}/plans`);
  }

  createPlan(plan: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/plans`, plan);
  }

  updatePlan(id: string, plan: any): Observable<any> {
    return this.http.patch(`${this.baseUrl}/plans/${id}`, plan);
  }

  deletePlan(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/plans/${id}`);
  }

  // Subscriptions
  getSubscriptions(page: number = 1, limit: number = 10): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    return this.http.get(`${this.baseUrl}/subscriptions`, { params });
  }

  cancelSubscription(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/subscriptions/${id}/cancel`, {});
  }

  changePlan(subscriptionId: string, planId: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/subscriptions/${subscriptionId}/change-plan`, { planId });
  }

  // Payments
  getPayments(page: number = 1, limit: number = 10, filters?: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.userId) params = params.set('userId', filters.userId);
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get(`${this.baseUrl}/payments`, { params });
  }

  // Email Logs
  getEmailLogs(page: number = 1, limit: number = 10, filters?: any): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (filters?.userId) params = params.set('userId', filters.userId);
    if (filters?.emailType) params = params.set('emailType', filters.emailType);
    if (filters?.startDate) params = params.set('startDate', filters.startDate);
    if (filters?.endDate) params = params.set('endDate', filters.endDate);

    return this.http.get(`${this.baseUrl}/email-logs`, { params });
  }
}

