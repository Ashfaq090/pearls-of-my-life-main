import { Component, EventEmitter, Input, Output } from '@angular/core';
import { LegacyService } from '../../services/legacy.service';

@Component({
  selector: 'app-file-upload',
  template: `
    <div class="upload-container">
      <div class="mb-3">
        <label class="form-label">Title</label>
        <input type="text" class="form-control" [(ngModel)]="title">
      </div>
      <div class="mb-3">
        <label class="form-label">Description</label>
        <textarea class="form-control" [(ngModel)]="description"></textarea>
      </div>
      <div class="mb-3">
        <label class="form-label">Select File</label>
        <input type="file" class="form-control" (change)="onFileSelected($event)" [accept]="acceptType">
      </div>
      <button class="btn btn-primary" [disabled]="!selectedFile || !title" (click)="upload()">Upload</button>
    </div>
  `
})
export class FileUploadComponent {
  @Input() type: 'video' | 'image' = 'video';
  @Output() uploadComplete = new EventEmitter<void>();

  title = '';
  description = '';
  selectedFile: File | null = null;

  get acceptType() {
    return this.type === 'video' ? 'video/*' : 'image/*';
  }

  constructor(private legacyService: LegacyService) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  upload() {
    if (!this.selectedFile || !this.title) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('title', this.title);
    formData.append('description', this.description);

    const upload$ = this.type === 'video' 
      ? this.legacyService.uploadVideo(formData)
      : this.legacyService.uploadImage(formData);

    upload$.subscribe({
      next: () => {
        this.title = '';
        this.description = '';
        this.selectedFile = null;
        this.uploadComplete.emit();
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('Upload failed');
      }
    });
  }
}
