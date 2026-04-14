import { Component } from '@angular/core';
import { SoundService } from 'src/app/services/sound.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  constructor(private soundService: SoundService) {}
  scrollToTop() {
    this.soundService.playClickSound();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
