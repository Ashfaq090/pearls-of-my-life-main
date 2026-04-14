import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BE_URL } from 'src/app/constants/app.constant';

@Injectable({
  providedIn: 'root',
})
export class LegacyService {
  private apiUrl = `${BE_URL}/legacy`;

  constructor(private http: HttpClient) {}

  uploadVideo(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/video/upload`, formData);
  }

  uploadImage(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/image/upload`, formData);
  }

  uploadAudio(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/audio/upload`, formData);
  }

  createNote(note: { title: string; content: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/note`, note);
  }

  getContent(): Observable<any> {
    return this.http.get(`${this.apiUrl}/content`);
  }

  deleteImage(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/image/${id}`);
  }
}
