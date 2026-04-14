import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from 'src/app/services/base.service';
import { BE_URL } from 'src/app/constants/app.constant';

@Injectable({
  providedIn: 'root',
})
export class AudiosService extends BaseService {
  private baseUrl = `${BE_URL}/legacy`;

  getAudios(page: number = 1, pageSize: number = 12): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('limit', pageSize.toString());
    return this.get(`${this.baseUrl}/audios`, { params });
  }

  uploadAudio(formData: FormData): Observable<any> {
    return this.post(`${this.baseUrl}/audio/upload`, formData);
  }

  deleteAudio(audioId: string): Observable<any> {
    return this.delete(`${this.baseUrl}/audio/${audioId}`);
  }

  getAudioById(audioId: string): Observable<any> {
    return this.get(`${this.baseUrl}/audio/${audioId}`);
  }
}
