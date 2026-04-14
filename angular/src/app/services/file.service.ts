import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { BE_URL } from '../constants/app.constant';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  private apiUrl = BE_URL; // Update to match your backend endpoint

  constructor(private http: HttpClient) {}

  // Upload a file
  uploadFile(controller_path: string, file: File): Observable<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${controller_path}`, formData, {
      responseType: 'blob',
    });
  }

  // Get a file
  getFile(controller_path: string): Observable<Blob | any> {
    return this.http.get(`${this.apiUrl}/${controller_path}`, {
      responseType: 'blob',
    });
  }

  // List all files (optional)
  listFiles(): Observable<any> {
    return this.http.get(`${this.apiUrl}/list`);
  }

  // List all files (optional)
  getFilesByPath(controller_path: string, paths: any[]): Observable<any> {
    const params = JSON.stringify(paths);
    console.log(params);
    // const formData = new FormData();
    // formData.append('urls', params);
    return this.http.get(`${this.apiUrl}/${controller_path}?paths=${params}`);
  }

  // Error handler
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client-side error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Server-side error: ${error.status} - ${error.message}`;
    }
    return throwError(errorMessage);
  }
}
