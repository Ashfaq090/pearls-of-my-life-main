import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VideosService } from './videos.service';
import { SharedService } from 'src/app/services/shared.service';
import { PaymentService } from 'src/app/services/payment.service';
import { ActivatedRoute, Router } from '@angular/router';
import { VideoRecorderComponent } from '../../legacy/components/video-recorder/video-recorder.component';
import { HttpErrorResponse } from '@angular/common/http';
import { BE_URL, STAGE_GUIDANCE } from 'src/app/constants/app.constant';

@Component({
  selector: 'app-videos',
  templateUrl: './videos.component.html',
  styleUrls: ['./videos.component.scss'],
})
export class VideosComponent implements OnInit {
  videos: any[] = [];
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
  currentStage: string | null = null;
  currentStageGuidance: { title: string; intro: string[]; bullets: string[]; note?: string } | null = null;

  openVideo(url: string) {
    if (url) {
      window.open(url, '_blank');
    }
  }

  constructor(
    private videosService: VideosService,
    private sharedService: SharedService,
    private paymentService: PaymentService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.isKeyHolder = this.sharedService.isKeyHolder();
    this.loadSubscriptionPlan();
    this.route.queryParamMap.subscribe((params) => {
      this.currentStage = params.get('stage');
      this.currentPage = 1;
      this.currentStageGuidance = this.currentStage
        ? STAGE_GUIDANCE[this.currentStage] || null
        : null;
      this.loadVideos();
      if (params.get('focus') === 'record') {
        if (!this.isKeyHolder) {
          this.showUploadForm = true;
          this.showRecordForm = false;
        }
        setTimeout(() => {
          const target = document.getElementById('recordSection');
          if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
          }
        }, 0);
      }
    });
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

  loadVideos() {
    this.loading = true;
    this.videosService
      .getVideos(this.currentPage, this.pageSize, this.currentStage || undefined)
      .subscribe({
      next: (response: any) => {
        const videos = response.data || response.videos || [];
        // Convert file paths to full URLs
        this.videos = videos.map((video: any) => ({
          ...video,
          url: this.getVideoUrl(video.url),
        }));
        this.totalItems =
          response.total || response.meta?.total || this.videos.length;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message || 'Failed to load videos',
        });
        this.loading = false;
      },
    });
  }

  getVideoUrl(url: string): string {
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
    this.loadVideos();
  }

  toggleUploadForm() {
    if (!this.subscriptionPlan?.videoRecordingAllowed) {
      this.sharedService.showToast({
        classname: 'warning',
        text: 'Video uploads are not allowed in your current plan.',
      });
      this.router.navigate(['/subscription-plans']);
      return;
    }
    this.showUploadForm = !this.showUploadForm;
    this.showRecordForm = false;
  }

  toggleRecordForm() {
    // if (!this.subscriptionPlan?.videoRecordingAllowed) {
    //   this.sharedService.showToast({
    //     classname: 'warning',
    //     text: 'Video recording is not allowed in your current plan.',
    //   });
    //   this.router.navigate(['/subscription-plans']);
    //   return;
    // }
    this.showRecordForm = !this.showRecordForm;
    this.showUploadForm = false;
  }

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadVideo() {
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
    if (this.currentStage) {
      formData.append('stage_label', this.currentStage);
    }

    this.videosService.uploadVideo(formData).subscribe({
      next: (response: any) => {
        this.sharedService.showToast({
          classname: 'success',
          text: response?.message || 'Video uploaded successfully',
        });
        this.resetUploadForm();
        this.loadVideos();
      },
      error: (err: HttpErrorResponse) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message || 'Failed to upload video',
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

  deleteVideo(videoId: string) {
    if (confirm('Are you sure you want to delete this video?')) {
      this.videosService.deleteVideo(videoId).subscribe({
        next: (response: any) => {
          this.sharedService.showToast({
            classname: 'success',
            text: response?.message || 'Video deleted successfully',
          });
          this.loadVideos();
        },
        error: (err: HttpErrorResponse) => {
          this.sharedService.showToast({
            classname: 'error',
            text: err?.error?.message || 'Failed to delete video',
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
    this.cdr.detectChanges();
    this.loadVideos();
  }

  getTotalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize);
  }

  getPageNumbers(): number[] {
    return Array(this.getTotalPages())
      .fill(0)
      .map((_, i) => i + 1);
  }

  showMessage(event: any){
    console.log('showMessage called with:', event);
    this.sharedService.showToast(event);
  }

}
