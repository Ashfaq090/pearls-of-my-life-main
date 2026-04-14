import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-content-gallery',
  template: `
    <div class="row">
      <div class="col-md-4 mb-3" *ngFor="let item of items">
        <div class="card h-100">
          <div
            *ngIf="type === 'image'"
            class="card-img-top"
            [style.background-image]="'url(' + item.url + ')'"
            style="height: 200px; background-size: cover; background-position: center;"
          ></div>
          <div
            *ngIf="type === 'video'"
            class="card-img-top bg-dark d-flex align-items-center justify-content-center"
            style="height: 200px;"
          >
            <i
              class="bi bi-play-circle text-white"
              style="font-size: 3rem;"
            ></i>
          </div>
          <div
            *ngIf="type === 'audio'"
            class="card-img-top bg-secondary d-flex align-items-center justify-content-center"
            style="height: 200px;"
          >
            <i class="bi bi-mic text-white" style="font-size: 3rem;"></i>
          </div>
          <div class="card-body">
            <h5 class="card-title">{{ item.title }}</h5>
            <p class="card-text">{{ item.description }}</p>
            <small class="text-muted">{{ item.created_on | date }}</small>
            <a
              *ngIf="type === 'video'"
              [href]="item.url"
              target="_blank"
              class="btn btn-sm btn-outline-primary mt-2"
              >Watch</a
            >
            <a
              *ngIf="type === 'image'"
              [href]="item.url"
              target="_blank"
              class="btn btn-sm btn-outline-primary mt-2"
              >View Full</a
            >
            <a
              *ngIf="type === 'audio'"
              [href]="item.url"
              target="_blank"
              class="btn btn-sm btn-outline-primary mt-2"
              >Listen</a
            >
          </div>
        </div>
      </div>
      <div *ngIf="items.length === 0" class="col-12 text-center mt-4">
        <p class="text-muted">No content found.</p>
      </div>
    </div>
  `,
})
export class ContentGalleryComponent {
  @Input() items: any[] = [];
  @Input() type: 'video' | 'image' | 'audio' = 'video';
}
