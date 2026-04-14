import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BE_URL } from '../constants/app.constant';

@Injectable({
  providedIn: 'root',
})
export class KeyHolderService {
  private apiUrl = BE_URL;

  constructor(private http: HttpClient) {}

  getKeyHolders(): Observable<any> {
    return this.http.get(`${this.apiUrl}/key-holders`);
  }

  addKeyHolder(keyHolder: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/key-holders`, keyHolder);
  }

  updateKeyHolder(id: string, keyHolder: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/key-holders/${id}`, keyHolder);
  }

  deleteKeyHolder(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/key-holders/${id}`);
  }

  getKeyHolderById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/key-holders/${id}`);
  }
}
