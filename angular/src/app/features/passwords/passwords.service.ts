import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BE_URL } from 'src/app/constants/app.constant';
import { BaseService } from 'src/app/services/base.service';

@Injectable({
  providedIn: 'root', // Ensures the service is available globally
})
export class PasswordService extends BaseService {
  private baseUrl = BE_URL; // Replace with your API URL

  getCredentials(optionalParams?: any): Observable<any> {
    return this.get(`${this.baseUrl}/credentials`, optionalParams);
  }

  // getCredentialsByUserId(id: string = '72FB6FC5-1488-4E1F-9CFC-7992318A670C', optionalParams?: any): Observable<any> {
  //     return this.get(`${this.baseUrl}/credentials/${id}`, optionalParams);
  // }

  addUpdateCredentials(payload: any, id?: string): Observable<any> {
    const url = `${this.baseUrl}/credentials${id ? '/' + id : ''}`;
    return (id && this.put(url, payload)) || this.post(url, payload);
  }

  deleteCredentials(id: string): Observable<any> {
    return this.delete(`${this.baseUrl}/credentials/${id}`);
  }
}
