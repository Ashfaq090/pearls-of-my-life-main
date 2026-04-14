import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  OnDestroy,
} from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { PersonalInfoService } from './personal-info.service';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbDatepickerModule, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { FileService } from 'src/app/services/file.service';
import { DomSanitizer } from '@angular/platform-browser';
import {
  dateToIsoString,
  isoStringToDateObj,
} from 'src/app/constants/app.constant';
import { SharedService } from 'src/app/services/shared.service';
import { PaymentService } from 'src/app/services/payment.service';
import { Router } from '@angular/router';
import { CustomDateParserFormatter } from 'src/app/shared/services/custom-date-parser-formatter.service';

@Component({
  selector: 'app-personal-info',
  templateUrl: './personal-info.component.html',
  styleUrls: ['./personal-info.component.scss'],
  providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }],
})
export class PersonalInfoComponent implements OnInit, OnDestroy {
  private readonly destroy$ = new Subject<void>();

  currentSubscription: any = null;
  hasActiveSubscription = false;
  isUnsubscribing = false;
  constructor(
    private readonly formBuilder: UntypedFormBuilder,
    private readonly personalInfoService: PersonalInfoService,
    private readonly fileService: FileService,
    private readonly sanitizer: DomSanitizer,
    private readonly sharedService: SharedService,
    private readonly paymentService: PaymentService,
    private readonly router: Router
  ) {}

  public imageUrl: any;
  public personalInfoForm: FormGroup;
  private personalDetails: any;
  public showPassword: boolean = false;
  public showResizeModal: boolean = false;
  public resizableImage: any = null;
  public resizeWidth: number = 188;
  public resizeHeight: number = 188;
  public showCameraModal: boolean = false;
  public videoStream: MediaStream | null = null;
  public capturedImage: string | null = null;
  public showPaymentHistory: boolean = false;
  public paymentHistory: any = null;
  public paymentHistoryLoading: boolean = false;
  private paymentHistoryLoaded: boolean = false;
  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;

