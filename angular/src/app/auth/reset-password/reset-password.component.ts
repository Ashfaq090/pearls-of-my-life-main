import { Component } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  UntypedFormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'src/app/services/shared.service';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
})
export class ResetPasswordComponent {
  public resetPasswordForm: FormGroup;

  public showPassword: boolean = false;
  public showConfirmPassword: boolean = false;
  private token: string | null = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly sharedService: SharedService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const tokenParam = this.route.snapshot.paramMap.get('token');
    this.token = tokenParam;
    console.log('Reset token from URL:', this.token); // Debug log

    if (!this.token) {
      this.sharedService.showToast({
        classname: 'error',
        text: 'Invalid reset password link',
      });
      this.router.navigate(['/auth/login']);
      return;
    }

    this.resetPasswordForm = this.formBuilder.group(
      {
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  submit() {
    if (!this.token) {
      this.sharedService.showToast({
        classname: 'error',
        text: 'Invalid reset token',
      });
      return;
    }

    if (this.resetPasswordForm.invalid) {
      if (this.resetPasswordForm.errors?.['passwordMismatch']) {
        this.sharedService.showToast({
          classname: 'error',
          text: 'Passwords do not match',
        });
      }
      return;
    }

    const passwordControl = this.resetPasswordForm.get('password');
    if (!passwordControl) {
      return;
    }

    const password = passwordControl.value;
    this.authService.resetPassword(this.token, password).subscribe({
      next: (response) => {
        this.sharedService.showToast({
          classname: 'success',
          text: 'Password reset successfully',
        });
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        this.sharedService.showToast({
          classname: 'error',
          text: error.error.message || 'Failed to reset password',
        });
      },
    });
  }
}
