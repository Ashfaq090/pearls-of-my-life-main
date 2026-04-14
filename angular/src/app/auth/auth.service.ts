import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BE_URL } from '../constants/app.constant';

@Injectable({
  providedIn: 'root', // Ensures the service is available globally
})
export class AuthService {
  private baseUrl = BE_URL; // Replace with your API URL
  private BE_URL1 = 'http://56.228.6.77';
  private auth = '/auth';

  constructor(private http: HttpClient) {}

  // Method to call the login API
  login(credentials: {
    email: string;
    hashed_password: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.auth}/login`, credentials, {
      observe: 'response',
    });
  }

  // Method to call the login API
  register(register: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.auth}/register`, register, {
      observe: 'response',
    });
  }

  getKeyHolder(tokenURL: string) {
    return this.http.get(`${this.baseUrl}${this.auth}/keyholder/${tokenURL}`);
  }

  loginKeyHolder(reqObj: any): Observable<any> {
    return this.http.post(`${this.baseUrl}${this.auth}/keyholder`, reqObj, {
      observe: 'response',
    });
  }

  forgotPassword(email: string) {
    return this.http.post(`${this.baseUrl}${this.auth}/forgot-password`, {
      email,
    });
  }

  resetPassword(token: string, password: string) {
    return this.http.post(`${this.baseUrl}${this.auth}/reset-password`, {
      token,
      password,
    });
  }

  changePassword(oldPassword: string, newPassword: string) {
    return this.http.post(`${this.baseUrl}${this.auth}/change-password`, {
      oldPassword,
      newPassword,
    });
  }

  acceptKeyHolderInvitation(data: { token_url: string; pin: string; password: string }) {
    return this.http.post(`${this.baseUrl}${this.auth}/keyholder/accept-invitation`, data);
  }
}
