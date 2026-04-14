import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BE_URL } from 'src/app/constants/app.constant';
import { BaseService } from 'src/app/services/base.service';

@Injectable({
  providedIn: 'root',
})
export class MemoriesService extends BaseService {
  private baseUrl = BE_URL; // Replace with your API URL

  getMemoriesFolders(optionalParams: any = ''): Observable<any> {
    return this.get(
      `${this.baseUrl}/memories/folders?${optionalParams ? optionalParams : ''}`
    );
  }

  addUpdateMemoryFolders(payload: any, id?: string): Observable<any> {
    const url = `${this.baseUrl}/memories/folders${id ? '/' + id : ''}`;
    return (id && this.put(url, payload)) || this.post(url, payload);
  }

  getMemoriesFolderDetails(optionalParams: any): Observable<any> {
    return this.get(
      `${this.baseUrl}/memories/?${optionalParams ? optionalParams : ''}`
    );
  }

  addMemories(file: File, body?: any): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    if (body) formData.append('text', JSON.stringify(body));
    return this.post(`${this.baseUrl}/memories/create`, formData);
  }

  // deleteKeyHolder(id: string): Observable<any> {
  //     return this.delete(`${this.baseUrl}/key-holders/${id}`);
  // }
}
