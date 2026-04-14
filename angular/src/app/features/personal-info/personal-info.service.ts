import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BE_URL } from 'src/app/constants/app.constant';
import { BaseService } from 'src/app/services/base.service';

@Injectable({
  providedIn: 'root', // Ensures the service is available globally
})
export class PersonalInfoService extends BaseService {
  private baseUrl = BE_URL; // Replace with your API URL

  getPersonalInfo(): Observable<any> {
    return this.get(`${this.baseUrl}/personal-info`);
  }

  update(payload: any): Observable<any> {
    const url = `${this.baseUrl}/personal-info`;
    return this.put(url, payload);
  }

  terminateAccount(): Observable<any> {
    return this.delete(`${this.baseUrl}/users/me`);
  }
}
