import {
  Component,
  ChangeDetectorRef,
  EventEmitter,
  Output,
} from '@angular/core';
import { LegacyService } from '../../services/legacy.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-audio-recorder',
  template: `
    <div class="text-center">
      <div class="mb-3" *ngIf="!isRecording && !recordedBlob && !isProcessing">
        <div class="audio-visualizer mb-3">
          <div class="audio-wave" [class.active]="isRecording">
            <div
              class="wave-bar"
              *ngFor="let bar of waveBars"
              [style.height.%]="bar"
            ></div>
          </div>
        </div>
        <button
          class="btn btn-danger rounded-circle p-3"
          (click)="startRecording()"
        >
          <i class="bi bi-mic-fill"></i> Record Audio
        </button>
      </div>

      <div class="mb-3" *ngIf="isRecording">
        <div class="recording-indicator mb-3">
          <span class="recording-dot"></span>
          <span>Recording... {{ formatTime(recordingTime) }}</span>
        </div>
        <button
          class="btn btn-secondary rounded-circle p-3"
          (click)="stopRecording()"
        >
          <i class="bi bi-stop-fill"></i> Stop
        </button>
      </div>

      <div *ngIf="recordedBlob" class="mb-3">
        <audio
          [src]="previewUrl"
          controls
          class="mb-3"
          style="width: 100%; max-width: 640px;"
        ></audio>
        <div class="d-flex justify-content-center gap-2 flex-wrap">
          <input
            type="text"
            class="form-control col-12 col-md-6"
            placeholder="Audio Title"
            [(ngModel)]="audioTitle"
          />
          <div class="d-flex gap-2">
            <button class="btn btn-success" (click)="uploadRecording()">
              Save
            </button>
            <button class="btn btn-warning" (click)="reset()">Discard</button>
            <button class="btn btn-info" (click)="reRecord()">Re-record</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .audio-visualizer {
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .audio-wave {
        display: flex;
        align-items: center;
        gap: 4px;
        height: 80px;
      }
      .wave-bar {
        width: 4px;
        background: #3498db;
        border-radius: 2px;
        transition: height 0.1s;
      }
      .audio-wave.active .wave-bar {
        animation: wave 0.5s ease-in-out infinite;
      }
      @keyframes wave {
        0%,
        100% {
          height: 20%;
        }
        50% {
          height: 80%;
        }
      }
      .recording-indicator {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-weight: bold;
        color: #dc3545;
      }
      .recording-dot {
        width: 12px;
        height: 12px;
        background: #dc3545;
        border-radius: 50%;
        animation: pulse 1s infinite;
      }
      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }
    `,
  ],
})
export class AudioRecorderComponent {
  @Output() recordComplete = new EventEmitter<void>();

  mediaRecorder: MediaRecorder | null = null;
  chunks: Blob[] = [];
  isRecording = false;
  recordedBlob: Blob | null = null;
  previewUrl: string | null = null;
  audioTitle = '';
  stream: MediaStream | null = null;
  recordingTime = 0;
  recordingInterval: any = null;
  waveAnimationInterval: any = null;
  waveBars: number[] = Array(20).fill(20);

  isProcessing = false;

  constructor(
    private legacyService: LegacyService,
    private cdr: ChangeDetectorRef,
    private sharedService: SharedService,
  ) {
    // Initialize wave bars with random heights for animation
    this.waveBars = Array(20)
      .fill(0)
      .map(() => Math.random() * 60 + 20);
  }

  async startRecording() {
    // Prevent multiple recording instances
    if (this.isRecording) {
      console.warn('Recording already in progress');
      return;
    }

    // Clean up any existing recording state
    this.cleanup();

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      this.mediaRecorder = new MediaRecorder(this.stream);
      this.chunks = [];
      this.recordingTime = 0;

      this.mediaRecorder.addEventListener('dataavailable', (e: BlobEvent) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      });

      this.mediaRecorder.addEventListener('stop', () => {
        this.recordedBlob = new Blob(this.chunks, { type: 'audio/webm' });
        this.previewUrl = URL.createObjectURL(this.recordedBlob);
        this.isProcessing = false;
        this.stopStream();
        if (this.recordingInterval) {
          clearInterval(this.recordingInterval);
          this.recordingInterval = null;
        }
        this.chunks = [];
        this.cdr.detectChanges();
      });

      this.mediaRecorder.start();
      this.isRecording = true;

      // Start timer (update every second)
      this.recordingInterval = setInterval(() => {
        if (this.isRecording) {
          this.recordingTime++;
        }
      }, 1000);

      // Separate interval for wave animation
      this.waveAnimationInterval = setInterval(() => {
        if (this.isRecording) {
          this.waveBars = this.waveBars.map(() => Math.random() * 60 + 20);
        } else {
          if (this.waveAnimationInterval) {
            clearInterval(this.waveAnimationInterval);
            this.waveAnimationInterval = null;
          }
        }
      }, 100);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      this.isRecording = false;
      alert('Could not access microphone. Please allow permissions.');
    }
  }

  stopRecording() {
    if (!this.mediaRecorder || !this.isRecording) return;

    this.isProcessing = true;
    this.mediaRecorder.stop();
    this.isRecording = false;

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    if (this.waveAnimationInterval) {
      clearInterval(this.waveAnimationInterval);
      this.waveAnimationInterval = null;
    }
  }

  stopStream() {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
  }

  cleanup() {
    // Stop any ongoing recording
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
    }

    // Stop stream
    this.stopStream();

    // Clear timer
    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }

    // Clear wave animation interval
    if (this.waveAnimationInterval) {
      clearInterval(this.waveAnimationInterval);
      this.waveAnimationInterval = null;
    }

    // Reset state
    this.isRecording = false;
    this.isProcessing = false;
    this.mediaRecorder = null;
  }

  reset() {
    // Clean up resources
    this.cleanup();

    // Revoke object URL if exists
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
    }

    // Reset all state
    this.recordedBlob = null;
    this.previewUrl = null;
    this.audioTitle = '';
    this.chunks = [];
    this.recordingTime = 0;
  }

  reRecord() {
    this.reset();
    // Use setTimeout to ensure state is fully reset before starting new recording
    setTimeout(() => {
      this.startRecording();
    }, 100);
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs
      .toString()
      .padStart(2, '0')}`;
  }

  uploadRecording() {
    if (!this.recordedBlob || !this.audioTitle.trim()) {
      // alert('Please provide a title for your audio recording');
      this.sharedService.showToast({
        classname: 'error',
        text: 'Please provide a title for your audio recording',
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', this.recordedBlob, 'recording.webm');
    formData.append('title', this.audioTitle.trim());
    formData.append('description', 'Recorded via WebRTC');
    formData.append('duration', this.recordingTime.toString());

    this.legacyService.uploadAudio(formData).subscribe({
      next: () => {
        this.reset();
        this.recordComplete.emit();
      },
      error: (err) => {
        console.error('Upload failed', err);
        this.sharedService.showToast({
          classname: 'error',
          text: 'Upload failed: ' + (err.error?.message || 'Unknown error'),
        });
        // alert('Upload failed: ' + (err.error?.message || 'Unknown error'));
      },
    });
  }
}
