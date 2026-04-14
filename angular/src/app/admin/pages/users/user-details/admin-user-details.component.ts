import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminApiService } from '../../../services/admin-api.service';

@Component({
  selector: 'app-admin-user-details',
  templateUrl: './admin-user-details.component.html',
  styleUrls: ['./admin-user-details.component.scss'],
})
export class AdminUserDetailsComponent implements OnInit {
  user: any = null;
  loading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminApi: AdminApiService,
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(id);
    }
  }

  loadUser(id: string) {
    this.loading = true;
    this.adminApi.getUserById(id).subscribe({
      next: (data) => {
        this.user = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading user:', error);
        this.loading = false;
      },
    });
  }

  goBack() {
    this.router.navigate(['/admin/users']);
  }

  activateUser() {
    if (confirm('Activate this user?')) {
      this.adminApi.activateUser(this.user.id).subscribe({
        next: () => this.loadUser(this.user.id),
      });
    }
  }

  deactivateUser() {
    if (confirm('Deactivate this user?')) {
      this.adminApi.deactivateUser(this.user.id).subscribe({
        next: () => this.loadUser(this.user.id),
      });
    }
  }

  terminateUser() {
    if (confirm('Terminate this user account? This action cannot be undone.')) {
      this.adminApi.terminateUser(this.user.id).subscribe({
        next: () => this.loadUser(this.user.id),
      });
    }
  }
}

