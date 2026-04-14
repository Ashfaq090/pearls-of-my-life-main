import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.scss'],
})
export class AboutUsComponent {
  constructor(private soundService: SoundService, private router: Router) {}
  scrollToTop() {
    this.soundService.playClickSound();
    // window.scrollTo({ top: 0, behavior: 'smooth' });
    const token = localStorage.getItem('accessToken');
    if (token) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/auth/login']);
    }
  }
}
