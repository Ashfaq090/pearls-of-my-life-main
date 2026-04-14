import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from '../../services/shared.service';

@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.scss'],
})
export class AdminLayoutComponent {
  menuItems = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin/dashboard' },
    { label: 'Users', icon: 'people', route: '/admin/users' },
    { label: 'Key Holders', icon: 'key', route: '/admin/keyholders' },
    { label: 'Uploads', icon: 'upload', route: '/admin/uploads' },
    { label: 'Plans', icon: 'card', route: '/admin/plans' },
    { label: 'Subscriptions', icon: 'subscription', route: '/admin/subscriptions' },
    { label: 'Payments', icon: 'payment', route: '/admin/payments' },
    { label: 'Email Logs', icon: 'email', route: '/admin/email-logs' },
    { label: 'Settings', icon: 'settings', route: '/admin/settings' },
  ];

  constructor(
    private router: Router,
    public sharedService: SharedService,
  ) {}

  logout() {
    this.sharedService.logout();
    this.router.navigate(['/admin/login']);
  }

  navigate(route: string) {
    this.router.navigate([route]);
  }
}

