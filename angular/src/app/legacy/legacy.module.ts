import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LegacyRoutingModule } from './legacy-routing.module';
import { LegacyDashboardComponent } from './components/legacy-dashboard/legacy-dashboard.component';
import { VideoRecorderComponent } from './components/video-recorder/video-recorder.component';
import { AudioRecorderComponent } from './components/audio-recorder/audio-recorder.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { ContentGalleryComponent } from './components/content-gallery/content-gallery.component';

@NgModule({
  declarations: [
    LegacyDashboardComponent,
    VideoRecorderComponent,
    AudioRecorderComponent,
    FileUploadComponent,
    ContentGalleryComponent,
  ],
  imports: [
    CommonModule,
    LegacyRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
  ],
  exports: [
    VideoRecorderComponent,
    AudioRecorderComponent,
    FileUploadComponent,
    ContentGalleryComponent,
  ],
})
export class LegacyModule {}
