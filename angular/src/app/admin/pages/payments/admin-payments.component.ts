import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-payments',
  templateUrl: './admin-payments.component.html',
  styleUrls: ['./admin-payments.component.scss'],
})
export class AdminPaymentsComponent implements OnInit {
  payments: any[] = [];
  loading: boolean = false;
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  totalPages: number = 0;
  filters: any = {
    userId: '',
    startDate: '',
    endDate: '',
  };

  constructor(private adminApi: AdminApiService) {}

  ngOnInit() {
    this.loadPayments();
  }

  loadPayments() {
    this.loading = true;
    this.adminApi.getPayments(this.page, this.limit, this.filters).subscribe({
      next: (response) => {
        this.payments = response.payments || [];
        this.total = response.total || 0;
        this.totalPages = response.totalPages || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading payments:', error);
        this.loading = false;
      },
    });
  }

  applyFilters() {
    this.page = 1;
    this.loadPayments();
  }

  clearFilters() {
    this.filters = {
      userId: '',
      startDate: '',
      endDate: '',
    };
    this.loadPayments();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.loadPayments();
    }
  }
}

