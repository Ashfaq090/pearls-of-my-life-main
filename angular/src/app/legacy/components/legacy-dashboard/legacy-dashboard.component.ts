import { Component, OnInit } from '@angular/core';
import { LegacyService } from '../../services/legacy.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-legacy-dashboard',
  template: `
    <div class="container mt-4">
      <h2>Legacy Upload & Recording</h2>

      <ul ngbNav #nav="ngbNav" class="nav-tabs" [(activeId)]="activeTab">
        <li [ngbNavItem]="1">
          <a ngbNavLink>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              style="margin-right: 8px;"
            >
              <path
                d="M17 10.5V7a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-3.5l4 4v-11l-4 4z"
              />
            </svg>
            Videos
          </a>
          <ng-template ngbNavContent>
            <div class="mt-3">
              <div class="d-flex gap-2 mb-3 flex-wrap" *ngIf="!isKeyHolder">
                <button
                  class="btn btn-primary"
                  (click)="
                    showVideoUpload = true;
                    showVideoRecord = false;
                    showVideoUrl = false
                  "
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style="margin-right: 6px; vertical-align: middle;"
                  >
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                  </svg>
                  Upload Video
                </button>
                <button
                  class="btn btn-success"
                  (click)="
                    showVideoRecord = true;
                    showVideoUpload = false;
                    showVideoUrl = false
                  "
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style="margin-right: 6px; vertical-align: middle;"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
                    />
                  </svg>
                  Record Video
                </button>
                <button
                  class="btn btn-info"
                  (click)="
                    showVideoUrl = true;
                    showVideoUpload = false;
                    showVideoRecord = false
                  "
                >
                  <i class="bi bi-link-45deg"></i> Paste Video URL
                </button>
              </div>

              <div *ngIf="showVideoUpload" class="card p-3 mb-3">
                <h4>Upload Video</h4>
                <app-file-upload
                  type="video"
                  (uploadComplete)="refreshContent()"
                ></app-file-upload>
              </div>

              <div *ngIf="showVideoRecord" class="card p-3 mb-3">
                <h4>Record Video</h4>
                <app-video-recorder
                  (recordComplete)="refreshContent()"
                ></app-video-recorder>
              </div>

              <div *ngIf="showVideoUrl" class="card p-3 mb-3">
                <h4>Paste Video URL</h4>
                <div class="mb-3">
                  <label class="form-label">Video URL</label>
                  <input
                    type="url"
                    class="form-control"
                    [(ngModel)]="videoUrl"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Title</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="videoUrlTitle"
                    placeholder="Video Title"
                  />
                </div>
                <button
                  class="btn btn-primary"
                  (click)="saveVideoUrl()"
                  [disabled]="!videoUrl || !videoUrlTitle"
                >
                  Save
                </button>
              </div>

              <app-content-gallery
                [items]="videos"
                type="video"
              ></app-content-gallery>
            </div>
          </ng-template>
        </li>
        <li [ngbNavItem]="2">
          <a ngbNavLink>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              style="margin-right: 8px;"
            >
              <path
                d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"
              />
            </svg>
            Audio
          </a>
          <ng-template ngbNavContent>
            <div class="mt-3">
              <div class="d-flex gap-2 mb-3 flex-wrap" *ngIf="!isKeyHolder">
                <button
                  class="btn btn-primary"
                  (click)="showAudioUpload = true; showAudioRecord = false"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style="margin-right: 6px; vertical-align: middle;"
                  >
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                  </svg>
                  Upload Audio
                </button>
                <button
                  class="btn btn-success"
                  (click)="showAudioRecord = true; showAudioUpload = false"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style="margin-right: 6px; vertical-align: middle;"
                  >
                    <path
                      d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.48 6-3.3 6-6.72h-1.7z"
                    />
                  </svg>
                  Record Audio
                </button>
              </div>

              <div *ngIf="showAudioUpload" class="card p-3 mb-3">
                <h4>Upload Audio</h4>
                <div class="mb-3">
                  <label class="form-label">Title</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="audioUploadTitle"
                  />
                </div>
                <div class="mb-3">
                  <label class="form-label">Select Audio File</label>
                  <input
                    type="file"
                    class="form-control"
                    accept="audio/*"
                    (change)="onAudioFileSelected($event)"
                  />
                </div>
                <button
                  class="btn btn-primary"
                  [disabled]="!selectedAudioFile || !audioUploadTitle"
                  (click)="uploadAudioFile()"
                >
                  Upload
                </button>
              </div>

              <div *ngIf="showAudioRecord" class="card p-3 mb-3">
                <h4>Record Audio</h4>
                <app-audio-recorder
                  (recordComplete)="refreshContent()"
                ></app-audio-recorder>
              </div>

              <app-content-gallery
                [items]="audios"
                type="audio"
              ></app-content-gallery>
            </div>
          </ng-template>
        </li>
        <li [ngbNavItem]="3">
          <a ngbNavLink>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              style="margin-right: 8px;"
            >
              <path
                d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"
              />
            </svg>
            Images
          </a>
          <ng-template ngbNavContent>
            <div class="mt-3">
              <div class="mb-3" *ngIf="!isKeyHolder">
                <button
                  class="btn btn-primary"
                  (click)="showImageUpload = !showImageUpload"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style="margin-right: 6px; vertical-align: middle;"
                  >
                    <path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z" />
                  </svg>
                  Upload Images
                </button>
              </div>

              <div *ngIf="showImageUpload" class="card p-3 mb-3">
                <h4>Upload Images</h4>
                <app-file-upload
                  type="image"
                  (uploadComplete)="refreshContent()"
                ></app-file-upload>
              </div>

              <app-content-gallery
                [items]="images"
                type="image"
              ></app-content-gallery>
            </div>
          </ng-template>
        </li>
        <li [ngbNavItem]="4">
          <a ngbNavLink>
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              style="margin-right: 8px;"
            >
              <path d="M3 18h12v-2H3v2zM3 6v2h18V6H3zm0 7h18v-2H3v2z" />
            </svg>
            Notes
          </a>
          <ng-template ngbNavContent>
            <div class="mt-3">
              <div class="mb-3" *ngIf="!isKeyHolder">
                <button
                  class="btn btn-primary"
                  (click)="showNoteCreate = !showNoteCreate"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style="margin-right: 6px; vertical-align: middle;"
                  >
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  Create Note
                </button>
              </div>

              <div *ngIf="showNoteCreate" class="card p-3 mb-3">
                <h4>Create Note</h4>
                <div class="form-group mb-2">
                  <label>Title</label>
                  <input
                    type="text"
                    class="form-control"
                    [(ngModel)]="newNote.title"
                  />
                </div>
                <div class="form-group mb-2">
                  <label>Content</label>
                  <textarea
                    class="form-control"
                    rows="5"
                    [(ngModel)]="newNote.content"
                  ></textarea>
                </div>
                <button class="btn btn-success" (click)="createNote()">
                  Save Note
                </button>
              </div>

              <div class="row">
                <div class="col-md-4 mb-3" *ngFor="let note of notes">
                  <div class="card">
                    <div class="card-body">
                      <h5 class="card-title">{{ note.title }}</h5>
                      <p class="card-text">{{ note.content }}</p>
                      <small class="text-muted">{{
                        note.created_on | date
                      }}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ng-template>
        </li>
      </ul>

      <div [ngbNavOutlet]="nav" class="mt-2"></div>
    </div>
  `,
})
export class LegacyDashboardComponent implements OnInit {
  activeTab = 1;
  videos: any[] = [];
  audios: any[] = [];
  images: any[] = [];
  notes: any[] = [];

