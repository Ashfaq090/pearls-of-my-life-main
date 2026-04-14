import { Component } from '@angular/core';
import { SoundService } from '../services/sound.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
})
export class AuthComponent {
  constructor(private soundsevice: SoundService, private router: Router) {}
  goToPage(type: string) {
    if (type === 'home') {
      // Navigate to the home page
      this.soundsevice.playClickSound();
      this.router.navigate(['/']);
    } else if (type === 'login') {
      // Navigate to the login page
      window.location.href = '/auth/login';
    } else {
      // Default action, can be customized
      console.warn('Unknown navigation type:', type);
    }
  }
}
