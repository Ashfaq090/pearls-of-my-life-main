import { Injectable } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from 'src/app/services/base.service';
import { BE_URL } from 'src/app/constants/app.constant';

@Injectable({
  providedIn: 'root',
})
export class VideosService extends BaseService {
  private baseUrl = `${BE_URL}/legacy`;

  getVideos(
    page: number = 1,
    pageSize: number = 12,
    stage?: string
  ): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', pageSize.toString());
    if (stage) {
      params = params.set('stage', stage);
    }
    return this.get(`${this.baseUrl}/videos`, { params });
  }

  uploadVideo(formData: FormData): Observable<any> {
    return this.post(`${this.baseUrl}/video/upload`, formData);
  }

  deleteVideo(videoId: string): Observable<any> {
    return this.delete(`${this.baseUrl}/video/${videoId}`);
  }

  getVideoById(videoId: string): Observable<any> {
    return this.get(`${this.baseUrl}/video/${videoId}`);
  }
}