  showVideoUpload = false;
  showVideoRecord = false;
  showVideoUrl = false;
  showAudioUpload = false;
  showAudioRecord = false;
  showImageUpload = false;
  showNoteCreate = false;

  videoUrl = '';
  videoUrlTitle = '';
  audioUploadTitle = '';
  selectedAudioFile: File | null = null;
  newNote = { title: '', content: '' };
  isKeyHolder = false;

  constructor(
    private legacyService: LegacyService,
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.isKeyHolder = this.sharedService.isKeyHolder();
    this.refreshContent();
  }

  refreshContent() {
    this.legacyService.getContent().subscribe((data) => {
      this.videos = data.videos || [];
      this.audios = data.audios || [];
      this.images = data.images || [];
      this.notes = data.notes || [];
    });
  }

  onAudioFileSelected(event: any) {
    this.selectedAudioFile = event.target.files[0];
  }

  uploadAudioFile() {
    if (!this.selectedAudioFile || !this.audioUploadTitle) return;

    const formData = new FormData();
    formData.append('file', this.selectedAudioFile);
    formData.append('title', this.audioUploadTitle);
    formData.append('description', '');

    this.legacyService.uploadAudio(formData).subscribe({
      next: () => {
        this.audioUploadTitle = '';
        this.selectedAudioFile = null;
        this.showAudioUpload = false;
        this.refreshContent();
      },
      error: (err) => {
        console.error('Upload failed', err);
        alert('Upload failed: ' + (err.error?.message || 'Unknown error'));
      },
    });
  }

  saveVideoUrl() {
    if (!this.videoUrl || !this.videoUrlTitle) return;

    const formData = new FormData();
    formData.append('url', this.videoUrl);
    formData.append('title', this.videoUrlTitle);
    formData.append('description', 'Video from URL');

    // Assuming there's a method for URL upload, otherwise use video upload endpoint
    this.legacyService.uploadVideo(formData).subscribe({
      next: () => {
        this.videoUrl = '';
        this.videoUrlTitle = '';
        this.showVideoUrl = false;
        this.refreshContent();
      },
      error: (err) => {
        console.error('Failed to save video URL', err);
        alert(
          'Failed to save video URL: ' + (err.error?.message || 'Unknown error')
        );
      },
    });
  }

  createNote() {
    if (!this.newNote.title || !this.newNote.content) return;
    this.legacyService.createNote(this.newNote).subscribe(() => {
      this.newNote = { title: '', content: '' };
      this.showNoteCreate = false;
      this.refreshContent();
    });
  }
}
