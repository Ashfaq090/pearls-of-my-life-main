import { Component, OnInit } from '@angular/core';
import { AdminApiService } from '../../services/admin-api.service';

@Component({
  selector: 'app-admin-uploads',
  templateUrl: './admin-uploads.component.html',
  styleUrls: ['./admin-uploads.component.scss'],
})
export class AdminUploadsComponent implements OnInit {
  uploads: any[] = [];
  loading: boolean = false;
  page: number = 1;
  limit: number = 10;
  total: number = 0;
  totalPages: number = 0;
  filters: any = {
    contentType: '',
    userId: '',
    startDate: '',
    endDate: '',
  };

  constructor(private adminApi: AdminApiService) {}

  ngOnInit() {
    this.loadUploads();
  }

  loadUploads() {
    this.loading = true;
    this.adminApi.getUploads(this.page, this.limit, this.filters).subscribe({
      next: (response) => {
        this.uploads = response.uploads || [];
        this.total = response.total || 0;
        this.totalPages = response.totalPages || 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading uploads:', error);
        this.loading = false;
      },
    });
  }

  deleteUpload(upload: any) {
    if (confirm('Delete this upload?')) {
      this.adminApi.deleteUpload(upload.id, upload.table).subscribe({
        next: () => this.loadUploads(),
        error: (error) => alert('Error: ' + (error.error?.message || 'Failed to delete')),
      });
    }
  }

  applyFilters() {
    this.page = 1;
    this.loadUploads();
  }

  clearFilters() {
    this.filters = {
      contentType: '',
      userId: '',
      startDate: '',
      endDate: '',
    };
    this.loadUploads();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.page = page;
      this.loadUploads();
    }
  }
}

