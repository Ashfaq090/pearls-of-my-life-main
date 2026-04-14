import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AudiosService } from './audios.service';
import { SharedService } from 'src/app/services/shared.service';
import { PaymentService } from 'src/app/services/payment.service';
import { Router } from '@angular/router';
import { AudioRecorderComponent } from '../../legacy/components/audio-recorder/audio-recorder.component';
import { HttpErrorResponse } from '@angular/common/http';
import { BE_URL } from 'src/app/constants/app.constant';

@Component({
  selector: 'app-audios',
  templateUrl: './audios.component.html',
  styleUrls: ['./audios.component.scss'],
})
export class AudiosComponent implements OnInit {
  audios: any[] = [];
  loading = false;
  currentPage = 1;
  pageSize = 12;
  totalItems = 0;
  showUploadForm = false;
  showRecordForm = false;
  selectedFile: File | null = null;
  uploadTitle = '';
  uploadDescription = '';
  subscriptionPlan: any = null;
  isKeyHolder = false;
  Math = Math; // Expose Math for template

  constructor(
    private audiosService: AudiosService,
    private sharedService: SharedService,
    private paymentService: PaymentService,
    private router: Router,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.isKeyHolder = this.sharedService.isKeyHolder();
    this.loadSubscriptionPlan();
    this.loadAudios();
  }

  loadSubscriptionPlan() {
    this.paymentService.getCurrentSubscription().subscribe({
      next: (subscription: any) => {
        if (subscription && subscription.plan) {
          this.subscriptionPlan = subscription.plan;
        }
      },
      error: () => {
        this.subscriptionPlan = null;
      },
    });
  }

  loadAudios() {
    this.loading = true;
    this.audiosService.getAudios(this.currentPage, this.pageSize).subscribe({
      next: (response: any) => {
        const audios = response.data || response.audios || [];
        // Convert file paths to full URLs
        this.audios = audios.map((audio: any) => ({
          ...audio,
          url: this.getAudioUrl(audio.url),
        }));
        this.totalItems =
          response.total || response.meta?.total || this.audios.length;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message || 'Failed to load audios',
        });
        this.loading = false;
      },
    });
  }

  getAudioUrl(url: string): string {
    if (!url) return '';
    // If already a full URL, return as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // Convert relative path to full URL
    const backendUrl = BE_URL.replace(/\/$/, ''); // Remove trailing slash
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${backendUrl}${cleanUrl}`;
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.loadAudios();
  }

  toggleUploadForm() {
    if (!this.subscriptionPlan?.audioRecordingAllowed) {
      this.sharedService.showToast({
        classname: 'warning',
        text: 'Audio uploads are not allowed in your current plan.',
      });
      this.router.navigate(['/subscription-plans']);
      return;
    }
    this.showUploadForm = !this.showUploadForm;
    this.showRecordForm = false;
  }

  toggleRecordForm() {
    if (!this.subscriptionPlan?.audioRecordingAllowed) {
      this.sharedService.showToast({
        classname: 'warning',
        text: 'Audio recording is not allowed in your current plan.',
      });
      this.router.navigate(['/subscription-plans']);
      return;
    }
    this.showRecordForm = !this.showRecordForm;
    this.showUploadForm = false;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadAudio() {
    if (!this.selectedFile || !this.uploadTitle) {
      this.sharedService.showToast({
        classname: 'error',
        text: 'Please select a file and provide a title',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.uploadTitle);
    formData.append('description', this.uploadDescription);

    this.audiosService.uploadAudio(formData).subscribe({
      next: (response: any) => {
        this.sharedService.showToast({
          classname: 'success',
          text: response?.message || 'Audio uploaded successfully',
        });
        this.resetUploadForm();
        this.loadAudios();
      },
      error: (err: HttpErrorResponse) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message || 'Failed to upload audio',
        });
      },
    });
  }

  resetUploadForm() {
    this.selectedFile = null;
    this.uploadTitle = '';
    this.uploadDescription = '';
    this.showUploadForm = false;
  }

  deleteAudio(audioId: string) {
    if (confirm('Are you sure you want to delete this audio?')) {
      this.audiosService.deleteAudio(audioId).subscribe({
        next: (response: any) => {
          this.sharedService.showToast({
            classname: 'success',
            text: response?.message || 'Audio deleted successfully',
          });
          this.loadAudios();
        },
        error: (err: HttpErrorResponse) => {
          this.sharedService.showToast({
            classname: 'error',
            text: err?.error?.message || 'Failed to delete audio',
          });
        },
      });
    }
  }

  formatDuration(seconds: number): string {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  formatFileSize(bytes: number): string {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  onRecordComplete() {
    this.showRecordForm = false;
    this.loadAudios();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  getPageNumbers(): number[] {
    return Array(this.getTotalPages())
      .fill(0)
      .map((_, i) => i + 1);
  }
}
