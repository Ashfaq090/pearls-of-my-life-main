import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../auth/auth.service';
import { SharedService } from '../../../services/shared.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss'],
})
export class AdminLoginComponent {
  loginForm: FormGroup;
  errorMessage: string = '';
  loading: boolean = false;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private sharedService: SharedService,
    private router: Router,
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';

      const { email, password } = this.loginForm.value;

      this.authService.login({ email, hashed_password: password }).subscribe({
        next: (response: any) => {
          // Extract response body (contains { user, access_token })
          const responseData = response.body || response;
          const user = responseData.user || responseData;
          const token = responseData.access_token || response.headers?.get('x-access-token');
          
          if (user && (user.role === 'admin' || user.role === 'ADMIN')) {
            if (token) {
              this.sharedService.setUserToken(token);
              this.router.navigate(['/admin/dashboard']);
            } else {
              this.errorMessage = 'Login successful but token not received.';
            }
          } else {
            this.errorMessage = 'Access denied. Admin privileges required.';
          }
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
          this.loading = false;
        },
      });
    }
  }
}

