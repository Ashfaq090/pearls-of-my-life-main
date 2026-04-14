import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseService } from 'src/app/services/base.service';
import { BE_URL } from '../constants/app.constant';

@Injectable({
  providedIn: 'root',
})
export class FeaturesService extends BaseService {
  private baseUrl = BE_URL; // Replace with your API URL

  getUserPlan(): Observable<any> {
    return this.get(`${this.baseUrl}/users/plan`);
  }
  sendEmail(email: string): Observable<any> {
    return this.post(`${this.baseUrl}/auth/send-email`, { email });
  }
}
