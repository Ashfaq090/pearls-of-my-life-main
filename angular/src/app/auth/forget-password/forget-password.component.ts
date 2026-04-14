import { Component } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { AuthService } from '../auth.service';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
})
export class ForgetPasswordComponent {
  public forgetPasswordForm: FormGroup;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly sharedService: SharedService,
    private soundService: SoundService
  ) {}

  ngOnInit(): void {
    this.forgetPasswordForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  submit() {
    this.soundService.playClickSound(); // Play sound on submit button click
    if (this.forgetPasswordForm.invalid) {
      this.sharedService.showToast({
        classname: 'error',
        text: 'Please enter a valid email address',
      });
      return;
    }

    const email = this.forgetPasswordForm.value.email;
    this.authService.forgotPassword(email).subscribe({
      next: (response) => {
        this.sharedService.showToast({
          classname: 'success',
          text: 'Password reset link has been sent to your email',
        });
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message || 'Failed to send reset password link',
        });
      },
    });
  }
}
