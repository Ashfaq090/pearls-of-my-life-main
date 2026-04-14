import {
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
  AfterViewInit,
} from '@angular/core';
import { LegacyService } from '../../services/legacy.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-video-recorder',
  template: `
    <div class="text-center">
      <!-- Live video preview (only when recording) -->

      <video
        *ngIf="isRecording"
        #videoElement
        autoplay
        playsinline
        class="mb-3"
        [ngClass]="{ 'show': recordedBlob, 'hidden': !recordedBlob }"
        style="width: 100%; max-width: 640px; background: black;"
      ></video>

      <!-- Recording controls -->
      <div class="mb-3">
        <button
          *ngIf="!isRecording && !recordedBlob"
          class="btn btn-danger rounded-circle p-3"
          (click)="startRecording()"
        >
          <i class="bi bi-record-fill"></i> Record
        </button>
        <button
          *ngIf="isRecording"
          class="btn btn-secondary rounded-circle p-3"
          (click)="stopRecording()"
        >
          <i class="bi bi-stop-fill"></i> Stop
        </button>
      </div>

      <!-- Recorded video preview and upload options -->
      <div *ngIf="recordedBlob" class="mb-3">
        <video
          [src]="previewUrl"
          controls
          class="mb-3"
          style="width: 100%; max-width: 640px;"
        ></video>
        <div class="d-flex justify-content-center gap-2 flex-wrap">
          <input
            type="text"
            class="form-control col-12 col-md-6"
            placeholder="Video Title *"
            [(ngModel)]="videoTitle"
          />
          <div class="d-flex gap-2">
            <button
              class="btn btn-success"
              (click)="uploadRecording()"
            >
              Save
            </button>
            <button class="btn btn-warning" (click)="reset()">Discard</button>
            <button class="btn btn-info" (click)="reRecord()">Re-record</button>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class VideoRecorderComponent implements AfterViewInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @Output() recordComplete = new EventEmitter<void>();
  @Output() toastOutput = new EventEmitter<{ classname: string; text: string }>();
  @Input() stageLabel: string | null = null;

  mediaRecorder: MediaRecorder | null = null;
  chunks: Blob[] = [];
  isRecording = false;
  recordedBlob: Blob | null = null;
  previewUrl: string | null = null;
  videoTitle = '';
  stream: MediaStream | null = null;
  recordingStartTime: number = 0;
  recordingDuration: number = 0;

  constructor(
    private legacyService: LegacyService,
    private cdr: ChangeDetectorRef,
  ) {}

  ngAfterViewInit() {
    // Component initialized
  }

  isVideoTitleValid(): boolean {
    return !!(this.videoTitle && this.videoTitle.trim().length > 0);
  }

  // onTitleInput() {
  //   // Trigger change detection when user types
  //   this.cdr.detectChanges();
  // }

  async startRecording() {
    // Prevent multiple recording instances
    if (this.isRecording) {
      console.warn('Recording already in progress');
      return;
    }
    this.isRecording = true;

    // Clean up any existing recording state
    this.cleanup();

    try {
      // Request media access
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      };

      // Try with ideal constraints first, fallback to basic if needed
      try {
        this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (err) {
        // Fallback to basic constraints
        console.warn('Failed with ideal constraints, trying basic...', err);
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
      }

      // Set recording state first so video element is rendered
      this.isRecording = true;
      this.cdr.detectChanges();

      // Wait for view to update, then bind stream
      setTimeout(() => {
        if (this.videoElement?.nativeElement && this.stream) {
          this.videoElement.nativeElement.srcObject = this.stream;
        }
      }, 0);

      // Create MediaRecorder
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      try {
        this.mediaRecorder = new MediaRecorder(this.stream, options);
      } catch (e) {
        // Fallback to default mimeType
        console.warn(
          'Failed to create MediaRecorder with options, using default',
          e
        );
        this.mediaRecorder = new MediaRecorder(this.stream);
      }

      this.chunks = [];
      this.recordingStartTime = Date.now();

      this.mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.recordedBlob = new Blob(this.chunks, { type: 'video/webm' });
        this.previewUrl = URL.createObjectURL(this.recordedBlob);
        this.recordingDuration = Math.floor(
          (Date.now() - this.recordingStartTime) / 1000
        );
        this.stopStream();
        // Clear the live video element
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = null;
        }
        this.cdr.detectChanges();
      };

      this.mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        this.isRecording = false;
        this.cleanup();
      };

      this.mediaRecorder.start();
    } catch (err: any) {
      console.error('Error accessing camera:', err);
      this.isRecording = false;

      let errorMessage = 'Could not access camera. ';
      if (
        err.name === 'NotAllowedError' ||
        err.name === 'PermissionDeniedError'
      ) {
        errorMessage +=
          'Please allow camera and microphone permissions in your browser settings.';
      } else if (
        err.name === 'NotFoundError' ||
        err.name === 'DevicesNotFoundError'
      ) {
        errorMessage += 'No camera or microphone found.';
      } else if (
        err.name === 'NotReadableError' ||
        err.name === 'TrackStartError'
      ) {
        errorMessage +=
          'Camera or microphone is already in use by another application.';
      } else {
        errorMessage += 'Please check your browser settings and try again.';
      }

      alert(errorMessage);
    }
  }

  stopRecording() {
    if (this.mediaRecorder && this.isRecording) {
      try {
        if (this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
          this.cleanup();
        }
      } catch (e) {
        console.error('Error stopping recording:', e);
      }
      this.isRecording = false;
    }
  }

  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => {
        track.stop();
      });
      this.stream = null;
    }
  }

  cleanup() {
    // Stop any ongoing recording
    if (this.mediaRecorder) {
      try {
        if (this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
        }
      } catch (e) {
        // Ignore errors if already stopped
      }
      this.mediaRecorder = null;
    }

    // Stop stream
    this.stopStream();

    // Clear video element
    if (this.videoElement?.nativeElement) {
      this.videoElement.nativeElement.srcObject = null;
    }

  }

  reset() {
    // Clean up resources
    this.cleanup();
    // Reset state
    this.isRecording = false;

    // Revoke object URL if exists
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    // Reset all state
    this.recordedBlob = null;
    this.previewUrl = null;
    this.videoTitle = '';
    this.chunks = [];
    this.recordingDuration = 0;
    this.recordingStartTime = 0;

    this.cdr.detectChanges();
  }

  reRecord() {
    this.reset();
    // Use setTimeout to ensure state is fully reset before starting new recording
    setTimeout(() => {
      this.startRecording();
    }, 100);
  }

  uploadRecording() {
    // if (!this.recordedBlob || !this.videoTitle) {
    //   alert('Please provide a title for your video recording');
    //   return;
      // alert('Please provide a title for your audio recording');
    if (!this.videoTitle) {
      console.trace('Toast called from:');
      console.log('Emitting toast:', { classname: 'error', text: 'Please provide a title for your audio recording' });
      this.toastOutput.emit({ classname: 'error', text: 'Please provide a title for your audio recording' });
      return;
    }

    if (!this.recordedBlob) {
      console.log('Emitting toast:', { classname: 'error', text: 'Please record a video before uploading' });
      this.toastOutput.emit({ classname: 'error', text: 'Please record a video before uploading' });
      return;
    }

    const formData = new FormData();
    formData.append('file', this.recordedBlob, 'recording.webm');
    formData.append('title', this.videoTitle);
    formData.append('description', 'Recorded via WebRTC');
    formData.append('duration', this.recordingDuration.toString());
    if (this.stageLabel) {
      formData.append('stage_label', this.stageLabel);
    }

    this.legacyService.uploadVideo(formData).subscribe({
      next: () => {
        this.cdr.detectChanges();
        const successToast = { classname: 'success', text: 'Video uploaded successfully' };
        console.log('Emitting success toast:', successToast);
        this.toastOutput.emit(successToast);
        setTimeout(() => {
          this.reset();
          this.recordComplete.emit();
        }, 500);
      },
      error: (err) => {
        console.error('Upload failed', err);
        // alert('Upload failed: ' + (err.error?.message || 'Unknown error'));
        this.cdr.detectChanges();
        const errorToast = { classname: 'error', text: 'Upload failed: ' + (err.error?.message || 'Unknown error') };
        console.log('Emitting error toast:', errorToast);
        this.toastOutput.emit(errorToast);
        setTimeout(() => {
          this.reset();
          this.recordComplete.emit();
        }, 500);
      },
    });
  }

}