  ngOnInit(): void {
    this.personalInfoForm = this.formBuilder.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: [''],
      phone_number: [''],
      address: [''],
      permanent_address: [''],
      hashed_password: ['', Validators.required],
      date_of_birth: [null],
    });
    this.getPresonalInfo();
    this.getProfilePic();
    this.loadCurrentSubscription();
  }

  getPresonalInfo() {
    this.personalInfoService.getPersonalInfo().subscribe({
      next: (res) => {
        this.personalDetails = res;
        this.patchForm();
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      },
    });
  }

  patchForm() {
    this.personalDetails.date_of_birth = isoStringToDateObj(
      this.personalDetails.date_of_birth
    );
    this.personalInfoForm.patchValue(this.personalDetails);
    this.personalInfoForm.updateValueAndValidity();
  }

  getProfilePic() {
    //debugger;
    const path = 'personal-info/profile-pic';
    this.fileService.getFile(path).subscribe({
      next: (blob) => {
        const objectURL = URL.createObjectURL(blob);
        this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
      },
    });
  }

  submit() {
    console.log(this.personalInfoForm);
    if (this.personalInfoForm.invalid) {
      console.log('Form invalid');
      return;
    } else {
      const form = this.personalInfoForm.value;
      this.personalInfoService
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          phone_number: form.phone_number,
          address: form.address,
          permanent_address: form.permanent_address,
          date_of_birth: dateToIsoString(form.date_of_birth),
          hashed_password: form.hashed_password || undefined, // Only send if provided
        })
        .subscribe({
          next: (response) => {
            this.sharedService.showToast({
              classname: 'success',
              text: response?.message,
            });
            this.personalDetails = response.data;
            this.patchForm();
          },
          error: (err) => {
            this.sharedService.showToast({
              classname: 'error',
              text: err?.error?.message,
            });
          },
        });
    }
  }

  cancel() {
    this.personalInfoForm.patchValue(this.personalDetails);
  }

  uploadFile(file: any) {
    if (!file || !file[0]) return;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.resizableImage = e.target.result;
      this.showResizeModal = true;
    };
    reader.readAsDataURL(file[0]);
  }

  resizeAndUpload() {
    if (!this.resizableImage) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Set canvas dimensions
      canvas.width = this.resizeWidth;
      canvas.height = this.resizeHeight;

      // Draw and resize image
      ctx?.drawImage(img, 0, 0, this.resizeWidth, this.resizeHeight);

      // Convert canvas to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const file = new File([blob], 'profile-pic.png', {
              type: 'image/png',
            });
            const path = 'personal-info/upload-profile-pic';

            this.fileService.uploadFile(path, file).subscribe({
              next: (responseBlob) => {
                const objectURL = URL.createObjectURL(responseBlob);
                this.imageUrl =
                  this.sanitizer.bypassSecurityTrustUrl(objectURL);
                this.showResizeModal = false;
                this.resizableImage = null;
                this.sharedService.showToast({
                  classname: 'success',
                  text: 'Profile picture successfully uploaded',
                });
              },
              error: (err) => {
                this.sharedService.showToast({
                  classname: 'error',
                  text: err?.error?.message,
                });
              },
            });
          }
        },
        'image/png',
        0.9
      );
    };

    img.src = this.resizableImage;
  }

  cancelResize() {
    this.showResizeModal = false;
    this.resizableImage = null;
  }

  adjustSize(type: 'width' | 'height', value: number) {
    if (type === 'width') {
      this.resizeWidth = Math.max(100, Math.min(500, value));
      // Maintain aspect ratio
      if (this.resizableImage) {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.height / img.width;
          this.resizeHeight = Math.round(this.resizeWidth * aspectRatio);
        };
        img.src = this.resizableImage;
      }
    } else {
      this.resizeHeight = Math.max(100, Math.min(500, value));
      // Maintain aspect ratio
      if (this.resizableImage) {
        const img = new Image();
        img.onload = () => {
          const aspectRatio = img.width / img.height;
          this.resizeWidth = Math.round(this.resizeHeight * aspectRatio);
        };
        img.src = this.resizableImage;
      }
    }
  }

  openCamera() {
    this.showCameraModal = true;
    // Use setTimeout to ensure view is initialized
    setTimeout(() => {
      this.startCamera();
    }, 100);
  }

  closeCamera() {
    this.stopCamera();
    this.showCameraModal = false;
    this.capturedImage = null;
  }

  startCamera() {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        this.videoStream = stream;
        if (this.videoElement?.nativeElement) {
          this.videoElement.nativeElement.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Error accessing camera:', err);
        this.sharedService.showToast({
          classname: 'error',
          text: 'Unable to access camera. Please check permissions.',
        });
        this.closeCamera();
      });
  }

  stopCamera() {
    if (this.videoStream) {
      this.videoStream.getTracks().forEach((track) => track.stop());
      this.videoStream = null;
    }
  }

  capturePhoto() {
    const video = this.videoElement?.nativeElement;
    if (!video || !this.videoStream) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            this.capturedImage = URL.createObjectURL(blob);
            const file = new File([blob], 'camera-capture.jpg', {
              type: 'image/jpeg',
            });
            // Show resize modal for captured image
            const reader = new FileReader();
            reader.onload = (e: any) => {
              this.resizableImage = e.target.result;
              if (this.capturedImage) {
                this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(
                  this.capturedImage
                );
              }
              this.showResizeModal = true;
              this.closeCamera();
            };
            reader.readAsDataURL(file);
          }
        },
        'image/jpeg',
        0.9
      );
    }
  }

  upgradePlan() {
    this.router.navigate(['/subscription-plans']);
  }

  private loadCurrentSubscription(): void {
    this.paymentService
      .getCurrentSubscription()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (subscription: any) => {
          this.currentSubscription = subscription;
          this.hasActiveSubscription =
            !!subscription &&
            subscription.status === 'active' &&
            !!subscription.plan;
        },
        error: () => {
          this.currentSubscription = null;
          this.hasActiveSubscription = false;
        },
      });
  }

  unsubscribeCurrentPlan(): void {
    if (!this.currentSubscription?.id) return;
    if (this.isUnsubscribing) return;

    const ok = confirm(
      'Are you sure you want to unsubscribe your current plan?'
    );
    if (!ok) return;

    this.isUnsubscribing = true;
    this.paymentService
      .cancelSubscription(this.currentSubscription.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.currentSubscription = { status: 'inactive', plan: null };
          this.hasActiveSubscription = false;
          this.loadCurrentSubscription();
          this.isUnsubscribing = false;
        },
        error: () => {
          this.isUnsubscribing = false;
          alert('Failed to unsubscribe. Please try again.');
        },
      });
  }

  togglePaymentHistory() {
    this.showPaymentHistory = !this.showPaymentHistory;
    if (this.showPaymentHistory && !this.paymentHistoryLoaded) {
      this.loadPaymentHistory();
    }
  }

  loadPaymentHistory() {
    if (!this.showPaymentHistory) return;
    this.paymentHistoryLoading = true;
    this.paymentService.getPaymentHistory(1, 20).subscribe({
      next: (history) => {
        this.paymentHistory = history;
        this.paymentHistoryLoaded = true;
        this.paymentHistoryLoading = false;
      },
      error: (err) => {
        console.error('Error loading payment history:', err);
        this.paymentHistoryLoading = false;
        this.sharedService.showToast({
          classname: 'error',
          text: 'Failed to load payment history',
        });
      },
    });
  }

  deleteAccount() {
    if (
      confirm(
        'Are you sure you want to delete your account? This action cannot be undone.'
      )
    ) {
      this.personalInfoService.terminateAccount().subscribe({
        next: () => {
          this.sharedService.showToast({
            classname: 'success',
            text: 'Account deleted successfully',
          });
          this.sharedService.logout();
        },
        error: (err) => {
          this.sharedService.showToast({
            classname: 'error',
            text: err?.error?.message || 'Failed to delete account',
          });
        },
      });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.stopCamera();
    if (this.capturedImage) {
      URL.revokeObjectURL(this.capturedImage);
    }
  }
}
