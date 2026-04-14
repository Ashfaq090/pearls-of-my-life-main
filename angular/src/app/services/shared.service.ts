import { inject, Injectable } from '@angular/core';
import { BaseService } from './base.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload } from '../interface/interface';

@Injectable({
  providedIn: 'root',
})
export class SharedService extends BaseService {
  private router = inject(Router);
  public userToken: string | null = localStorage.getItem('accessToken');
  public toaster = new BehaviorSubject<any>(null);

  public setUserToken(token: any): void {
    localStorage.setItem('accessToken', token);
    this.userToken = token;
  }
  public isKeyHolder() {
    if (this.userToken) {
      const decodedToken = jwtDecode<JwtPayload>(this.userToken);
      return decodedToken.is_keyholder;
    }
    return false;
  }

  public getUserRole() {
    if (this.userToken) {
      const decodedToken = jwtDecode<JwtPayload>(this.userToken);
      return decodedToken.role || 'user';
    }
    return 'user';
  }

  public isSuperAdmin() {
    return this.getUserRole() === 'super_admin';
  }

  public isAdmin() {
    const role = this.getUserRole();
    return role === 'admin' || role === 'super_admin';
  }

  public clearUserData(): void {
    localStorage.clear();
    this.userToken = null;
  }

  public logout(): void {
    this.clearUserData();
    this.router.navigate(['/home']);
    this.showToast({
      classname: 'success',
      text: 'You have been successfully logged out!',
    });
  }

  public showToast(toast: any) {
    this.toaster.next(toast);
  }

  public hideToast() {
    this.toaster.next(false);
  }

  public getUserEmail(): string {
    if (this.userToken) {
      const decodedToken = jwtDecode<JwtPayload>(this.userToken);
      return decodedToken.email || 'Admin';
    }
    return 'Admin';
  }
}
