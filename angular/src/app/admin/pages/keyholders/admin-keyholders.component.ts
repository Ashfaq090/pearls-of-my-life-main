import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-keyholders',
  templateUrl: './admin-keyholders.component.html',
  styleUrls: ['./admin-keyholders.component.scss'],
})
export class AdminKeyholdersComponent implements OnInit {
  keyHolders: any[] = [];
  loading: boolean = false;
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  totalPages: number = 0;

  constructor(private adminApi: AdminApiService) {}

  ngOnInit() {
    this.loadKeyHolders();
  }

  loadKeyHolders() {
    this.loading = true;
    this.adminApi.getKeyHolders(this.page, this.limit).subscribe({
      next: (response) => {
        this.keyHolders = response.keyHolders || [];
        this.total = response.total || 0;
        this.totalPages = response.totalPages || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading key holders:', error);
        this.loading = false;
      },
    });
  }

  deleteKeyHolder(id: string) {
    if (confirm('Delete this key holder?')) {
      this.adminApi.deleteKeyHolder(id).subscribe({
        next: () => this.loadKeyHolders(),
        error: (error) => alert('Error: ' + (error.error?.message || 'Failed to delete')),
      });
    }
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.loadKeyHolders();
    }
  }
}

