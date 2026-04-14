import { Injectable } from '@angular/core';
import { BaseService } from 'src/app/services/base.service';
import { Observable } from 'rxjs';
import { BE_URL } from 'src/app/constants/app.constant';

@Injectable({
  providedIn: 'root',
})
export class ObituaryService extends BaseService {
  private baseUrl = BE_URL;

  getObituaries(optionalParams: any = ''): Observable<any> {
    return this.get(
      `${this.baseUrl}/obituaries?${optionalParams ? optionalParams : ''}`
    );
  }

  getObituaryByUserId(
    id: string = '72FB6FC5-1488-4E1F-9CFC-7992318A670C',
    optionalParams?: any
  ): Observable<any> {
    return this.get(`${this.baseUrl}/obituaries/${id}`, optionalParams);
  }

  addUpdateObituary(payload: any, id?: string): Observable<any> {
    const url = `${this.baseUrl}/obituaries${id ? '/' + id : ''}`;
    return id ? this.put(url, payload) : this.post(url, payload);
  }

  deleteObituary(obituaryId: string): Observable<any> {
    return this.delete(`${this.baseUrl}/obituaries/${obituaryId}`);
  }
}
