import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.scss'],
})
export class AdminUsersComponent implements OnInit {
  users: any[] = [];
  loading: boolean = false;
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  totalPages: number = 0;
  searchTerm: string = '';
  statusFilter: string = 'all';

  constructor(
    private adminApi: AdminApiService,
    private router: Router,
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.loading = true;
    this.adminApi
      .getUsers(this.page, this.limit, this.searchTerm, this.statusFilter)
      .subscribe({
        next: (response) => {
          this.users = response.users || [];
          this.total = response.total || 0;
          this.totalPages = response.totalPages || 0;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.loading = false;
        },
      });
  }

  onSearch() {
    this.page = 1;
    this.loadUsers();
  }

  onStatusChange() {
    this.page = 1;
    this.loadUsers();
  }

  activateUser(id: string) {
    if (confirm('Activate this user?')) {
      this.adminApi.activateUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (error) => alert('Error: ' + (error.error?.message || 'Failed to activate user')),
      });
    }
  }

  deactivateUser(id: string) {
    if (confirm('Deactivate this user?')) {
      this.adminApi.deactivateUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (error) => alert('Error: ' + (error.error?.message || 'Failed to deactivate user')),
      });
    }
  }

  terminateUser(id: string) {
    if (confirm('Terminate this user account? This action cannot be undone.')) {
      this.adminApi.terminateUser(id).subscribe({
        next: () => this.loadUsers(),
        error: (error) => alert('Error: ' + (error.error?.message || 'Failed to terminate user')),
      });
    }
  }

  viewUser(id: string) {
    this.router.navigate(['/admin/users', id]);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.loadUsers();
    }
  }
}

