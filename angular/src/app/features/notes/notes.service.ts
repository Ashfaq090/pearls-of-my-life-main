import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BE_URL } from 'src/app/constants/app.constant';
import { BaseService } from 'src/app/services/base.service';

@Injectable({
  providedIn: 'root', // Ensures the service is available globally
})
export class NotesService extends BaseService {
  private baseUrl = BE_URL; // Replace with your API URL

  getNotes(optionalParams: any = ''): Observable<any> {
    return this.get(
      `${this.baseUrl}/notes?${optionalParams ? optionalParams : ''}`
    );
  }

  getNotesByUserId(
    id: string = '72FB6FC5-1488-4E1F-9CFC-7992318A670C',
    optionalParams?: any
  ): Observable<any> {
    return this.get(`${this.baseUrl}/notes/${id}`, optionalParams);
  }

  addUpdateNote(payload: any, id?: string): Observable<any> {
    const url = `${this.baseUrl}/notes${id ? '/' + id : ''}`;
    return (id && this.put(url, payload)) || this.post(url, payload);
  }

  deleteNote(note_id: string): Observable<any> {
    return this.delete(`${this.baseUrl}/notes/${note_id}`);
  }

  // getNotesByYear(year: string): Observable<any> {
  //     return this.get(`${this.baseUrl}/notes/year/${year}`);
  // }
}
