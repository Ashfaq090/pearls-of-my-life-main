import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BE_URL } from 'src/app/constants/app.constant';

@Injectable({
  providedIn: 'root',
})
export class AdminService {
  private apiUrl = BE_URL;
  private baseUrl = `${this.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  getUsers(page: number = 1, limit: number = 10): Observable<any> {
    return this.http.get(`${this.baseUrl}/manage/list`, {
      params: { page: page.toString(), limit: limit.toString() },
    });
  }

  updateUserRole(userId: string, role: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}/role`, { role });
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${userId}`);
  }

  blockUser(userId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}/block`, {});
  }

  unblockUser(userId: string): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}/unblock`, {});
  }

  updateUser(userId: string, userData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${userId}`, userData);
  }
}
