import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BE_URL } from 'src/app/constants/app.constant';
import { BaseService } from 'src/app/services/base.service';

@Injectable({
  providedIn: 'root',
})
export class ObituaryInfoService extends BaseService {
  private baseUrl = BE_URL; // Replace with your API URL

  getObituaryInfo(optionalParams: any = ''): Observable<any> {
    return this.get(`${this.baseUrl}/obituary-info?${optionalParams}`);
  }

  getObituaryInfoById(id: string): Observable<any> {
    return this.get(`${this.baseUrl}/obituary-info/${id}`);
  }

  createObituaryInfo(payload: any): Observable<any> {
    return this.post(`${this.baseUrl}/obituary-info`, payload);
  }
  getObituaries(optionalParams: any = ''): Observable<any> {
    return this.get(
      `${this.baseUrl}/obituary-info?${optionalParams ? optionalParams : ''}`
    );
  }
  updateObituaryInfo(payload: any, id: string): Observable<any> {
    return this.put(`${this.baseUrl}/obituary-info/${id}`, payload);
  }

  deleteObituaryInfo(id: string): Observable<any> {
    return this.delete(`${this.baseUrl}/obituary-info/${id}`);
  }
}
