import { Component } from '@angular/core';
import {
  AbstractControl,
  FormGroup,
  UntypedFormBuilder,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth/auth.service';
import { SharedService } from 'src/app/services/shared.service';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  public changePasswordForm: FormGroup;
  public showOldPassword: boolean = false;
  public showNewPassword: boolean = false;
  public showConfirmPassword: boolean = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private authService: AuthService,
    private sharedService: SharedService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.changePasswordForm = this.formBuilder.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      {
        validators: this.passwordMatchValidator,
      }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');

    if (!newPassword || !confirmPassword) {
      return null;
    }

    return newPassword.value === confirmPassword.value
      ? null
      : { passwordMismatch: true };
  }

  submit() {
    if (this.changePasswordForm.invalid) {
      if (this.changePasswordForm.errors?.['passwordMismatch']) {
        this.sharedService.showToast({
          classname: 'error',
          text: 'Passwords do not match',
        });
      } else {
        this.sharedService.showToast({
          classname: 'error',
          text: 'Please fill all required fields correctly',
        });
      }
      return;
    }

    const oldPasswordControl = this.changePasswordForm.get('oldPassword');
    const newPasswordControl = this.changePasswordForm.get('newPassword');

    if (!oldPasswordControl || !newPasswordControl) {
      return;
    }

    const oldPassword = oldPasswordControl.value;
    const newPassword = newPasswordControl.value;

    this.authService.changePassword(oldPassword, newPassword).subscribe({
      next: (response) => {
        this.sharedService.showToast({
          classname: 'success',
          text: 'Password changed successfully',
        });
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.sharedService.showToast({
          classname: 'error',
          text: error.error.message || 'Failed to change password',
        });
      },
    });
  }
}
