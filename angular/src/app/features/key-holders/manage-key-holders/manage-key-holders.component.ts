import { Component, Input, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { KeyHolderService } from '../key-holders.service';
import { SharedService } from 'src/app/services/shared.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RELATION_LIST } from 'src/app/constants/app.constant';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-manage-key-holders',
  templateUrl: './manage-key-holders.component.html',
  styleUrls: ['./manage-key-holders.component.scss'],
})
export class ManageKeyHoldersComponent implements OnDestroy, AfterViewInit {
  @ViewChild('videoElement') videoElement?: ElementRef<HTMLVideoElement>;
  public keyHolderForm: FormGroup;
  @Input() data: any = {};
  public imageUrl: any;
  private uploadedFile: any;
  public relationList = RELATION_LIST;
  public showCameraModal = false;
  public videoStream: MediaStream | null = null;
  public capturedImage: string | null = null;
  public readonly OTHER_RELATION_VALUE = 'Other';
  public readonly FUNERAL_HOME_TYPE = 'FUNERAL_HOME';
  public isSubmitting = false;

  constructor(
    private readonly activeModal: NgbActiveModal,
    private readonly formBuilder: UntypedFormBuilder,
    private readonly keyHolderService: KeyHolderService,
    private readonly sharedService: SharedService,
    private readonly sanitizer: DomSanitizer,
    private readonly soundService: SoundService
  ) {}

  ngOnInit(): void {
    this.keyHolderForm = this.formBuilder.group({
      file: [''],
      type: ['PERSON'],
      funeral_home_name: [''],
      contact_person: [''],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      email: ['', Validators.required],
      phone_number: [''],
      relation: ['', Validators.required],
      other_relation: [''],
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zip: ['', Validators.required],
    });

    const initialType = this.getType();
    this.keyHolderForm.patchValue({ type: initialType });
    this.applyValidatorsByType(initialType);

    if (this.data?.item?.id) {
      this.patchForm();
    }
  }

  // patchForm() {
  //   this.keyHolderForm.patchValue({
  //     first_name: this.data.item.first_name,
  //     last_name: this.data.item.last_name,
  //     email: this.data.item.email,
  //     phone_number: this.data.item.phone_number,
  //     address: this.data.item.address,
  //     relation: this.data.item.relation,
  //   });
  //   this.keyHolderForm.updateValueAndValidity();
  // }
  patchForm() {
    const currentRelation = this.data?.item?.relation;
    const isCustomRelation =
      currentRelation && !this.relationList.includes(currentRelation);
    this.keyHolderForm.patchValue({
      type: this.getType(),
      funeral_home_name: this.data.item.funeral_home_name || '',
      contact_person: this.data.item.contact_person || '',
      first_name: this.data.item.first_name,
      last_name: this.data.item.last_name,
      email: this.data.item.email,
      phone_number: this.data.item.phone_number,
      relation: isCustomRelation ? this.OTHER_RELATION_VALUE : currentRelation,
      other_relation: isCustomRelation ? currentRelation : '',
      street: this.data.item.street,
      city: this.data.item.city,
      state: this.data.item.state,
      zip: this.data.item.zip,
    });
    this.keyHolderForm.updateValueAndValidity();
    this.applyValidatorsByType(this.getType());
  }

