import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FeaturesService } from '../features.service';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-refer-friend-modal',
  templateUrl: './refer-friend-modal.component.html',
  styleUrls: ['./refer-friend-modal.component.scss'],
})
export class ReferFriendModalComponent {
  @Output() sendEmail = new EventEmitter<string>();
  @Output() closeModal = new EventEmitter<void>();

  emailForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private featureService: FeaturesService,
    private soundService: SoundService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onSubmit() {
    this.soundService.playClickSound();
    if (this.emailForm.valid) {
      this.featureService.sendEmail(this.emailForm.value.email).subscribe({
        next: (response) => {
          console.log('Email sent successfully:', response);
          alert('Referral email sent successfully! Your friend will receive an invitation to join Pearls of Life.');
          this.emailForm.reset();
          this.activeModal.close('success');
        },
        error: (error) => {
          console.error('Error sending email:', error);
          alert('Failed to send email: ' + (error.error?.message || 'Unknown error. Please try again.'));
        },
      });
    }
  }

  onClose() {
    // this.closeModal.emit();
    this.soundService.playClickSound();
    this.activeModal.close(null);
  }
}
