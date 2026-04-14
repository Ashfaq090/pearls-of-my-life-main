import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-email-logs',
  templateUrl: './admin-email-logs.component.html',
  styleUrls: ['./admin-email-logs.component.scss'],
})
export class AdminEmailLogsComponent implements OnInit {
  logs: any[] = [];
  loading: boolean = false;
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  totalPages: number = 0;
  filters: any = {
    userId: '',
    emailType: '',
    startDate: '',
    endDate: '',
  };

  emailTypes = [
    { value: '', label: 'All Types' },
    { value: 'registration', label: 'Registration' },
    { value: 'password_reset', label: 'Password Reset' },
    { value: 'account_termination', label: 'Account Termination' },
    { value: 'subscription', label: 'Subscription' },
    { value: 'payment', label: 'Payment' },
    { value: 'general', label: 'General' },
  ];

  constructor(private adminApi: AdminApiService) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.adminApi.getEmailLogs(this.page, this.limit, this.filters).subscribe({
      next: (response) => {
        this.logs = response.logs || [];
        this.total = response.total || 0;
        this.totalPages = response.totalPages || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading email logs:', error);
        this.loading = false;
      },
    });
  }

  applyFilters() {
    this.page = 1;
    this.loadLogs();
  }

  clearFilters() {
    this.filters = {
      userId: '',
      emailType: '',
      startDate: '',
      endDate: '',
    };
    this.loadLogs();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.loadLogs();
    }
  }
}

