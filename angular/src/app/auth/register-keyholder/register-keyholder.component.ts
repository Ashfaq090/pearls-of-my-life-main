import { Component, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { SharedService } from 'src/app/services/shared.service';
import { tap } from 'rxjs';

@Component({
  selector: 'app-register-keyholder',
  templateUrl: './register-keyholder.component.html',
  styleUrls: ['./register-keyholder.component.scss'],
})
export class RegisterKeyholderComponent implements OnInit {
  public loginKeyHolderForm: FormGroup;
  public acceptInvitationForm: FormGroup;
  private tokenURL: string | null;
  public isAcceptingInvitation = false;
  public keyHolderInfo: any = null;
  public showPasswordForm = false;
  public showPassword: boolean = false;
  public showConfirmPassword: boolean = false;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.loginKeyHolderForm = this.formBuilder.group({
      pin: ['', Validators.required],
    });

    this.acceptInvitationForm = this.formBuilder.group(
      {
        pin: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.activatedRoute.paramMap.subscribe((params) => {
      this.tokenURL = params.get('tokenURL');
      if (this.tokenURL) {
        // Check if this is an accept invitation route
        const url = this.router.url;
        if (url.includes('/accept/')) {
          this.isAcceptingInvitation = true;
        }
        this.getKeyHolder(this.tokenURL);
      }
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    if (
      password &&
      confirmPassword &&
      password.value !== confirmPassword.value
    ) {
      confirmPassword.setErrors({ passwordMismatch: true });
    } else {
      if (confirmPassword?.hasError('passwordMismatch')) {
        confirmPassword.setErrors(null);
      }
    }
    return null;
  }

  getKeyHolder(tokenURL: string) {
    this.authService.getKeyHolder(tokenURL).subscribe({
      next: (res: any) => {
        this.keyHolderInfo = res.data || res;
      },
      error: (err) => {
        this.sharedService.showToast({
          classname: 'error',
          text: err?.error?.message || 'Invalid invitation link',
        });
      },
    });
  }

  acceptInvitation() {
    if (this.acceptInvitationForm.valid && this.tokenURL) {
      this.authService
        .acceptKeyHolderInvitation({
          token_url: this.tokenURL,
          pin: this.acceptInvitationForm.value.pin,
          password: this.acceptInvitationForm.value.password,
        })
        .subscribe({
          next: (res: any) => {
            this.sharedService.showToast({
              classname: 'success',
              text: res.message || 'Invitation accepted! You can now login.',
            });
            // Redirect to login page
            this.router.navigate(['/auth/keyholder', this.tokenURL]);
          },
          error: (err) => {
            this.sharedService.showToast({
              classname: 'error',
              text: err?.error?.message || 'Failed to accept invitation',
            });
          },
        });
    } else {
      this.acceptInvitationForm.markAllAsTouched();
    }
  }

  submit() {
    if (this.loginKeyHolderForm.valid) {
      this.authService
        .loginKeyHolder({
          token_url: this.tokenURL,
          pin: this.loginKeyHolderForm.value.pin,
        })
        .pipe(
          tap((response) => {
            // Authorization
            const token =
              response.headers.get('Authorization') ||
              response.headers.get('x-access-token');
            if (token) {
              this.sharedService.setUserToken(token);
              localStorage.setItem('isKeyHolder', 'true');
            }
          })
        )
        .subscribe({
          next: (res: any) => {
            this.sharedService.showToast({
              classname: 'success',
              text: 'Login successful!',
            });
            this.router.navigate(['/dashboard']);
          },
          error: (err) => {
            this.sharedService.showToast({
              classname: 'error',
              text: err?.error?.message || 'Login failed',
            });
          },
        });
    }
  }
}
