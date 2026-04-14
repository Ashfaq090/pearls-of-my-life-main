import { Component, OnInit } from '@angular/core';
import { LegacyService } from 'src/app/legacy/services/legacy.service';
import { SharedService } from 'src/app/services/shared.service';
import { BE_URL } from 'src/app/constants/app.constant';

@Component({
  selector: 'app-legacy-photos',
  templateUrl: './legacy-photos.component.html',
  styleUrls: ['./legacy-photos.component.scss'],
})
export class LegacyPhotosComponent implements OnInit {
  public images: any[] = [];
  public loading = false;
  public readonly MAX_IMAGES = 30;

  constructor(
    private readonly legacyService: LegacyService,
    private readonly sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.loadImages();
  }

  get canUpload(): boolean {
    return this.images.length < this.MAX_IMAGES;
  }

  loadImages(): void {
    this.loading = true;
    this.legacyService.getContent().subscribe({
      next: (response: any) => {
        const rawImages = response?.images || [];
        this.images = rawImages.map((img: any) => ({
          ...img,
          url: this.getImageUrl(img),
        }));
        this.loading = false;
      },
      error: (err: any) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message || 'Failed to load photos',
        });
        this.loading = false;
      },
    });
  }

  onUploadComplete(): void {
    this.loadImages();
  }

  deleteImage(image: any): void {
    if (!image?.id) return;
    if (!confirm('Are you sure you want to delete this photo?')) return;

    this.legacyService.deleteImage(image.id).subscribe({
      next: () => {
        this.sharedService.showToast({
          classname: 'success',
          text: 'Photo deleted successfully',
        });
        this.loadImages();
      },
      error: (err: any) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message || 'Failed to delete photo',
        });
      },
    });
  }

  private getImageUrl(image: any): string {
    const rawUrl = image?.image_url || image?.image_path || image?.url;
    if (!rawUrl) return '';
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }
    const clean = rawUrl.replace(/^\.\//, '').replace(/\\/g, '/');
    const base = BE_URL.replace(/\/$/, '');
    const normalized = clean.startsWith('/') ? clean : `/${clean}`;
    return `${base}${normalized}`;
  }
}