  submit() {
    if (this.isSubmitting) {
      return;
    }
    this.isSubmitting = true;
    this.soundService.playClickSound();
    console.log(this.keyHolderForm);
    if (this.keyHolderForm.invalid) {
      this.sharedService.showToast({
        classname: 'warning',
        text: 'Please fill all required fields.',
      });
      this.isSubmitting = false;
      return;
    }

    const form = this.keyHolderForm.value;
    const file = this.uploadedFile ? this.uploadedFile : null;
    const type = this.getType();
    const relationValue =
      form.relation === this.OTHER_RELATION_VALUE
        ? (form.other_relation || '').trim()
        : form.relation;

    if (
      type !== this.FUNERAL_HOME_TYPE &&
      form.relation === this.OTHER_RELATION_VALUE &&
      !relationValue
    ) {
      this.sharedService.showToast({
        classname: 'warning',
        text: 'Please provide the relationship type.',
      });
      this.isSubmitting = false;
      return;
    }

    const payload: any = {
      type,
      phone_number: form.phone_number,
      street: form.street,
      city: form.city,
      state: form.state,
      zip: form.zip,
    };

    if (type === this.FUNERAL_HOME_TYPE) {
      payload.funeral_home_name = form.funeral_home_name;
      payload.contact_person = form.contact_person;
      payload.email = form.email;
    } else {
      payload.first_name = form.first_name;
      payload.last_name = form.last_name;
      payload.email = form.email;
      payload.relation = relationValue;
    }

    const request$ = this.data?.item?.id
      ? this.keyHolderService.updateKeyHolder(this.data.item.id, file, payload)
      : this.keyHolderService.addKeyHolder(file, payload);

    request$.subscribe({
      next: (response) => {
        const successText =
          'Your Keyholder(s) have been notified of your request to assign them as account keyholder. If you have not already done so, please contact your keyholder(s) to inform them of your request and other wishes you may have concerning your final plans.';
        this.sharedService.showToast({
          classname: 'success',
          text: successText,
          delay: 5000,
        });
        this.isSubmitting = false;
        this.closeModal({ saved: true });
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message,
        });
        this.isSubmitting = false;
      },
    });
  }

  closeModal(result?: any): void {
    this.activeModal.close(result ?? null);
  }

  isFuneralHome(): boolean {
    return this.getType() === this.FUNERAL_HOME_TYPE;
  }

  private getType(): string {
    return String(
      this.data?.type || this.data?.item?.type || this.keyHolderForm?.value?.type || 'PERSON'
    ).toUpperCase();
  }

  private applyValidatorsByType(type: string): void {
    const isFuneralHome = type === this.FUNERAL_HOME_TYPE;

    const firstName = this.keyHolderForm.get('first_name');
    const lastName = this.keyHolderForm.get('last_name');
    const email = this.keyHolderForm.get('email');
    const relation = this.keyHolderForm.get('relation');
    const funeralName = this.keyHolderForm.get('funeral_home_name');
    const street = this.keyHolderForm.get('street');
    const city = this.keyHolderForm.get('city');
    const state = this.keyHolderForm.get('state');

    if (isFuneralHome) {
      firstName?.clearValidators();
      lastName?.clearValidators();
      relation?.clearValidators();
      funeralName?.setValidators([Validators.required]);
      street?.setValidators([Validators.required]);
      city?.setValidators([Validators.required]);
      state?.setValidators([Validators.required]);
      email?.clearValidators();
    } else {
      firstName?.setValidators([Validators.required]);
      lastName?.setValidators([Validators.required]);
      relation?.setValidators([Validators.required]);
      funeralName?.clearValidators();
      street?.setValidators([Validators.required]);
      city?.setValidators([Validators.required]);
      state?.setValidators([Validators.required]);
      email?.setValidators([Validators.required]);
    }

    firstName?.updateValueAndValidity();
    lastName?.updateValueAndValidity();
    email?.updateValueAndValidity();
    relation?.updateValueAndValidity();
    funeralName?.updateValueAndValidity();
    street?.updateValueAndValidity();
    city?.updateValueAndValidity();
    state?.updateValueAndValidity();
  }

  onFileChange(file: any) {
    this.uploadedFile = file[0];
    const objectURL = URL.createObjectURL(file[0]);
    this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
  }

  openCamera() {
    this.showCameraModal = true;
    this.startCamera();
  }

  closeCamera() {
    this.stopCamera();
    this.showCameraModal = false;
    this.capturedImage = null;
  }

  ngAfterViewInit() {
    // Video element will be available after view init
  }

  startCamera() {
    navigator.mediaDevices.getUserMedia({ video: true })
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
      this.videoStream.getTracks().forEach(track => track.stop());
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
      canvas.toBlob((blob) => {
        if (blob) {
          this.capturedImage = URL.createObjectURL(blob);
          this.imageUrl = this.sanitizer.bypassSecurityTrustUrl(this.capturedImage);
          this.uploadedFile = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          this.stopCamera();
          this.showCameraModal = false;
        }
      }, 'image/jpeg', 0.9);
    }
  }

  ngOnDestroy() {
    this.stopCamera();
    if (this.capturedImage) {
      URL.revokeObjectURL(this.capturedImage);
    }
  }
}
